"use client"

import { Button } from "@/components/ui/button"
import { Palette, Music, ChefHat, Cake, PartyPopper, Star, Clock, Users, Sparkles, Gift, Camera, Pizza, Cookie, Check } from "lucide-react"
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

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your party.",
        variant: "destructive"
      })
      return
    }

    if (!formData.package) {
      toast({
        title: "Package Required",
        description: "Please select a party package.",
        variant: "destructive"
      })
      return
    }

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

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Request Submitted!",
          description: "We've received your party request and will contact you within 24 hours!",
          duration: 5000
        })

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
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src="https://res.cloudinary.com/dku1gnuat/video/upload/v1769506618/Diciendo_COCINARTE_g1qket.mov"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-white/70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_cupcakes.svg"
              alt="Cupcakes"
              width={90}
              height={90}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[90px] lg:h-[90px] opacity-70 animate-float-slow"
            />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate">
              Cocinarte Party Experiences
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_niño2.svg"
              alt="Child cooking"
              width={80}
              height={80}
              className="w-14 h-14 sm:w-18 sm:h-18 lg:w-[80px] lg:h-[80px] opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-xl sm:text-2xl text-slate-medium font-semibold mb-2">
            Creative • Interactive • Fully Hosted
          </p>
          <span className="inline-block bg-cocinarte-orange text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            Ages 5+
          </span>
          <p className="text-base sm:text-lg text-slate-medium max-w-3xl mx-auto px-4">
            At Cocinarte, families can choose <strong>ONE main party experience</strong> for their celebration.
            All parties are designed to be fun, interactive, and fully guided by our team.
          </p>
        </div>

        {/* Choose Your Experience */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate mb-6">Choose Your Experience</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            {/* Art Parties */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold mb-2">Art Parties</h4>
              <p className="text-purple-100">Creative painting & crafts</p>
            </div>

            {/* Dance & Music Parties */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold mb-2">Dance & Music Parties</h4>
              <p className="text-pink-100">High-energy fun & games</p>
            </div>

            {/* Cooking Parties */}
            <div className="bg-gradient-to-br from-cocinarte-orange to-cocinarte-red rounded-2xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold mb-2">Cooking Parties</h4>
              <p className="text-orange-100">Hands-on baking & culinary fun</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 italic">
            Kids focus on one core experience per party to keep the celebration engaging, organized, and age-appropriate.
          </p>
        </div>

        {/* What's Included - Art & Dance Parties Only */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate mb-2">What's Included</h3>
            <p className="text-sm text-cocinarte-red font-semibold">(Art & Dance Parties Only)</p>
            <p className="text-slate-500 text-sm mt-1">This section applies to Art and Dance & Music parties.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700"><strong>Fully hosted party experience</strong><br /><span className="text-sm text-slate-500">(Professional art instructor or DJ/party host)</span></p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700"><strong>All supplies and materials</strong> for the selected activity</p>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-700"><strong>Exclusive use of an adjacent party room</strong>, including:</p>
                  <ul className="text-sm text-slate-600 mt-2 ml-4 space-y-1">
                    <li>• 20 adult chairs & 4 adult tables</li>
                    <li>• 15 child chairs & 2 child tables</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Set-up and clean-up are only included with the Full Party Decor Package.
            </p>
          </div>
        </div>

        {/* Party Experiences & Pricing Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-slate">Party Experiences & Pricing</h3>
        </div>

        {/* Art Studio Party */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Palette className="w-10 h-10 text-white" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">Art Studio Party</h3>
                  <p className="text-purple-200">Hosted in our dedicated art room with a professional instructor</p>
                </div>
              </div>
              <span className="text-4xl font-bold text-white">$450</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3">Choose ONE art experience:</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                  <h5 className="font-bold text-purple-700 mb-1">Slime Making Party</h5>
                  <p className="text-sm text-slate-600">Up to 18 children</p>
                </div>
                <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                  <h5 className="font-bold text-purple-700 mb-1">Canvas Painting Party</h5>
                  <p className="text-sm text-slate-600">Capacity based on setup</p>
                </div>
              </div>
            </div>

            <h4 className="font-bold text-slate-800 mb-3">Includes:</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500" />
                <span className="text-slate-700">Art instructor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500" />
                <span className="text-slate-700">All art supplies</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500" />
                <span className="text-slate-700">Guided creative activity</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500" />
                <span className="text-slate-700">Each child takes home their artwork</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dance & Music Party */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Music className="w-10 h-10 text-white" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">Dance & Music Party</h3>
                  <p className="text-pink-200">A high-energy celebration for kids who love music, movement, and fun</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-white">$350</span>
                <p className="text-pink-200 text-sm">Up to 18 children</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <h4 className="font-bold text-slate-800 mb-3">Includes:</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-500" />
                <span className="text-slate-700">Stage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-500" />
                <span className="text-slate-700">Professional DJ & party host</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-500" />
                <span className="text-slate-700">Dance games & karaoke</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-500" />
                <span className="text-slate-700">Smoke machine & party lights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cooking Parties */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-cocinarte-orange to-cocinarte-red p-6">
            <div className="flex items-center gap-4">
              <ChefHat className="w-10 h-10 text-white" />
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Cooking Parties</h3>
                <p className="text-orange-100">Hands-on cooking & baking led by professional chefs</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Cooking parties are hosted in our kitchen studio and do not include the adjacent party room, tables, or seating unless added separately.
              </p>
            </div>

            {/* Menu Options */}
            <div className="mb-8">
              <h4 className="font-bold text-slate-800 mb-4">Menu Options</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border-2 border-cocinarte-orange rounded-xl p-4 text-center bg-orange-50">
                  <Pizza className="w-8 h-8 text-cocinarte-orange mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Make-Your-Own Pizza</p>
                </div>
                <div className="border-2 border-cocinarte-red rounded-xl p-4 text-center bg-red-50">
                  <Cake className="w-8 h-8 text-cocinarte-red mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Decorate Your Own Cupcakes</p>
                </div>
                <div className="border-2 border-amber-500 rounded-xl p-4 text-center bg-amber-50">
                  <Cookie className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Bake Chocolate Chip Cookies</p>
                </div>
              </div>
            </div>

            {/* Cooking Party Tiers */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mini Fiesta */}
              <div className="border-2 border-cocinarte-yellow rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-cocinarte-yellow rounded-full flex items-center justify-center">
                    <Cake className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Mini Fiesta</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-cocinarte-yellow">$450</span>
                  <span className="text-sm text-slate-500">Up to 8 children</span>
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">1.5-hour party</p>
                <p className="text-sm font-semibold text-slate-700 mb-2">Includes:</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-yellow mt-0.5 flex-shrink-0" />
                    Chef-led cooking or baking experience
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-yellow mt-0.5 flex-shrink-0" />
                    All ingredients & kitchen tools
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-yellow mt-0.5 flex-shrink-0" />
                    Birthday cake-making activity
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-yellow mt-0.5 flex-shrink-0" />
                    Take-home treats
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-yellow mt-0.5 flex-shrink-0" />
                    In-kitchen party decorations
                  </li>
                </ul>
              </div>

              {/* Deluxe Fiesta */}
              <div className="border-2 border-cocinarte-red rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cocinarte-red text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-cocinarte-red rounded-full flex items-center justify-center">
                    <PartyPopper className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Deluxe Fiesta</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-cocinarte-red">$650</span>
                  <span className="text-sm text-slate-500">Up to 12 children</span>
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">2-hour party</p>
                <p className="text-sm font-semibold text-slate-700 mb-2">Includes:</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-red mt-0.5 flex-shrink-0" />
                    Chef-led cooking or baking experience
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-red mt-0.5 flex-shrink-0" />
                    All ingredients & kitchen tools
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-red mt-0.5 flex-shrink-0" />
                    Custom birthday cake
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-red mt-0.5 flex-shrink-0" />
                    Goodie bags
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-red mt-0.5 flex-shrink-0" />
                    Full in-kitchen decorations
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-red mt-0.5 flex-shrink-0" />
                    Photo booth station
                  </li>
                </ul>
              </div>

              {/* Premium Fiesta */}
              <div className="border-2 border-cocinarte-navy rounded-xl p-6 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-cocinarte-navy rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Premium Fiesta</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-cocinarte-navy">$850</span>
                  <span className="text-sm text-slate-500">Up to 18 children</span>
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">2.5-hour party</p>
                <p className="text-sm font-semibold text-slate-700 mb-2">Includes:</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    Chef-led cooking or baking experience
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    All ingredients & kitchen tools
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    Custom themed birthday cake
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    Premium goodie bags
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    Themed in-kitchen decorations
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    Dedicated party coordinator
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cocinarte-navy mt-0.5 flex-shrink-0" />
                    Photo booth station
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Add-Ons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <h3 className="text-2xl font-bold text-center text-slate mb-2">Optional Add-Ons</h3>
          <p className="text-center text-slate-500 mb-6">(All Parties)</p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border-2 border-cocinarte-orange rounded-xl p-4 bg-orange-50 text-center">
              <Pizza className="w-8 h-8 text-cocinarte-orange mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 mb-1">From-Scratch Pizza</h4>
              <p className="text-sm text-slate-500">(Chef-Made)</p>
              <p className="text-2xl font-bold text-cocinarte-orange mt-2">$25</p>
              <p className="text-xs text-slate-500">per pizza</p>
            </div>

            <div className="border-2 border-cocinarte-red rounded-xl p-4 bg-red-50 text-center">
              <Cake className="w-8 h-8 text-cocinarte-red mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 mb-1">Custom Cake</h4>
              <p className="text-sm text-slate-500">by Our Master Baker</p>
              <p className="text-2xl font-bold text-cocinarte-red mt-2">$85+</p>
              <p className="text-xs text-slate-500">starting price</p>
            </div>

            <div className="border-2 border-cocinarte-blue rounded-xl p-4 bg-blue-50 text-center">
              <Gift className="w-8 h-8 text-cocinarte-blue mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 mb-1">Drink Pitchers</h4>
              <p className="text-sm text-slate-500">Free refills included</p>
              <p className="text-2xl font-bold text-cocinarte-blue mt-2">$10</p>
              <p className="text-xs text-slate-500">per pitcher</p>
            </div>
          </div>
        </div>

        {/* Decorations & Styling */}
        <div className="bg-gradient-to-r from-cocinarte-yellow to-amber-400 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          <h3 className="text-2xl font-bold text-center text-white mb-2">Decorations & Styling</h3>
          <p className="text-center text-white/90 mb-8">(Optional)</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/95 rounded-xl p-6 text-center">
              <Sparkles className="w-10 h-10 text-cocinarte-yellow mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 mb-2">Small Balloon Garland</h4>
              <p className="text-3xl font-bold text-cocinarte-yellow">$150</p>
            </div>
            <div className="bg-white/95 rounded-xl p-6 text-center">
              <Camera className="w-10 h-10 text-cocinarte-orange mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 mb-2">Circle Backdrop with Fabric</h4>
              <p className="text-3xl font-bold text-cocinarte-orange">$125</p>
            </div>
            <div className="bg-white/95 rounded-xl p-6 text-center border-4 border-cocinarte-red">
              <Star className="w-10 h-10 text-cocinarte-red mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 mb-2">Full Party Decor Package</h4>
              <p className="text-3xl font-bold text-cocinarte-red mb-2">$650</p>
              <p className="text-xs text-cocinarte-red font-semibold">Only option that includes full set-up and clean-up</p>
            </div>
          </div>

          {/* Full Package Details */}
          <div className="bg-white/95 rounded-xl p-6 mb-8">
            <h4 className="font-bold text-slate-800 mb-4 text-center">Full Party Decor Package Includes:</h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm">Balloon garland</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm">Floral accents</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm">Party centerpieces</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm">Tablecloths</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm">Plates, cups & silverware</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm">Goodie bags for each child</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 md:col-span-3">
                <Check className="w-4 h-4 text-cocinarte-red flex-shrink-0" />
                <span className="text-slate-700 text-sm font-semibold">Full set-up & clean-up</span>
              </div>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="bg-white/95 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 mb-2 text-center">Decoration Color Palettes</h4>
            <p className="text-center text-slate-500 text-sm mb-6">(Choose one palette — up to 3 colors)</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-xl p-4">
                <h5 className="font-bold text-slate-700 mb-2">Pastel Party</h5>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-pink-200" title="Blush pink"></span>
                  <span className="w-8 h-8 rounded-full bg-purple-200" title="Lavender"></span>
                  <span className="w-8 h-8 rounded-full bg-green-200" title="Mint"></span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Blush pink • Lavender • Mint</p>
              </div>

              <div className="border rounded-xl p-4">
                <h5 className="font-bold text-slate-700 mb-2">Bright Fiesta</h5>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-pink-500" title="Hot pink"></span>
                  <span className="w-8 h-8 rounded-full bg-orange-500" title="Orange"></span>
                  <span className="w-8 h-8 rounded-full bg-cyan-400" title="Turquoise"></span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Hot pink • Orange • Turquoise</p>
              </div>

              <div className="border rounded-xl p-4">
                <h5 className="font-bold text-slate-700 mb-2">Neutral Chic</h5>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-50 border" title="Cream"></span>
                  <span className="w-8 h-8 rounded-full bg-amber-100" title="Beige"></span>
                  <span className="w-8 h-8 rounded-full bg-gray-300" title="Soft gray"></span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Cream • Beige • Soft gray</p>
              </div>

              <div className="border rounded-xl p-4">
                <h5 className="font-bold text-slate-700 mb-2">Tropical Vibes</h5>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-teal-500" title="Teal"></span>
                  <span className="w-8 h-8 rounded-full bg-coral-400 bg-[#FF7F50]" title="Coral"></span>
                  <span className="w-8 h-8 rounded-full bg-yellow-400" title="Sunshine yellow"></span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Teal • Coral • Sunshine yellow</p>
              </div>

              <div className="border rounded-xl p-4">
                <h5 className="font-bold text-slate-700 mb-2">Adventure Cool</h5>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-900" title="Navy blue"></span>
                  <span className="w-8 h-8 rounded-full bg-emerald-600" title="Emerald green"></span>
                  <span className="w-8 h-8 rounded-full bg-gray-600" title="Charcoal gray"></span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Navy blue • Emerald green • Charcoal gray</p>
              </div>
            </div>
          </div>
        </div>

        {/* Birthday Party Request Form */}
        <div className="bg-cocinarte-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-center text-slate mb-2">Request Your Party</h3>
          <p className="text-center text-slate-500 mb-6">Fill out the form below and we'll contact you within 24 hours!</p>

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
                Party Type & Package *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="art-slime"
                    checked={formData.package === 'art-slime'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Art: Slime Making</div>
                    <div className="text-xs text-slate-medium">$450 • Up to 18 kids</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="art-canvas"
                    checked={formData.package === 'art-canvas'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Art: Canvas Painting</div>
                    <div className="text-xs text-slate-medium">$450</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="package"
                    value="dance-music"
                    checked={formData.package === 'dance-music'}
                    onChange={handleInputChange}
                    required
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate text-sm">Dance & Music Party</div>
                    <div className="text-xs text-slate-medium">$350 • Up to 18 kids</div>
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
                    <div className="font-semibold text-slate text-sm">Cooking: Mini Fiesta</div>
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
                    <div className="font-semibold text-slate text-sm">Cooking: Deluxe Fiesta</div>
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
                    <div className="font-semibold text-slate text-sm">Cooking: Premium Fiesta</div>
                    <div className="text-xs text-slate-medium">$850 • Up to 18 kids • 2.5 hours</div>
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
                Special Requests, Add-Ons, or Color Palette Preference
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-cocinarte-blue/5 hover:bg-cocinarte-blue/10 resize-none"
                placeholder="Any dietary restrictions, add-ons you're interested in, preferred color palette, or questions..."
              ></textarea>
            </div>

            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-cocinarte-orange hover:bg-amber text-cocinarte-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Party Request'}
              </Button>
              <p className="text-xs text-slate-medium mt-3">
                We'll contact you within 24 hours to discuss your party and confirm availability!
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
