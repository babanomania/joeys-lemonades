import { API_BASE_URL } from '@/config/constants'
import { SupportTicket, TicketComment } from '@/types/supportTicket'

export const createTicket = async (
  walletAddress: string,
  subject: string,
  description: string,
  orderId?: string
): Promise<SupportTicket> => {
  const response = await fetch(`${API_BASE_URL}/api/support`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ subject, description, orderId })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create ticket')
  }

  const { data } = await response.json()
  return data
}

export const updateTicketStatus = async (
  walletAddress: string,
  ticketId: string,
  status: string,
  adminResponse?: string
): Promise<SupportTicket> => {
  const response = await fetch(`${API_BASE_URL}/api/support/${ticketId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ status, adminResponse })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update ticket status')
  }

  const { data } = await response.json()
  return data
}

export const getUserTickets = async (walletAddress: string): Promise<SupportTicket[]> => {
  const response = await fetch(`${API_BASE_URL}/api/support/user`, {
    headers: {
      'wallet-address': walletAddress
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch tickets')
  }

  const { data } = await response.json()
  return data
}

export const getTicketById = async (
  walletAddress: string,
  ticketId: string
): Promise<SupportTicket> => {
  const response = await fetch(`${API_BASE_URL}/api/support/${ticketId}`, {
    headers: {
      'wallet-address': walletAddress
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch ticket')
  }

  const { data } = await response.json()
  return data
}

export const addComment = async (
  walletAddress: string,
  ticketId: string,
  comment: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/support/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ comment })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to add comment')
  }
}

export const getTicketComments = async (
  walletAddress: string,
  ticketId: string
): Promise<TicketComment[]> => {
  const response = await fetch(`${API_BASE_URL}/api/support/${ticketId}/comments`, {
    headers: {
      'wallet-address': walletAddress
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch comments')
  }

  const { data } = await response.json()
  return data
}
