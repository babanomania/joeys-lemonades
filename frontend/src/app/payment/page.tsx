'use client';

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react';
import { Header } from '@/components/Header';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { submitOrder } from '@/services/orderService';
import BN from 'bn.js';

const STORE_WALLET = new PublicKey(process.env.NEXT_PUBLIC_STORE_WALLET || '');

interface CartItemWithCustomizations {
  id: string;
  name: string;
  price: number;
  customizations: {
    size: 'Small' | 'Large';
    sweetness: 'Less Sweet' | 'Normal' | 'Extra Sweet';
    ice: 'No Ice' | 'Light Ice' | 'Regular Ice' | 'Extra Ice';
  };
}

export default function PaymentPage() {
  const { items, total, clearCart } = useCart();
  const { publicKey, sendTransaction } = useWallet();
  const router = useRouter();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handlePayment = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed with payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com');
      
      const amountInSol = total / 100;
      const lamports = new BN(amountInSol * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: STORE_WALLET,
          lamports: lamports.toNumber(),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      await submitOrder({
        items,
        total,
        walletAddress: publicKey.toString(),
        transactionSignature: signature,
      });

      sessionStorage.setItem('orderConfirmation', 'true');
      clearCart();
      
      toast({
        title: 'Payment successful',
        description: `Transaction signature: ${signature}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/confirmation');
    } catch (error) {
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Header />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="center">
            <Heading>Your Cart is Empty</Heading>
            <Button
              leftIcon={<Icon as={FaArrowLeft} />}
              colorScheme="orange"
              onClick={() => router.push('/menu')}
            >
              Return to Menu
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Button
              leftIcon={<Icon as={FaArrowLeft} />}
              variant="ghost"
              onClick={() => router.push('/menu')}
            >
              Back to Menu
            </Button>
            <Heading
              bgGradient="linear(to-r, orange.500, yellow.500)"
              bgClip="text"
              size="lg"
            >
              Review Your Order
            </Heading>
          </Flex>

          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
            <GridItem>
              <Box bg={cardBg} p={6} borderRadius="lg" shadow="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" mb={4}>Order Summary</Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Item</Th>
                        <Th>Customizations</Th>
                        <Th isNumeric>Price</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {items.map((item, index) => (
                        <Tr key={index}>
                          <Td>{item.name}</Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {item.customizations.size}, {item.customizations.sweetness}, {item.customizations.ice}
                            </Text>
                          </Td>
                          <Td isNumeric>${item.price.toFixed(2)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box bg={cardBg} p={6} borderRadius="lg" shadow="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Payment Details</Heading>
                  <Divider />
                  <Flex justify="space-between">
                    <Text>Subtotal:</Text>
                    <Text>${total.toFixed(2)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Tax (10%):</Text>
                    <Text>${(total * 0.1).toFixed(2)}</Text>
                  </Flex>
                  <Divider />
                  <Flex justify="space-between" fontWeight="bold">
                    <Text>Total:</Text>
                    <Text>${(total * 1.1).toFixed(2)}</Text>
                  </Flex>
                  <Text fontSize="sm" color={textColor} textAlign="right">
                    ≈ {(total * 1.1 / 100).toFixed(3)} SOL
                  </Text>
                  <Button
                    colorScheme="orange"
                    size="lg"
                    w="full"
                    mt={4}
                    leftIcon={<Icon as={FaCreditCard} />}
                    onClick={handlePayment}
                    isLoading={isProcessing}
                    loadingText="Processing Payment"
                    isDisabled={!publicKey}
                  >
                    {publicKey ? 'Pay with Solana' : 'Connect Wallet to Pay'}
                  </Button>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    Using Solana {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'} network
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
}
