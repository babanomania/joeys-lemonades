import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateTicketRequest, TicketResponse, TicketListResponse } from '@/types/support'

export async function POST(request: Request) {
  try {
    const body: CreateTicketRequest = await request.json()
    const { walletAddress, orderId, subject, description, priority } = body

    // Validate request
    if (!walletAddress || !subject || !description || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If orderId is provided, verify it belongs to the user
    if (orderId) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .eq('wallet_address', walletAddress)
        .single()

      if (orderError || !order) {
        return NextResponse.json(
          { error: 'Invalid order ID' },
          { status: 400 }
        )
      }
    }

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert([
        {
          wallet_address: walletAddress,
          order_id: orderId,
          subject,
          description,
          priority,
          status: 'open',
        },
      ])
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating support ticket:', ticketError)
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
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
    console.error('Error processing support ticket:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Add pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data: tickets, error, count } = await query

    if (error) {
      console.error('Error fetching support tickets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch support tickets' },
        { status: 500 }
      )
    }

    const response: TicketListResponse = {
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        walletAddress: ticket.wallet_address,
        orderId: ticket.order_id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      })),
      totalCount: count || 0,
      page,
      pageSize,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
