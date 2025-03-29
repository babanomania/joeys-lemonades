import { Request, Response, NextFunction } from 'express'
import { OrderService } from '../services/orderService'
import { AppError } from '../middleware/errorHandler'
import { OrderItem } from '../models/types'

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      if (!items || !Array.isArray(items)) {
        throw new AppError('Invalid order items', 400)
      }

      const order = await OrderService.createOrder(walletAddress, items as OrderItem[])
      res.status(201).json({ data: order })
    } catch (error) {
      next(error)
    }
  }

  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params
      const order = await OrderService.getOrder(orderId)
      res.status(200).json({ data: order })
    } catch (error) {
      next(error)
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const orders = await OrderService.getUserOrders(walletAddress)
      res.status(200).json({ data: orders })
    } catch (error) {
      next(error)
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params
      const { status } = req.body

      if (!status) {
        throw new AppError('Status is required', 400)
      }

      const order = await OrderService.updateOrderStatus(orderId, status)
      res.status(200).json({ data: order })
    } catch (error) {
      next(error)
    }
  }
}
