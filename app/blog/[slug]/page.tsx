import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getBlogBySlug, getAllBlogSlugs, blogPosts } from "@/lib/blog-data"
import { Clock, ArrowLeft, ArrowRight } from "lucide-react"
import CocinarteHeader from "@/components/cocinarte/cocinarte-header"
import CocinarteFooter from "@/components/cocinarte/cocinarte-footer"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogBySlug(slug)
  if (!post) return { title: "Post Not Found" }

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      images: [{ url: post.heroImage }],
      type: "article",
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <div className="min-h-screen bg-cocinarte-white font-coming-soon relative overflow-hidden" style={{ fontFamily: 'Coming Soon' }} data-page="cocinarte">
      {post.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.schema) }}
        />
      )}
      <CocinarteHeader />

      {/* Hero Image */}
      <section className="relative w-full aspect-[4/3] sm:aspect-[3/1] lg:aspect-[3.5/1] max-h-[500px]">
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
          <div className="max-w-[900px] mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm mb-3 sm:mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Back to Blog</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="bg-cocinarte-red text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                {post.category}
              </span>
              <div className="flex items-center gap-1 text-white/70 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{post.readTime}</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-snug sm:leading-tight">
              {post.title}
            </h1>
            <p className="text-white/70 text-xs sm:text-sm mt-2 sm:mt-3">{post.date}</p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-[900px] mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        <div className="prose-content">
          {post.content.map((section, index) => {
            switch (section.type) {
              case "paragraph":
                return (
                  <p
                    key={index}
                    className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-5"
                  >
                    {section.text}
                  </p>
                )
              case "heading2":
                return (
                  <h2
                    key={index}
                    className="text-lg sm:text-2xl lg:text-3xl font-bold text-cocinarte-black mt-8 sm:mt-12 mb-3 sm:mb-4 pb-2 border-b border-cocinarte-orange/20"
                  >
                    {section.text}
                  </h2>
                )
              case "heading3":
                return (
                  <h3
                    key={index}
                    className="text-base sm:text-xl font-bold text-cocinarte-black mt-6 sm:mt-8 mb-2 sm:mb-3"
                  >
                    {section.text}
                  </h3>
                )
              case "list":
                return (
                  <ul key={index} className="mb-5 sm:mb-6 space-y-2 sm:space-y-2.5 pl-0">
                    {section.items?.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 sm:gap-3 text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed"
                      >
                        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cocinarte-orange mt-2 sm:mt-2.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              case "recipe":
                return (
                  <div
                    key={index}
                    className="bg-cocinarte-yellow/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 border border-cocinarte-yellow/20"
                  >
                    <h4 className="text-base sm:text-xl font-bold text-cocinarte-black mb-2 sm:mb-3">
                      {section.title}
                    </h4>
                    {section.description?.split("\n\n").map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-gray-700 text-xs sm:text-base leading-relaxed mb-2 sm:mb-3 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )
              case "tip-box":
                return (
                  <div
                    key={index}
                    className="bg-cocinarte-blue/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 border-l-4 border-cocinarte-navy"
                  >
                    <p className="text-xs sm:text-sm font-semibold text-cocinarte-navy mb-1">Pro Tip</p>
                    <p className="text-gray-700 text-xs sm:text-base leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                )
              case "cta":
                return (
                  <div key={index} className="text-center my-6 sm:my-10">
                    <Link
                      href={section.buttonHref || "/"}
                      className="inline-flex items-center gap-2 bg-cocinarte-red hover:bg-cocinarte-orange text-white font-semibold px-5 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-lg"
                    >
                      {section.buttonText}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </div>
                )
              default:
                return null
            }
          })}
        </div>

        {/* Author / About Section */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="bg-cocinarte-navy rounded-xl sm:rounded-2xl p-5 sm:p-8 text-white">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0">
                <Image
                  src="/cocinarte/cocinarteLogo.webp"
                  alt="CocinarTe Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-base sm:text-lg">CocinarTe PDX</p>
                <p className="text-cocinarte-blue text-xs sm:text-sm">
                  Kids Cooking School &bull; Hillsboro, Oregon
                </p>
              </div>
            </div>
            <p className="text-cocinarte-blue text-xs sm:text-base leading-relaxed">
              CocinarTe is a kids cooking school and family experience studio in
              Hillsboro, Oregon. Through hands-on classes, birthday parties, and
              cultural cooking experiences rooted in Latin American cuisine,
              CocinarTe teaches children and families that the kitchen is the
              best classroom in the house.
            </p>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-cocinarte-orange/5 py-10 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-3xl font-bold text-cocinarte-black mb-6 sm:mb-8 text-center">
              Keep Reading
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-8 max-w-[800px] mx-auto">
              {relatedPosts.map((relPost) => (
                <Link key={relPost.slug} href={`/blog/${relPost.slug}`} className="group block">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-cocinarte-orange/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={relPost.heroImage}
                        alt={relPost.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                        <span className="text-cocinarte-red text-xs font-semibold">
                          {relPost.category}
                        </span>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{relPost.readTime}</span>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-cocinarte-black mb-1.5 sm:mb-2 group-hover:text-cocinarte-red transition-colors duration-200 line-clamp-2 leading-snug">
                        {relPost.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 flex-1">
                        {relPost.excerpt}
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
          </div>
        </section>
      )}

      <CocinarteFooter />
    </div>
  )
}
