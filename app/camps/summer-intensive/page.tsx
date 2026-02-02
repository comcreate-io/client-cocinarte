"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CocinarteHeader from "@/components/cocinarte/cocinarte-header"
import CocinarteFooter from "@/components/cocinarte/cocinarte-footer"
import {
  Sun,
  ChefHat,
  Clock,
  Calendar,
  Users,
  Star,
  Heart,
  Sparkles,
  Lightbulb,
  Target,
  BookOpen
} from "lucide-react"

export default function SummerIntensiveCampPage() {
  return (
    <div className="min-h-screen bg-white font-coming-soon relative overflow-hidden" style={{ fontFamily: 'Coming Soon' }} data-page="cocinarte">
      <CocinarteHeader />

      <div className="pt-20">
        {/* Hero Section with Video */}
        <section className="relative w-full min-h-[100svh] sm:min-h-0 sm:h-[75vh] overflow-hidden">
          <video
            src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508720/IMG_4293_ras9jm.mov"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 sm:bg-black/40" />
          <div className="relative min-h-[100svh] sm:min-h-0 sm:h-full flex flex-col justify-center items-center sm:items-start">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-white w-full text-center sm:text-left py-20 sm:py-0">
              <Badge className="bg-[#FCB414] text-black px-4 py-2 text-sm mb-4 inline-flex">
                <Sun className="w-4 h-4 mr-2" />
                Summer 2026
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Summer Intensive<br />Cooking Camp
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 opacity-95" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                Go Deeper in the Kitchen
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 justify-center sm:justify-start">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Dates TBD</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Multi-Day Experience</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Curious Kids</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 inline-block">
                <p className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Dates and additional details coming soon
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About the Camp Section */}
        <section className="py-10 sm:py-16 bg-gradient-to-br from-[#FCB414]/10 via-white to-[#F48E77]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate mb-3 sm:mb-4">
                About the Camp
              </h2>
              <p className="text-base sm:text-lg text-slate-medium max-w-3xl mx-auto px-2">
                A multi-day experience focused on skill-building, exploration, and creativity through food
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Main Description Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-lg mb-8">
                <p className="text-base sm:text-xl text-slate-medium leading-relaxed mb-6 sm:mb-8">
                  Our <strong className="text-slate">Summer Intensive Cooking Camp</strong> is designed for curious, motivated kids who want to go deeper in the kitchen. This multi-day experience focuses on skill-building, exploration, and creativity through food — giving children the space to learn, practice, and grow at their own pace.
                </p>

                <div className="bg-[#FCB414]/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8">
                  <p className="text-lg sm:text-2xl text-slate font-semibold text-center italic">
                    "A calm, intentional environment where children are treated as capable learners and creators — not just helpers in the kitchen."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0614F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#F0614F]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Skill-Building Focus</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Deeper learning at their own pace</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FCB414]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-[#FCB414]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Creative Exploration</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Experiment with flavors and ingredients</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00ADEE]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ADEE]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Real Recipes</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Follow recipes from start to finish</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F48E77]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#F48E77]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Intentional Environment</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Calm, focused learning space</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Gallery Section */}
        <section className="py-10 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate mb-3 sm:mb-4">
                See Our Kitchen in Action
              </h2>
              <p className="text-base sm:text-lg text-slate-medium max-w-3xl mx-auto px-2">
                Watch our young chefs create amazing dishes and have fun in the kitchen!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video">
                <video
                  src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508012/IMG_4246_pb3da3.mov"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video">
                <video
                  src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508707/IMG_4285_s1kolp.mov"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video sm:col-span-2 lg:col-span-1">
                <video
                  src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508861/IMG_8357_tuzcec.mov"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </div>
        </section>

        {/* What Participants Will Do Section */}
        <section className="py-10 sm:py-16 bg-gradient-to-br from-[#CDECF9]/20 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate mb-3 sm:mb-4">
                What Participants Will Do
              </h2>
              <p className="text-base sm:text-lg text-slate-medium max-w-3xl mx-auto px-2">
                Meaningful, hands-on experiences that build real kitchen skills and lasting confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F48E77]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-[#F0614F]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">Learn Cooking Techniques</h3>
                    <p className="text-slate-medium text-sm sm:text-base">Foundational and advanced cooking techniques for confident kitchen skills</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FCB414]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#FCB414]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">Experiment with Flavors</h3>
                    <p className="text-slate-medium text-sm sm:text-base">Explore flavors, textures, and ingredients through creative experimentation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#CDECF9] rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-[#00ADEE]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">Follow Real Recipes</h3>
                    <p className="text-slate-medium text-sm sm:text-base">Complete real recipes from start to finish with guidance and support</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F48E77]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7 text-[#F0614F]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">Develop Focus</h3>
                    <p className="text-slate-medium text-sm sm:text-base">Build focus, independence, and problem-solving skills</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FCB414]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#FCB414]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">Gain Confidence</h3>
                    <p className="text-slate-medium text-sm sm:text-base">Build confidence through meaningful, hands-on work</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#CDECF9] rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-[#00ADEE]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">Grow at Their Own Pace</h3>
                    <p className="text-slate-medium text-sm sm:text-base">Space to learn, practice, and grow in a supportive environment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Video Section */}
        <section className="py-10 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <video
                    src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508863/IMG_8335_xqhsl0.mov"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
                <Badge className="bg-[#FCB414] text-black px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Intensive Experience
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate">
                  More Than Just Cooking
                </h2>
                <p className="text-base sm:text-lg text-slate-medium leading-relaxed">
                  This intensive offers a calm, intentional environment where children are treated as capable learners and creators. Through meaningful, hands-on work, participants develop not just cooking skills, but focus, independence, and problem-solving abilities that extend far beyond the kitchen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon CTA Section */}
        <section className="relative py-12 sm:py-20 overflow-hidden">
          <video
            src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769509076/IMG_4340_tjhgtq.mov"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-[#F0614F]/90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sun className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Dates and Additional Details Coming Soon
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              We're excited to offer this intensive cooking experience this summer. Check back soon for dates, pricing, and registration information.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/camps" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-white hover:bg-gray-100 text-[#F0614F] px-6 sm:px-8 py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  View Spring Break Camp
                </Button>
              </Link>
              <Link href="/#contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#F0614F] px-6 sm:px-8 py-4 text-base sm:text-lg rounded-xl transition-all duration-200">
                  Contact Us for Updates
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <CocinarteFooter />
    </div>
  )
}
