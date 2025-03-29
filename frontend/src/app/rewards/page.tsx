'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  Box,
  Button,
  Container,
  Heading,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  useToast,
  VStack,
  useColorModeValue,
  Badge,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrophy,
  faMedal,
  faCrown,
  faLock,
  faCheck,
  faGift,
} from '@fortawesome/free-solid-svg-icons'
import { fetchRewardsData, claimReward, NFTReward } from '@/services/rewardsService'
import { Header } from '@/components/Header'
import { SharedCard } from '@/components/SharedCard'

// Dynamically import WalletMultiButton with ssr disabled
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const rewardTiers = [
  {
    id: 'purchase_count_bronze',
    name: 'Bronze',
    icon: faMedal,
    color: '#CD7F32',
    required_purchases: 5,
    discount: 5,
    description: 'Unlock a 5% discount on all future orders',
    benefits: ['5% discount on all orders', 'Early access to seasonal flavors', 'Exclusive Bronze NFT'],
  },
  {
    id: 'purchase_count_silver',
    name: 'Silver',
    icon: faMedal,
    color: '#C0C0C0',
    required_purchases: 10,
    discount: 10,
    description: 'Unlock a 10% discount on all future orders',
    benefits: ['10% discount on all orders', 'Priority customer support', 'Limited edition Silver NFT', 'Monthly rewards'],
  },
  {
    id: 'purchase_count_gold',
    name: 'Gold',
    icon: faCrown,
    color: '#FFD700',
    required_purchases: 20,
    discount: 15,
    description: 'Unlock a 15% discount on all future orders',
    benefits: ['15% discount on all orders', 'VIP customer support', 'Exclusive Gold NFT', 'Free delivery', 'Special event invites'],
  },
]

export default function RewardsPage() {
  const { publicKey } = useWallet()
  const toast = useToast()
  const [purchaseCount, setPurchaseCount] = useState(0)
  const [ownedNFTs, setOwnedNFTs] = useState<NFTReward[]>([])
  const [progress, setProgress] = useState(0)
  const [nextTierAt, setNextTierAt] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [claimingTier, setClaimingTier] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, blue.900, purple.900)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (publicKey && mounted) {
      loadRewardsData()
    }
  }, [publicKey, mounted])

  const loadRewardsData = async () => {
    if (!publicKey) return

    try {
      const rewardsData = await fetchRewardsData(publicKey.toString())
      
      setPurchaseCount(rewardsData.orderCount)
      setProgress(rewardsData.progress.progress)
      setNextTierAt(rewardsData.progress.nextTierAt)
      setOwnedNFTs(rewardsData.ownedNFTs)
    } catch (error) {
      console.error('Error loading rewards:', error)
      toast({
        title: 'Error loading rewards',
        description: 'Failed to load your rewards data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleClaimReward = async (tierId: string) => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to claim rewards.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setClaimingTier(tierId)
    setIsLoading(true)

    try {
      await claimReward(publicKey.toString(), tierId)
      
      toast({
        title: 'Success!',
        description: 'Your NFT reward has been claimed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      await loadRewardsData()
    } catch (error: any) {
      console.error('Error claiming reward:', error)
      toast({
        title: 'Failed to claim reward',
        description: error.message || 'An error occurred while claiming your reward.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setClaimingTier(null)
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Header />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading mb={4}>Rewards & Loyalty Program</Heading>
            {!publicKey ? (
              <SharedCard p={6}>
                <VStack spacing={4}>
                  <Text>Connect your wallet to view and claim rewards</Text>
                  <WalletMultiButton />
                </VStack>
              </SharedCard>
            ) : (
              <>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {rewardTiers.map((tier) => {
                    const isUnlocked = purchaseCount >= tier.required_purchases;
                    const isOwned = ownedNFTs.some(
                      (nft) => nft.tier === tier.id && nft.status === 'minted'
                    );
                    
                    return (
                      <SharedCard key={tier.id} p={6}>
                        <VStack spacing={6} align="center">
                          <Box
                            p={8}
                            borderRadius="full"
                            bg={useColorModeValue(`${tier.color}10`, `${tier.color}20`)}
                          >
                            <Icon
                              as={FontAwesomeIcon}
                              icon={tier.icon}
                              boxSize={16}
                              color={tier.color}
                            />
                          </Box>
                          <Heading size="md">{tier.name}</Heading>
                          <Text>Required Purchases: {tier.required_purchases}</Text>
                          <Progress
                            value={(purchaseCount / tier.required_purchases) * 100}
                            width="100%"
                            colorScheme="blue"
                            rounded="md"
                            size="lg"
                          />
                          <Button
                            colorScheme="blue"
                            isDisabled={!isUnlocked || isOwned || isLoading}
                            isLoading={claimingTier === tier.id}
                            leftIcon={
                              <Icon
                                as={FontAwesomeIcon}
                                icon={isOwned ? faCheck : faGift}
                              />
                            }
                            onClick={() => handleClaimReward(tier.id)}
                            width="100%"
                            size="lg"
                          >
                            {isOwned
                              ? 'Claimed'
                              : isUnlocked
                              ? 'Claim Reward'
                              : `${tier.required_purchases - purchaseCount} more purchases needed`}
                          </Button>
                        </VStack>
                      </SharedCard>
                    )
                  })}
                </SimpleGrid>
              </>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
