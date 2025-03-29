'use client'

import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  Button,
  useToast,
} from '@chakra-ui/react'
import { useCart } from '@/app/contexts/CartContext'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { processPayment } from '@/services/paymentService'

export function PaymentSummary() {
  const { items, total, clearCart } = useCart()
  const { publicKey, connected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  const handlePayment = async () => {
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed with payment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsProcessing(true)
    try {
      await processPayment({
        items,
        total,
        walletAddress: publicKey.toString(),
      })

      toast({
        title: 'Payment Successful',
        description: 'Your order has been placed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      clearCart()
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An error occurred during payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      bg="white"
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Order Summary</Heading>
        
        {items.map((item, index) => (
          <Box key={index}>
            <Text>
              {item.quantity}x {item.size} {item.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {item.sweetness}, {item.ice}
            </Text>
            <Text fontWeight="bold">
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </Box>
        ))}
        
        <Divider />
        
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Total: ${total.toFixed(2)}
          </Text>
        </Box>
        
        <Button
          colorScheme="orange"
          size="lg"
          onClick={handlePayment}
          isLoading={isProcessing}
          loadingText="Processing Payment"
          isDisabled={!connected || items.length === 0}
        >
          {connected ? 'Pay with Solana' : 'Connect Wallet to Pay'}
        </Button>
      </VStack>
    </Box>
  )
}
