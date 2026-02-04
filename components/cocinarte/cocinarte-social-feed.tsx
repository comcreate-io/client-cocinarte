"use client"

import { useEffect } from "react"
import { Instagram } from "lucide-react"

export default function CocinarteSocialFeed() {
  useEffect(() => {
    // Load Elfsight script
    const script = document.createElement("script")
    script.src = "https://static.elfsight.com/platform/platform.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')
      if (existingScript) {
        existingScript.remove()
      }
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

        {/* Elfsight Instagram Feed */}
        <div className="w-full flex justify-center">
          <div className="elfsight-app-525b2565-128d-44f1-8d4e-339c0c5ebdf7" data-elfsight-app-lazy></div>
        </div>

        {/* Follow on Instagram button */}
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
