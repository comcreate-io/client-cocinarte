import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Heart, Sparkles } from "lucide-react"
import Image from "next/image"

export default function CocinarteClassTypes() {
  return (
    <section id="classes" className="py-16 sm:py-20 relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/cocinarte/cocinarte3.jpeg"
          alt="Cooking class background"
          fill
          className="object-cover object-top"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/40"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_frutas.svg"
              alt="Fruits"
              width={90}
              height={90}
              className="hidden sm:block w-12 h-12 sm:w-16 sm:h-16 lg:w-[90px] lg:h-[90px] opacity-70 animate-float-slow"
            />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate">
              Our Class Types
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_niคo1.svg"
              alt="Child cooking"
              width={80}
              height={80}
              className="hidden sm:block w-10 h-10 sm:w-14 sm:h-14 lg:w-[80px] lg:h-[80px] opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-lg sm:text-xl text-slate-medium max-w-3xl mx-auto px-4">
            We offer different class formats to suit every family's needs and schedule.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-100 to-amber-200">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-amber" />
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate">Mini Chefcitos</CardTitle>
              <CardDescription className="text-amber font-semibold text-sm sm:text-base lg:text-lg">Ages 7-12</CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-slate-medium mb-3 text-sm sm:text-base lg:text-lg leading-relaxed">
                Kids are dropped off and guided by our instructors. Perfect for building 
                independence and cooking confidence.
              </p>
              <div className="space-y-1 text-xs sm:text-sm text-slate-medium">
                <p>• 1.5-2 hours per class</p>
                <p>• Age-appropriate tools</p>
                <p>• Close supervision</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-100 to-amber-200">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-amber" />
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate">Chefcitos Together</CardTitle>
              <CardDescription className="text-golden font-semibold text-sm sm:text-base lg:text-lg">Ages 3+ with parents</CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-slate-medium mb-3 text-sm sm:text-base lg:text-lg leading-relaxed">
                Parents or caregivers must participate in the cooking experience together with their child. 
                Great for younger children and family bonding.
              </p>
              <div className="space-y-1 text-xs sm:text-sm text-slate-medium">
                <p>• Family participation</p>
                <p>• Younger children welcome - 3 and above</p>
                <p>• Shared learning experience</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-100 to-amber-200 sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-amber" />
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate">Cocina Creativa</CardTitle>
              <CardDescription className="text-amber font-semibold text-sm sm:text-base lg:text-lg">Ages 12+</CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-slate-medium mb-3 text-sm sm:text-base lg:text-lg leading-relaxed">
                Beginner, intermediate, and advanced workshops designed for teens and adults. 
                Perfect for birthday parties, private events, and special occasions.
              </p>
              <div className="space-y-1 text-xs sm:text-sm text-slate-medium">
                <p>• Custom options available</p>
                <p>• Private group classes</p>
                <p>• Birthday party packages</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
