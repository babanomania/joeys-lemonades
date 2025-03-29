import express, { Router } from 'express'
import { body, param } from 'express-validator'
import { OrderController } from '../controllers/orderController'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { apiLimiter } from '../middleware/rateLimiter'

const router: Router = express.Router()

// Apply auth middleware and rate limiting to all order routes
router.use(authMiddleware)
router.use(apiLimiter)

// Create order
router.post(
  '/',
  validate([
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.name').isString().notEmpty().withMessage('Item name is required'),
    body('items.*.size').isIn(['small', 'large']).withMessage('Invalid size'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  ]),
  OrderController.createOrder
)

// Get user orders
router.get('/user', OrderController.getUserOrders)

// Get specific order
router.get(
  '/:orderId',
  validate([
    param('orderId').isUUID().withMessage('Invalid order ID')
  ]),
  OrderController.getOrder
)

// Update order status
router.patch(
  '/:orderId/status',
  validate([
    param('orderId').isUUID().withMessage('Invalid order ID'),
    body('status').isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Invalid status'),
  ]),
  OrderController.updateOrderStatus
)

export default router
