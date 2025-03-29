import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { connection, storeWallet } from '../config/solana'
import { AppError } from '../middleware/errorHandler'

export class PaymentService {
  static async createPayment(amount: number, buyerWallet: string): Promise<string> {
    try {
      const buyerPublicKey = new PublicKey(buyerWallet)
      
      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: buyerPublicKey,
          toPubkey: storeWallet,
          lamports: amount * LAMPORTS_PER_SOL
        })
      )

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = buyerPublicKey

      // Serialize the transaction
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      })

      // Return the serialized transaction for the frontend to sign
      return serializedTransaction.toString('base64')
    } catch (error) {
      console.error('Error creating payment:', error)
      throw new AppError('Failed to create payment', 500)
    }
  }

  static async confirmPayment(signature: string): Promise<boolean> {
    try {
      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction(signature)

      if (confirmation.value.err) {
        throw new AppError('Payment failed', 400)
      }

      return true
    } catch (error) {
      console.error('Error confirming payment:', error)
      throw new AppError('Failed to confirm payment', 500)
    }
  }

  static async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress)
      const balance = await connection.getBalance(publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error getting balance:', error)
      throw new AppError('Failed to get balance', 500)
    }
  }
}
