import { Connection, PublicKey } from '@solana/web3.js'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.SOLANA_RPC_URL) {
  throw new Error('Missing env.SOLANA_RPC_URL')
}

if (!process.env.STORE_WALLET) {
  throw new Error('Missing env.STORE_WALLET')
}

export const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed')
export const storeWallet = new PublicKey(process.env.STORE_WALLET)

// Initialize Metaplex
export const metaplex = Metaplex.make(connection)
