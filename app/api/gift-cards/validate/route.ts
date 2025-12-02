import { NextRequest, NextResponse } from 'next/server'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Gift card code is required' },
        { status: 400 }
      )
    }

    const giftCardsService = new GiftCardsClientService()
    const validation = await giftCardsService.validateGiftCard(code)

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 200 }
      )
    }

    return NextResponse.json({
      valid: true,
      giftCard: {
        id: validation.giftCard!.id,
        code: validation.giftCard!.code,
        current_balance: validation.giftCard!.current_balance,
        initial_balance: validation.giftCard!.initial_balance,
        is_redeemed: !!validation.giftCard!.redeemed_by_parent_id
      }
    })
  } catch (error) {
    console.error('Error validating gift card:', error)
    return NextResponse.json(
      { error: 'Failed to validate gift card' },
      { status: 500 }
    )
  }
}
