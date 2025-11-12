"use client"

import { Button } from "@/components/ui/button"
import { Cake, PartyPopper, Star } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState } from "react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function CocinarteBirthday() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    numberOfChildren: '',
    package: '',
    parentName: '',
    phone: '',
    email: '',
    childNameAge: '',
    specialRequests: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Birthday form submitted!')
    console.log('Form data:', formData)
    console.log('Selected date:', selectedDate)
    
    if (!selectedDate) {
      console.log('Date validation failed')
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your party.",
        variant: "destructive"
      })
      return
    }

    if (!formData.package) {
      console.log('Package validation failed')
      toast({
        title: "Package Required",
        description: "Please select a party package.",
        variant: "destructive"
      })
      return
    }

    console.log('All validations passed, submitting...')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/birthday-party', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredDate: selectedDate.toISOString(),
          ...formData
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Success! Showing toast...')
        toast({
          title: "🎉 Request Submitted!",
          description: "We've received your party request and will contact you within 24 hours!",
          duration: 5000
        })
        
        // Reset form
        setSelectedDate(null)
        setFormData({
          numberOfChildren: '',
          package: '',
          parentName: '',
          phone: '',
          email: '',
          childNameAge: '',
          specialRequests: ''
        })
      } else {
        throw new Error(data.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting party request:', error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="birthday-parties" className="py-20 relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/cocinarte/cocinarte11.jpeg"
          alt="Birthday party background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/50"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_cupcakes.svg"
              alt="Cupcakes"
              width={90}
              height={90}
              className="opacity-70 animate-float-slow"
            />
            <h2 className="text-4xl lg:text-5xl font-bold text-slate">
              Birthday Party Packages
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_niคo2.svg"
              alt="Child cooking"
              width={80}
              height={80}
              className="opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-xl text-slate-medium max-w-3xl mx-auto">
            Make your child's birthday unforgettable with our fun cooking party packages!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-cocinarte-yellow to-cocinarte-yellow rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
            <Cake className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Mini Fiesta</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Up to 8 kids</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$450</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2">
                  <li>• 1.5-hour cooking session</li>
                  <li>• All ingredients</li>
                  <li>• Birthday cake-making</li>
                  <li>• Take-home treats</li>
                  <li>• Party decorations</li>
                </ul>
              </div>

          <div className="bg-gradient-to-br from-cocinarte-red to-cocinarte-red rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
            <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Deluxe Fiesta</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Up to 12 kids</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$650</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2">
                  <li>• 2.5-hour cooking session</li>
                  <li>• All ingredients</li>
                  <li>• Custom birthday cake</li>
                  <li>• Goodie bags</li>
                  <li>• Full party decorations</li>
                  <li>• Photo Booth station for pictures</li>
                </ul>
              </div>

          <div className="bg-cocinarte-navy rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Premium Fiesta</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Up to 18 kids</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$850</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2">
                  <li>• 3-hour cooking session</li>
                  <li>• All ingredients</li>
                  <li>• Custom themed cake</li>
                  <li>• Premium goodie bags</li>
                  <li>• Themed decorations</li>
                  <li>• Party coordinator</li>
                  <li>• Photo Booth station for pictures</li>
                </ul>
              </div>
        </div>

        {/* Weekend Party Room Rentals Section */}
        <div className="mt-20">
          {/* Hero Header */}
          <div className="bg-gradient-to-br from-cocinarte-navy via-cocinarte-blue to-cocinarte-navy rounded-3xl p-8 md:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cocinarte-yellow/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cocinarte-red/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center">
              <div className="inline-block bg-cocinarte-yellow px-6 py-2 rounded-full mb-4">
                <p className="text-cocinarte-navy font-bold text-sm uppercase tracking-wider">Weekend Special</p>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">Weekend Party Room Rentals</h3>
              <p className="text-xl md:text-2xl text-cocinarte-blue mb-2">Two beautiful party rooms available</p>

              <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                  <p className="text-5xl md:text-6xl font-bold text-cocinarte-yellow">$450</p>
                  <p className="text-sm text-cocinarte-blue mt-2">Base Price</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                  <p className="text-3xl md:text-4xl font-bold text-white">$200</p>
                  <p className="text-sm text-cocinarte-blue mt-2">Non-refundable Deposit</p>
                </div>
              </div>

              <p className="text-cocinarte-blue mt-6 text-lg">Remaining balance due day of event</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* What's Included - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border-2 border-cocinarte-blue/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-cocinarte-red p-3 rounded-xl">
                  <PartyPopper className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-cocinarte-navy">What's Included</h4>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">⏱️</span>
                    <div>
                      <p className="font-semibold text-slate-800">2 hours party time</p>
                      <p className="text-xs text-slate-600">Party + cleanup included</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">🚪</span>
                    <div>
                      <p className="font-semibold text-slate-800">TWO party rooms</p>
                      <p className="text-xs text-slate-600">Exclusive access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">👶</span>
                    <div>
                      <p className="font-semibold text-slate-800">Up to 16 kids included</p>
                      <p className="text-xs text-slate-600">MAX 20 kids (+$12 each)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">👨‍👩‍👧‍👦</span>
                    <div>
                      <p className="font-semibold text-slate-800">Space for 45 guests</p>
                      <p className="text-xs text-slate-600">Kids under 10 months free</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">⚙️</span>
                    <div>
                      <p className="font-semibold text-slate-800">30 min setup time</p>
                      <p className="text-xs text-slate-600">Before your event</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">🎉</span>
                    <div>
                      <p className="font-semibold text-slate-800">Exclusive party host</p>
                      <p className="text-xs text-slate-600">Dedicated to your event</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">🪑</span>
                    <div>
                      <p className="font-semibold text-slate-800">Tables & chairs</p>
                      <p className="text-xs text-slate-600">Café tables included</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">🎂</span>
                    <div>
                      <p className="font-semibold text-slate-800">Cake cutter & lighter</p>
                      <p className="text-xs text-slate-600">Ready for your celebration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cocinarte-blue/5 rounded-lg hover:bg-cocinarte-blue/10 transition-colors">
                    <span className="text-cocinarte-orange text-xl">🍕</span>
                    <div>
                      <p className="font-semibold text-slate-800">BYOF (Bring Your Own)</p>
                      <p className="text-xs text-slate-600">Food, drinks, snacks (nut-free)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-cocinarte-yellow rounded-lg">
                <p className="text-sm font-bold text-slate-800 mb-2">⚠️ Important Requirements:</p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  <p>• All guests must sign a waiver</p>
                  <p>• Parent must stay with each child</p>
                </div>
              </div>
            </div>

            {/* Time Slots - Takes 1 column */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cocinarte-yellow to-cocinarte-orange rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Cake className="w-6 h-6" />
                  <h4 className="text-xl font-bold">Weekend Time Slots</h4>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-colors">
                    <p className="font-bold text-lg">9:00 am – 11:00 am</p>
                    <p className="text-xs text-white/90">Morning slot</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-colors">
                    <p className="font-bold text-lg">12:00 pm – 2:00 pm</p>
                    <p className="text-xs text-white/90">Afternoon slot</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-colors">
                    <p className="font-bold text-lg">3:00 pm – 5:00 pm</p>
                    <p className="text-xs text-white/90">Evening slot</p>
                  </div>
                </div>

                <p className="text-xs text-white/80 mt-4 text-center">Extra availability may open depending on the day</p>
              </div>

              <div className="bg-gradient-to-br from-cocinarte-red to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                <h4 className="text-xl font-bold mb-4">🎄 Holiday Pricing</h4>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mb-4">
                  <p className="text-3xl font-bold">+$100</p>
                  <p className="text-xs text-white/90">Added to base price</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p>• Federal Holidays</p>
                  <p>• Spring Break</p>
                  <p>• Winter Break</p>
                  <p>• Thanksgiving Break</p>
                </div>
                <p className="text-xs text-white/80 mt-3 italic">Not applied during Summer Break</p>
              </div>
            </div>
          </div>

          {/* Add-Ons Section */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-cocinarte-blue/10">
            <div className="text-center mb-8">
              <h4 className="text-3xl font-bold text-cocinarte-navy mb-2">Enhance Your Party</h4>
              <p className="text-slate-600">Choose from our delicious add-ons to make your party extra special</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Extra Time */}
              <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-cocinarte-orange/20 hover:border-cocinarte-orange hover:shadow-xl transition-all">
                <div className="text-3xl mb-3">⏰</div>
                <h5 className="text-lg font-bold text-cocinarte-navy mb-3">Extra Time</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">+30 minutes</span>
                    <span className="font-bold text-cocinarte-orange">$90</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">+1 hour</span>
                    <span className="font-bold text-cocinarte-orange">$175</span>
                  </div>
                </div>
              </div>

              {/* Food */}
              <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-cocinarte-red/20 hover:border-cocinarte-red hover:shadow-xl transition-all">
                <div className="text-3xl mb-3">🍕</div>
                <h5 className="text-lg font-bold text-cocinarte-navy mb-3">Food</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Large pizza</span>
                    <span className="font-bold text-cocinarte-red">$30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Drink pitchers</span>
                    <span className="font-bold text-cocinarte-red">$10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Party cake</span>
                    <span className="font-bold text-cocinarte-red">$80</span>
                  </div>
                </div>
              </div>

              {/* Coffee */}
              <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all">
                <div className="text-3xl mb-3">☕</div>
                <h5 className="text-lg font-bold text-cocinarte-navy mb-3">Coffee</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">2.5L pot</span>
                    <span className="font-bold text-amber-600">$20</span>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-cocinarte-navy/20 hover:border-cocinarte-navy hover:shadow-xl transition-all">
                <div className="text-3xl mb-3">✨</div>
                <h5 className="text-lg font-bold text-cocinarte-navy mb-3">Experience</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Character visit</span>
                    <span className="font-bold text-cocinarte-navy">$150</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Smash cleanup</span>
                    <span className="font-bold text-cocinarte-navy">$35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">20+ kids fee</span>
                    <span className="font-bold text-cocinarte-navy">$75</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decor Add-Ons - Full Width Expandable Section */}
            <details className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎈</span>
                  <div>
                    <h5 className="text-xl font-bold text-cocinarte-navy">Decor Add-Ons</h5>
                    <p className="text-sm text-slate-600">Click to see all decoration options</p>
                  </div>
                </div>
                <span className="text-2xl text-purple-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-700">Full Party Décor Package</span>
                    <span className="font-bold text-purple-600 text-sm whitespace-nowrap ml-2">$225+</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Tables, balloons, goody bags</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Metal arches</span>
                  <span className="font-bold text-purple-600">$50</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">w/ white covers</span>
                  <span className="font-bold text-purple-600">$75</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Additional tables</span>
                  <span className="font-bold text-purple-600">$10</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Table covers</span>
                  <span className="font-bold text-purple-600">$5</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Cake stand</span>
                  <span className="font-bold text-purple-600">$10</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Cupcake stands (2)</span>
                  <span className="font-bold text-purple-600">$15</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Candles</span>
                  <span className="font-bold text-purple-600">$2-$8</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Easel</span>
                  <span className="font-bold text-purple-600">$25</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                  <span className="text-sm text-slate-700">Marquee Number</span>
                  <span className="font-bold text-purple-600">$30</span>
                </div>
              </div>
            </details>
          </div>

          {/* Policies Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cancellation Policy */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-100 hover:border-cocinarte-blue/30 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <span className="text-2xl">📋</span>
                </div>
                <h4 className="text-xl font-bold text-cocinarte-navy">Cancellation Policy</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-cocinarte-red mt-0.5">•</span>
                  <span>Deposits are <strong>nonrefundable</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cocinarte-orange mt-0.5">•</span>
                  <span>Reschedule <strong>once within 3 months</strong> (20+ day notice)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cocinarte-orange mt-0.5">•</span>
                  <span>Sick-day reschedule available with <strong>$75 fee</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Snow/weather: <strong>reschedule or refund</strong></span>
                </li>
              </ul>
            </div>

            {/* Decor Rules */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-slate-100 hover:border-cocinarte-blue/30 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="text-xl font-bold text-cocinarte-navy">Decor Rules</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Bring your own décor</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Command hooks only</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Banners with ribbon (7.6 ft max)</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="font-semibold text-red-800 text-xs mb-2">🚫 NOT ALLOWED:</p>
                  <p className="text-xs text-red-700">Nails, tape, tacks • Greenery wall attachments • Glitter, confetti, slime • Paint, piñatas, alcohol</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Birthday Party Request Form */}
        <div className="mt-16 bg-cocinarte-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center text-slate mb-6">Request Your Party</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Date *
                </label>
                <div className="relative" data-page="cocinarte">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select a date"
                    className="w-full px-4 py-3 pr-12 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10 font-coming-soon"
                    required
                    minDate={new Date()}
                    showPopperArrow={false}
                    popperClassName="react-datepicker-popper"
                    calendarClassName="react-datepicker-calendar"
                    dayClassName={(date) => 
                      date.getTime() === selectedDate?.getTime() 
                        ? 'react-datepicker__day--selected' 
                        : ''
                    }
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Number of Children *
                </label>
                <input 
                  type="number"
                  name="numberOfChildren"
                  value={formData.numberOfChildren}
                  onChange={handleInputChange}
                  min="1" 
                  max="20" 
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10"
                  placeholder="How many children?"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Package Selection *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-cocinarte-yellow/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="mini-party"
                    checked={formData.package === 'mini-party'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Mini Fiesta</div>
                    <div className="text-xs text-slate-medium">$450 • Up to 8 kids • 1.5 hours</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-cocinarte-red/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="deluxe-party"
                    checked={formData.package === 'deluxe-party'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Deluxe Fiesta</div>
                    <div className="text-xs text-slate-medium">$650 • Up to 12 kids • 2.5 hours</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-cocinarte-navy/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="premium-party"
                    checked={formData.package === 'premium-party'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Premium Fiesta</div>
                    <div className="text-xs text-slate-medium">$850 • Up to 18 kids • 3 hours</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <input 
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10"
                  placeholder="(503) 123-4567"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Birthday Child's Name & Age
                </label>
                <input 
                  type="text"
                  name="childNameAge"
                  value={formData.childNameAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10"
                  placeholder="e.g., Maria, age 8"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Special Requests or Dietary Restrictions
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10 resize-none"
                placeholder="Any allergies, special themes, or requests..."
              ></textarea>
            </div>
            
          <div className="text-center">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-cocinarte-orange hover:bg-amber text-cocinarte-white font-bold px-6 py-3 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Party Request'}
              </Button>
              <p className="text-xs text-slate-medium mt-3">
                We'll contact you within 24 hours to confirm availability!
              </p>
          </div>
          </form>
        </div>
      </div>
    </section>
  )
}
