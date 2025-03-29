import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper function to handle database errors
export function handleDatabaseError(error: unknown): never {
  console.error('Database error:', error)
  throw new Error('An error occurred while accessing the database')
}

// Helper function to validate order exists
export async function validateOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .single()

  if (error || !data) {
    throw new Error('Order not found')
  }

  return data
}

// Helper function to check NFT reward eligibility
export async function checkNFTRewardEligibility(walletAddress: string) {
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('wallet_address', walletAddress)
    .eq('status', 'confirmed')

  return {
    isEligible: count === 5,
    purchaseCount: count,
  }
}

// Helper function to create NFT reward
export async function createNFTReward(walletAddress: string, type: 'purchase_count' | 'spend_amount') {
  const { error } = await supabase
    .from('nft_rewards')
    .insert([
      {
        wallet_address: walletAddress,
        type,
        status: 'pending',
      },
    ])

  if (error) {
    handleDatabaseError(error)
  }
}
