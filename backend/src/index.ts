import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler, AppError } from './middleware/errorHandler'
import orderRoutes from './routes/orderRoutes'
import nftRewardRoutes from './routes/nftRewardRoutes'
import supportTicketRoutes from './routes/supportTicketRoutes'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/orders', orderRoutes)
app.use('/api/nft-rewards', nftRewardRoutes)
app.use('/api/support', supportTicketRoutes)

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' })
})

const errorHandlerMiddleware: ErrorRequestHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err instanceof AppError ? err.details : undefined
    })
    return
  }

  console.error('Unhandled error:', err)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}

app.use(errorHandlerMiddleware)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
