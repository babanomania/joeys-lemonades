import { NextResponse } from 'next/server'
import { mintNFT, checkNFTOwnership } from '@/lib/nft'
import { supabase } from '@/lib/supabase'

interface NFTRewardRequest {
  walletAddress: string
  type: 'purchase_count' | 'spend_amount'
}

export async function POST(request: Request) {
  try {
    const body: NFTRewardRequest = await request.json()
    const { walletAddress, type } = body

    // Validate request
    if (!walletAddress || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has this type of NFT
    const hasNFT = await checkNFTOwnership(walletAddress, type)
    if (hasNFT) {
      return NextResponse.json(
        { error: 'User already has this NFT reward' },
        { status: 400 }
      )
    }

    // Check eligibility based on type
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_orders, total_spent')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let isEligible = false
    if (type === 'purchase_count') {
      isEligible = user.total_orders >= 5
    } else if (type === 'spend_amount') {
      isEligible = user.total_spent >= 10
    }

    if (!isEligible) {
      return NextResponse.json(
        { error: 'User not eligible for this reward' },
        { status: 400 }
      )
    }

    // Mint NFT
    const { nft, uri } = await mintNFT(walletAddress, type)

    // Record NFT reward in database
    const { error: rewardError } = await supabase
      .from('nft_rewards')
      .insert([
        {
          wallet_address: walletAddress,
          type,
          status: 'minted',
          mint_address: nft.address.toString(),
          metadata_uri: uri,
        },
      ])

    if (rewardError) {
      console.error('Error recording NFT reward:', rewardError)
      return NextResponse.json(
        { error: 'Failed to record NFT reward' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mint_address: nft.address.toString(),
      metadata_uri: uri,
      message: 'NFT reward minted successfully',
    })
  } catch (error) {
    console.error('Error processing NFT reward:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get user's NFT rewards
    const { data: rewards, error } = await supabase
      .from('nft_rewards')
      .select('*')
      .eq('wallet_address', walletAddress)

    if (error) {
      console.error('Error fetching NFT rewards:', error)
      return NextResponse.json(
        { error: 'Failed to fetch NFT rewards' },
        { status: 500 }
      )
    }

    // Get user's stats for eligibility check
    const { data: user } = await supabase
      .from('users')
      .select('total_orders, total_spent')
      .eq('wallet_address', walletAddress)
      .single()

    const eligibility = {
      purchase_count: {
        eligible: user?.total_orders >= 5,
        progress: user?.total_orders || 0,
        target: 5,
      },
      spend_amount: {
        eligible: user?.total_spent >= 10,
        progress: user?.total_spent || 0,
        target: 10,
      },
    }

    return NextResponse.json({
      rewards,
      eligibility,
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
