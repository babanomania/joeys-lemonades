export interface CartItem {
  id: string
  name: string
  size: 'Small' | 'Large'
  price: number
  quantity: number
  sweetness: 'Less Sweet' | 'Normal' | 'Extra Sweet'
  ice: 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice'
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  walletAddress: string
  transactionSignature: string
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface NFTReward {
  id: string
  walletAddress: string
  tokenId: string
  type: 'purchase_count' | 'spend_amount'
  createdAt: string
}
