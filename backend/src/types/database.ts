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
          total_amount: number
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          total_amount: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          total_amount?: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          wallet_address: string
          order_id?: string
          subject: string
          description: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          admin_response?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          order_id?: string
          subject: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          admin_response?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          order_id?: string
          subject?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          admin_response?: string
          created_at?: string
          updated_at?: string
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          wallet_address: string
          comment: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          wallet_address: string
          comment: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          wallet_address?: string
          comment?: string
          is_admin?: boolean
          created_at?: string
        }
      }
      nft_rewards: {
        Row: {
          id: string
          wallet_address: string
          type: 'purchase_count' | 'spend_amount'
          status: 'minted'
          transaction_signature: string
          created_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          type: 'purchase_count' | 'spend_amount'
          status?: 'minted'
          transaction_signature: string
          created_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          type?: 'purchase_count' | 'spend_amount'
          status?: 'minted'
          transaction_signature?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
