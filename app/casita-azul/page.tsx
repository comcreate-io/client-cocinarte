import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  BookOpen, 
  Users, 
  Star, 
  Globe, 
  Music, 
  Palette, 
  Leaf,
  ArrowRight,
  CheckCircle,
  Brain,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from "lucide-react"

export default function CasitaAzulPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 px-4 py-2 text-sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Bilingual Minds, Boundless Hearts
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold font-questa leading-tight text-slate">
                  Welcome to Casita Azul!
                </h1>
                <p className="text-xl lg:text-2xl text-slate-600 font-questa">
                  Bilingual Minds, Boundless Hearts
                </p>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                We do more than teach Spanish. We immerse children in language, love, and learning, 
                shaping their minds and hearts in ways that will serve them forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-amber hover:bg-golden text-white font-questa px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="https://www.casitaazulpdx.com/">Join us!</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-questa px-8 py-4 text-lg rounded-xl transition-all duration-200">
                  <Link href="https://www.casitaazulpdx.com/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/casita-azul.webp"
                alt="Casita Azul - Bilingual Minds, Boundless Hearts"
                width={400}
                height={400}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* We do more than teach Spanish Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-questa text-slate mb-4">
              We do more than teach Spanish
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We immerse children in language, love, and learning, shaping their minds and hearts 
              in ways that will serve them forever.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Bilingual Minds</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Complete Spanish immersion environment where children naturally acquire 
                  language through daily activities and meaningful interactions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Boundless Hearts</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Heart-centered teaching that nurtures confident, curious, and compassionate 
                  little humans through play, culture, and belonging.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Lifelong Learning</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  We create a foundation for lifelong learning that goes beyond language 
                  to support children's whole development and growth.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* We nurture bilingual minds and hearts Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-amber-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold font-questa text-slate">
                  We nurture bilingual minds and hearts
                </h2>
                <p className="text-lg text-gray-600">
                  Beyond learning Spanish, we build belonging. Through play, culture, and 
                  heart-centered teaching, we nurture confident, curious, and compassionate 
                  little humans.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Language Immersion</h3>
                    <p className="text-gray-600">Complete Spanish environment for natural language acquisition</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Cultural Connection</h3>
                    <p className="text-gray-600">Authentic experiences that build cultural awareness and appreciation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Heart-Centered Teaching</h3>
                    <p className="text-gray-600">Nurturing environment that supports emotional and social development</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Play-Based Learning</h3>
                    <p className="text-gray-600">Learning through exploration, creativity, and meaningful experiences</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-amber hover:bg-golden text-white font-questa px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="https://www.casitaazulpdx.com/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="/casitaAzul/casita2.webp"
                  alt="Children learning in Spanish immersion"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita3.webp"
                  alt="Cultural activities and play"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita4.webp"
                  alt="Heart-centered teaching"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita5.webp"
                  alt="Bilingual minds and hearts"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preschool & Daycare Services Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-questa text-slate mb-4">
              Preschool & Daycare Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive preschool and daycare programs that combine Spanish immersion 
              with quality early childhood education in a warm, nurturing environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Preschool Program</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Structured Spanish immersion preschool curriculum designed to prepare children 
                  for kindergarten while building bilingual skills through play and exploration.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Daycare Services</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  Full-time and part-time daycare options with Spanish immersion, providing 
                  flexible care for working families in a loving, bilingual environment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  We understand families need flexibility. Our programs accommodate various 
                  schedules to meet your family's unique needs and lifestyle.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl lg:text-3xl font-bold font-questa text-slate">
                  Why Choose Our Preschool & Daycare?
                </h3>
                <p className="text-lg text-gray-600">
                  Our programs combine the best of early childhood education with Spanish immersion, 
                  creating an environment where children thrive academically, socially, and linguistically.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-questa font-semibold text-lg text-slate mb-2">Age-Appropriate Curriculum</h4>
                    <p className="text-gray-600">Developmentally appropriate activities that support learning at every stage</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-questa font-semibold text-lg text-slate mb-2">Small Class Sizes</h4>
                    <p className="text-gray-600">Personalized attention with low teacher-to-child ratios for optimal learning</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-questa font-semibold text-lg text-slate mb-2">Qualified Educators</h4>
                    <p className="text-gray-600">Experienced teachers trained in early childhood education and Spanish immersion</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-questa font-semibold text-lg text-slate mb-2">Safe & Nurturing</h4>
                    <p className="text-gray-600">Secure environment where children feel safe to explore, learn, and grow</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-amber hover:bg-golden text-white font-questa px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="https://www.casitaazulpdx.com/contact-us" target="_blank" rel="noopener noreferrer">Learn More</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="/casitaAzul/casita1.webp"
                  alt="Preschool activities in Spanish"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita2.webp"
                  alt="Daycare environment"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita3.webp"
                  alt="Children learning together"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita4.webp"
                  alt="Bilingual education"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We create a foundation for lifelong learning Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Image
                  src="/casitaAzul/casita6.webp"
                  alt="Foundation for lifelong learning"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita1.webp"
                  alt="Spanish immersion environment"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita2.webp"
                  alt="Whole development support"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
                <Image
                  src="/casitaAzul/casita3.webp"
                  alt="Nurturing Spanish environment"
                  width={300}
                  height={200}
                  className="rounded-xl object-cover h-48"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold font-questa text-slate">
                  We create a foundation for lifelong learning
                </h2>
                <p className="text-lg text-gray-600">
                  It's more than a program — it's a place to thrive. At Casita Azul, children 
                  are embraced in a nurturing Spanish-immersion environment that supports 
                  their whole development.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Whole Development</h3>
                    <p className="text-gray-600">Supporting cognitive, social, emotional, and physical growth</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Nurturing Environment</h3>
                    <p className="text-gray-600">Safe, caring space where children feel valued and supported</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Spanish Immersion</h3>
                    <p className="text-gray-600">Complete language environment for natural bilingual development</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-questa font-semibold text-lg text-slate mb-2">Lifelong Foundation</h3>
                    <p className="text-gray-600">Skills and confidence that serve children throughout their lives</p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-amber hover:bg-golden text-white font-questa px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="https://www.casitaazulpdx.com/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-questa text-slate mb-4">
              Contact Information
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We love to hear from you! Get in touch with us to learn more about our Casita Azul program.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  <p className="font-semibold text-slate">+1 (503) 916 9758</p>
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
                  <p className="font-semibold text-slate">info@casitaazulpdx.org</p>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-questa text-xl text-slate">Address</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600">
                  <p className="font-semibold text-slate">17815 NW Tillamook Dr</p>
                  <p>Portland, Oregon 97229</p>
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold font-questa">
              Ready to Begin Your Child's Spanish Journey?
            </h2>
            <p className="text-xl text-green-100">
              Join our Casita Azul family and give your child the gift of bilingual education 
              in a nurturing, supportive environment where bilingual minds and boundless hearts thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber hover:bg-golden text-white font-questa px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/admissions" className="flex items-center">
                  Join us!
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-green-800 hover:bg-white hover:text-green-800 font-questa px-8 py-4 text-lg rounded-xl transition-all duration-200">
                <Link href="https://www.casitaazulpdx.com/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
