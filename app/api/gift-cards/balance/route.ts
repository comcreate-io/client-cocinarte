import { NextRequest, NextResponse } from 'next/server'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

    const giftCardsService = new GiftCardsClientService()

    const giftCards = await giftCardsService.getGiftCardsByParentId(parentId)
    const totalBalance = await giftCardsService.getTotalBalanceByParentId(parentId)

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
