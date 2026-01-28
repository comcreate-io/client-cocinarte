"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CocinarteHeader from "@/components/cocinarte/cocinarte-header"
import CocinarteFooter from "@/components/cocinarte/cocinarte-footer"
import CampBookingPopup from "@/components/cocinarte/camp-booking-popup"
import {
  Flower2,
  ChefHat,
  Clock,
  Calendar,
  Users,
  Star,
  Heart,
  Sparkles,
  CheckCircle,
  Cookie
} from "lucide-react"

export default function CampsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-coming-soon relative overflow-hidden" style={{ fontFamily: 'Coming Soon' }} data-page="cocinarte">
      <CocinarteHeader />

      <div className="pt-20">
        {/* Hero Section with Video */}
        <section className="relative w-full min-h-[100svh] sm:min-h-0 sm:h-[75vh] overflow-hidden">
          <video
            src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769509028/IMG_7036_jbtdin.mov"
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
                <Flower2 className="w-4 h-4 mr-2" />
                Spring Break 2026
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Bake & Create<br />Spring Break Camp
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 opacity-95" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                Hands-On Baking for Ages 7+
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 justify-center sm:justify-start">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>March 23–27</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>9:00–12:30</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Ages 7+</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#F0614F] hover:bg-[#F48E77] text-white px-8 py-5 text-lg rounded-xl shadow-lg font-semibold"
                onClick={() => setIsBookingOpen(true)}
              >
                Reserve Your Spot
              </Button>
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
                A week of hands-on baking where kids build real skills and lasting confidence
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-12">
              {/* Pricing Card - Show first on mobile */}
              <div className="lg:hidden bg-[#F0614F] rounded-2xl sm:rounded-3xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between sm:flex-col sm:text-center sm:space-y-4">
                  <div className="flex items-center sm:flex-col gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <ChefHat className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <div className="sm:text-center">
                      <p className="text-white/80 text-xs uppercase tracking-wide">Daily Rate</p>
                      <p className="text-3xl sm:text-5xl font-bold">$120</p>
                      <p className="text-white/80 text-sm">per child, per day</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-center sm:w-full">
                    <div className="bg-white/20 rounded-lg sm:rounded-xl p-2 sm:p-4 mb-2 sm:mb-4">
                      <div className="flex items-center justify-center space-x-2 text-sm sm:text-base">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold">Mar 23–27</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm sm:text-base mt-1">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold">9:00–12:30</span>
                      </div>
                    </div>
                    <Badge className="bg-[#FCB414] text-black px-3 py-1 text-xs sm:text-sm">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Limited Spots
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Main Description Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col justify-between h-full">
                <p className="text-base sm:text-xl text-slate-medium leading-relaxed mb-6 sm:mb-8">
                  This Spring Break, Cocinarte invites children ages 7 and up to our <strong className="text-slate">Bake & Create Cooking Camp</strong> —
                  a hands-on, progressive baking experience where kids cook every single day while building real kitchen skills and confidence.
                </p>

                <div className="bg-[#FCB414]/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8">
                  <p className="text-lg sm:text-2xl text-slate font-semibold text-center italic">
                    "This isn't busy work or crafts. It's real baking, real learning, and real pride in what they create."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0614F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-[#F0614F]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Expert-Led Instruction</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Experienced chefs guide every session</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FCB414]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#FCB414]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Progressive Learning</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Skills build throughout the week</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00ADEE]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ADEE]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Learning by Doing</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Hands-on experience in every class</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F48E77]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#F48E77]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate text-base sm:text-lg">Take Home Creations</h4>
                      <p className="text-slate-medium text-sm sm:text-base">Bring home everything they bake</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Card - Desktop only */}
              <div className="hidden lg:block bg-[#F0614F] rounded-3xl p-8 shadow-xl text-white">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <ChefHat className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <p className="text-white/80 text-sm uppercase tracking-wide mb-1">Daily Rate</p>
                    <p className="text-5xl font-bold">$120</p>
                    <p className="text-white/80">per child, per day</p>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">March 23–27</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">9:00 AM – 12:30 PM</span>
                    </div>
                  </div>

                  <Badge className="bg-[#FCB414] text-black px-4 py-2">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Limited Spots Available
                  </Badge>
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
                  src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769509032/IMG_6965_ior2uz.mov"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video">
                <video
                  src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508868/IMG_8378_v12ugt.mov"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video sm:col-span-2 lg:col-span-1">
                <video
                  src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769509087/IMG_7031_bc2hfj.mov"
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

        {/* What Kids Will Do Section */}
        <section className="py-10 sm:py-16 bg-gradient-to-br from-[#CDECF9]/20 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate mb-3 sm:mb-4">
                What Kids Will Do
              </h2>
              <p className="text-base sm:text-lg text-slate-medium max-w-3xl mx-auto px-2">
                Each day, children will engage in meaningful, hands-on baking activities that build skills and confidence.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#F48E77]/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <Cookie className="w-7 h-7 sm:w-10 sm:h-10 text-[#F0614F]" />
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate mb-1 sm:mb-3">Bake a New Recipe</h3>
                <p className="text-slate-medium text-xs sm:text-base hidden sm:block">Create something new from scratch every single day</p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#FCB414]/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <ChefHat className="w-7 h-7 sm:w-10 sm:h-10 text-[#FCB414]" />
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate mb-1 sm:mb-3">Learn Real Skills</h3>
                <p className="text-slate-medium text-xs sm:text-base hidden sm:block">Measure, mix, bake, and decorate with intention</p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#CDECF9] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <Users className="w-7 h-7 sm:w-10 sm:h-10 text-[#00ADEE]" />
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate mb-1 sm:mb-3">Work Together</h3>
                <p className="text-slate-medium text-xs sm:text-base hidden sm:block">Work both independently and collaboratively</p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#FCB414]/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <Star className="w-7 h-7 sm:w-10 sm:h-10 text-[#FCB414]" />
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate mb-1 sm:mb-3">Build Confidence</h3>
                <p className="text-slate-medium text-xs sm:text-base hidden sm:block">Gain confidence through hands-on learning</p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#F48E77]/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <Heart className="w-7 h-7 sm:w-10 sm:h-10 text-[#F0614F]" />
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate mb-1 sm:mb-3">Take Home Creations</h3>
                <p className="text-slate-medium text-xs sm:text-base hidden sm:block">Take home everything they bake to share with family</p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#CDECF9] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-[#00ADEE]" />
                </div>
                <h3 className="text-sm sm:text-xl font-bold text-slate mb-1 sm:mb-3">Feel Proud</h3>
                <p className="text-slate-medium text-xs sm:text-base hidden sm:block">Experience real pride in their delicious creations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Schedule Section */}
        <section className="py-10 sm:py-16 bg-gradient-to-br from-[#FCB414]/10 to-[#F48E77]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate mb-3 sm:mb-4">
                Daily Schedule
              </h2>
              <p className="text-base sm:text-lg text-slate-medium max-w-3xl mx-auto px-2">
                A structured day filled with baking, learning, and fun activities.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
              <div className="flex items-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-md">
                <div className="w-20 sm:w-28 flex-shrink-0">
                  <span className="text-[#F0614F] font-bold text-sm sm:text-base">9:00–9:15</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate text-sm sm:text-base">Arrival & Snack</h4>
                </div>
              </div>

              <div className="flex items-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-md">
                <div className="w-20 sm:w-28 flex-shrink-0">
                  <span className="text-[#FCB414] font-bold text-sm sm:text-base">9:15–10:30</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate text-sm sm:text-base">Baking & Preparation</h4>
                </div>
              </div>

              <div className="flex items-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-md">
                <div className="w-20 sm:w-28 flex-shrink-0">
                  <span className="text-[#00ADEE] font-bold text-sm sm:text-base">10:30–11:00</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate text-sm sm:text-base">While-It-Bakes Activities</h4>
                </div>
              </div>

              <div className="flex items-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-md">
                <div className="w-20 sm:w-28 flex-shrink-0">
                  <span className="text-[#FCB414] font-bold text-sm sm:text-base">11:00–12:00</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate text-sm sm:text-base">Decorating or Second Bake</h4>
                </div>
              </div>

              <div className="flex items-center bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-md">
                <div className="w-20 sm:w-28 flex-shrink-0">
                  <span className="text-[#F0614F] font-bold text-sm sm:text-base">12:00–12:30</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate text-sm sm:text-base">Reflection & Pickup</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mini Bakery Showcase Section */}
        <section className="py-10 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <video
                    src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508911/IMG_8371_z0ufw4.mov"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
                <Badge className="bg-[#F48E77] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  End of Week Celebration
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate">
                  Mini Bakery Showcase
                </h2>
                <p className="text-base sm:text-lg text-slate-medium leading-relaxed">
                  The week ends with a <strong className="text-slate">Mini Bakery Showcase</strong>, where families are invited to join us,
                  taste the baked goods, and celebrate everything the children have learned throughout the week.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center text-slate text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#F0614F] flex-shrink-0" />
                    <span>Families invited to celebrate</span>
                  </div>
                  <div className="flex items-center text-slate text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#F0614F] flex-shrink-0" />
                    <span>Taste all the delicious baked goods</span>
                  </div>
                  <div className="flex items-center text-slate text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#F0614F] flex-shrink-0" />
                    <span>Celebrate your child's accomplishments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-12 sm:py-20 overflow-hidden">
          <video
            src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769509122/IMG_4345_iaipws.mov"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F0614F]/90 to-[#F48E77]/90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Bake & Create?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Give your child a Spring Break they'll never forget. Real baking, real skills, real pride.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#F0614F] px-6 sm:px-8 py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsBookingOpen(true)}
              >
                Enroll for Spring Break
              </Button>
              <Link href="/#contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#F0614F] px-6 sm:px-8 py-4 text-base sm:text-lg rounded-xl transition-all duration-200">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <CocinarteFooter />

      {/* Camp Booking Popup */}
      <CampBookingPopup
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  )
}
