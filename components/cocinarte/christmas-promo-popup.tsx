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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Decorative snowflakes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 text-white/20 text-4xl">❄</div>
          <div className="absolute top-8 right-8 text-white/15 text-2xl">❄</div>
          <div className="absolute bottom-12 left-8 text-white/10 text-3xl">❄</div>
          <div className="absolute top-1/2 right-4 text-white/15 text-xl">❄</div>
          <div className="absolute bottom-20 right-12 text-white/20 text-2xl">❄</div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Christmas tree emoji header */}
          <div className="text-6xl mb-4">🎄</div>

          {/* Main headline */}
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Coming Soon' }}>
            Christmas Special!
          </h2>

          {/* Sparkle divider */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="h-px w-16 bg-white/50" />
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {/* Offer details */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Coming Soon' }}>
                FREE $20
              </span>
              <Gift className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg leading-relaxed" style={{ fontFamily: 'Coming Soon' }}>
              Buy any Gift Card and receive an extra <span className="font-bold underline">$20 USD</span> on top for FREE!
            </p>
          </div>

          {/* Sub text */}
          <p className="text-white/80 text-sm mb-6" style={{ fontFamily: 'Coming Soon' }}>
            The perfect gift for little chefs! 👨‍🍳
          </p>

          {/* CTA Button */}
          <Link
            href="/gift-cards"
            onClick={handleClose}
            className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-red-600 font-bold py-4 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            style={{ fontFamily: 'Coming Soon' }}
          >
            <Gift className="w-5 h-5" />
            Get Your Gift Card Now!
          </Link>

          {/* Limited time badge */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm">
            <span>🎅</span>
            <span style={{ fontFamily: 'Coming Soon' }}>Limited Holiday Offer</span>
            <span>🎁</span>
          </div>
        </div>
      </div>
    </div>
  )
}
