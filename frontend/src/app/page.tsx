'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Flex,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Grid,
} from '@chakra-ui/react'
import { Header } from '@/components/Header'
import { SharedCard } from '@/components/SharedCard'
import Link from 'next/link'
import Image from 'next/image'
import { FaLeaf, FaStar, FaWallet } from 'react-icons/fa'

const features = [
  {
    icon: FaLeaf,
    title: 'Fresh & Natural',
    description: 'Made with hand-picked lemons and natural ingredients daily.',
  },
  {
    icon: FaStar,
    title: 'NFT Rewards',
    description: 'Earn exclusive NFT rewards and unlock special perks.',
  },
  {
    icon: FaWallet,
    title: 'Solana Payments',
    description: 'Fast and secure payments using Solana blockchain.',
  },
]

const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859',
    alt: 'Refreshing lemonade with mint and ice',
  },
  {
    src: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    alt: 'Fresh lemons for our signature drinks',
  },
  {
    src: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e',
    alt: 'Handcrafted lemonade preparation',
  },
]

export default function Home() {
  const bgGradient = useColorModeValue(
    'linear(to-b, white, gray.50)',
    'linear(to-b, gray.900, gray.800)'
  )
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Header />
      
      {/* Hero Section */}
      <Container maxW="container.xl" py={16}>
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: 8, lg: 12 }}
          alignItems="center"
        >
          <VStack align="flex-start" spacing={8}>
            <VStack align="flex-start" spacing={4}>
              <Text
                color="orange.500"
                fontWeight="bold"
                fontSize="lg"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Welcome to Joey's
              </Text>
              <Heading
                as="h1"
                size="3xl"
                lineHeight="shorter"
                bgGradient="linear(to-r, orange.500, yellow.500)"
                bgClip="text"
              >
                Refresh Your Day with Premium Lemonades
              </Heading>
              <Text fontSize="xl" color={textColor} maxW="600px">
                Experience the perfect blend of traditional craftsmanship and modern technology.
                Every sip rewards you with our unique NFT loyalty program.
              </Text>
            </VStack>
            
            <Flex gap={4}>
              <Link href="/menu" passHref>
                <Button
                  as="a"
                  size="lg"
                  colorScheme="orange"
                  px={8}
                >
                  View Menu
                </Button>
              </Link>
              <Link href="/rewards" passHref>
                <Button
                  as="a"
                  size="lg"
                  colorScheme="yellow"
                  px={8}
                >
                  NFT Rewards
                </Button>
              </Link>
            </Flex>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {heroImages.map((image, index) => (
              <Box
                key={index}
                position="relative"
                height={{ base: '200px', md: index === 0 ? '400px' : '190px' }}
                gridColumn={index === 0 ? 'span 2' : 'auto'}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: 'cover', borderRadius: '12px' }}
                  priority={index === 0}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {features.map((feature, index) => (
            <SharedCard key={index} p={8}>
              <VStack spacing={4} align="flex-start">
                <Icon
                  as={feature.icon}
                  boxSize={10}
                  color="orange.500"
                />
                <Heading size="md">{feature.title}</Heading>
                <Text color={textColor}>{feature.description}</Text>
              </VStack>
            </SharedCard>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
