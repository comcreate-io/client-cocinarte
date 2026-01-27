import { Shield, CheckCircle, Utensils, AlertTriangle, Clock, Users, DollarSign, Heart } from "lucide-react"
import Image from "next/image"

export default function CocinarteSafety() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <Image
                  src="/cocinarte/floating_elements/COCINARTE_guante.svg"
                  alt="Oven mitt"
                  width={80}
                  height={80}
                  className="hidden sm:block w-16 h-16 sm:w-18 sm:h-18 lg:w-[80px] lg:h-[80px] opacity-70 animate-float-slow"
                />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate">
                  Safety & Learning Experience
                </h2>
                <Image
                  src="/cocinarte/floating_elements/COCINARTE_tabla corte.svg"
                  alt="Cutting board"
                  width={70}
                  height={70}
                  className="hidden sm:block w-14 h-14 sm:w-16 sm:h-16 lg:w-[70px] lg:h-[70px] opacity-70 animate-float-medium"
                />
              </div>
              <p className="text-lg sm:text-xl text-slate-medium">
                Safety is our top priority. We create a fun, educational environment where kids 
                can learn essential cooking skills while staying safe and having a great time.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-slate mb-1 sm:mb-2">Safety First</h3>
                  <p className="text-slate-medium text-sm sm:text-base lg:text-lg">Kids use age-appropriate tools with close instructor supervision</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-slate mb-1 sm:mb-2">Kitchen Basics</h3>
                  <p className="text-slate-medium text-sm sm:text-base lg:text-lg">Learn hand washing, safe chopping techniques, and careful heat use</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-slate mb-1 sm:mb-2">Enjoy Your Creations</h3>
                  <p className="text-slate-medium text-sm sm:text-base lg:text-lg">Part of the fun is enjoying the finished dish together, with leftovers to take home</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-slate mb-1 sm:mb-2">Allergy Accommodations</h3>
                  <p className="text-slate-medium text-sm sm:text-base lg:text-lg">We adapt recipes for allergies and dietary restrictions when possible</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-br from-cocinarte-yellow/20 to-cocinarte-yellow/40 rounded-xl p-4 sm:p-6 text-center relative overflow-hidden">
                  {/* Background Image */}
                  <Image
                    src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507207/IMG_4322_w2it9u.heic"
                    alt="Kids cooking - Class Duration"
                    fill
                    className="object-cover"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-white text-base sm:text-lg lg:text-xl">1.5-2 Hours</h3>
                    <p className="text-xs sm:text-sm text-white">Per class session</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cocinarte-red/20 to-cocinarte-red/40 rounded-xl p-4 sm:p-6 text-center relative overflow-hidden">
                  {/* Background Image */}
                  <Image
                    src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769508849/IMG_8426_mkuph8.jpg"
                    alt="Young chefs - Age Group"
                    fill
                    className="object-cover"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-white text-base sm:text-lg lg:text-xl">Ages 7-12</h3>
                    <p className="text-xs sm:text-sm text-white">Main program focus</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <div className="bg-cocinarte-blue rounded-xl p-4 sm:p-6 text-center relative overflow-hidden">
                  {/* Background Image */}
                  <Image
                    src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507227/IMG_4422_vrp7pr.heic"
                    alt="Delicious food - Pricing"
                    fill
                    className="object-cover"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-white text-base sm:text-lg lg:text-xl">$60-80</h3>
                    <p className="text-xs sm:text-sm text-white">Per child</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cocinarte-yellow/20 to-cocinarte-yellow/40 rounded-xl p-4 sm:p-6 text-center relative overflow-hidden">
                  {/* Background Image */}
                  <Image
                    src="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507218/IMG_4386_lgd9ba.heic"
                    alt="Family cooking - Family Fun"
                    fill
                    className="object-cover"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/50"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-white text-base sm:text-lg lg:text-xl">Family Fun</h3>
                    <p className="text-xs sm:text-sm text-white">$120-150 per family</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
