import CocinarteHeader from "@/components/cocinarte/cocinarte-header"
import CocinarteFooter from "@/components/cocinarte/cocinarte-footer"
import CocinarteHero from "@/components/cocinarte/cocinarte-hero"
import CocinarteCalendar from "@/components/cocinarte/cocinarte-calendar"
import CocinarteAbout from "@/components/cocinarte/cocinarte-about"
import CocinarteClassTypes from "@/components/cocinarte/cocinarte-class-types"
import CocinarteSafety from "@/components/cocinarte/cocinarte-safety"
import CocinarteBirthday from "@/components/cocinarte/cocinarte-birthday"
import CocinartePrivateEvents from "@/components/cocinarte/cocinarte-private-events"
import CocinarteFAQ from "@/components/cocinarte/cocinarte-faq"
import CocinarteContact from "@/components/cocinarte/cocinarte-contact"
import CocinarteSocialFeed from "@/components/cocinarte/cocinarte-social-feed"
import CocinarteCTA from "@/components/cocinarte/cocinarte-cta"
import CocinarteIntensiveCooking from "@/components/cocinarte/cocinarte-intensive-cooking"
import CocinarteGallery from "@/components/cocinarte/cocinarte-gallery"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-coming-soon relative overflow-hidden" style={{ fontFamily: 'Coming Soon' }} data-page="cocinarte">
        {/* Floating elements around the entire page - hidden on mobile for better performance */}
        <Image
          src="/cocinarte/floating_elements/COCINARTE_cupcakes.svg"
          alt="Cupcakes"
          width={60}
          height={60}
          className="hidden sm:block absolute top-20 left-8 opacity-30 animate-float-slow pointer-events-none w-12 h-12 sm:w-14 sm:h-14 lg:w-[60px] lg:h-[60px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_frutas.svg"
          alt="Fruits"
          width={50}
          height={50}
          className="hidden sm:block absolute top-32 right-12 opacity-25 animate-float-medium pointer-events-none w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_cuchara.svg"
          alt="Spoon"
          width={45}
          height={45}
          className="hidden sm:block absolute top-64 left-16 opacity-20 animate-float-slow pointer-events-none w-9 h-9 sm:w-11 sm:h-11 lg:w-[45px] lg:h-[45px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_tenedor.svg"
          alt="Fork"
          width={40}
          height={40}
          className="hidden sm:block absolute top-80 right-20 opacity-25 animate-float-medium pointer-events-none w-8 h-8 sm:w-10 sm:h-10 lg:w-[40px] lg:h-[40px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_plato.svg"
          alt="Plate"
          width={55}
          height={55}
          className="hidden sm:block absolute top-96 left-12 opacity-20 animate-float-slow pointer-events-none w-11 h-11 sm:w-13 sm:h-13 lg:w-[55px] lg:h-[55px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_batidora.svg"
          alt="Mixer"
          width={65}
          height={65}
          className="hidden sm:block absolute top-[500px] right-8 opacity-30 animate-float-medium pointer-events-none w-13 h-13 sm:w-15 sm:h-15 lg:w-[65px] lg:h-[65px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_utensilios.svg"
          alt="Utensils"
          width={50}
          height={50}
          className="hidden sm:block absolute top-[600px] left-20 opacity-25 animate-float-slow pointer-events-none w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_tetera.svg"
          alt="Teapot"
          width={60}
          height={60}
          className="hidden sm:block absolute top-[700px] right-16 opacity-20 animate-float-medium pointer-events-none w-12 h-12 sm:w-14 sm:h-14 lg:w-[60px] lg:h-[60px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_comida.svg"
          alt="Food"
          width={70}
          height={70}
          className="hidden sm:block absolute top-[800px] left-8 opacity-25 animate-float-slow pointer-events-none w-14 h-14 sm:w-16 sm:h-16 lg:w-[70px] lg:h-[70px]"
        />
        <Image
          src="/cocinarte/floating_elements/COCINARTE_tabla corte.svg"
          alt="Cutting Board"
          width={55}
          height={55}
          className="hidden sm:block absolute top-[900px] right-12 opacity-20 animate-float-medium pointer-events-none w-11 h-11 sm:w-13 sm:h-13 lg:w-[55px] lg:h-[55px]"
        />

        <CocinarteHeader />
        <CocinarteHero />
        <CocinarteAbout />
        <CocinarteCalendar />
        <CocinarteClassTypes />
        <CocinarteIntensiveCooking />
        <CocinarteSafety />
        <CocinarteSocialFeed />
        <CocinarteBirthday />
        <CocinartePrivateEvents />
        <CocinarteGallery />
        <CocinarteFAQ />
        <CocinarteContact />
        <CocinarteCTA />
        <CocinarteFooter />
      </div>
  )
}
