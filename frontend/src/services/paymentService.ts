import { createClient } from '@supabase/supabase-js'

interface CartItem {
  id: string
  name: string
  size: 'Small' | 'Large'
  sweetness: 'Less Sweet' | 'Normal' | 'Extra Sweet'
  ice: 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice'
  price: number
  quantity: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PaymentRequest {
  items: CartItem[]
  total: number
  walletAddress: string
}

export async function processPayment(request: PaymentRequest) {
  try {
    // Create order record in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          wallet_address: request.walletAddress,
          total_amount: request.total,
          items: request.items,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (orderError) throw new Error('Failed to create order')

    // Process Solana payment through backend
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: order.id,
        amount: request.total,
        walletAddress: request.walletAddress
      }),
    })

    if (!response.ok) {
      throw new Error('Payment processing failed')
    }

    // Update order status to completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
    }

    return order
  } catch (error) {
    console.error('Payment processing error:', error)
    throw error
  }
}
