import { NextResponse } from 'next/server'
import { CartItem } from '@/types'
import { supabase, checkNFTRewardEligibility } from '@/lib/supabase'

interface OrderRequest {
  items: CartItem[]
  total: number
  walletAddress: string
  transactionSignature: string
}

export async function POST(request: Request) {
  try {
    const body: OrderRequest = await request.json()
    const { items, total, walletAddress, transactionSignature } = body

    // Validate request
    if (!items?.length || !total || !walletAddress || !transactionSignature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          items,
          total,
          wallet_address: walletAddress,
          transaction_signature: transactionSignature,
          status: 'confirmed',
        },
      ])
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Check if user qualifies for NFT reward
    const { isEligible } = await checkNFTRewardEligibility(walletAddress)

    if (isEligible) {
      // Mint NFT reward through the NFT reward API
      const nftResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/nft-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          type: 'purchase_count',
        }),
      })

      if (!nftResponse.ok) {
        console.error('Failed to mint NFT reward:', await nftResponse.text())
      }
    }

    // Return success response
    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      estimatedTime: 15, // 15 minutes estimated preparation time
    })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
