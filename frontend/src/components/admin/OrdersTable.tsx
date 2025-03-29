'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Text,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface OrderItem {
  name: string
  size: string
  sweetness: string
  ice: string
  quantity: number
  price: number
}

interface Order {
  id: string
  created_at: string
  wallet_address: string
  total_amount: number
  status: 'pending' | 'completed' | 'failed'
  items: OrderItem[]
  transaction_signature?: string
}

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending: 'yellow',
    completed: 'green',
    failed: 'red',
  }

  if (loading) {
    return <Text>Loading orders...</Text>
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Date</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th isNumeric>Total</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td fontSize="sm">{order.id.slice(0, 8)}...</Td>
              <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
              <Td fontSize="sm">{order.wallet_address.slice(0, 8)}...</Td>
              <Td>
                <Box>
                  {order.items.map((item, index) => (
                    <Text key={index} fontSize="sm">
                      {item.quantity}x {item.name} ({item.size})
                    </Text>
                  ))}
                </Box>
              </Td>
              <Td isNumeric>${order.total_amount.toFixed(2)}</Td>
              <Td>
                <Badge colorScheme={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
