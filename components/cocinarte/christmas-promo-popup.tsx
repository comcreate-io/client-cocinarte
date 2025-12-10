'use client'

import { useState, useEffect } from 'react'
import { X, Gift, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function ChristmasPromoPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show popup after a short delay on every page load
    const timer = setTimeout(() => setIsOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-[320px] sm:max-w-md bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Decorative snowflakes - hidden on mobile */}
        <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 text-white/20 text-4xl">❄</div>
          <div className="absolute top-8 right-8 text-white/15 text-2xl">❄</div>
          <div className="absolute bottom-12 left-8 text-white/10 text-3xl">❄</div>
          <div className="absolute top-1/2 right-4 text-white/15 text-xl">❄</div>
          <div className="absolute bottom-20 right-12 text-white/20 text-2xl">❄</div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Content */}
        <div className="relative p-4 sm:p-8 text-center">
          {/* Christmas tree emoji header */}
          <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🎄</div>

          {/* Main headline */}
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Coming Soon' }}>
            Christmas Special!
          </h2>

          {/* Sparkle divider */}
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div className="h-px w-12 sm:w-16 bg-white/50" />
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>

          {/* Offer details */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Gift className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              <span className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Coming Soon' }}>
                FREE $20
              </span>
              <Gift className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-white text-sm sm:text-lg leading-relaxed" style={{ fontFamily: 'Coming Soon' }}>
              Buy any Gift Card and receive an extra <span className="font-bold underline">$20 USD</span> on top for FREE!
            </p>
          </div>

          {/* Sub text */}
          <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-6" style={{ fontFamily: 'Coming Soon' }}>
            The perfect gift for little chefs! 👨‍🍳
          </p>

          {/* CTA Button */}
          <Link
            href="/gift-cards"
            onClick={handleClose}
            className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-red-600 font-bold py-2.5 px-5 sm:py-4 sm:px-8 rounded-full text-sm sm:text-lg transition-all hover:scale-105 shadow-lg"
            style={{ fontFamily: 'Coming Soon' }}
          >
            <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            Get Your Gift Card Now!
          </Link>

          {/* Limited time badge */}
          <div className="mt-3 sm:mt-6 inline-flex items-center gap-1 sm:gap-2 bg-white/20 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
            <span>🎅</span>
            <span style={{ fontFamily: 'Coming Soon' }}>Limited Holiday Offer</span>
            <span>🎁</span>
          </div>
        </div>
      </div>
    </div>
  )
}
