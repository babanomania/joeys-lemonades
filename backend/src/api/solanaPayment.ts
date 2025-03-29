import { createClient } from '@supabase/supabase-js'
import { Request, Response } from 'express'
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
const storeWallet = new PublicKey(process.env.STORE_WALLET!)

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, walletAddress } = req.body

    if (!orderId || !amount || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        order_id: orderId,
        wallet_address: walletAddress,
        amount,
        status: 'pending'
      }])
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return res.status(500).json({ error: 'Failed to create transaction' })
    }

    // Create Solana transaction instruction
    const buyerWallet = new PublicKey(walletAddress)
    const lamports = Math.round(amount * LAMPORTS_PER_SOL)

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: buyerWallet,
      toPubkey: storeWallet,
      lamports
    })

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()

    // Create transaction
    const solanaTransaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerWallet
    }).add(transferInstruction)

    // Return transaction data for signing on frontend
    return res.json({
      transaction: solanaTransaction,
      message: 'Transaction created successfully'
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, transactionSignature } = req.body

    if (!orderId || !transactionSignature) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Confirm transaction on Solana
    const confirmation = await connection.confirmTransaction(transactionSignature)

    if (confirmation.value.err) {
      console.error('Transaction failed:', confirmation.value.err)
      return res.status(400).json({ error: 'Transaction failed' })
    }

    // Update transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        signature: transactionSignature,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (transactionError) {
      console.error('Error updating transaction:', transactionError)
      return res.status(500).json({ error: 'Failed to update transaction' })
    }

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        transaction_signature: transactionSignature,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('Error updating order:', orderError)
      return res.status(500).json({ error: 'Failed to update order' })
    }

    return res.json({
      message: 'Payment confirmed successfully',
      transactionSignature
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
