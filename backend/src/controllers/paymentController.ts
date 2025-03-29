import { Request, Response, NextFunction } from 'express'
import { PaymentService } from '../services/paymentService'
import { OrderService } from '../services/orderService'
import { AppError } from '../middleware/errorHandler'

export class PaymentController {
  static async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      // Get order details
      const order = await OrderService.getOrder(orderId)

      // Verify order belongs to user
      if (order.walletAddress !== walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      // Create payment transaction
      const serializedTransaction = await PaymentService.createPayment(
        order.total,
        walletAddress
      )

      res.status(200).json({
        data: {
          transaction: serializedTransaction,
          amount: order.total
        }
      })
    } catch (error) {
      next(error)
    }
  }

  static async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params
      const { signature } = req.body
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      if (!signature) {
        throw new AppError('Transaction signature required', 400)
      }

      // Get order details
      const order = await OrderService.getOrder(orderId)

      // Verify order belongs to user
      if (order.walletAddress !== walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      // Confirm payment
      await PaymentService.confirmPayment(signature)

      // Update order status
      const updatedOrder = await OrderService.updateOrderStatus(orderId, 'completed')

      res.status(200).json({
        data: {
          order: updatedOrder,
          signature
        }
      })
    } catch (error) {
      next(error)
    }
  }

  static async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const balance = await PaymentService.getBalance(walletAddress)

      res.status(200).json({
        data: {
          balance,
          walletAddress
        }
      })
    } catch (error) {
      next(error)
    }
  }
}
