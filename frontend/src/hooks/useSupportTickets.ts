import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useToast } from '@chakra-ui/react'
import {
  SupportTicket,
  TicketComment,
  CreateTicketInput,
  UpdateTicketStatusInput
} from '@/types/supportTicket'
import {
  createTicket,
  updateTicketStatus,
  getUserTickets,
  getTicketById,
  addComment,
  getTicketComments
} from '@/api/supportTickets'

export const useSupportTickets = () => {
  const { publicKey } = useWallet()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])

  const handleError = (error: any) => {
    console.error('Support ticket error:', error)
    toast({
      title: 'Error',
      description: error.message || 'Something went wrong',
      status: 'error',
      duration: 5000,
      isClosable: true
    })
  }

  const fetchTickets = useCallback(async () => {
    if (!publicKey) return

    try {
      setLoading(true)
      const walletAddress = publicKey.toString()
      const fetchedTickets = await getUserTickets(walletAddress)
      setTickets(fetchedTickets)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const fetchTicket = useCallback(async (ticketId: string) => {
    if (!publicKey) return

    try {
      setLoading(true)
      const walletAddress = publicKey.toString()
      const ticket = await getTicketById(walletAddress, ticketId)
      setCurrentTicket(ticket)

      // Fetch comments for the ticket
      const ticketComments = await getTicketComments(walletAddress, ticketId)
      setComments(ticketComments)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const submitTicket = useCallback(async (input: CreateTicketInput) => {
    if (!publicKey) return

    try {
      setLoading(true)
      const walletAddress = publicKey.toString()
      const newTicket = await createTicket(
        walletAddress,
        input.subject,
        input.description,
        input.orderId
      )
      
      setTickets(prev => [newTicket, ...prev])
      toast({
        title: 'Success',
        description: 'Support ticket created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      
      return newTicket
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  const updateStatus = useCallback(async (ticketId: string, input: UpdateTicketStatusInput) => {
    if (!publicKey) return

    try {
      setLoading(true)
      const walletAddress = publicKey.toString()
      const updatedTicket = await updateTicketStatus(
        walletAddress,
        ticketId,
        input.status,
        input.adminResponse
      )

      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ))
      
      if (currentTicket?.id === ticketId) {
        setCurrentTicket(updatedTicket)
      }

      toast({
        title: 'Success',
        description: 'Ticket status updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [publicKey, currentTicket])

  const submitComment = useCallback(async (ticketId: string, comment: string) => {
    if (!publicKey) return

    try {
      setLoading(true)
      const walletAddress = publicKey.toString()
      await addComment(walletAddress, ticketId, comment)
      
      // Refresh comments after adding a new one
      const newComments = await getTicketComments(walletAddress, ticketId)
      setComments(newComments)

      toast({
        title: 'Success',
        description: 'Comment added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  return {
    loading,
    tickets,
    currentTicket,
    comments,
    fetchTickets,
    fetchTicket,
    submitTicket,
    updateStatus,
    submitComment
  }
}
