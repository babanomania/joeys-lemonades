import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { paymentApi } from '@/lib/api'
import { useToast } from '@chakra-ui/react'

export const usePayments = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const toast = useToast()

  const createPayment = useCallback(async (orderId: string) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)
      setError(null)

      // Get the payment transaction from backend
      const response = await paymentApi.create(orderId)
      const { transaction: serializedTransaction } = response.data

      // Deserialize and sign the transaction
      const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'))
      const signedTransaction = await signTransaction(transaction)
      
      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      
      // Confirm the transaction
      await paymentApi.confirm(orderId, signature)

      toast({
        title: 'Payment successful',
        description: 'Your order has been paid for',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      return signature
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Payment failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [publicKey, signTransaction, connection, toast])

  const getBalance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await paymentApi.getBalance()
      return response.data.balance
    } catch (err: any) {
      setError(err.message)
      toast({
        title: 'Error fetching balance',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    loading,
    error,
    createPayment,
    getBalance,
  }
}
