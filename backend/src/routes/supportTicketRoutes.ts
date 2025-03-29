import express, { Router } from 'express'
import { body, param } from 'express-validator'
import { SupportTicketController } from '../controllers/supportTicketController'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { apiLimiter } from '../middleware/rateLimiter'

const router: Router = express.Router()

// Apply auth middleware and rate limiting
router.use(authMiddleware)
router.use(apiLimiter)

// Create support ticket
router.post(
  '/',
  validate([
    body('subject').isString().trim().notEmpty().withMessage('Subject is required'),
    body('description').isString().trim().notEmpty().withMessage('Description is required'),
    body('orderId').optional().isUUID().withMessage('Invalid order ID')
  ]),
  SupportTicketController.createTicket
)

// Update ticket status (admin only)
router.patch(
  '/:ticketId/status',
  validate([
    param('ticketId').isUUID().withMessage('Invalid ticket ID'),
    body('status')
      .isIn(['open', 'in_progress', 'resolved', 'closed'])
      .withMessage('Invalid status'),
    body('adminResponse').optional().isString().trim().notEmpty()
      .withMessage('Admin response cannot be empty if provided')
  ]),
  SupportTicketController.updateTicketStatus
)

// Get user's tickets
router.get('/user', SupportTicketController.getUserTickets)

// Get specific ticket
router.get(
  '/:ticketId',
  validate([
    param('ticketId').isUUID().withMessage('Invalid ticket ID')
  ]),
  SupportTicketController.getTicketById
)

// Add comment to ticket
router.post(
  '/:ticketId/comments',
  validate([
    param('ticketId').isUUID().withMessage('Invalid ticket ID'),
    body('comment').isString().trim().notEmpty().withMessage('Comment is required')
  ]),
  SupportTicketController.addComment
)

// Get ticket comments
router.get(
  '/:ticketId/comments',
  validate([
    param('ticketId').isUUID().withMessage('Invalid ticket ID')
  ]),
  SupportTicketController.getTicketComments
)

export default router
