export interface User {
  id: string
  walletAddress: string
  totalOrders: number
  totalSpent: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  walletAddress: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  transactionSignature: string
  createdAt: Date
  updatedAt: Date
}

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

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface NFTReward {
  id: string
  wallet_address: string
  tier: RewardTier
  mint_address?: string
  metadata_uri?: string
  status: NFTRewardStatus
  created_at: string
  updated_at: string
}

export type RewardTier = 'purchase_count_bronze' | 'purchase_count_silver' | 'purchase_count_gold'
export type NFTRewardStatus = 'pending' | 'minted' | 'failed'

export interface SupportTicket {
  id: string
  walletAddress: string
  orderId?: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
  updatedAt: Date
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
