import { Connection, PublicKey } from '@solana/web3.js'
import { createClient } from '@supabase/supabase-js'

export interface Order {
  id: string
  wallet_address: string
  items: Array<{
    name: string
    size: 'small' | 'large'
    quantity: number
    price: number
    customizations?: {
      sweetness?: number
      ice?: number
    }
  }>
  total: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transaction_signature: string
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  price: number
  size: 'small' | 'large'
  image_url: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface NFTReward {
  id: string
  wallet_address: string
  tier: string
  mint_address: string | null
  metadata_uri: string | null
  status: 'pending' | 'minted' | 'failed'
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activeCustomers: number
  nftsMinted: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class AdminService {
  private connection: Connection

  constructor() {
    this.connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com')
  }

  static async checkAdminAccess(walletAddress?: string | null) {
    if (!walletAddress) return false

    // Compare with store wallet, making sure both are in the same case
    const storeWallet = process.env.NEXT_PUBLIC_STORE_WALLET || ''
    console.log('Store wallet:', storeWallet)
    console.log('Connected wallet:', walletAddress)
    return walletAddress.toLowerCase() === storeWallet.toLowerCase()
  }

  async isAdmin(walletAddress: string): Promise<boolean> {
    if (!walletAddress) return false

    // Compare with store wallet, making sure both are in the same case
    const storeWallet = process.env.NEXT_PUBLIC_STORE_WALLET || ''
    return walletAddress.toLowerCase() === storeWallet.toLowerCase()
  }

  async getOrders(): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw error
    }

    return orders || []
  }

  async getInventory(): Promise<InventoryItem[]> {
    const { data: inventory, error } = await supabase
      .from('lemonade_items')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching inventory:', error)
      throw error
    }

    return inventory || []
  }

  async getNFTRewards() {
    try {
      const { data, error } = await supabase
        .from('nft_rewards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data.map((reward) => ({
        ownerAddress: reward.wallet_address,
        mintAddress: reward.mint_address || '',
        tier: reward.type === 'purchase_count' ? 'bronze' : 'gold',
        mintedAt: reward.created_at,
        metadata: reward.metadata_uri,
      }))
    } catch (error) {
      console.error('Error fetching NFT rewards:', error)
      throw error
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [ordersData, nftData] = await Promise.all([
        supabase
          .from('orders')
          .select('total, wallet_address, status')
          .eq('status', 'completed'),
        supabase
          .from('nft_rewards')
          .select('count')
          .eq('status', 'minted')
          .single()
      ])

      if (ordersData.error) throw ordersData.error
      if (nftData.error) throw nftData.error

      const orders = ordersData.data || []
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const uniqueCustomers = new Set(orders.map(order => order.wallet_address))

      return {
        totalOrders: orders.length,
        totalRevenue,
        activeCustomers: uniqueCustomers.size,
        nftsMinted: nftData.data?.count || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    const { error } = await supabase
      .from('lemonade_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId)

    if (error) {
      console.error('Error updating inventory item:', error)
      throw error
    }
  }
}
