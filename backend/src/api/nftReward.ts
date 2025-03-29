import { createClient } from '@supabase/supabase-js'
import { Request, Response } from 'express'
import {
  Connection,
  Keypair,
  PublicKey
} from '@solana/web3.js'
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage
} from '@metaplex-foundation/js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
const storeKeypair = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(process.env.STORE_PRIVATE_KEY!))
)

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(storeKeypair))
  .use(bundlrStorage())

export const checkEligibility = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params

    if (!walletAddress) {
      return res.status(400).json({ error: 'Missing wallet address' })
    }

    // Get completed orders for the wallet
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('wallet_address', walletAddress)
      .eq('status', 'completed')

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return res.status(500).json({ error: 'Failed to fetch orders' })
    }

    // Calculate total orders and spending
    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Get existing rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('nft_rewards')
      .select('tier')
      .eq('wallet_address', walletAddress)

    if (rewardsError) {
      console.error('Error fetching rewards:', rewardsError)
      return res.status(500).json({ error: 'Failed to fetch rewards' })
    }

    const existingTiers = new Set(rewards?.map(r => r.tier))
    const eligibleTiers = []

    // Check eligibility for each tier
    if (totalOrders >= 20 && !existingTiers.has('gold')) {
      eligibleTiers.push('gold')
    } else if (totalOrders >= 10 && !existingTiers.has('silver')) {
      eligibleTiers.push('silver')
    } else if (totalOrders >= 5 && !existingTiers.has('bronze')) {
      eligibleTiers.push('bronze')
    }

    return res.json({
      totalOrders,
      totalSpent,
      eligibleTiers,
      existingTiers: Array.from(existingTiers)
    })
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const mintNFT = async (req: Request, res: Response) => {
  try {
    const { walletAddress, tier } = req.body

    if (!walletAddress || !tier) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check eligibility
    const { data: eligibility } = await checkEligibility({ params: { walletAddress } } as Request, res)
    if (!eligibility.eligibleTiers.includes(tier)) {
      return res.status(400).json({ error: 'Not eligible for this tier' })
    }

    // Prepare NFT metadata
    const metadata = {
      name: `Joey's Lemonade ${tier.charAt(0).toUpperCase() + tier.slice(1)} Reward`,
      description: `A ${tier} tier reward for being a loyal customer at Joey's Lemonade Stand`,
      image: `https://api.joeyslemonades.com/nft-images/${tier}.png`,
      attributes: [
        {
          trait_type: 'Tier',
          value: tier
        },
        {
          trait_type: 'Issued',
          value: new Date().toISOString().split('T')[0]
        }
      ]
    }

    // Upload metadata
    const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(metadata)

    // Mint NFT
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: metadata.name,
      sellerFeeBasisPoints: 0,
      tokenOwner: new PublicKey(walletAddress)
    })

    // Save reward in database
    const { data: reward, error: rewardError } = await supabase
      .from('nft_rewards')
      .insert([{
        wallet_address: walletAddress,
        tier,
        mint_address: nft.address.toString(),
        metadata_uri: metadataUri
      }])
      .select()
      .single()

    if (rewardError) {
      console.error('Error saving reward:', rewardError)
      return res.status(500).json({ error: 'Failed to save reward' })
    }

    return res.json({
      message: 'NFT minted successfully',
      reward,
      nft: {
        address: nft.address.toString(),
        metadataUri
      }
    })
  } catch (error) {
    console.error('Error minting NFT:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
