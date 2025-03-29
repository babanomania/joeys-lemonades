import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { AppError } from './errorHandler'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      walletAddress: string
      isAdmin: boolean
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const walletAddress = req.headers['wallet-address']

    if (!walletAddress || typeof walletAddress !== 'string') {
      throw new AppError('Unauthorized: Wallet address required', 401)
    }

    // Check if user exists and if they are an admin
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('wallet_address', walletAddress)
      .single()

    if (error || !user) {
      throw new AppError('Unauthorized: Invalid wallet address', 401)
    }

    // Add user to request object
    req.user = {
      walletAddress,
      isAdmin: user.is_admin || false
    }

    next()
  } catch (error) {
    next(error)
  }
}
