import { NextRequest, NextResponse } from 'next/server'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

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

    const giftCardsService = new GiftCardsClientService()

    // Validate the gift card first
    const validation = await giftCardsService.validateGiftCard(code)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if already redeemed by someone else
    if (validation.giftCard?.redeemed_by_parent_id &&
        validation.giftCard.redeemed_by_parent_id !== parentId) {
      return NextResponse.json(
        { error: 'This gift card has already been redeemed by another account' },
        { status: 400 }
      )
    }

    // Redeem the gift card
    const giftCard = await giftCardsService.redeemGiftCard(code, parentId)

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
