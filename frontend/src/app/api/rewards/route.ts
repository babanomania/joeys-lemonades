import { NextResponse } from 'next/server'
import { supabase, handleDatabaseError } from '@/lib/supabase'
import { mintNFT } from '@/lib/nft'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get order count
    const { count: orderCount, error: orderError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress)

    if (orderError) {
      throw orderError
    }

    // Get owned NFTs
    const { data: nfts, error: nftError } = await supabase
      .from('nft_rewards')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('status', 'minted')

    if (nftError) {
      throw nftError
    }

    // Define reward tiers (since we don't have a table for this yet)
    const tiers = [
      {
        id: 'purchase_count_bronze',
        name: 'Bronze',
        required_purchases: 5,
        discount: 5,
      },
      {
        id: 'purchase_count_silver',
        name: 'Silver',
        required_purchases: 10,
        discount: 10,
      },
      {
        id: 'purchase_count_gold',
        name: 'Gold',
        required_purchases: 20,
        discount: 15,
      },
    ]

    // Calculate available rewards
    const availableTiers = tiers.filter(
      (tier) => tier.required_purchases <= (orderCount || 0)
    )

    // Calculate next tier
    const nextTier = tiers.find(
      (tier) => tier.required_purchases > (orderCount || 0)
    )

    const progress = {
      currentCount: orderCount || 0,
      nextTierAt: nextTier?.required_purchases || null,
      progress: nextTier
        ? ((orderCount || 0) / nextTier.required_purchases) * 100
        : 100,
    }

    return NextResponse.json({
      orderCount: orderCount || 0,
      ownedNFTs: nfts || [],
      availableTiers,
      nextTier,
      progress,
    })
  } catch (error) {
    console.error('Error fetching rewards data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== Starting NFT Reward POST request ===');
    const body = await request.json();
    console.log('Request body:', body);

    const { walletAddress, tierId } = body;
    console.log('Wallet Address:', walletAddress);
    console.log('Tier ID:', tierId);

    if (!walletAddress || !tierId) {
      console.error('Missing required fields:', { walletAddress, tierId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get order count to verify eligibility
    console.log('Fetching order count for wallet:', walletAddress);
    const { count: orderCount, error: orderError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress);

    if (orderError) {
      console.error('Error fetching orders:', orderError);
      throw orderError;
    }
    console.log('Order count:', orderCount);

    // Get tier requirements
    const tiers = [
      { id: 'purchase_count_bronze', required_purchases: 5 },
      { id: 'purchase_count_silver', required_purchases: 10 },
      { id: 'purchase_count_gold', required_purchases: 20 },
    ];
    console.log('Available tiers:', tiers);

    const tier = tiers.find(t => t.id === tierId);
    console.log('Selected tier:', tier);

    if (!tier || (orderCount || 0) < tier.required_purchases) {
      console.error('Eligibility check failed:', {
        tier,
        orderCount,
        required: tier?.required_purchases
      });
      return NextResponse.json(
        { error: 'Not eligible for this reward tier' },
        { status: 400 }
      );
    }
    console.log('Eligibility check passed');

    // Check if user already has this NFT
    const { data: existingNFT, error: checkError } = await supabase
      .from('nft_rewards')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('tier', tierId)
      .eq('status', 'minted')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing NFT:', checkError);
      throw checkError;
    }

    if (existingNFT) {
      console.error('NFT already claimed:', existingNFT);
      return NextResponse.json(
        { error: 'NFT already claimed' },
        { status: 400 }
      );
    }

    // Mint NFT through backend service
    const backendUrl = `${process.env.BACKEND_URL}/api/nft/mint`;
    console.log('Calling backend at:', backendUrl);
    const mintResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientAddress: walletAddress,
        type: tierId.includes('bronze') ? 'purchase_count' : 'spend_amount',
      }),
    });

    console.log('Backend response:', mintResponse);

    if (!mintResponse.ok) {
      const error = await mintResponse.text();
      console.error('Error from NFT minting service:', error);
      throw new Error(`Failed to mint NFT: ${error}`);
    }

    const { nft } = await mintResponse.json();
    console.log('NFT minted successfully:', nft);

    // Create NFT reward record
    console.log('Creating NFT reward record...');
    const { data: nftReward, error: nftError } = await supabase
      .from('nft_rewards')
      .insert([
        {
          wallet_address: walletAddress,
          type: tierId.includes('bronze') ? 'purchase_count' : 'spend_amount',
          status: 'minted',
          mint_address: nft.address,
          metadata_uri: nft.metadata_uri,
          tier: tierId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (nftError) {
      console.error('Error creating NFT reward:', nftError);
      throw nftError;
    }
    console.log('NFT reward record created:', nftReward);

    return NextResponse.json({
      success: true,
      nft: nftReward,
      mint_address: nft.address,
      metadata_uri: nft.metadata_uri,
      message: 'NFT reward minted successfully',
    });
  } catch (error) {
    console.error('Error in NFT reward POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
