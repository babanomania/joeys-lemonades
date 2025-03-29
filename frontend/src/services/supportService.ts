import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface SupportTicket {
  id?: string
  name: string
  email: string
  category: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at?: string
  updated_at?: string
}

export class SupportService {
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{ ...ticket, status: 'open' }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getTicketById(id: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async updateTicketStatus(id: string, status: SupportTicket['status']) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  async addTicketResponse(ticketId: string, response: string, isAdmin: boolean) {
    const { error } = await supabase
      .from('ticket_responses')
      .insert([{
        ticket_id: ticketId,
        response,
        is_admin: isAdmin
      }])

    if (error) throw error
  }

  async getTicketResponses(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  }
}
