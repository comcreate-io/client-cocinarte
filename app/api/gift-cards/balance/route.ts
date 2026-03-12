import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Use service role client to bypass RLS for balance queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json(
        { error: 'Parent ID is required' },
        { status: 400 }
      )
    }

    const { data: giftCards, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('redeemed_by_parent_id', parentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gift cards:', error)
      throw new Error('Failed to fetch gift cards')
    }

    const activeCards = (giftCards || []).filter((gc: any) => gc.is_active)
    const totalBalance = activeCards.reduce((sum: number, gc: any) => sum + gc.current_balance, 0)

    return NextResponse.json({
      giftCards: giftCards.map(gc => ({
        id: gc.id,
        code: gc.code,
        initial_balance: gc.initial_balance,
        current_balance: gc.current_balance,
        is_active: gc.is_active,
        created_at: gc.created_at,
        expires_at: gc.expires_at,
        purchaser_name: gc.purchaser_name
      })),
      totalBalance
    })
  } catch (error) {
    console.error('Error fetching gift card balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gift card balance' },
      { status: 500 }
    )
  }
}
