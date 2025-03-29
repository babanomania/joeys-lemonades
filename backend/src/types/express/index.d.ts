declare namespace Express {
  export interface Request {
    user?: {
      walletAddress: string
    }
  }
}
