'use client'

import {
  Box,
  Image,
  Text,
  VStack,
  Badge,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react'

interface NFTCardProps {
  name: string
  image: string
  description: string
  rarity: 'Common' | 'Rare' | 'Legendary'
  mintDate: string
}

const rarityColors = {
  Common: 'gray',
  Rare: 'purple',
  Legendary: 'orange'
}

export function NFTCard({ name, image, description, rarity, mintDate }: NFTCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      bg={bgColor}
      boxShadow="sm"
      width="100%"
    >
      <Image
        src={image}
        alt={name}
        width="100%"
        height="200px"
        objectFit="cover"
      />

      <VStack p={6} align="start" spacing={4}>
        <Box width="100%">
          <Badge colorScheme={rarityColors[rarity]} mb={2}>
            {rarity}
          </Badge>
          <Heading size="md" mb={2}>{name}</Heading>
          <Text color={textColor} fontSize="sm" noOfLines={2}>
            {description}
          </Text>
        </Box>

        <Text fontSize="xs" color="gray.500">
          Minted on {mintDate}
        </Text>
      </VStack>
    </Box>
  )
}
