'use client'

import { FC, useCallback, useMemo } from 'react'
import { Button, useToast } from '@chakra-ui/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export const CustomWalletButton: FC = () => {
  const { setVisible } = useWalletModal()
  const { wallet, connect, disconnect, connecting, connected, publicKey } = useWallet()
  const toast = useToast()

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
  const content = useMemo(() => {
    if (connecting) return 'Connecting...'
    if (connected) return `${base58?.slice(0, 4)}...${base58?.slice(-4)}`
    if (wallet) return 'Connect Wallet'
    return 'Select Wallet'
  }, [connecting, connected, wallet, base58])

  const handleClick = useCallback(async () => {
    try {
      if (connected) {
        await disconnect()
      } else if (wallet) {
        await connect()
      } else {
        setVisible(true)
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: (error as Error)?.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [connected, wallet, connect, disconnect, setVisible, toast])

  return (
    <Button
      colorScheme="orange"
      onClick={handleClick}
      isLoading={connecting}
      loadingText="Connecting..."
    >
      {content}
    </Button>
  )
}
