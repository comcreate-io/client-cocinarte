import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "./fonts.css"
import ModernHeader from "@/components/modern-header"
import Footer from "@/components/footer"
import StickyApplyButton from "@/components/sticky-apply-button"
import { Inter, Playfair_Display, Lora, Cormorant_Garamond, Libre_Baskerville, Poppins } from 'next/font/google'
import FloatingCTA from "@/components/floating-cta"
import ConditionalLayout from "@/components/conditional-layout"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
})

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: false,
})

const libreBaskerville = Libre_Baskerville({ 
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})

const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: false,
})



export const metadata: Metadata = {
  title: "Cocinarte - Cooking Classes for Kids in Hillsboro, Oregon",
  description: "Cocinarte offers hands-on cooking classes for kids ages 5-12 in Hillsboro, Oregon. Learn to cook delicious Latin-inspired dishes while building confidence and life skills in a fun, safe environment.",
  keywords: [
    "Cocinarte",
    "cooking classes for kids Hillsboro",
    "kids cooking classes Oregon",
    "children cooking program",
    "Latin cuisine for kids",
    "hands-on cooking lessons",
    "culinary classes children",
    "after school cooking program",
    "kids culinary education",
    "family cooking classes Oregon"
  ],
  authors: [{ name: "Cocinarte" }],
  creator: "Cocinarte",
  publisher: "Cocinarte",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cocinartepdx.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Cocinarte - Cooking Classes for Kids in Hillsboro, Oregon",
    description: "Cocinarte offers hands-on cooking classes for kids ages 5-12 in Hillsboro, Oregon. Learn to cook delicious Latin-inspired dishes while building confidence and life skills in a fun, safe environment.",
    url: 'https://cocinartepdx.com',
    siteName: 'Cocinarte',
    images: [
      {
        url: 'https://cocinartepdx.com/openGraphCocinarte.png',
        width: 1200,
        height: 630,
        alt: 'Cocinarte - Cooking Classes for Kids in Hillsboro, Oregon',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cocinarte - Cooking Classes for Kids in Hillsboro, Oregon",
    description: "Cocinarte offers hands-on cooking classes for kids ages 5-12 in Hillsboro, Oregon. Learn to cook delicious Latin-inspired dishes while building confidence and life skills in a fun, safe environment.",
    images: ['https://cocinartepdx.com/openGraphCocinarte.png'],
    creator: '@cocinarte',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'education',
  classification: 'Kids Cooking Classes - Hillsboro, Oregon',
  other: {
    'msapplication-TileColor': '#1e293b',
    'theme-color': '#1e293b',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${lora.variable} ${cormorant.variable} ${libreBaskerville.variable} ${poppins.variable} scroll-smooth`}>
      <head>
        {/* Google Fonts - Coming Soon */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Coming+Soon&display=swap" rel="stylesheet" />
        
        {/* Favicon Links */}
        <link rel="icon" href="/cocinarte/cocinarteLogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/cocinarte/cocinarteLogo.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* Additional favicon sizes */}
        <link rel="icon" type="image/png" sizes="96x96" href="/cocinarte/cocinarteLogo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/cocinarte/cocinarteLogo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/cocinarte/cocinarteLogo.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#1e293b" />
        <meta name="msapplication-TileImage" content="/cocinarte/cocinarteLogo.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1e293b" />
        
        {/* Force Open Graph Image - Explicit Tags */}
        <meta property="og:image" content="https://cocinartepdx.com/openGraphCocinarte.png" />
        <meta property="og:image:secure_url" content="https://cocinartepdx.com/openGraphCocinarte.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Cocinarte - Cooking Classes for Kids in Hillsboro, Oregon" />
        
        {/* Twitter Card - Explicit Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://cocinartepdx.com/openGraphCocinarte.png" />
        <meta name="twitter:image:alt" content="Cocinarte - Cooking Classes for Kids in Hillsboro, Oregon" />

        {/* WhatsApp Specific - Uses Open Graph */}
        <meta property="og:site_name" content="Cocinarte" />
        <meta property="og:url" content="https://cocinartepdx.com" />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* Ahrefs Analytics */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="WGtXuhlwl1X148pxAF2BnA" async></script>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Cocinarte",
              "description": "Cocinarte offers hands-on cooking classes for kids ages 5-12 in Hillsboro, Oregon. Learn to cook delicious Latin-inspired dishes while building confidence and life skills in a fun, safe environment.",
              "url": "https://cocinartepdx.com",
              "logo": "https://cocinartepdx.com/openGraphCocinarte.png",
              "image": "https://cocinartepdx.com/openGraphCocinarte.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "770 NE Rogahn Street",
                "addressLocality": "Hillsboro",
                "addressRegion": "OR",
                "postalCode": "97124",
                "addressCountry": "US"
              },
              "telephone": "+1-503-916-9758",
              "email": "cocinarte@casitaazulpdx.org",
              "areaServed": {
                "@type": "City",
                "name": "Hillsboro"
              },
              "priceRange": "$$",
              "serviceType": "Kids Cooking Classes",
              "audience": {
                "@type": "Audience",
                "audienceType": "Children ages 5-12"
              }
            })
          }}
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
