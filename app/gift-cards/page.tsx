'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Gift, ChefHat, Heart, Star } from 'lucide-react'
import GiftCardPurchase from '@/components/gift-cards/gift-card-purchase'
import CocinarteHeader from '@/components/cocinarte/cocinarte-header'
import CocinarteFooter from '@/components/cocinarte/cocinarte-footer'

export default function GiftCardsPage() {
  const [purchaseComplete, setPurchaseComplete] = useState(false)

  return (
    <div className="min-h-screen bg-white font-coming-soon" style={{ fontFamily: 'Coming Soon' }}>
      <CocinarteHeader />

      <main className="pt-[80px] sm:pt-[100px]">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cocinarte-orange/10 via-cocinarte-yellow/5 to-cocinarte-blue/10 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cocinarte-orange/20 rounded-full mb-6">
              <Gift className="h-10 w-10 text-cocinarte-orange" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cocinarte-navy mb-4">
              Give the Gift of Cooking
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Share the joy of culinary adventures with a Cocinarte gift card.
              Perfect for birthdays, holidays, or just because!
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                  <ChefHat className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-cocinarte-navy mb-2">Cooking Classes</h3>
                <p className="text-gray-600 text-sm">
                  Use towards any cooking class - from Mini Chef sessions to family cooking experiences
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-100 rounded-full mb-4">
                  <Heart className="h-7 w-7 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-cocinarte-navy mb-2">Thoughtful Gift</h3>
                <p className="text-gray-600 text-sm">
                  Include a personalized message to make it extra special
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
                  <Star className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-cocinarte-navy mb-2">Never Expires*</h3>
                <p className="text-gray-600 text-sm">
                  Valid for 1 year from purchase - plenty of time to plan the perfect class
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Form Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <GiftCardPurchase onSuccess={() => setPurchaseComplete(true)} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-cocinarte-navy text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-cocinarte-navy mb-2">How does the recipient receive their gift card?</h3>
                <p className="text-gray-600 text-sm">
                  The recipient will receive a beautiful email with their gift card code and instructions on how to redeem it. You'll also receive a confirmation email.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cocinarte-navy mb-2">Can the gift card be used for any class?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! Gift cards can be applied to any cooking class, including Mini Chef classes, Mom & Me sessions, and special events.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cocinarte-navy mb-2">What if the class costs more than my gift card balance?</h3>
                <p className="text-gray-600 text-sm">
                  No problem! You can pay the difference with a credit card during checkout. Any remaining balance stays on your account for future use.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-cocinarte-navy mb-2">Can I check my gift card balance?</h3>
                <p className="text-gray-600 text-sm">
                  Absolutely! Once you redeem your gift card, you can view your balance anytime in the "My Account" section.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Link href="/#upcoming-classes">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Classes
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <CocinarteFooter />
    </div>
  )
}
