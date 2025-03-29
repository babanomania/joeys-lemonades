import { Request, Response, NextFunction } from 'express'
import { NFTRewardService } from '../services/nftRewardService'
import { AppError } from '../middleware/errorHandler'

export class NFTRewardController {
  static async checkEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const eligibility = await NFTRewardService.checkEligibility(walletAddress)
      res.status(200).json({ data: eligibility })
    } catch (error) {
      next(error)
    }
  }

  static async mintNFT(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = req.user?.walletAddress
      const { tier } = req.body

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      if (!tier || !['purchase_count_bronze', 'purchase_count_silver', 'purchase_count_gold'].includes(tier)) {
        throw new AppError('Invalid reward tier', 400)
      }

      // Check eligibility before minting
      const { eligible, tier: eligibleTier } = await NFTRewardService.checkEligibility(walletAddress)

      if (!eligible) {
        throw new AppError('Not eligible for NFT reward', 400)
      }

      if (tier !== eligibleTier) {
        throw new AppError(`Not eligible for ${tier} reward`, 400)
      }

      const reward = await NFTRewardService.mintNFT(walletAddress, tier)
      res.status(201).json({ data: reward })
    } catch (error) {
      next(error)
    }
  }

  static async getUserRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = req.user?.walletAddress

      if (!walletAddress) {
        throw new AppError('Unauthorized', 401)
      }

      const rewards = await NFTRewardService.getUserRewards(walletAddress)
      res.status(200).json({ data: rewards })
    } catch (error) {
      next(error)
    }
  }
}
