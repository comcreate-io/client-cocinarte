"use client"

import { Button } from "@/components/ui/button"
import { Users, ChefHat, Clock, DollarSign, UtensilsCrossed, Sparkles } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState } from "react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

// Menu options for private classes
const MENU_OPTIONS = [
  {
    id: "tostadas",
    name: "Baked Tostadas with Shredded Chicken",
    description: "Tostadas horneadas con pollo deshebrado, salsa BBQ-chipotle suave, frijoles refritos, lechuga y queso",
    category: "Main Course"
  },
  {
    id: "tamales",
    name: "Mini Tamales Express Tricolor",
    description: "Traditional tricolor mini tamales with pickled red onion",
    category: "Main Course"
  },
  {
    id: "arepas",
    name: "Turkey and Cheese Arepa Sliders",
    description: "Arepas sliders de pavo y queso - delicious Colombian-style sliders",
    category: "Main Course"
  },
  {
    id: "empanadas",
    name: "Mini Chicken Empanadas",
    description: "Empanaditas de pollo - crispy baked empanadas with savory chicken filling",
    category: "Main Course"
  },
  {
    id: "tacos",
    name: "Crispy Sweet Potato and Black Bean Tacos",
    description: "Tacos crujientes de camote y frijoles negros - vegetarian friendly",
    category: "Main Course"
  },
  {
    id: "quesadillas",
    name: "Mini Quesadillas with Monster Guacamole",
    description: "Fun quesadillas served with freshly made guacamole",
    category: "Main Course"
  },
  {
    id: "birria",
    name: "Turkey Birria with Bean Sopes",
    description: "Birria de pavo with sopes de frijoles con queso fresco",
    category: "Main Course"
  },
  {
    id: "chicken-rolls",
    name: "Mini Spinach & Cheese Chicken Rolls",
    description: "Mini Rollitos de Pollo con Espinaca y Queso - elegant and delicious",
    category: "Main Course"
  },
  {
    id: "wraps",
    name: "Mini Chicken and Veggie Wraps",
    description: "Mini wraps de pollo y vegetales - healthy and colorful",
    category: "Main Course"
  },
  {
    id: "mac-cheese",
    name: "Mac & Cheese with Hidden Vegetables",
    description: "Creamy mac & cheese with nutritious hidden veggies",
    category: "Main Course"
  },
  {
    id: "custom",
    name: "Custom Menu",
    description: "Let us know your preferences and we'll create something special",
    category: "Custom"
  }
]

