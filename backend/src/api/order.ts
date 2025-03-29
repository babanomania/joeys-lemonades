import { createClient } from '@supabase/supabase-js'
import { Request, Response } from 'express'
import { OrderItem } from '../types/order'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { walletAddress, items, totalAmount } = req.body

    // Validate input
    if (!walletAddress || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user exists, if not create one
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single()

    if (!user) {
      await supabase
        .from('users')
        .insert([{ wallet_address: walletAddress }])
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        wallet_address: walletAddress,
        items,
        total_amount: totalAmount,
        status: 'pending'
      }])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return res.status(500).json({ error: 'Failed to create order' })
    }

    // Update inventory
    for (const item of items as OrderItem[]) {
      const { error: inventoryError } = await supabase.rpc('update_inventory', {
        item_name: item.name,
        quantity_change: -item.quantity
      })

      if (inventoryError) {
        console.error('Error updating inventory:', inventoryError)
        // Rollback order
        await supabase
          .from('orders')
          .delete()
          .eq('id', order.id)
        return res.status(500).json({ error: 'Failed to update inventory' })
      }
    }

    return res.status(201).json(order)
  } catch (error) {
    console.error('Error processing order:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { walletAddress } = req.query

    if (!id || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('wallet_address', walletAddress)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return res.status(500).json({ error: 'Failed to fetch order' })
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, transactionSignature } = req.body

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        transaction_signature: transactionSignature,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return res.status(500).json({ error: 'Failed to update order' })
    }

    return res.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
