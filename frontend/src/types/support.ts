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
  createdAt: string
  updatedAt: string
}

export interface CreateTicketRequest {
  walletAddress: string
  orderId?: string
  subject: string
  description: string
  priority: TicketPriority
}

export interface UpdateTicketRequest {
  status?: TicketStatus
  priority?: TicketPriority
  description?: string
}

export interface TicketResponse {
  success: boolean
  ticket?: SupportTicket
  error?: string
}

export interface TicketListResponse {
  tickets: SupportTicket[]
  totalCount: number
  page: number
  pageSize: number
}
