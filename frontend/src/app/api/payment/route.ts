import { NextResponse } from 'next/server'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createTransaction } from '@/lib/solana'
import { supabase } from '@/lib/supabase'
import { PaymentRequest, PaymentResponse } from '@/types/solana'

export async function POST(request: Request) {
  try {
    const body: PaymentRequest = await request.json()
    const { amount, walletAddress, orderId } = body

    // Validate request
    if (!amount || !walletAddress || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Validate wallet address
      const fromPubkey = new PublicKey(walletAddress)

      // Create Solana transaction
      const transaction = await createTransaction(amount, fromPubkey)

      // Return the serialized transaction for signing
      const serializedTransaction = Buffer.from(
        transaction.serialize({ requireAllSignatures: false })
      ).toString('base64')

      const response: PaymentResponse = {
        success: true,
        transactionSignature: serializedTransaction,
      }

      return NextResponse.json(response)
    } catch (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid wallet address',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
