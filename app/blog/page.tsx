import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { blogPosts } from "@/lib/blog-data"
import { Clock, ArrowRight, BookOpen } from "lucide-react"
import CocinarteHeader from "@/components/cocinarte/cocinarte-header"
import CocinarteFooter from "@/components/cocinarte/cocinarte-footer"

export const metadata: Metadata = {
  title: "Blog | CocinarTe PDX - Cooking Tips, Recipes & Party Ideas for Kids",
  description: "Explore our blog for expert tips on cooking with kids, birthday party ideas, age-appropriate recipes, and Latin American culinary traditions for families.",
}

export default function BlogPage() {
  const featuredPost = blogPosts[0]
  const otherPosts = blogPosts.slice(1)

  return (
    <div className="min-h-screen bg-cocinarte-white font-coming-soon relative overflow-hidden" style={{ fontFamily: 'Coming Soon' }} data-page="cocinarte">
      <CocinarteHeader />

      {/* Hero Section */}
      <section className="relative bg-cocinarte-navy overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 sm:mb-6">
            <BookOpen className="h-4 w-4 text-cocinarte-yellow" />
            <span className="text-white/90 text-sm">CocinarTe Blog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-cocinarte-white mb-3 sm:mb-4 px-2">
            Tips, Recipes & Inspiration
          </h1>
          <p className="text-sm sm:text-lg text-cocinarte-blue max-w-2xl mx-auto px-2">
            Expert advice on cooking with kids, creative party ideas, and ways to bring Latin American culinary traditions into your family&apos;s kitchen.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 -mt-6 sm:-mt-12 relative z-10">
        <Link href={`/blog/${featuredPost.slug}`} className="group block">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-cocinarte-orange/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto min-h-[200px]">
                <Image
                  src={featuredPost.heroImage}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span className="bg-cocinarte-red text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-cocinarte-red text-xs sm:text-sm font-semibold">{featuredPost.category}</span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-cocinarte-black mb-2 sm:mb-3 group-hover:text-cocinarte-red transition-colors duration-200 leading-snug">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-2 text-cocinarte-red font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Other Posts Grid */}
      {otherPosts.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-16">
          <h2 className="text-xl sm:text-3xl font-bold text-cocinarte-black mb-6 sm:mb-8">
            More Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {otherPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-cocinarte-orange/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.heroImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <span className="text-cocinarte-red text-xs font-semibold">{post.category}</span>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-cocinarte-black mb-1.5 sm:mb-2 group-hover:text-cocinarte-red transition-colors duration-200 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-cocinarte-red font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all duration-200">
                      <span>Read Article</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-cocinarte-orange/10 py-10 sm:py-16">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-cocinarte-black mb-3 sm:mb-4">
            Ready to Start Cooking Together?
          </h2>
          <p className="text-gray-600 mb-5 sm:mb-6 text-xs sm:text-base px-2">
            Join CocinarTe&apos;s hands-on cooking classes for kids and families in Hillsboro, Oregon. Latin American cuisine, expert instruction, and unforgettable memories.
          </p>
          <Link
            href="/#upcoming-classes"
            className="inline-flex items-center gap-2 bg-cocinarte-red hover:bg-cocinarte-orange text-white font-semibold px-5 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
          >
            Explore Our Classes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <CocinarteFooter />
    </div>
  )
}
