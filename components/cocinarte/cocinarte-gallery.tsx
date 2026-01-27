"use client"

import Image from "next/image"
import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

const galleryItems = [
  // Row 1 - Videos
  { type: "video", src: "https://res.cloudinary.com/dku1gnuat/video/upload/v1769507266/IMG_4306_psztdq.mov" },
  { type: "image", src: "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507166/IMG_4272_lxoduw.heic" },
  { type: "video", src: "https://res.cloudinary.com/dku1gnuat/video/upload/v1769507313/Tacos_frying_hfvqea.mov" },
  { type: "image", src: "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507282/IMG_4065_bp2sxi.jpg" },
  // Row 2 - Mix
  { type: "image", src: "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507294/IMG_4136_tcpd1r.heic" },
  { type: "video", src: "https://res.cloudinary.com/dku1gnuat/video/upload/v1769508707/IMG_4285_s1kolp.mov" },
  { type: "image", src: "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769508849/IMG_8426_mkuph8.jpg" },
  { type: "video", src: "https://res.cloudinary.com/dku1gnuat/video/upload/v1769507354/Tortillas_up_close_gqbqhd.mov" },
]

export default function CocinarteGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get only images for lightbox
  const imageItems = galleryItems.filter(item => item.type === "image")

  const openLightbox = (galleryIndex: number) => {
    // Find the index in imageItems array
    const imageIndex = imageItems.findIndex(img => img.src === galleryItems[galleryIndex].src)
    if (imageIndex !== -1) {
      setCurrentIndex(imageIndex)
      setLightboxOpen(true)
    }
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + imageItems.length) % imageItems.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageItems.length)
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-cocinarte-blue/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate mb-3">
            Our Kitchen in Action
          </h2>
          <p className="text-base sm:text-lg text-slate-medium max-w-2xl mx-auto">
            See what happens when young chefs get creative
          </p>
        </div>

        {/* Gallery Grid - Compact for mobile */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden ${item.type === "image" ? "cursor-pointer group" : ""}`}
              onClick={() => item.type === "image" && openLightbox(index)}
            >
              {item.type === "video" ? (
                <video
                  src={item.src}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={item.src}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              {/* Hover overlay - only for images */}
              {item.type === "image" && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-cocinarte-yellow transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-cocinarte-yellow transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-cocinarte-yellow transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Content */}
          <div className="max-w-4xl max-h-[80vh] w-full">
            <div className="relative w-full h-[80vh]">
              <Image
                src={imageItems[currentIndex].src}
                alt={`Gallery image ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imageItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-cocinarte-yellow w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
