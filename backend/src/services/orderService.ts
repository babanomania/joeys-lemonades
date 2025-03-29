import { supabase } from '../config/supabase'
import { Order, OrderItem } from '../models/types'
import { AppError } from '../middleware/errorHandler'

export class OrderService {
  static async createOrder(walletAddress: string, items: OrderItem[]): Promise<Order> {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const { data, error } = await supabase
      .from('orders')
      .insert({
        wallet_address: walletAddress,
        items,
        total,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      throw new AppError('Failed to create order', 500)
    }

    return data as Order
  }

  static async getOrder(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      throw new AppError('Order not found', 404)
    }

    return data as Order
  }

  static async getUserOrders(walletAddress: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user orders:', error)
      throw new AppError('Failed to fetch orders', 500)
    }

    return data as Order[]
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating order status:', error)
      throw new AppError('Failed to update order status', 500)
    }

    return data as Order
  }
}
