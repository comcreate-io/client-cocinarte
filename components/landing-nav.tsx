"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  X,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Calendar
} from "lucide-react"
import Image from "next/image"

export default function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const programs = [
    {
      name: "Programs",
      href: "#overview",
      logo: "/branding/logo.png",
      description: "K-5 Spanish Immersion",
      badge: "Ages 5-11"
    },
    {
      name: "Casita Azul",
      href: "#casita-azul",
      logo: "/casita-azul.png",
      description: "Preschool & Daycare",
      badge: "Ages 2-5"
    },
    {
      name: "Cocinarte",
      href: "#cocinarte",
      logo: "/cocinarte/cocinarteLogo.png",
      description: "Cooking Classes",
      badge: "All Ages"
    },
    {
      name: "Camp Alegría",
      href: "#camp-alegria",
      logo: "/camp-alegria.png",
      description: "Summer Camp",
      badge: "Ages 5-12"
    }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent lg:bg-white/95 lg:backdrop-blur-sm lg:border-b lg:border-slate-200 lg:shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end lg:justify-between h-16 lg:h-20">

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {programs.map((program) => {
                return (
                  <Link
                    key={program.name}
                    href={program.href}
                    className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={program.logo}
                        alt={program.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {program.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {program.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button size="sm" className="bg-slate hover:bg-slate-800 text-white">
              <Link href="#contact" className="flex items-center scroll-smooth">
                <Phone className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button - Moved to right */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white rounded-xl shadow-lg">
            <div className="px-4 py-6 space-y-6">
              {/* Programs List */}
              <div className="space-y-3">
                {programs.map((program) => {
                  return (
                    <Link
                      key={program.name}
                      href={program.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center space-x-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={program.logo}
                          alt={program.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-700 text-sm mb-1">
                          {program.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {program.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="flex flex-col space-y-3 pt-6 border-t border-slate-200">
                <Button className="w-full bg-slate hover:bg-slate-800 text-white">
                  <Link href="#contact" className="flex items-center justify-center scroll-smooth">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
