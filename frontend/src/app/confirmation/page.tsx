'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, VStack, Text, Button, Icon, useColorModeValue } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

export default function Confirmation() {
  const router = useRouter()
  const bgColor = useColorModeValue('white', 'gray.800')

  // If user refreshes this page, redirect them to menu
  useEffect(() => {
    const hasConfirmation = sessionStorage.getItem('orderConfirmation')
    if (!hasConfirmation) {
      router.push('/menu')
    }
    // Clear the confirmation flag when leaving the page
    return () => {
      sessionStorage.removeItem('orderConfirmation')
    }
  }, [router])

  return (
    <Box maxW="container.md" mx="auto" py={16} px={4}>
      <VStack
        spacing={8}
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="sm"
        textAlign="center"
      >
        <Icon as={CheckCircleIcon} w={16} h={16} color="green.500" />
        
        <VStack spacing={4}>
          <Text fontSize="3xl" fontWeight="bold">
            Order Confirmed!
          </Text>
          <Text color="gray.600">
            Thank you for your order. Your lemonade will be ready shortly.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Check your wallet for the transaction confirmation.
          </Text>
        </VStack>

        <VStack spacing={4} pt={4}>
          <Button
            colorScheme="orange"
            size="lg"
            onClick={() => router.push('/menu')}
          >
            Order More
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/rewards')}
          >
            Check Rewards
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}
