export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  walletAddress: string
  orderId?: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  adminResponse?: string
  createdAt: Date
  updatedAt: Date
}

export interface TicketComment {
  id: string
  ticketId: string
  walletAddress: string
  comment: string
  isAdmin: boolean
  createdAt: Date
}

export interface CreateTicketInput {
  subject: string
  description: string
  orderId?: string
}

export interface UpdateTicketStatusInput {
  status: TicketStatus
  adminResponse?: string
}
