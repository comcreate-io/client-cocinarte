import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Phone,
  Mail,
  BookOpen,
  Calendar
} from "lucide-react"

export default function LandingFooter() {
  const programs = [
    {
      name: "Programs",
      href: "#overview",
      logo: "/branding/logo.png",
      description: "K-5 Spanish Immersion School"
    },
    {
      name: "Casita Azul",
      href: "#casita-azul",
      logo: "/casita-azul.png",
      description: "Preschool & Daycare"
    },
    {
      name: "Cocinarte",
      href: "#cocinarte",
      logo: "/cocinarte/cocinarteLogo.png",
      description: "Cooking Classes"
    },
    {
      name: "Camp Alegría",
      href: "#camp-alegria",
      logo: "/camp-alegria.png",
      description: "Summer Camp"
    }
  ]


  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Programs */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold font-questa mb-6">Our Programs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programs.map((program) => {
                return (
                  <Link
                    key={program.name}
                    href={program.href}
                    className="group p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={program.logo}
                        alt={program.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded object-contain"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-slate-100 text-sm">
                          {program.name}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {program.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold font-questa mb-6">Contact</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <a 
                  href="tel:+15039169758" 
                  className="text-sm text-slate-300 hover:text-white transition-colors duration-200"
                >
                  (503) 916-9758
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <a
                  href="mailto:info@cocinartepdx.com"
                  className="text-sm text-slate-300 hover:text-white transition-colors duration-200"
                >
                  info@cocinartepdx.com
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>


      {/* Bottom Bar */}
      <div className="border-t border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors duration-200">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
