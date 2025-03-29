import { Request, Response, NextFunction } from 'express'
import { SupportTicketService } from '../services/supportTicketService'
import { AppError } from '../middleware/errorHandler'

export class SupportTicketController {
  static async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { subject, description, orderId } = req.body
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const ticket = await SupportTicketService.createTicket(
        walletAddress,
        subject,
        description,
        orderId
      )

      res.status(201).json({ data: ticket })
    } catch (error) {
      next(error)
    }
  }

  static async updateTicketStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params
      const { status, adminResponse } = req.body
      const walletAddress = req.user?.walletAddress
      const isAdmin = req.user?.isAdmin

      if (!walletAddress || !isAdmin) {
        throw new AppError('Unauthorized', 401)
      }

      const ticket = await SupportTicketService.updateTicketStatus(
        ticketId,
        status,
        adminResponse
      )

      res.status(200).json({ data: ticket })
    } catch (error) {
      next(error)
    }
  }

  static async getUserTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const tickets = await SupportTicketService.getUserTickets(walletAddress)
      res.status(200).json({ data: tickets })
    } catch (error) {
      next(error)
    }
  }

  static async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params
      const walletAddress = req.user?.walletAddress
      const isAdmin = req.user?.isAdmin

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const ticket = await SupportTicketService.getTicketById(ticketId)

      // Check if user has access to this ticket
      if (!isAdmin && ticket.walletAddress !== walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      res.status(200).json({ data: ticket })
    } catch (error) {
      next(error)
    }
  }

  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params
      const { comment } = req.body
      const walletAddress = req.user?.walletAddress
      const isAdmin = req.user?.isAdmin

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      await SupportTicketService.addComment(
        ticketId,
        walletAddress,
        comment,
        Boolean(isAdmin)
      )

      res.status(201).json({ message: 'Comment added successfully' })
    } catch (error) {
      next(error)
    }
  }

  static async getTicketComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params
      const walletAddress = req.user?.walletAddress
      const isAdmin = req.user?.isAdmin

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      // Verify user has access to this ticket
      const ticket = await SupportTicketService.getTicketById(ticketId)
      if (!isAdmin && ticket.walletAddress !== walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const comments = await SupportTicketService.getTicketComments(ticketId)
      res.status(200).json({ data: comments })
    } catch (error) {
      next(error)
    }
  }
}
