import { createClient } from '@supabase/supabase-js'

interface CartItemWithCustomizations {
  id: string
  name: string
  price: number
  customizations: {
    size: 'Small' | 'Large'
    sweetness: 'Less Sweet' | 'Normal' | 'Extra Sweet'
    ice: 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice'
  }
}

interface OrderPayload {
  items: CartItemWithCustomizations[]
  total: number
  walletAddress: string
  transactionSignature: string
}

interface OrderResponse {
  orderId: string
  status: 'pending' | 'confirmed' | 'failed'
  estimatedTime: number // in minutes
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const submitOrder = async (payload: OrderPayload): Promise<OrderResponse> => {
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to submit order')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting order:', error)
    throw error
  }
}

export const getOrderStatus = async (orderId: string) => {
  try {
    const response = await fetch(`/api/order/${orderId}`)
    
    if (!response.ok) {
      throw new Error('Failed to get order status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting order status:', error)
    throw error
  }
}

export const getOrderCount = async (walletAddress: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('wallet_address', walletAddress)

    if (error) throw error
    return data?.length || 0
  } catch (error) {
    console.error('Error getting order count:', error)
    throw error
  }
}
