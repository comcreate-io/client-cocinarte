import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sun, 
  TreePine, 
  Music, 
  Palette, 
  Globe, 
  Users, 
  Star, 
  Heart,
  ArrowRight,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChefHat,
  Compass,
  Target
} from "lucide-react"

export default function CampAlegriaPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-6 md:py-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3 md:space-y-4">
                <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Summer 2025 Registration Open
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-questa leading-tight text-slate">
                  Camp Alegría
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 font-questa">
                  Immersive Summer Camp for Ages 5-12
                </p>
              </div>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                A one-of-a-kind immersive summer camp designed for children ages 5-12 to experience 
                Latin American culture through storytelling, hands-on activities, and unforgettable experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-amber hover:bg-golden text-white font-questa px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="https://campalegria.campmanagement.com/p/request_for_info_m.php?action=enroll" target="_blank" rel="noopener noreferrer">Register Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-questa px-8 py-4 text-lg rounded-xl transition-all duration-200">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/camp-alegria.webp"
                alt="Camp Alegria"
                width={400}
                height={400}
                className="w-[90%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section id="contact" className="py-12 md:py-16 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-questa text-slate mb-4 px-4">
              Register your child for a summer of fun!
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Location</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  <p className="font-semibold text-slate">770 NE Rogahn Street</p>
                  <p>Hillsboro, Oregon</p>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  <p className="font-semibold text-slate">campalegria@casitaazulpdx.org</p>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate/5 to-slate/10">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-slate rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  <p className="font-semibold text-slate">(503) 916-9758</p>
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Camp Alegría Special */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-green-50 to-amber-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-questa text-slate mb-4 px-4">
              What Makes Camp Alegría Special?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto px-4">
              Camp Alegría offers a unique blend of Spanish immersion, cultural activities, and summer fun. Our experienced staff creates an environment where children can learn, grow, and make lasting memories while developing their Spanish language skills. Each session offers unique themes and activities designed to engage children in Spanish language learning through play, exploration, and cultural experiences.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-questa text-slate mb-3 md:mb-4 flex items-center">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                  Full Spanish Immersion
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Complete Spanish language immersion with native speakers and cultural activities
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-questa text-slate mb-3 md:mb-4 flex items-center">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-2 sm:mr-3 text-amber flex-shrink-0" />
                  Bilingual Support
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Supportive bilingual environment for children at different Spanish proficiency levels
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
                <p className="text-base sm:text-lg text-gray-600 font-semibold">
                  Each session will conclude with a special community event, such as a World Cup match, 
                  Carnaval parade, or group feast!
                </p>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/pictures/discoverMore.webp"
                alt="Children enjoying Camp Alegria"
                width={600}
                height={400}
                className="rounded-2xl object-cover w-full h-96 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-questa text-slate mb-4 px-4">
              Take a look to our sessions in 2026
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Explore our exciting sessions for 2026 and give your child an unforgettable summer experience!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Session 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-questa text-xl text-slate">Session 1: Adventure across America</CardTitle>
                    <p className="text-sm text-gray-600">June 16th - July 3rd (No camp on July 4th)</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Your child will embark on a journey through Latin America, exploring its rich cultures through art, 
                  storytelling, and hands-on activities. From vibrant crafts to traditional tales and immersive experiences, 
                  each session brings a new adventure.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Session 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-questa text-xl text-slate">Session 2: Carnaval Celebration</CardTitle>
                    <p className="text-sm text-gray-600">July 7th - July 25th</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Experience the vibrant energy of Latin America's most joyful festival with a lively fusion of dance, 
                  music, and crafts! Immerse yourself in the rhythms of traditional beats and explore hands-on craft 
                  stations that celebrate rich cultural traditions.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Session 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate/5 to-slate/10">
              <CardHeader>
                <div className="flex items-center mb-4">
                                     <div className="w-12 h-12 bg-slate rounded-full flex items-center justify-center mr-4">
                     <Target className="w-6 h-6 text-white" />
                   </div>
                  <div>
                    <CardTitle className="font-questa text-xl text-slate">Session 3: World Cup Extravaganza</CardTitle>
                    <p className="text-sm text-gray-600">July 28th - August 15th</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  A dynamic and fun-filled soccer camp where kids develop skills, build teamwork, and experience the 
                  excitement of the game! With engaging drills, friendly matches, and a supportive environment, young 
                  players will boost their confidence and embrace the spirit of the sport.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Session 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-questa text-xl text-slate">Session 4: Latin Cooking Adventure</CardTitle>
                    <p className="text-sm text-gray-600">August 18th - August 29th</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Kids get hands-on in the kitchen as they learn to make delicious traditional Latin dishes! From 
                  homemade tortillas to savory empanadas and sweet treats like alfajores, these fun and interactive 
                  cooking classes introduce children to the rich flavors of Latin America.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



    </div>
  )
}
