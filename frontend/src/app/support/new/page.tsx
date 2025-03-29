'use client'

import { Box, Container } from '@chakra-ui/react'
import { Header } from '@/components/Header'
import { NewTicketForm } from '@/components/support/NewTicketForm'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function NewTicket() {
  const { publicKey } = useWallet()

  return (
    <Box minH="100vh">
      <Header />
      <Container maxW="container.xl" py={8}>
        {!publicKey ? (
          <Box textAlign="center" py={8}>
            <WalletMultiButton />
          </Box>
        ) : (
          <NewTicketForm />
        )}
      </Container>
    </Box>
  )
}
