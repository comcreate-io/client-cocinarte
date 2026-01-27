import Image from "next/image"
import FlipCard from "@/components/flip-card"

export default function CocinarteAbout() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_cuchara.svg"
              alt="Spoon"
              width={120}
              height={120}
              className="hidden sm:block w-16 h-16 sm:w-20 sm:h-20 lg:w-[120px] lg:h-[120px] opacity-70 animate-float-slow"
            />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate">
              What is Cocinarte?
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_cuchillo.svg"
              alt="Knife"
              width={110}
              height={110}
              className="hidden sm:block w-14 h-14 sm:w-18 sm:h-18 lg:w-[110px] lg:h-[110px] opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-lg sm:text-xl text-slate-medium max-w-3xl mx-auto px-4">
            A cooking program designed for kids and families to explore Latin flavors while learning 
            hands-on cooking skills. Each class is fun, interactive, and age-appropriate — no prior 
            cooking experience needed!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-16 lg:gap-[200px] justify-items-center">
          <FlipCard
            title="Hands-On Learning"
            description="Interactive cooking experiences where kids learn by doing"
            category="Learning"
            imageSrc="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507200/IMG_4309_qmmpbq.heic"
            detailedDescription="Interactive cooking experiences where kids learn by doing, building confidence and skills in the kitchen. Our hands-on approach ensures every child actively participates in creating delicious dishes."
            learningOutcomes={[
              "Build practical cooking skills and kitchen confidence",
              "Learn proper knife safety and cooking techniques",
              "Develop creativity and problem-solving in the kitchen"
            ]}
          />

          <FlipCard
            title="Latin Flavors"
            description="Explore authentic Latin American cuisine"
            category="Culture"
            imageSrc="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507294/IMG_4136_tcpd1r.heic"
            imagePosition="center top"
            detailedDescription="Explore authentic Latin American cuisine and discover new flavors, ingredients, and cooking techniques. Each class introduces children to the rich culinary traditions of Latin America."
            learningOutcomes={[
              "Discover traditional Latin American ingredients and spices",
              "Learn authentic cooking methods from various regions",
              "Appreciate cultural diversity through food"
            ]}
          />

          <FlipCard
            title="Family Fun"
            description="Perfect for kids and families to cook together"
            category="Community"
            imageSrc="https://res.cloudinary.com/dku1gnuat/image/upload/f_auto,q_auto/v1769507282/IMG_4065_bp2sxi.jpg"
            detailedDescription="Perfect for kids and families to cook together, creating lasting memories and bonding experiences. Our classes foster a warm, inclusive environment where everyone can learn and grow together."
            learningOutcomes={[
              "Strengthen family bonds through shared cooking experiences",
              "Create lasting memories in a fun, supportive environment",
              "Build teamwork and communication skills"
            ]}
          />
        </div>
      </div>
    </section>
  )
}