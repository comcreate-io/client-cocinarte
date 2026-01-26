"use client"

import { useEffect } from "react"
import { Instagram } from "lucide-react"

// TypeScript declaration for Instagram embed script
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

export default function CocinarteSocialFeed() {
  const instagramPosts = [
    "https://www.instagram.com/p/DT1Jj8RlT_a/",
    "https://www.instagram.com/p/DTycnN3Fc7t/",
    "https://www.instagram.com/p/DTtgj98CPuQ/",
    "https://www.instagram.com/p/DTjM11glfad/",
    "https://www.instagram.com/p/DTeBrxXCEPN/",
    "https://www.instagram.com/p/DTbZoMOFRu3/"
  ]

  useEffect(() => {
    // Load Instagram embed script
    if (window.instgrm) {
      window.instgrm.Embeds.process()
    } else {
      const script = document.createElement("script")
      script.src = "https://www.instagram.com/embed.js"
      script.async = true
      document.body.appendChild(script)
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

        {/* Mobile: Show only 2 posts stacked + View All button */}
        <div className="sm:hidden space-y-4">
          {instagramPosts.slice(0, 2).map((postUrl, index) => (
            <div key={index} className="flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={postUrl}
                data-instgrm-version="14"
                style={{
                  background: '#FFF',
                  border: 0,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  margin: 0,
                  maxWidth: '100%',
                  padding: 0,
                  width: '100%'
                }}
              />
            </div>
          ))}

          {/* View all on Instagram button for mobile */}
          <div className="text-center pt-4">
            <a
              href="https://www.instagram.com/cocinartepdx/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cocinarte-red hover:bg-cocinarte-orange text-white px-6 py-3 rounded-full font-semibold text-base hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Instagram className="w-5 h-5" />
              View All Posts
            </a>
          </div>
        </div>

        {/* Tablet/Desktop: Grid layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {instagramPosts.map((postUrl, index) => (
            <div key={index} className="flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={postUrl}
                data-instgrm-version="14"
                style={{
                  background: '#FFF',
                  border: 0,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  margin: 0,
                  maxWidth: '100%',
                  minWidth: '280px',
                  padding: 0,
                  width: '100%'
                }}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