export default function CocinartePrivateEvents() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    eventType: '',
    numberOfGuests: '',
    preferredTime: '',
    contactName: '',
    phone: '',
    email: '',
    selectedMenu: '',
    dietaryRestrictions: '',
    eventDetails: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your event.",
        variant: "destructive"
      })
      return
    }

    if (!formData.eventType || formData.eventType === 'Select event type') {
      toast({
        title: "Event Type Required",
        description: "Please select an event type.",
        variant: "destructive"
      })
      return
    }

    if (!formData.preferredTime || formData.preferredTime === 'Select time') {
      toast({
        title: "Time Required",
        description: "Please select a preferred time.",
        variant: "destructive"
      })
      return
    }

    if (!formData.selectedMenu) {
      toast({
        title: "Menu Selection Required",
        description: "Please select a menu option for your private class.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/private-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredDate: selectedDate.toISOString(),
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "🎊 Request Submitted!",
          description: "We've received your private class request and will contact you within 24 hours!",
          duration: 5000
        })

        // Reset form
        setSelectedDate(null)
        setFormData({
          eventType: '',
          numberOfGuests: '',
          preferredTime: '',
          contactName: '',
          phone: '',
          email: '',
          selectedMenu: '',
          dietaryRestrictions: '',
          eventDetails: ''
        })
      } else {
        throw new Error(data.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting event request:', error)
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
    <section id="private-events" className="py-20 bg-gradient-to-br from-cocinarte-blue/10 via-cocinarte-yellow/10 to-cocinarte-orange/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_utensilios.svg"
              alt="Utensils"
              width={90}
              height={90}
              className="opacity-70 animate-float-slow"
            />
            <h2 className="text-4xl lg:text-5xl font-bold text-slate">
              Private Cooking Classes
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_niคo3.svg"
              alt="Child cooking"
              width={80}
              height={80}
              className="opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-xl text-slate-medium max-w-3xl mx-auto">
            Book an exclusive cooking experience for your group! Perfect for team building, family gatherings, or special celebrations.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mb-12">
          <div className="bg-cocinarte-navy rounded-2xl p-8 md:p-12 text-white shadow-xl text-center">
            <div className="inline-block bg-cocinarte-yellow px-6 py-2 rounded-full mb-4">
              <p className="text-cocinarte-navy font-bold text-sm uppercase tracking-wider">Private Class Package</p>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Private Cooking Experience</h3>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-cocinarte-yellow">$350</p>
                <p className="text-sm text-cocinarte-blue mt-1">Flat Rate</p>
              </div>
              <div className="hidden sm:block h-16 w-px bg-cocinarte-blue/30"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">Up to 12</p>
                <p className="text-sm text-cocinarte-blue mt-1">People (including parents)</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Users className="w-8 h-8 text-cocinarte-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Up to 12 Guests</p>
                <p className="text-xs text-cocinarte-blue">Adults & Kids</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <ChefHat className="w-8 h-8 text-cocinarte-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">Choose Your Dish</p>
                <p className="text-xs text-cocinarte-blue">From Our Menu</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Clock className="w-8 h-8 text-cocinarte-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">2 Hour Class</p>
                <p className="text-xs text-cocinarte-blue">Hands-on Experience</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <UtensilsCrossed className="w-8 h-8 text-cocinarte-yellow mx-auto mb-2" />
                <p className="text-sm font-medium">All Ingredients</p>
                <p className="text-xs text-cocinarte-blue">Included</p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Included Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* What's Included */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h4 className="text-2xl font-bold text-cocinarte-navy mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cocinarte-yellow" />
              What's Included
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">Private use of our cooking space for your group</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">Professional chef instruction throughout the class</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">All ingredients and cooking equipment provided</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">Choose one dish from our delicious menu</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">Enjoy your creation together at the end</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">Take home any leftovers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cocinarte-orange text-xl">✓</span>
                <span className="text-slate-700">Aprons provided during the class</span>
              </li>
            </ul>
          </div>

          {/* Important Notes */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h4 className="text-2xl font-bold text-cocinarte-navy mb-6">Important Notes</h4>

            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h5 className="font-bold text-amber-800 mb-2">🎨 Decorations</h5>
                <p className="text-sm text-amber-700">Decorations are <strong>NOT included</strong> in the package. You're welcome to bring your own simple decorations (command hooks only, no tape or nails).</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-bold text-blue-800 mb-2">👥 Group Size</h5>
                <p className="text-sm text-blue-700">Package includes up to <strong>12 people total</strong> (children and accompanying adults). Additional guests may be possible for an extra fee - please inquire.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-bold text-green-800 mb-2">🍽️ Menu Selection</h5>
                <p className="text-sm text-green-700">Choose one dish from our menu for your class. All participants will cook the same recipe together. Dietary accommodations available upon request.</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-bold text-purple-800 mb-2">📋 Waivers Required</h5>
                <p className="text-sm text-purple-700">All participants must sign a waiver. Parents/guardians must stay with children under 12 during the class.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Perfect For Section */}
        <div className="bg-cocinarte-orange/10 rounded-2xl p-8 mb-12">
          <h4 className="text-2xl font-bold text-center text-cocinarte-navy mb-6">Perfect For</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <span className="text-3xl mb-2 block">👨‍👩‍👧‍👦</span>
              <p className="font-semibold text-slate-700">Family Gatherings</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <span className="text-3xl mb-2 block">🏢</span>
              <p className="font-semibold text-slate-700">Team Building</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <span className="text-3xl mb-2 block">🎓</span>
              <p className="font-semibold text-slate-700">School Groups</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <span className="text-3xl mb-2 block">🎉</span>
              <p className="font-semibold text-slate-700">Special Celebrations</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-slate mb-6">Request Your Private Class</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                >
                  <option value="">Select event type</option>
                  <option value="Family Gathering">Family Gathering</option>
                  <option value="Team Building">Team Building</option>
                  <option value="School Group">School Group</option>
                  <option value="Friends Get-Together">Friends Get-Together</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Anniversary Celebration">Anniversary Celebration</option>
                  <option value="Holiday Party">Holiday Party</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Guests * <span className="font-normal text-slate-500">(max 12)</span></label>
                  <input
                    type="number"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                    min="1"
                    max="12"
                    required
                    className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                    placeholder="Total people (1-12)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Time *</label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  >
                    <option value="">Select time</option>
                    <option value="Morning (9 AM - 11 AM)">Morning (9 AM - 11 AM)</option>
                    <option value="Midday (11 AM - 1 PM)">Midday (11 AM - 1 PM)</option>
                    <option value="Afternoon (1 PM - 3 PM)">Afternoon (1 PM - 3 PM)</option>
                    <option value="Late Afternoon (3 PM - 5 PM)">Late Afternoon (3 PM - 5 PM)</option>
                    <option value="Evening (5 PM - 7 PM)">Evening (5 PM - 7 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Date *</label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select a date"
                    className="w-full px-4 py-3 pr-12 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                    minDate={new Date()}
                    required
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Choose Your Dish *</label>
                <select
                  name="selectedMenu"
                  value={formData.selectedMenu}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                >
                  <option value="">Select a dish from our menu</option>
                  {MENU_OPTIONS.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                {formData.selectedMenu && formData.selectedMenu !== 'custom' && (
                  <p className="mt-2 text-sm text-slate-600 italic">
                    {MENU_OPTIONS.find(m => m.id === formData.selectedMenu)?.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                    placeholder="(503) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dietary Restrictions or Allergies</label>
                <input
                  type="text"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  placeholder="e.g., vegetarian, nut allergy, gluten-free"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Details</label>
                <textarea
                  name="eventDetails"
                  value={formData.eventDetails}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50 resize-none"
                  placeholder="Tell us about your group, any special requests, or questions..."
                ></textarea>
              </div>

              <div className="text-center pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cocinarte-orange hover:bg-amber text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <p className="text-sm text-slate-medium mt-4">We'll contact you within 24 hours to confirm availability!</p>
              </div>
            </form>
          </div>

          {/* Images Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="text-xl font-bold text-cocinarte-navy mb-4">Our Cooking Space</h4>
              <div className="space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <Image
                    src="/cocinarte/cocinarte2.jpeg"
                    alt="Cooking class in action"
                    width={600}
                    height={338}
                    className="w-full h-full object-cover object-[center_20%]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="/cocinarte/cocinarte10.jpeg"
                      alt="Kids cooking together"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="/cocinarte/cocinarte11.jpeg"
                      alt="Group cooking experience"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover object-[center_35%]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-cocinarte-yellow rounded-2xl p-6 text-center">
              <h4 className="text-xl font-bold text-white mb-2">Questions?</h4>
              <p className="text-white/90 mb-4">We're happy to help you plan your perfect cooking experience!</p>
              <div className="space-y-2 text-white">
                <p className="font-semibold">📧 info@cocinartepdx.org</p>
                <p className="font-semibold">📞 (503) 916-9758</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
