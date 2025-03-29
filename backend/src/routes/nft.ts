import express, { Request, Response, Router } from 'express';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity, toBigNumber, toMetaplexFile, bundlrStorage, BundlrStorageDriver } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { configDotenv } from 'dotenv';
import * as bs58 from 'bs58';
import { supabase } from '../config/supabase';

const router: Router = express.Router();

configDotenv();

// Initialize Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Load store wallet from private key
const loadStoreWallet = () => {
  try {
    const privateKeyString = process.env.STORE_WALLET_PRIVATE_KEY;
    if (!privateKeyString) {
      throw new Error('STORE_WALLET_PRIVATE_KEY not set');
    }
    
    const privateKeyBytes = bs58.decode(privateKeyString);
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error('Error loading store wallet:', error);
    throw new Error('Failed to load store wallet');
  }
};

// Initialize store wallet and Metaplex with custom Bundlr configuration
const storeWallet = loadStoreWallet();
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(storeWallet))
  .use(bundlrStorage({
    address: 'https://node1.bundlr.network',
    providerUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    timeout: 120000,
    priceMultiplier: 1.25, // Add a buffer for price fluctuations
  }));

// Ensure storage is ready
const prepareStorage = async () => {
  try {
    const storageDriver = metaplex.storage().driver() as BundlrStorageDriver;
    
    // This will automatically fund if needed
    await storageDriver.getBalance();
    console.log('Storage driver is ready');
  } catch (error) {
    console.error('Error preparing storage:', error);
    throw error;
  }
};

interface NFTAttribute {
  trait_type: string;
  value: string;
  [key: string]: unknown;
}

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
}

interface NFTStats {
  bronze: number;
  silver: number;
  gold: number;
  total: number;
}

// NFT metadata for different reward types
const NFT_METADATA: Record<string, NFTMetadata> = {
  purchase_count: {
    name: "Joey's Lemonade Loyalty",
    symbol: 'LEMON',
    description: "Awarded for being a loyal customer at Joey's Lemonade Stand",
    image: '/nft/bronze-rewards.svg',
    attributes: [
      { trait_type: 'Type', value: 'Loyalty' },
      { trait_type: 'Purchases', value: '5' },
      { trait_type: 'Discount', value: '5%' },
    ],
  },
  spend_amount: {
    name: "Joey's Lemonade VIP",
    symbol: 'LEMON',
    description: "Awarded for being a VIP customer at Joey's Lemonade Stand",
    image: '/nft/gold-rewards.svg',
    attributes: [
      { trait_type: 'Type', value: 'VIP' },
      { trait_type: 'Minimum Spend', value: '$10' },
      { trait_type: 'Discount', value: '15%' },
    ],
  },
};

type NFTType = keyof typeof NFT_METADATA;

interface MintNFTRequest {
  recipientAddress: string;
  type: NFTType;
}

// Mint NFT endpoint
router.post('/mint', async (req: Request<{}, {}, MintNFTRequest>, res: Response): Promise<Response | void> => {
  try {
    const { recipientAddress, type } = req.body;
    console.log('Received NFT minting request:', { recipientAddress, type });

    // Ensure storage is ready before proceeding
    await prepareStorage();

    if (!recipientAddress || !type) {
      console.error('Missing required fields:', { recipientAddress, type });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const metadata = NFT_METADATA[type];
    if (!metadata) {
      console.error('Invalid NFT type:', type);
      return res.status(400).json({ error: 'Invalid NFT type' });
    }

    console.log('Using store wallet:', storeWallet.publicKey.toString());
    const recipientPublicKey = new PublicKey(recipientAddress);
    console.log('Recipient wallet:', recipientPublicKey.toString());

    // Check store wallet balance
    const balance = await connection.getBalance(storeWallet.publicKey);
    console.log('Store wallet balance:', balance / 1e9, 'SOL');

    // Create metadata without image but with emojis
    const { nft } = await metaplex.nfts().create({
      name: `${metadata.name} 🍋`,  // Add lemon emoji to name
      symbol: `${metadata.symbol} 🌟`,  // Add star emoji to symbol
      sellerFeeBasisPoints: 0,
      uri: '', // Empty URI since we're not using external metadata
      creators: [
        {
          address: storeWallet.publicKey,
          share: 100,
        },
      ],
      isMutable: true,
      maxSupply: toBigNumber(1),
      collection: null,
      uses: null,
      isCollection: false,
      tokenStandard: 0, // Fungible
      updateAuthority: storeWallet,
    });

    console.log('NFT created:', nft.address.toString());

    // Transfer NFT to recipient
    await metaplex.nfts().transfer({
      nftOrSft: nft,
      authority: storeWallet,
      fromOwner: storeWallet.publicKey,
      toOwner: recipientPublicKey,
    });

    console.log('NFT transferred to:', recipientPublicKey.toString());

    return res.json({
      success: true,
      nft: {
        address: nft.address.toString(),
      },
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get NFT stats endpoint
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { data: nfts, error } = await supabase
      .from('nft_rewards')
      .select('tier')
      .not('status', 'eq', 'revoked');

    if (error) {
      throw error;
    }

    const stats: NFTStats = {
      bronze: 0,
      silver: 0,
      gold: 0,
      total: 0,
    };

    nfts?.forEach((nft: { tier: string }) => {
      if (nft.tier === 'bronze') stats.bronze++;
      if (nft.tier === 'silver') stats.silver++;
      if (nft.tier === 'gold') stats.gold++;
      stats.total++;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching NFT stats:', error);
    res.status(500).json({ error: 'Failed to fetch NFT stats' });
  }
});

export default router;
