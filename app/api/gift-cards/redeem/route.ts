import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, parentId } = body

    if (!code || !parentId) {
      return NextResponse.json(
        { error: 'Gift card code and parent ID are required' },
        { status: 400 }
      )
    }

    // Fetch the gift card by code
    const { data: giftCard, error: fetchError } = await supabase
      .from('gift_cards')
      .select('*')
      .ilike('code', code)
      .single()

    if (fetchError || !giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found' },
        { status: 400 }
      )
    }

    if (!giftCard.is_active) {
      return NextResponse.json(
        { error: 'Gift card is no longer active' },
        { status: 400 }
      )
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Gift card has expired' },
        { status: 400 }
      )
    }

    if (giftCard.current_balance <= 0) {
      return NextResponse.json(
        { error: 'Gift card has no remaining balance' },
        { status: 400 }
      )
    }

    // Check if already redeemed by someone else
    if (giftCard.redeemed_by_parent_id &&
        giftCard.redeemed_by_parent_id !== parentId) {
      return NextResponse.json(
        { error: 'This gift card has already been redeemed by another account' },
        { status: 400 }
      )
    }

    // Link the gift card to the parent account if not already linked
    if (!giftCard.redeemed_by_parent_id) {
      const { data: updated, error: updateError } = await supabase
        .from('gift_cards')
        .update({
          redeemed_by_parent_id: parentId,
          redeemed_at: new Date().toISOString()
        })
        .eq('id', giftCard.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error redeeming gift card:', updateError)
        return NextResponse.json(
          { error: 'Failed to redeem gift card' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        giftCard: {
          id: updated.id,
          code: updated.code,
          current_balance: updated.current_balance,
          initial_balance: updated.initial_balance
        }
      })
    }

    // Already redeemed by this parent
    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        current_balance: giftCard.current_balance,
        initial_balance: giftCard.initial_balance
      }
    })
  } catch (error: any) {
    console.error('Error redeeming gift card:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to redeem gift card' },
      { status: 500 }
    )
  }
}
