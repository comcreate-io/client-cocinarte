"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, Clock, Users, Flower2, Sparkles } from "lucide-react"

const STORAGE_KEY = "camp-promotion-dismissed"
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export default function CampPromotionPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if the popup was dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const now = Date.now()
      // If dismissed less than 7 days ago, don't show
      if (now - dismissedTime < DISMISS_DURATION) {
        return
      }
    }

    // Show popup after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleDismiss()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-2xl">
        {/* Header with video background */}
        <div className="relative h-48 overflow-hidden">
          <video
            src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769509028/IMG_7036_jbtdin.mov"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-[#FCB414] text-black px-3 py-1.5 text-xs mb-2">
              <Flower2 className="w-3 h-3 mr-1.5" />
              Spring Break 2026
            </Badge>
            <h2 className="text-2xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Bake & Create Camp
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 mb-4">
            Join us for a week of hands-on baking where kids build real skills and lasting confidence!
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center bg-[#FCB414]/10 rounded-full px-3 py-1.5 text-sm">
              <Calendar className="w-4 h-4 mr-1.5 text-[#FCB414]" />
              <span className="text-slate-700 font-medium">March 23–27</span>
            </div>
            <div className="flex items-center bg-[#F0614F]/10 rounded-full px-3 py-1.5 text-sm">
              <Clock className="w-4 h-4 mr-1.5 text-[#F0614F]" />
              <span className="text-slate-700 font-medium">9:00–12:30</span>
            </div>
            <div className="flex items-center bg-[#00ADEE]/10 rounded-full px-3 py-1.5 text-sm">
              <Users className="w-4 h-4 mr-1.5 text-[#00ADEE]" />
              <span className="text-slate-700 font-medium">Ages 7+</span>
            </div>
          </div>

          <div className="bg-[#F0614F]/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Daily Rate</p>
                <p className="text-2xl font-bold text-[#F0614F]">$120<span className="text-sm font-normal text-slate-500">/day</span></p>
              </div>
              <Badge className="bg-[#FCB414] text-black px-3 py-1.5">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Limited Spots
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDismiss}
            >
              Maybe Later
            </Button>
            <Link href="/camps" className="flex-1" onClick={handleDismiss}>
              <Button className="w-full bg-[#F0614F] hover:bg-[#F0614F]/90 text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
