"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, Heart, Users, Star, Calendar, ArrowRight, Instagram, Facebook } from "lucide-react"

export default function CocinarteLandingPage() {
  return (
    <div className="min-h-screen bg-white font-coming-soon" style={{ fontFamily: 'Coming Soon' }}>
      {/* Hero Section with Video */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0">
          <video
            src="https://res.cloudinary.com/dku1gnuat/video/upload/v1762977232/Untitled_design_6_zfvdmr.mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/cocinarte/cocinarteLogo.webp"
              alt="Cocinarte Logo"
              width={400}
              height={120}
              className="object-contain h-20 sm:h-24 md:h-28 lg:h-32 w-auto"
              priority
            />
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-5xl leading-tight"
            style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)' }}
          >
            Where Young Chefs Discover the Joy of Cooking
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl sm:text-2xl md:text-3xl text-white mb-12 max-w-3xl"
            style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}
          >
            Hands-on cooking classes for kids and families exploring authentic Latin flavors
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link href="/">
              <Button
                size="lg"
                className="bg-cocinarte-red hover:bg-cocinarte-orange text-white px-8 py-6 text-lg sm:text-xl font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Calendar className="mr-2 h-6 w-6" />
                Book a Class Now
              </Button>
            </Link>
            <Link href="/#about">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/90 hover:bg-white text-cocinarte-navy border-2 border-white px-8 py-6 text-lg sm:text-xl font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Learn More
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>

          {/* Social Links */}
          <div className="absolute bottom-8 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 sm:gap-6 mt-16 sm:mt-0">
            <Link
              href="https://www.instagram.com/cocinartepdx/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-4 rounded-full transition-all duration-300"
            >
              <Instagram className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=61580541556926"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-4 rounded-full transition-all duration-300"
            >
              <Facebook className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* What Makes Us Special Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cocinarte-navy mb-6">
              Why Families Love Cocinarte
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto">
              More than just cooking classes — we create memorable experiences that build confidence, creativity, and connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-cocinarte-red/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ChefHat className="h-8 w-8 text-cocinarte-red" />
              </div>
              <h3 className="text-2xl font-bold text-cocinarte-navy mb-4 text-center">
                Hands-On Learning
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Kids actively participate in every step, building real cooking skills and kitchen confidence
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-cocinarte-orange/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Heart className="h-8 w-8 text-cocinarte-orange" />
              </div>
              <h3 className="text-2xl font-bold text-cocinarte-navy mb-4 text-center">
                Latin Flavors
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Explore authentic Latin American cuisine and discover new flavors, ingredients, and traditions
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-cocinarte-yellow/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="h-8 w-8 text-cocinarte-yellow" />
              </div>
              <h3 className="text-2xl font-bold text-cocinarte-navy mb-4 text-center">
                Family Bonding
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Create lasting memories together while learning valuable life skills in a fun environment
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-cocinarte-blue/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Star className="h-8 w-8 text-cocinarte-blue" />
              </div>
              <h3 className="text-2xl font-bold text-cocinarte-navy mb-4 text-center">
                Safe & Supportive
              </h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Age-appropriate instruction with proper safety measures and experienced instructors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Kids in the Kitchen */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-cocinarte-navy">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Kids in the Kitchen
            </h2>
            <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto">
              Watch as young chefs create delicious dishes and unforgettable memories
            </p>
          </div>

          {/* Main Video - Kids Cooking */}
          <div className="mb-8">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
              <video
                src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769507266/IMG_4306_psztdq.mov"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>

          {/* Mixed Grid - Videos and Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Video - Kids cooking */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <video
                src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508012/IMG_4246_pb3da3.mov"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            {/* Image - Kitchen with kids */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <Image
                src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507166/IMG_4271_jndruw.heic"
                alt="Kids learning to cook"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Video - Kids in kitchen */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <video
                src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769508707/IMG_4285_s1kolp.mov"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            {/* Image - Kitchen with kids */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <Image
                src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769508848/IMG_8421_lv6ip3.jpg"
                alt="Young chefs at work"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Food Photos Section */}
          <div className="text-center mb-8 mt-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Delicious Creations
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Food Video */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <video
                src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769507313/Tacos_frying_hfvqea.mov"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            {/* Food Photo */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <Image
                src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507291/IMG_4120_uxkirf.heic"
                alt="Delicious Latin food"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Food Video - Tortillas */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <video
                src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769507354/Tortillas_up_close_gqbqhd.mov"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>

            {/* Food Photo */}
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl group">
              <Image
                src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507294/IMG_4136_tcpd1r.heic"
                alt="Fresh ingredients"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Class Types Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cocinarte-navy mb-6">
              Choose Your Cooking Adventure
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto">
              We offer different class formats to suit every family's needs and schedule
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mini Chefcitos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-cocinarte-orange">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-cocinarte-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-10 w-10 text-cocinarte-orange" />
                </div>
                <h3 className="text-3xl font-bold text-cocinarte-navy mb-2">Mini Chefcitos</h3>
                <p className="text-xl font-semibold text-cocinarte-orange">Ages 7-12</p>
              </div>
              <p className="text-slate-600 text-center mb-6 leading-relaxed text-lg">
                Kids are dropped off and guided by our instructors. Perfect for building independence and cooking confidence.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-orange text-xl">✓</span>
                  <span className="text-slate-600">1.5-2 hours per class</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-orange text-xl">✓</span>
                  <span className="text-slate-600">Age-appropriate tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-orange text-xl">✓</span>
                  <span className="text-slate-600">Close supervision</span>
                </li>
              </ul>
            </div>

            {/* Chefcitos Together */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-cocinarte-red">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-cocinarte-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-cocinarte-red" />
                </div>
                <h3 className="text-3xl font-bold text-cocinarte-navy mb-2">Chefcitos Together</h3>
                <p className="text-xl font-semibold text-cocinarte-red">Ages 3+ with parents</p>
              </div>
              <p className="text-slate-600 text-center mb-6 leading-relaxed text-lg">
                Parents or caregivers participate in the cooking experience together with their child. Great for younger children and family bonding.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-red text-xl">✓</span>
                  <span className="text-slate-600">Family participation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-red text-xl">✓</span>
                  <span className="text-slate-600">Younger children welcome</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-red text-xl">✓</span>
                  <span className="text-slate-600">Shared learning experience</span>
                </li>
              </ul>
            </div>

            {/* Cocina Creativa */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-cocinarte-yellow">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-cocinarte-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 text-cocinarte-yellow" />
                </div>
                <h3 className="text-3xl font-bold text-cocinarte-navy mb-2">Cocina Creativa</h3>
                <p className="text-xl font-semibold text-cocinarte-yellow">Ages 12+</p>
              </div>
              <p className="text-slate-600 text-center mb-6 leading-relaxed text-lg">
                Beginner, intermediate, and advanced workshops designed for teens and adults. Perfect for birthday parties and private events.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-yellow text-xl">✓</span>
                  <span className="text-slate-600">Custom options available</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-yellow text-xl">✓</span>
                  <span className="text-slate-600">Private group classes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cocinarte-yellow text-xl">✓</span>
                  <span className="text-slate-600">Birthday party packages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-cocinarte-red relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/cocinarte/floating_elements/COCINARTE_cupcakes.svg"
            alt=""
            width={100}
            height={100}
            className="absolute top-10 left-10 animate-float-slow"
          />
          <Image
            src="/cocinarte/floating_elements/COCINARTE_cuchara.svg"
            alt=""
            width={80}
            height={80}
            className="absolute bottom-10 right-10 animate-float-medium"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Start Your Culinary Journey?
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
            Join hundreds of families who have discovered the joy of cooking at Cocinarte. Book your first class today and watch your young chef shine!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-cocinarte-red hover:bg-cocinarte-orange text-white px-12 py-8 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Calendar className="mr-3 h-7 w-7" />
                Book Your Class Now
              </Button>
            </Link>
            <Link href="/#contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white hover:bg-white/90 text-cocinarte-navy border-2 border-white px-12 py-8 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-12 border-t border-white/20">
            <p className="text-white/80 text-lg mb-6">Follow us for cooking inspiration and class updates</p>
            <div className="flex justify-center gap-6">
              <Link
                href="https://www.instagram.com/cocinartepdx/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3"
              >
                <Instagram className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">@cocinartepdx</span>
              </Link>
              <Link
                href="https://www.facebook.com/profile.php?id=61580541556926"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3"
              >
                <Facebook className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Cocinarte PDX</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cocinarte-navy text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <Image
              src="/cocinarte/cocinarteLogo.webp"
              alt="Cocinarte Logo"
              width={200}
              height={60}
              className="object-contain h-16 w-auto mx-auto"
            />
          </div>
          <p className="text-white/70 text-lg mb-4">
            Where young chefs discover the joy of cooking
          </p>
          <p className="text-white/50 text-sm">
            © 2025 Cocinarte. All rights reserved.
          </p>
          <div className="mt-6">
            <Link
              href="https://www.casitaazuleducation.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cocinarte-yellow hover:text-cocinarte-orange transition-colors duration-300"
            >
              Part of Casita Azul Education
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
