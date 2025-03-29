import { SupportService } from '@/services/supportService'
import { NextResponse } from 'next/server'

const supportService = new SupportService()

export async function POST(request: Request) {
  try {
    const ticket = await request.json()
    const data = await supportService.createTicket(ticket)

    // Send email notification (can be implemented later)
    // await sendEmailNotification(ticket.email, data.id)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing support ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
