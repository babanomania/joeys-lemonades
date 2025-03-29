interface RewardProgress {
  currentCount: number
  nextTierAt: number | null
  progress: number
}

interface RewardTier {
  id: string
  name: string
  required_purchases: number
  discount: number
  description: string
}

export interface NFTReward {
  id: string
  wallet_address: string
  tier: string
  mint_address?: string
  metadata_uri?: string
  status: 'pending' | 'minted' | 'failed'
  created_at: string
  updated_at: string
}

interface RewardsResponse {
  orderCount: number
  ownedNFTs: NFTReward[]
  availableTiers: RewardTier[]
  nextTier: RewardTier | null
  progress: RewardProgress
}

export const fetchRewardsData = async (walletAddress: string): Promise<RewardsResponse> => {
  try {
    const response = await fetch(`/api/rewards?wallet=${walletAddress}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch rewards data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching rewards:', error)
    throw error
  }
}

export const claimReward = async (walletAddress: string, tierId: string): Promise<NFTReward> => {
  try {
    const response = await fetch('/api/rewards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        tierId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to claim reward')
    }

    const { nft } = await response.json()
    return nft
  } catch (error) {
    console.error('Error claiming reward:', error)
    throw error
  }
}
