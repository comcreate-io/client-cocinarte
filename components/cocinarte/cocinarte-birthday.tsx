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

        {/* Available Themes Banner */}
        <div className="mb-12 bg-cocinarte-orange rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Ask us about available party themes!</h3>
          <p className="text-white text-lg">
            We offer: <strong>Pastel • Rainbow • Jungle • Encanto • Coco • Princess • Baking Theme</strong> and more!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* DIY Party */}
          <div className="bg-cocinarte-orange rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
            <Cake className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">DIY Party</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Do It Yourself</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$450</p>
            <p className="text-xs text-white/90 mb-2">Deposit: $200</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2 text-left">
              <li>• Room rental (both rooms)</li>
              <li>• Adult & kids tables/chairs</li>
              <li>• 2-hour party time</li>
              <li>• Set-up time included</li>
              <li>• Up to 16 kids included</li>
            </ul>
          </div>

          {/* Mini Fiesta */}
          <div className="bg-cocinarte-yellow rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
            <Cake className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Mini Fiesta</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Up to 8 kids</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$450</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2 text-left">
              <li>• 1.5-hour party</li>
              <li>• All ingredients</li>
              <li>• Birthday cake-making</li>
              <li>• Take-home treats</li>
              <li>• Party decorations</li>
            </ul>
          </div>

          {/* Deluxe Fiesta */}
          <div className="bg-cocinarte-red rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
            <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Deluxe Fiesta</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Up to 12 kids</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$650</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2 text-left">
              <li>• 2-hour party</li>
              <li>• All ingredients</li>
              <li>• Custom birthday cake</li>
              <li>• Goodie bags</li>
              <li>• Full party decorations</li>
              <li>• Photo Booth station</li>
            </ul>
          </div>

          {/* Premium Fiesta */}
          <div className="bg-cocinarte-navy rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-white text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Premium Fiesta</h3>
            <p className="text-sm sm:text-base lg:text-lg text-white mb-2 sm:mb-3">Up to 18 kids</p>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">$850</p>
            <ul className="text-xs sm:text-sm text-white space-y-1 sm:space-y-2 text-left">
              <li>• 2.5-hour party</li>
              <li>• All ingredients</li>
              <li>• Custom themed cake</li>
              <li>• Premium goodie bags</li>
              <li>• Themed decorations</li>
              <li>• Party coordinator</li>
              <li>• Photo Booth station</li>
            </ul>
          </div>
        </div>

        {/* VIP Package - Full Width */}
        <div className="mb-8 bg-cocinarte-yellow rounded-2xl p-6 md:p-8 text-center shadow-xl">
          <div className="inline-block bg-white px-6 py-2 rounded-full mb-4">
            <p className="text-cocinarte-navy font-bold text-sm uppercase tracking-wider">⭐ VIP Experience ⭐</p>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">VIP Party Package</h3>
          <p className="text-5xl font-bold text-white mb-6">$1,078</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-white max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Full décor package</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Small balloon garland</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Pizzas included</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Veggie tray</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Sodas & kids juices</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Goodie bags</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Character visit</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Tables & chairs</div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">✓ Both party rooms</div>
          </div>
        </div>

        {/* Weekend Party Room Rentals Section */}
        <div className="mt-20">
          {/* Header */}
          <div className="bg-cocinarte-navy rounded-t-2xl p-8 md:p-12 text-white shadow-lg text-center mb-0">
            <div className="inline-block bg-cocinarte-yellow px-6 py-2 rounded-full mb-4">
              <p className="text-cocinarte-navy font-bold text-sm uppercase tracking-wider">Weekend Special</p>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Weekend Party Room Rentals</h3>
            <p className="text-lg text-cocinarte-blue mb-6">Two beautiful party rooms available</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-cocinarte-yellow">$450</p>
                <p className="text-sm text-cocinarte-blue mt-1">Base Price</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">$200</p>
                <p className="text-sm text-cocinarte-blue mt-1">Non-refundable Deposit</p>
              </div>
            </div>
            <p className="text-cocinarte-blue">Remaining balance due day of event</p>
          </div>

          <div className="bg-white rounded-b-2xl shadow-lg p-6 md:p-8">

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* What's Included */}
            <div>
              <h4 className="text-xl font-bold text-cocinarte-navy mb-4">What's Included</h4>
              <ul className="space-y-2 text-slate-700">
                <li>• 2 hours of party time (party + cleanup)</li>
                <li>• 30 minutes of set-up time before event</li>
                <li>• Use of TWO party rooms</li>
                <li>• Up to 16 kids included (MAX 20 kids — $12 per additional child)</li>
                <li>• Children under 10 months are free</li>
                <li>• Space for up to 45 guests</li>
                <li>• Exclusive party host</li>
                <li>• Tables, chairs & café tables</li>
                <li>• Cake cutter & lighter provided</li>
                <li>• Bring your own food/drinks/snacks (nut-free)</li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-800">⚠️ Important:</p>
                <p className="text-xs text-slate-600 mt-1">• All guests must sign a waiver</p>
                <p className="text-xs text-slate-600">• Parent must stay with each child</p>
              </div>
            </div>

            {/* Time Slots & Holiday Pricing */}
            <div>
              <h4 className="text-xl font-bold text-cocinarte-navy mb-4">Party Time Slots</h4>
              <ul className="space-y-2 text-slate-700 mb-6">
                <li>• 9:00 am – 11:00 am</li>
                <li>• 1:30 pm – 3:30 pm</li>
                <li>• 4:30 pm – 6:30 pm</li>
              </ul>
              <p className="text-xs text-slate-500 mb-6">Extra availability may open depending on the day</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h5 className="text-lg font-bold text-cocinarte-navy mb-2">🎄 Holiday Pricing</h5>
                <p className="text-sm text-slate-700 mb-2"><strong>Add $100</strong> for:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Federal Holidays</li>
                  <li>• School Breaks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Add-Ons */}
          <div className="mb-8">
            <h4 className="text-xl font-bold text-cocinarte-navy mb-4 text-center">Add-Ons</h4>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="border-2 border-cocinarte-orange rounded-lg p-4 bg-orange-50 hover:shadow-lg transition-shadow">
                <h5 className="font-bold text-cocinarte-orange mb-2">⏰ Extra Time</h5>
                <p className="text-sm text-slate-700">+30 min: <strong>$90</strong></p>
              </div>

              <div className="border-2 border-cocinarte-red rounded-lg p-4 bg-red-50 hover:shadow-lg transition-shadow">
                <h5 className="font-bold text-cocinarte-red mb-2">🍕 Food</h5>
                <p className="text-sm text-slate-700">Large pizza: <strong>$30</strong></p>
                <p className="text-sm text-slate-700">Veggie tray: <strong>Price varies</strong></p>
                <p className="text-sm text-slate-700">Drink pitchers: <strong>$10</strong></p>
                <p className="text-sm text-slate-700">Party cake: <strong>$80</strong></p>
              </div>

              <div className="border-2 border-amber-500 rounded-lg p-4 bg-amber-50 hover:shadow-lg transition-shadow">
                <h5 className="font-bold text-amber-700 mb-2">☕ Coffee</h5>
                <p className="text-sm text-slate-700">2.5L pot: <strong>$20</strong></p>
              </div>

              <div className="border-2 border-cocinarte-navy rounded-lg p-4 bg-blue-50 hover:shadow-lg transition-shadow">
                <h5 className="font-bold text-cocinarte-navy mb-2">✨ Experience</h5>
                <p className="text-sm text-slate-700">Character visit: <strong>$150</strong></p>
                <p className="text-sm text-slate-700">Piñata w/ candy: <strong>$180</strong></p>
                <p className="text-sm text-slate-700">Smash cake cleanup: <strong>$35</strong></p>
                <p className="text-sm text-slate-700">Smash full cleanup: <strong>$150</strong></p>
              </div>
            </div>

            {/* Decor Add-Ons */}
            <details className="border-2 border-purple-400 rounded-lg p-4 bg-purple-50 hover:shadow-lg transition-shadow">
              <summary className="cursor-pointer font-bold text-purple-700 flex items-center justify-between">
                <span>🎈 Decor Add-Ons (Click to expand)</span>
                <span className="text-xl">▼</span>
              </summary>
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-700">
                <div className="bg-white p-2 rounded border border-purple-200">Full Décor Package (includes plates & cups): <strong>$225+</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Small balloon garland: <strong>$250</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Metal arches: <strong>$50</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">w/ white covers: <strong>$75</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Additional tables: <strong>$10</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Table covers: <strong>$5</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Cake stand: <strong>$10</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Cupcake stands (2): <strong>$15</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Candles: <strong>$2-$8</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Easel: <strong>$25</strong></div>
                <div className="bg-white p-2 rounded border border-purple-200">Marquee Number: <strong>$30</strong></div>
              </div>
            </details>
          </div>

          {/* Policies */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold text-cocinarte-navy mb-3">📋 Cancellation Policy</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Deposits are nonrefundable</li>
                <li>• Reschedule once within 3 months (20+ day notice)</li>
                <li>• Sick-day reschedule: $75 fee</li>
                <li>• Snow/weather: reschedule or refund</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-cocinarte-navy mb-3">🎨 Decor Rules</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Bring your own décor</li>
                <li>✓ Command hooks only</li>
                <li>✓ Banners with ribbon (7.6 ft max)</li>
              </ul>
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <strong>🚫 Not Allowed:</strong> Nails, tape, tacks, attaching to foliage wall, glitter, confetti, slime, paint, alcohol
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">Piñatas available as add-on only</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="diy-party"
                    checked={formData.package === 'diy-party'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">DIY Party</div>
                    <div className="text-xs text-slate-medium">$450 • Up to 16 kids • 2 hours</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-cocinarte-yellow/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="mini-fiesta"
                    checked={formData.package === 'mini-fiesta'}
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
                    value="deluxe-fiesta"
                    checked={formData.package === 'deluxe-fiesta'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Deluxe Fiesta</div>
                    <div className="text-xs text-slate-medium">$650 • Up to 12 kids • 2 hours</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-cocinarte-navy/10 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="premium-fiesta"
                    checked={formData.package === 'premium-fiesta'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Premium Fiesta</div>
                    <div className="text-xs text-slate-medium">$850 • Up to 18 kids • 2.5 hours</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-amber-100 cursor-pointer transition-colors sm:col-span-2 lg:col-span-2">
                  <input
                    type="radio"
                    name="package"
                    value="vip-package"
                    checked={formData.package === 'vip-package'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-cocinarte-orange focus:ring-cocinarte-orange"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">⭐ VIP Party Package ⭐</div>
                    <div className="text-xs text-slate-medium">$1,078 • All-inclusive premium experience</div>
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
