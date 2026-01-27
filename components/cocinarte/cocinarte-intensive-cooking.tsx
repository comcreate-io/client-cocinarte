"use client"

import { Button } from "@/components/ui/button"
import { ChefHat, Calendar, Users, Award, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

const slideshowImages = [
  "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507200/IMG_4309_qmmpbq.heic",
  "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507188/IMG_4283_e3k29p.heic",
  "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769508848/IMG_8421_lv6ip3.jpg",
  "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507166/IMG_4271_jndruw.heic",
  "https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507207/IMG_4322_w2it9u.heic",
]

export default function CocinarteIntensiveCooking() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slideshowImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => {
    setCurrentImage((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length)
  }

  const goToNext = () => {
    setCurrentImage((prev) => (prev + 1) % slideshowImages.length)
  }

  return (
    <section id="intensive-cooking" className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cocinarte-blue/30 via-white to-cocinarte-yellow/20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_batidora.svg"
              alt="Mixer"
              width={80}
              height={80}
              className="hidden sm:block w-12 h-12 sm:w-16 sm:h-16 lg:w-[80px] lg:h-[80px] opacity-70 animate-float-slow"
            />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate">
              Intensive Cooking Program
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_comida.svg"
              alt="Food"
              width={70}
              height={70}
              className="hidden sm:block w-10 h-10 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px] opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-lg sm:text-xl text-slate-medium max-w-3xl mx-auto px-4">
            In partnership with Camp Alegria - A deeper culinary experience for young chefs
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Slideshow Section */}
          <div className="relative order-2 lg:order-1 h-[350px] sm:h-[400px] lg:h-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full group">
              {/* Images */}
              {slideshowImages.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  alt={`Kids cooking in intensive program ${index + 1}`}
                  fill
                  className={`object-cover object-center transition-opacity duration-700 ${
                    index === currentImage ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-slate" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-slate" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slideshowImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImage
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* Overlay badge */}
              <div className="absolute top-4 left-4 bg-cocinarte-orange text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Ages 7-12
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cocinarte-yellow/30 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-cocinarte-blue/40 rounded-full blur-xl"></div>
          </div>

          {/* Content Section */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-cocinarte-blue/20">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate mb-4">
                Dive Deep Into Culinary Arts
              </h3>
              <p className="text-slate-medium text-base sm:text-lg leading-relaxed mb-6">
                This workshop is offered in partnership with Camp Alegria, giving children the opportunity
                to dive deep into culinary techniques alongside professional chefs in our professional kitchen environment.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cocinarte-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-5 h-5 text-cocinarte-orange" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-medium">Professional Chefs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cocinarte-navy/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-cocinarte-navy" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-medium">Small Class Sizes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cocinarte-yellow/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-amber" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-medium">Real Techniques</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cocinarte-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-cocinarte-red" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-medium">Flexible Dates</span>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-gradient-to-r from-cocinarte-blue/10 to-cocinarte-yellow/10 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-slate mb-2">What's Included:</h4>
                <ul className="text-sm sm:text-base text-slate-medium space-y-1">
                  <li>• Professional kitchen experience</li>
                  <li>• Learn real culinary techniques</li>
                  <li>• Work alongside professional chefs</li>
                  <li>• Take home recipes and skills</li>
                </ul>
              </div>

              {/* CTA Button */}
              <a
                href="https://campalegriapdx.com/camps/intensive-cooking-workshop"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full bg-gradient-to-r from-cocinarte-orange to-cocinarte-red hover:from-cocinarte-red hover:to-cocinarte-orange text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span>Learn More at Camp Alegria</span>
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Camp Alegria Partnership Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-cocinarte-blue/20">
            <span className="text-slate-medium text-sm sm:text-base">A proud partnership with</span>
            <a
              href="https://campalegriapdx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cocinarte-navy hover:text-cocinarte-orange transition-colors text-sm sm:text-base"
            >
              Camp Alegria PDX
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
