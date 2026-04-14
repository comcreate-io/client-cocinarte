import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Our Programs",
  description: "Get in touch with us for information about Cocinarte cooking classes, Casita Azul preschool, and Camp Alegría summer camp in Hillsboro, Oregon.",
  keywords: [
    "contact cocinarte",
    "contact casita azul",
    "contact camp alegria",
    "Hillsboro programs",
    "Spanish immersion contact",
    "cooking classes contact",
    "preschool contact",
    "summer camp contact"
  ],
  openGraph: {
    title: "Contact Us - Our Programs",
    description: "Get in touch with us for information about Cocinarte cooking classes, Casita Azul preschool, and Camp Alegría summer camp in Hillsboro, Oregon.",
    url: 'https://www.cocinartepdx.com/contact',
    siteName: 'Our Programs',
    images: [
      {
        url: '/branding/logo.png',
        width: 1200,
        height: 630,
        alt: 'Contact Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact Us - Our Programs",
    description: "Get in touch with us for information about Cocinarte cooking classes, Casita Azul preschool, and Camp Alegría summer camp in Hillsboro, Oregon.",
    images: ['/branding/logo.png'],
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}