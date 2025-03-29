import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UpdateTicketRequest, TicketResponse } from '@/types/support'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateTicketRequest = await request.json()
    const { status, priority, description } = body

    // Validate request
    if (!status && !priority && !description) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, any> = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (description) updateData.description = description

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating support ticket:', error)
      return NextResponse.json(
        { error: 'Failed to update support ticket' },
        { status: 500 }
      )
    }

    const response: TicketResponse = {
      success: true,
      ticket: {
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating support ticket:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching support ticket:', error)
      return NextResponse.json(
        { error: 'Support ticket not found' },
        { status: 404 }
      )
    }

    const response: TicketResponse = {
      success: true,
      ticket: {
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching support ticket:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
