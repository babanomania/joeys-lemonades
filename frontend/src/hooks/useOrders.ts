import { useState, useCallback } from 'react'
import { orderApi } from '@/lib/api'
import { useToast } from '@chakra-ui/react'

export interface OrderItem {
  name: string
  size: 'small' | 'large'
  quantity: number
  price: number
  customizations?: {
    sweetness?: number
    ice?: number
  }
}

export interface Order {
  id: string
  walletAddress: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transactionSignature?: string
  createdAt: string
  updatedAt: string
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await orderApi.getAll()
      setOrders(response.data)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error fetching orders',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const createOrder = useCallback(async (items: OrderItem[]) => {
    try {
      setLoading(true)
      setError(null)
      const response = await orderApi.create(items)
      setOrders(prev => [...prev, response.data])
      return response.data
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error creating order',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      setLoading(true)
      setError(null)
      const response = await orderApi.updateStatus(orderId, status)
      setOrders(prev => prev.map(order => 
        order.id === orderId ? response.data : order
      ))
      return response.data
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error updating order',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  }
}
