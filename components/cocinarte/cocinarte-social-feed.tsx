"use client"

import { useEffect, useRef } from "react"
import { Instagram } from "lucide-react"

export default function CocinarteSocialFeed() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Elfsight script for Instagram widget
    // You'll need to replace the widget ID after setting up your free Elfsight account
    const script = document.createElement("script")
    script.src = "https://static.elfsight.com/platform/platform.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  return (
    <section id="social-feed" className="py-12 sm:py-20 bg-gradient-to-b from-cocinarte-blue/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-14">
          <p className="text-base sm:text-lg text-slate-medium mb-2">Browse Our Social Media</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate mb-4">
            Latest Stories
          </h2>
          <p className="text-base sm:text-xl text-slate-medium max-w-2xl mx-auto px-2">
            Follow us on Instagram to see our latest cooking adventures!
          </p>
        </div>

        {/* Instagram Widget Container */}
        <div ref={widgetRef} className="flex justify-center">
          {/*
            SETUP INSTRUCTIONS:
            1. Go to https://elfsight.com/instagram-feed-widget/
            2. Click "Create widget for FREE"
            3. Sign up for a free account
            4. Connect your Instagram account (@cocinartepdx)
            5. Choose "Grid" or "Collage" layout
            6. Customize colors to match (use #F0614F for accents)
            7. Copy the widget code and replace the div below

            The free plan includes:
            - Auto-updating feed
            - Up to 200 views/month
            - Basic customization
          */}

          {/* Replace this div with your Elfsight widget code */}
          {/* Example: <div className="elfsight-app-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" data-elfsight-app-lazy></div> */}

          <div className="elfsight-app-0a1b2c3d-4e5f-6789-abcd-ef0123456789" data-elfsight-app-lazy></div>
        </div>

        {/* Fallback: View on Instagram button */}
        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/cocinartepdx/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-cocinarte-red hover:bg-cocinarte-orange text-white px-6 py-3 rounded-full font-semibold text-base hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Instagram className="w-5 h-5" />
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  )
}
