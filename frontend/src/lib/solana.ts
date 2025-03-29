import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { TransactionStatus } from '@/types/solana'

// Initialize Solana connection
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
)

// Store owner's public key from environment variables
const OWNER_PUBLIC_KEY = new PublicKey(process.env.NEXT_PUBLIC_STORE_WALLET || '')

export async function createTransaction(
  amount: number,
  fromPubkey: PublicKey
): Promise<Transaction> {
  const transaction = new Transaction()

  // Convert amount to lamports (1 SOL = 1 billion lamports)
  const lamports = Math.round(amount * LAMPORTS_PER_SOL)

  // Add a transfer instruction to the transaction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: OWNER_PUBLIC_KEY,
      lamports,
    })
  )

  // Get the latest blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromPubkey

  return transaction
}

export async function checkTransactionStatus(
  signature: string
): Promise<TransactionStatus> {
  try {
    const status = await connection.getSignatureStatus(signature)

    if (!status || !status.value) {
      return {
        signature,
        status: 'pending',
      }
    }

    if (status.value.err) {
      return {
        signature,
        status: 'failed',
        error: 'Transaction failed',
      }
    }

    return {
      signature,
      status: 'confirmed',
    }
  } catch (error) {
    return {
      signature,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
