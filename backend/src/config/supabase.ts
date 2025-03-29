import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Database } from '../types/database'

dotenv.config()

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing env.SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_KEY')
}

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handleDatabaseError = (error: unknown): never => {
  console.error('Database error:', error)
  throw new Error('An error occurred while accessing the database')
}
