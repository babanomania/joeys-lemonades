'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { WalletContextProvider } from './providers/WalletContextProvider'
import { CartProvider } from './contexts/CartContext'
import theme from '../theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <WalletContextProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </WalletContextProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}
