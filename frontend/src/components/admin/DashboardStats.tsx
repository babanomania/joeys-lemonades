'use client'

import {
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiShoppingBag, FiDollarSign, FiUsers, FiAward } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Stats {
  totalOrders: number
  totalRevenue: number
  uniqueCustomers: number
  nftsMinted: number
  orderGrowth: number
  revenueGrowth: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    uniqueCustomers: 0,
    nftsMinted: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
  })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total orders and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, wallet_address, created_at')
        .eq('status', 'completed')

      if (!orders) return

      // Calculate current month's stats
      const now = new Date()
      const currentMonth = now.getMonth()
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1))

      const currentMonthOrders = orders.filter(
        order => new Date(order.created_at).getMonth() === currentMonth
      )
      const lastMonthOrders = orders.filter(
        order => new Date(order.created_at).getMonth() === lastMonth.getMonth()
      )

      // Calculate growth rates
      const orderGrowth = lastMonthOrders.length
        ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
        : 0

      const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const lastRevenue = lastMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const revenueGrowth = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0

      // Get unique customers
      const uniqueCustomers = new Set(orders.map(order => order.wallet_address)).size

      // Fetch NFT count
      const { count: nftCount } = await supabase
        .from('nft_rewards')
        .select('*', { count: 'exact' })

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
        uniqueCustomers,
        nftsMinted: nftCount || 0,
        orderGrowth,
        revenueGrowth,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel display="flex" alignItems="center" gap={2}>
            <Icon as={FiShoppingBag} /> Orders
          </StatLabel>
          <StatNumber>{stats.totalOrders}</StatNumber>
          <StatHelpText>
            <StatArrow type={stats.orderGrowth >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(stats.orderGrowth).toFixed(1)}%
          </StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel display="flex" alignItems="center" gap={2}>
            <Icon as={FiDollarSign} /> Revenue
          </StatLabel>
          <StatNumber>${stats.totalRevenue.toFixed(2)}</StatNumber>
          <StatHelpText>
            <StatArrow type={stats.revenueGrowth >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(stats.revenueGrowth).toFixed(1)}%
          </StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel display="flex" alignItems="center" gap={2}>
            <Icon as={FiUsers} /> Customers
          </StatLabel>
          <StatNumber>{stats.uniqueCustomers}</StatNumber>
          <StatHelpText>Unique wallets</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Stat>
          <StatLabel display="flex" alignItems="center" gap={2}>
            <Icon as={FiAward} /> NFTs
          </StatLabel>
          <StatNumber>{stats.nftsMinted}</StatNumber>
          <StatHelpText>Rewards minted</StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  )
}
