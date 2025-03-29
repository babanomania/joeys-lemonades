import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity, toBigNumber, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Solana connection
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
)

// Load store wallet from private key file
const loadStoreWallet = () => {
  try {
    const privateKeyPath = process.env.STORE_WALLET_PRIVATE_KEY?.replace('~', process.env.HOME || '')
    if (!privateKeyPath) {
      throw new Error('STORE_WALLET_PRIVATE_KEY not set')
    }
    const rawData = fs.readFileSync(privateKeyPath, 'utf-8')
    const privateKeyArray = JSON.parse(rawData)
    return Keypair.fromSecretKey(new Uint8Array(privateKeyArray))
  } catch (error) {
    console.error('Error loading store wallet:', error)
    throw new Error('Failed to load store wallet')
  }
}

// Initialize store wallet and Metaplex
const storeWallet = loadStoreWallet()
const metaplex = Metaplex.make(connection).use(keypairIdentity(storeWallet))

// NFT metadata for different reward types
const NFT_METADATA = {
  purchase_count: {
    name: "Joey's Lemonade Loyalty",
    symbol: 'LEMON',
    description: 'Awarded for being a loyal customer at Joey\'s Lemonade Stand',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/nft/bronze-rewards.svg`,
    attributes: [
      { trait_type: 'Type', value: 'Loyalty' },
      { trait_type: 'Purchases', value: '5' },
      { trait_type: 'Discount', value: '5%' },
    ],
  },
  spend_amount: {
    name: "Joey's Lemonade VIP",
    symbol: 'LEMON',
    description: 'Awarded for being a VIP customer at Joey\'s Lemonade Stand',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/nft/gold-rewards.svg`,
    attributes: [
      { trait_type: 'Type', value: 'VIP' },
      { trait_type: 'Minimum Spend', value: '$10' },
      { trait_type: 'Discount', value: '15%' },
    ],
  },
}

export async function mintNFT(
  recipientAddress: string,
  type: 'purchase_count' | 'spend_amount'
): Promise<{ nft: any; uri: string }> {
  try {
    const metadata = NFT_METADATA[type]
    const recipientPublicKey = new PublicKey(recipientAddress)

    // Validate and fetch image URL
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set')
    }

    const imageUrl = new URL(metadata.image)
    console.log('Fetching NFT image from:', imageUrl.toString())

    // Upload image to Arweave
    const response = await fetch(imageUrl.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    const file = toMetaplexFile(new Uint8Array(buffer), 'nft.svg')
    const imageUri = await metaplex.storage().upload(file)
    console.log('Image uploaded to Arweave:', imageUri)

    // Create and upload metadata
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: metadata.name,
      description: metadata.description,
      image: imageUri,
      attributes: metadata.attributes,
      properties: {
        files: [
          {
            uri: imageUri,
            type: 'image/svg+xml',
          },
        ],
      },
    })
    console.log('Metadata uploaded to Arweave:', uri)

    // Create NFT using Metaplex
    const { nft } = await metaplex.nfts().create({
      uri,
      name: metadata.name,
      symbol: metadata.symbol,
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: storeWallet.publicKey,
          share: 100,
        },
      ],
      isMutable: false,
      maxSupply: toBigNumber(1),
    })
    console.log('NFT created:', nft.address.toString())

    return { nft, uri }
  } catch (error) {
    console.error('Error in mintNFT:', error)
    throw error
  }
}

export async function checkNFTOwnership(
  walletAddress: string,
  type: 'purchase_count' | 'spend_amount'
): Promise<boolean> {
  try {
    const ownerPublicKey = new PublicKey(walletAddress)
    const metadata = NFT_METADATA[type]

    // Find all NFTs owned by the wallet
    const nfts = await metaplex.nfts().findAllByOwner({ owner: ownerPublicKey })

    // Check if any NFT matches our metadata
    return nfts.some(
      (nft) => nft.name === metadata.name && nft.symbol === metadata.symbol
    )
  } catch (error) {
    console.error('Error checking NFT ownership:', error)
    return false
  }
}
