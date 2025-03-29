import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { useWallet } from '@solana/wallet-adapter-react'
import api from '@/lib/api'

export interface NFTReward {
  id: string
  wallet_address: string
  type: 'purchase_count' | 'spend_amount'
  status: 'minted' | 'failed'
  transaction_signature: string
  created_at: string
}

export const useNFTRewards = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rewards, setRewards] = useState<NFTReward[]>([])
  const [eligibility, setEligibility] = useState<{
    eligible: boolean
    type?: string
  } | null>(null)
  const toast = useToast()
  const { publicKey } = useWallet()

  const checkEligibility = useCallback(async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/nft-rewards/eligibility')
      setEligibility(response.data)
      return response.data
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error checking eligibility',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [publicKey, toast])

  const mintNFT = useCallback(async (type: 'purchase_count' | 'spend_amount') => {
    if (!publicKey) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.post('/nft-rewards/mint', { type })
      
      // Update rewards list
      setRewards(prev => [response.data, ...prev])

      toast({
        title: 'NFT minted successfully',
        description: 'Your reward NFT has been minted!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      return response.data
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error minting NFT',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [publicKey, toast])

  const fetchRewards = useCallback(async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/nft-rewards/user')
      setRewards(response.data)
      return response.data
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error fetching rewards',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [publicKey, toast])

  return {
    loading,
    error,
    rewards,
    eligibility,
    checkEligibility,
    mintNFT,
    fetchRewards,
  }
}
