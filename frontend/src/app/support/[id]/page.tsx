'use client'

import { Box, Container } from '@chakra-ui/react'
import { Header } from '@/components/Header'
import { TicketDetail } from '@/components/support/TicketDetail'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useParams } from 'next/navigation'

export default function TicketPage() {
  const { publicKey } = useWallet()
  const params = useParams()
  const ticketId = params?.id as string

  return (
    <Box minH="100vh">
      <Header />
      <Container maxW="container.xl" py={8}>
        {!publicKey ? (
          <Box textAlign="center" py={8}>
            <WalletMultiButton />
          </Box>
        ) : (
          <TicketDetail ticketId={ticketId} />
        )}
      </Container>
    </Box>
  )
}
