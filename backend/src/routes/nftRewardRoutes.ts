import express, { Router } from 'express'
import { body } from 'express-validator'
import { NFTRewardController } from '../controllers/nftRewardController'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { apiLimiter } from '../middleware/rateLimiter'

const router: Router = express.Router()

// Apply auth middleware and rate limiting
router.use(authMiddleware)
router.use(apiLimiter)

// Check NFT eligibility
router.get('/eligibility', NFTRewardController.checkEligibility)

// Get user's NFT rewards
router.get('/user', NFTRewardController.getUserRewards)

// Mint new NFT reward
router.post(
  '/mint',
  validate([
    body('type')
      .isIn(['purchase_count', 'spend_amount'])
      .withMessage('Invalid reward type'),
  ]),
  NFTRewardController.mintNFT
)

export default router
