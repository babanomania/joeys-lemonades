import { NextResponse } from 'next/server'
import { checkTransactionStatus } from '@/lib/solana'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { signature: string } }
) {
  try {
    const { signature } = params

    // Check transaction status
    const status = await checkTransactionStatus(signature)

    if (status.status === 'confirmed') {
      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid', transaction_signature: signature })
        .eq('transaction_signature', signature)

      if (updateError) {
        console.error('Error updating order status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
