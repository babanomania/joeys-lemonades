import { PublicKey } from '@solana/web3.js'

export interface PaymentRequest {
  amount: number
  walletAddress: string
  orderId: string
}

export interface PaymentResponse {
  success: boolean
  transactionSignature?: string
  error?: string
}

export interface TransactionStatus {
  signature: string
  status: 'confirmed' | 'failed' | 'pending'
  error?: string
}
