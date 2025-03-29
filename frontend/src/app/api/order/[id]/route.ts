import { NextResponse } from 'next/server'
import { supabase, validateOrder } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate order exists
    await validateOrder(id)

    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        items,
        total,
        wallet_address,
        created_at,
        updated_at,
        users (
          total_orders,
          total_spent
        )
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get NFT rewards for this order's wallet
    const { data: rewards } = await supabase
      .from('nft_rewards')
      .select('*')
      .eq('wallet_address', order.wallet_address)
      .eq('status', 'pending')

    // Return order details with rewards info
    return NextResponse.json({
      id: order.id,
      status: order.status,
      items: order.items,
      total: order.total,
      walletAddress: order.wallet_address,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      estimatedTime: getEstimatedTime(order.created_at),
      rewards: rewards || [],
      userStats: order.users,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    if (error instanceof Error && error.message === 'Order not found') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getEstimatedTime(createdAt: string): number {
  const orderTime = new Date(createdAt).getTime()
  const currentTime = new Date().getTime()
  const elapsedMinutes = Math.floor((currentTime - orderTime) / (1000 * 60))
  const estimatedTime = Math.max(15 - elapsedMinutes, 0) // 15 minutes total preparation time
  return estimatedTime
}
