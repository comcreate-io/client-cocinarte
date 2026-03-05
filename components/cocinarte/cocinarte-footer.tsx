import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react"

export default function CocinarteFooter() {
  return (
    <footer className="bg-cocinarte-navy text-cocinarte-white py-12 w-full">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Image 
              src="/cocinarte/cocinarteLogo.png" 
              alt="Cocinarte Logo" 
              width={150} 
              height={48} 
              className="object-contain h-12 mb-4" 
            />
            <p className="text-cocinarte-blue text-sm">
              Cooking adventures for kids and families to explore Latin flavors while learning hands-on cooking skills.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-cocinarte-yellow">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#calendar" className="text-cocinarte-blue hover:text-cocinarte-yellow transition-colors">Home</Link></li>
              <li><Link href="#about" className="text-cocinarte-blue hover:text-cocinarte-yellow transition-colors">About Our Classes</Link></li>
              <li><Link href="#faq" className="text-cocinarte-blue hover:text-cocinarte-yellow transition-colors">FAQ</Link></li>
              <li><Link href="#birthday-parties" className="text-cocinarte-blue hover:text-cocinarte-yellow transition-colors">Birthday Parties</Link></li>
              <li><Link href="#private-events" className="text-cocinarte-blue hover:text-cocinarte-yellow transition-colors">Private Events</Link></li>
              <li><Link href="/terms" className="text-cocinarte-blue hover:text-cocinarte-yellow transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-cocinarte-yellow">Contact Info</h3>
            <div className="space-y-2 text-sm text-cocinarte-blue">
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                (503) 916-9758
              </p>
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                info@cocinartepdx.com
              </p>
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                770 NE Rogahn Street<br />
                Hillsboro, OR 97124
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-cocinarte-yellow">Follow Us</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Link href="https://www.instagram.com/cocinartepdx/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-cocinarte-yellow rounded-full flex items-center justify-center hover:bg-cocinarte-orange transition-colors cursor-pointer">
                  <Instagram className="w-4 h-4 text-cocinarte-black" />
                </Link>
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-cocinarte-yellow rounded-full flex items-center justify-center hover:bg-cocinarte-orange transition-colors cursor-pointer">
                  <Facebook className="w-4 h-4 text-cocinarte-black" />
                </Link>
                <Link href="https://twitter.com/cocinarte" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-cocinarte-yellow rounded-full flex items-center justify-center hover:bg-cocinarte-orange transition-colors cursor-pointer">
                  <Twitter className="w-4 h-4 text-cocinarte-black" />
                </Link>
                <Link href="mailto:info@cocinartepdx.com" className="w-8 h-8 bg-cocinarte-yellow rounded-full flex items-center justify-center hover:bg-cocinarte-orange transition-colors cursor-pointer">
                  <Mail className="w-4 h-4 text-cocinarte-black" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-cocinarte-blue mt-8 pt-8 text-center text-sm text-cocinarte-blue">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p>&copy; 2024 Cocinarte. All rights reserved.</p>
            <Link
              href="/dashboard"
              className="text-cocinarte-blue/60 hover:text-cocinarte-yellow transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
