import { Request, Response, NextFunction } from 'express'

interface ValidationErrorDetail {
  path: string
  message: string
}

export class AppError extends Error {
  statusCode: number
  details?: ValidationErrorDetail[]

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details
    })
  }

  console.error('Unhandled error:', err)
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}
