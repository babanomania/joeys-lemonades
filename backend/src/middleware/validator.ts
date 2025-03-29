import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain, ValidationError } from 'express-validator'
import { AppError } from './errorHandler'

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)))

      const errors = validationResult(req)
      if (errors.isEmpty()) {
        return next()
      }

      const formattedErrors = errors.array().map((error: ValidationError) => ({
        path: error.type === 'field' ? error.path : error.type,
        message: error.msg
      }))

      const error = new AppError('Validation failed', 400)
      error.details = formattedErrors
      throw error
    } catch (error) {
      next(error)
    }
  }
}
