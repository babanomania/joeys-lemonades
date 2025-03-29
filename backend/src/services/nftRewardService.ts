import { Metaplex, toMetaplexFile } from '@metaplex-foundation/js'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { supabase } from '../config/supabase'
import { connection, metaplex } from '../config/solana'
import { AppError } from '../middleware/errorHandler'
import { NFTReward } from '../models/types'
import * as bs58 from 'bs58'
import * as fs from 'fs'

export class NFTRewardService {
  static async checkEligibility(walletAddress: string): Promise<{ eligible: boolean; tier?: string }> {
    try {
      // Check purchase count
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('wallet_address', walletAddress)
        .eq('status', 'completed')

      if (ordersError) throw ordersError

      const orderCount = orders?.length || 0

      if (orderCount >= 20) {
        return { eligible: true, tier: 'purchase_count_gold' }
      } else if (orderCount >= 10) {
        return { eligible: true, tier: 'purchase_count_silver' }
      } else if (orderCount >= 5) {
        return { eligible: true, tier: 'purchase_count_bronze' }
      }

      return { eligible: false }
    } catch (error) {
      console.error('Error checking NFT eligibility:', error)
      throw new AppError('Failed to check NFT eligibility', 500)
    }
  }

  static async createNFTMetadata(walletAddress: string, tier: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const getTierDetails = (tier: string) => {
      switch (tier) {
        case 'purchase_count_gold':
          return {
            name: 'Gold Tier',
            description: 'VIP treatment with 15% discount and custom flavor requests.',
            discount: '15%',
            color: '#FFD700'
          }
        case 'purchase_count_silver':
          return {
            name: 'Silver Tier',
            description: 'Unlock exclusive flavors and member-only events with 10% discount.',
            discount: '10%',
            color: '#C0C0C0'
          }
        default:
          return {
            name: 'Bronze Tier',
            description: 'Earn 5% discount on all purchases and early access to seasonal flavors.',
            discount: '5%',
            color: '#CD7F32'
          }
      }
    }

    const tierDetails = getTierDetails(tier)
    
    const metadata = {
      name: `Joey's Lemonades ${tierDetails.name} NFT`,
      description: tierDetails.description,
      image: `${baseUrl}/assets/nft-${tier}.svg`,
      attributes: [
        {
          trait_type: 'Tier',
          value: tierDetails.name
        },
        {
          trait_type: 'Discount',
          value: tierDetails.discount
        },
        {
          trait_type: 'Wallet',
          value: walletAddress
        },
        {
          trait_type: 'Date Awarded',
          value: new Date().toISOString()
        }
      ]
    }

    return metadata
  }

  static async mintNFT(walletAddress: string, tier: string): Promise<NFTReward> {
    try {
      // Check if NFT was already minted for this tier
      const { data: existingReward } = await supabase
        .from('nft_rewards')
        .select('*')
        .eq('wallet_address', walletAddress)
        .eq('tier', tier)
        .eq('status', 'minted')
        .single()

      if (existingReward) {
        throw new AppError('NFT reward already claimed', 400)
      }

      // Create NFT metadata
      const metadata = await this.createNFTMetadata(walletAddress, tier)

      // Convert metadata to Metaplex file
      const metadataFile = toMetaplexFile(
        Buffer.from(JSON.stringify(metadata)),
        'metadata.json'
      )

      // Upload metadata
      const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(metadata)

      // Create NFT using the store wallet from private key
      if (!process.env.STORE_WALLET_PRIVATE_KEY) {
        throw new Error('STORE_WALLET_PRIVATE_KEY not set');
      }
      
      const privateKeyBytes = bs58.decode(process.env.STORE_WALLET_PRIVATE_KEY);
      const storeKeypair = Keypair.fromSecretKey(privateKeyBytes);

      // Create NFT with properly typed identity
      const { nft } = await metaplex
        .use({
          install(mx: Metaplex) {
            return {
              publicKey: storeKeypair.publicKey,
              signTransaction: async (tx: Transaction) => {
                tx.partialSign(storeKeypair)
                return tx
              },
              signAllTransactions: async (txs: Transaction[]) => {
                txs.forEach(tx => tx.partialSign(storeKeypair))
                return txs
              },
              signMessage: async (message: Uint8Array) => {
                return bs58.encode(storeKeypair.secretKey.slice(0, 32))
              },
            }
          }
        })
        .nfts()
        .create({
          uri: metadataUri,
          name: metadata.name,
          sellerFeeBasisPoints: 0
        })

      // Record the reward in database
      const { data: reward, error } = await supabase
        .from('nft_rewards')
        .insert({
          wallet_address: walletAddress,
          tier,
          status: 'minted',
          mint_address: nft.address.toString(),
          metadata_uri: metadataUri,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return reward as NFTReward
    } catch (error) {
      console.error('Error minting NFT:', error)
      
      // Record failed attempt
      if (error instanceof AppError && error.message !== 'NFT reward already claimed') {
        await supabase
          .from('nft_rewards')
          .insert({
            wallet_address: walletAddress,
            tier,
            status: 'failed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      throw error instanceof AppError ? error : new AppError('Failed to mint NFT', 500)
    }
  }

  static async getUserRewards(walletAddress: string): Promise<NFTReward[]> {
    try {
      const { data, error } = await supabase
        .from('nft_rewards')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data as NFTReward[]
    } catch (error) {
      console.error('Error fetching user rewards:', error)
      throw new AppError('Failed to fetch rewards', 500)
    }
  }
}
