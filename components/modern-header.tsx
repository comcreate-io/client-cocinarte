"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Star, MapPin, Phone, ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function ModernHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMenuAnimating, setIsMenuAnimating] = useState(false)
  const pathname = usePathname()
  const headerRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: "Home", href: "/landing" },
    { name: "Cocinarte", href: "/" },
    { name: "Casita Azul", href: "/casita-azul" },
    { name: "Camp Alegría", href: "/camp-alegria" },
    { name: "Contact", href: "/contact" },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMenuAnimating(false)
        setTimeout(() => setIsMenuOpen(false), 300)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  const isActivePage = (href: string, submenu?: any[]) => {
    if (pathname === href) return true
    if (submenu) {
      return submenu.some((item) => pathname === item.href || pathname.startsWith(item.href.split("#")[0]))
    }
    return false
  }

  const handleDropdownToggle = (itemName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveDropdown(activeDropdown === itemName ? null : itemName)
  }

  return (
    <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar */}
      <div className="hidden sm:block bg-slate text-white py-2 text-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">770 NE Rogahn Street, Hillsboro, OR 97124</span>
                <span className="sm:hidden">Hillsboro, OR</span>
              </div>
              <div className="hidden md:flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(503) 916-9758</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-golden" />
                <span className="text-xs hidden sm:inline">Culinary Excellence for All Ages</span>
                <span className="text-xs sm:hidden">Culinary Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <Image 
                  src="/branding/logo.png" 
                  alt="Logo" 
                  width={200} 
                  height={64} 
                  className="object-contain h-14 sm:h-16 lg:h-20 max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]" 
                />
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.submenu ? (
                    <div className="relative">
                      <button
                        className={`flex items-center px-6 py-3 rounded-xl text-base font-questa font-semibold transition-all duration-200 ${
                          isActivePage(item.href, item.submenu)
                            ? "bg-slate text-white shadow-md"
                            : "text-slate hover:bg-slate hover:text-white"
                        }`}
                        onClick={(e) => handleDropdownToggle(item.name, e)}
                      >
                        {item.name}
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {activeDropdown === item.name && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-3 text-sm font-questa transition-colors duration-200 ${
                                pathname === subItem.href || pathname.startsWith(subItem.href.split("#")[0])
                                  ? "bg-slate text-white font-semibold"
                                  : "text-slate hover:bg-slate hover:text-white"
                              }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-6 py-3 rounded-xl text-base font-questa font-semibold transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-slate text-white shadow-md"
                          : "text-slate hover:bg-slate hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <div className="relative">
                <Button
                  size="lg"
                  className="bg-amber hover:bg-golden hover:text-slate text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-questa px-6 py-3 text-base flex items-center"
                  onClick={(e) => handleDropdownToggle("Discover More", e)}
                >
                  Discover More
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === "Discover More" ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {activeDropdown === "Discover More" && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                    <Link
                      href="/casita-azul"
                      className="flex items-center px-4 py-4 text-base font-questa text-slate hover:bg-slate hover:text-white transition-colors duration-200"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Image 
                        src="/casita-azul.png" 
                        alt="Casita Azul Logo" 
                        width={44} 
                        height={44} 
                        className="mr-4 object-contain" 
                      />
                      Casita Azul
                    </Link>
                    <Link
                      href="/camp-alegria"
                      className="flex items-center px-4 py-4 text-base font-questa text-slate hover:bg-slate hover:text-white transition-colors duration-200"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Image 
                        src="/camp-alegria.png" 
                        alt="Camp Alegria Logo" 
                        width={44} 
                        height={44} 
                        className="mr-4 object-contain" 
                      />
                      Camp Alegria
                    </Link>
                  </div>
                )}
              </div>
              <Button
                size="lg"
                className="bg-amber hover:bg-golden hover:text-slate text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-questa px-6 py-3 text-base"
              >
                <Link href="/contact">Apply Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden mobile-menu-button p-2 rounded-xl bg-slate text-white hover:bg-slate-medium hover:text-white transition-colors duration-200"
              onClick={() => {
                if (!isMenuOpen) {
                  setIsMenuAnimating(true)
                  setIsMenuOpen(true)
                } else {
                  setIsMenuAnimating(false)
                  setTimeout(() => setIsMenuOpen(false), 300)
                }
              }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mobile-menu fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className={`absolute top-0 right-0 h-screen w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
              isMenuAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-amber/5 to-golden/5 flex-shrink-0">
                <div className="flex items-center flex-1">
                  <Image 
                    src="/branding/logo.png" 
                    alt="Logo" 
                    width={120} 
                    height={40} 
                    className="object-contain h-12 mx-auto" 
                  />
                </div>
                <button
                  onClick={() => {
                    setIsMenuAnimating(false)
                    setTimeout(() => setIsMenuOpen(false), 300)
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex flex-col flex-1 min-h-0">
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <div>
                          <button
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isActivePage(item.href, item.submenu)
                                ? "bg-amber text-white shadow-lg"
                                : "text-gray-700 hover:bg-amber/10 hover:text-amber"
                            }`}
                            onClick={(e) => handleDropdownToggle(item.name, e)}
                          >
                            <span className="flex items-center">
                              {item.name}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 transition-all duration-300 ${
                                activeDropdown === item.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {activeDropdown === item.name && (
                            <div className="ml-3 mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    pathname === subItem.href || pathname.startsWith(subItem.href.split("#")[0])
                                      ? "bg-amber text-white shadow-md"
                                      : "text-gray-600 hover:bg-amber hover:text-white"
                                  }`}
                                  onClick={() => {
                                    setIsMenuAnimating(false)
                                    setTimeout(() => {
                                      setIsMenuOpen(false)
                                      setActiveDropdown(null)
                                    }, 300)
                                  }}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            pathname === item.href
                              ? "bg-amber text-white shadow-lg"
                              : "text-gray-700 hover:bg-amber/10 hover:text-amber"
                          }`}
                          onClick={() => {
                            setIsMenuAnimating(false)
                            setTimeout(() => setIsMenuOpen(false), 300)
                          }}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Action Buttons */}
                <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
                  <div className="space-y-3">
                    <div className="relative">
                      <Button
                        size="lg"
                        className="w-full bg-amber hover:bg-golden hover:text-slate text-white rounded-xl font-medium py-3 text-sm shadow-lg transition-all duration-200 flex items-center justify-between"
                        onClick={(e) => handleDropdownToggle("Discover More Mobile", e)}
                      >
                        <span>Discover More</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-all duration-300 ${
                            activeDropdown === "Discover More Mobile" ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                      {activeDropdown === "Discover More Mobile" && (
                        <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
                          <Link
                            href="/casita-azul"
                            className="flex items-center px-3 py-4 rounded-lg text-base font-medium text-gray-700 hover:bg-amber hover:text-white transition-all duration-200"
                            onClick={() => {
                              setIsMenuAnimating(false)
                              setTimeout(() => {
                                setIsMenuOpen(false)
                                setActiveDropdown(null)
                              }, 300)
                            }}
                          >
                            <Image 
                              src="/casita-azul.png" 
                              alt="Casita Azul Logo" 
                              width={36} 
                              height={36} 
                              className="mr-4 object-contain" 
                            />
                            Casita Azul
                          </Link>
                          <Link
                            href="/camp-alegria"
                            className="flex items-center px-3 py-4 rounded-lg text-base font-medium text-gray-700 hover:bg-amber hover:text-white transition-all duration-200"
                            onClick={() => {
                              setIsMenuAnimating(false)
                              setTimeout(() => {
                                setIsMenuOpen(false)
                                setActiveDropdown(null)
                              }, 300)
                            }}
                          >
                            <Image 
                              src="/camp-alegria.png" 
                              alt="Camp Alegria Logo" 
                              width={36} 
                              height={36} 
                              className="mr-4 object-contain" 
                            />
                            Camp Alegria
                          </Link>
                        </div>
                      )}
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-slate hover:bg-slate-medium text-white rounded-xl font-medium py-3 text-sm shadow-lg transition-all duration-200"
                      onClick={() => {
                        setIsMenuAnimating(false)
                        setTimeout(() => setIsMenuOpen(false), 300)
                      }}
                    >
                      <Link href="/contact">Apply Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}
