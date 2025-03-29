import { supabase } from '../config/supabase'
import { AppError } from '../middleware/errorHandler'
import { SupportTicket } from '../models/types'

export class SupportTicketService {
  static async createTicket(
    walletAddress: string,
    subject: string,
    description: string,
    orderId?: string
  ): Promise<SupportTicket> {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          wallet_address: walletAddress,
          subject,
          description,
          order_id: orderId,
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single()

      if (error) throw error

      // Send notification to admin (could be implemented later)
      await this.notifyAdmin(ticket as SupportTicket)

      return {
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at)
      }
    } catch (error) {
      console.error('Error creating support ticket:', error)
      throw new AppError('Failed to create support ticket', 500)
    }
  }

  static async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed',
    adminResponse?: string
  ): Promise<SupportTicket> {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .update({
          status,
          admin_response: adminResponse,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single()

      if (error) throw error

      // Notify user about status update (could be implemented later)
      if (ticket) {
        await this.notifyUser({
          id: ticket.id,
          walletAddress: ticket.wallet_address,
          orderId: ticket.order_id,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: new Date(ticket.created_at),
          updatedAt: new Date(ticket.updated_at)
        })
      }

      return {
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at)
      }
    } catch (error) {
      console.error('Error updating support ticket:', error)
      throw new AppError('Failed to update support ticket', 500)
    }
  }

  static async getUserTickets(walletAddress: string): Promise<SupportTicket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })

      if (error) throw error

      return tickets.map(ticket => ({
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching user tickets:', error)
      throw new AppError('Failed to fetch support tickets', 500)
    }
  }

  static async getTicketById(ticketId: string): Promise<SupportTicket> {
    try {
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (error) throw error
      if (!ticket) throw new AppError('Ticket not found', 404)

      return {
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at)
      }
    } catch (error) {
      console.error('Error fetching support ticket:', error)
      if (error instanceof AppError) throw error
      throw new AppError('Failed to fetch support ticket', 500)
    }
  }

  static async addComment(
    ticketId: string,
    walletAddress: string,
    comment: string,
    isAdmin: boolean
  ): Promise<void> {
    try {
      const ticket = await this.getTicketById(ticketId)

      if (!isAdmin && ticket.walletAddress !== walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          wallet_address: walletAddress,
          comment,
          is_admin: isAdmin
        })

      if (error) throw error

      // Notify relevant party about new comment
      if (isAdmin) {
        await this.notifyUser(ticket)
      } else {
        await this.notifyAdmin(ticket)
      }
    } catch (error) {
      console.error('Error adding comment to ticket:', error)
      if (error instanceof AppError) throw error
      throw new AppError('Failed to add comment', 500)
    }
  }

  static async getTicketComments(ticketId: string): Promise<any[]> {
    try {
      const { data: comments, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return comments
    } catch (error) {
      console.error('Error fetching ticket comments:', error)
      throw new AppError('Failed to fetch ticket comments', 500)
    }
  }

  private static async notifyAdmin(ticket: SupportTicket): Promise<void> {
    // Implement admin notification system (email, webhook, etc.)
    console.log('Admin notification:', ticket)
  }

  private static async notifyUser(ticket: SupportTicket): Promise<void> {
    // Implement user notification system (email, in-app, etc.)
    console.log('User notification:', ticket)
  }
}
