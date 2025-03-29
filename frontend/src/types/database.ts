export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          wallet_address: string
          items: Json
          total: number
          transaction_signature: string
          status: 'pending' | 'confirmed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          items: Json
          total: number
          transaction_signature: string
          status: 'pending' | 'confirmed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          items?: Json
          total?: number
          transaction_signature?: string
          status?: 'pending' | 'confirmed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      nft_rewards: {
        Row: {
          id: string
          wallet_address: string
          token_id: string | null
          mint_address: string | null
          metadata_uri: string | null
          type: 'purchase_count' | 'spend_amount'
          status: 'pending' | 'minted' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          token_id?: string | null
          mint_address?: string | null
          metadata_uri?: string | null
          type: 'purchase_count' | 'spend_amount'
          status: 'pending' | 'minted' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          token_id?: string | null
          mint_address?: string | null
          metadata_uri?: string | null
          type?: 'purchase_count' | 'spend_amount'
          status?: 'pending' | 'minted' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          wallet_address: string
          total_orders: number
          total_spent: number
          last_order_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          wallet_address: string
          total_orders?: number
          total_spent?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          wallet_address?: string
          total_orders?: number
          total_spent?: number
          last_order_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
