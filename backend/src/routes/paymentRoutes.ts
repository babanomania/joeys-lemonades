import express, { Router } from 'express'
import { body, param } from 'express-validator'
import { PaymentController } from '../controllers/paymentController'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { apiLimiter } from '../middleware/rateLimiter'

const router: Router = express.Router()

// Apply auth middleware and rate limiting
router.use(authMiddleware)
router.use(apiLimiter)

// Create payment transaction for order
router.post(
  '/orders/:orderId',
  validate([
    param('orderId').isUUID().withMessage('Invalid order ID')
  ]),
  PaymentController.createPayment
)

// Confirm payment for order
router.post(
  '/orders/:orderId/confirm',
  validate([
    param('orderId').isUUID().withMessage('Invalid order ID'),
    body('signature').isString().notEmpty().withMessage('Transaction signature is required')
  ]),
  PaymentController.confirmPayment
)

// Get wallet balance
router.get('/balance', PaymentController.getBalance)

export default router
