export interface OrderItem {
  name: string
  size: 'Small' | 'Large'
  sweetness: 'Less Sweet' | 'Normal' | 'Extra Sweet'
  ice: 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice'
  quantity: number
  price: number
}

export interface Order {
  id: string
  walletAddress: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'completed' | 'cancelled'
  transactionSignature?: string
  createdAt: Date
  updatedAt: Date
}
