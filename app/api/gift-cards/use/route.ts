import { NextRequest, NextResponse } from 'next/server'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, amount, bookingId, description } = body

    if (!parentId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Parent ID and amount are required' },
        { status: 400 }
      )
    }

    const giftCardsService = new GiftCardsClientService()

    // Apply the gift card balance (deduct from available cards)
    const result = await giftCardsService.applyGiftCardBalanceForParent(
      parentId,
      amount,
      bookingId,
      description
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to apply gift card balance' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      amountApplied: result.amountApplied,
      remainingBalance: result.remainingBalance
    })
  } catch (error) {
    console.error('Error using gift card balance:', error)
    return NextResponse.json(
      { error: 'Failed to use gift card balance' },
      { status: 500 }
    )
  }
}
