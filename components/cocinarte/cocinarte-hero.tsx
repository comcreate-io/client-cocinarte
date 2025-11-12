"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function CocinarteHero() {
  return (
    <section className="relative w-full mt-[60px] sm:mt-[70px] md:mt-[90px] h-[70vh] sm:h-[80vh] md:h-[90vh] lg:max-h-[98vh] overflow-hidden">
      {/* Background video - full width, dynamic height */}
      <div className="relative w-full h-full">
        <video
          src="https://res.cloudinary.com/dku1gnuat/video/upload/v1762977232/Untitled_design_6_zfvdmr.mp4"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center -mt-8 sm:-mt-20 md:-mt-24 lg:-mt-28">
          <div className="text-left text-white px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 max-w-4xl">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 3px 3px 6px rgba(0, 0, 0, 0.6), 1px 1px 2px rgba(0, 0, 0, 0.9)' }}>
              Cooking Adventures for Kids
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 3px rgba(0, 0, 0, 0.7)' }}>
              Where young chefs discover the joy of cooking
            </p>

            {/* CTA Button */}
            <Link href="#upcoming-classes">
              <Button size="lg" className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>


    </section>
  )
}
