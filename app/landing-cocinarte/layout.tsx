import { Metadata } from "next"
import ConditionalLayout from "@/components/conditional-layout"

export const metadata: Metadata = {
  title: "Cocinarte | Cooking Classes for Kids & Families",
  description: "Hands-on cooking classes for kids and families exploring authentic Latin flavors. Where young chefs discover the joy of cooking in Hillsboro, Oregon.",
  keywords: ["Cocinarte", "cooking classes", "kids cooking", "Latin cuisine", "family cooking", "Hillsboro Oregon", "cooking workshops", "culinary classes"],
  openGraph: {
    title: "Cocinarte | Cooking Classes for Kids & Families",
    description: "Hands-on cooking classes for kids and families exploring authentic Latin flavors. Where young chefs discover the joy of cooking in Hillsboro, Oregon.",
    url: 'https://cocinartepdx.com',
    siteName: 'Cocinarte',
    images: [
      {
        url: 'https://cocinartepdx.com/openGraphCocinarte.png',
        width: 1200,
        height: 630,
        alt: 'Cocinarte - Where Young Chefs Discover the Joy of Cooking',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cocinarte | Cooking Classes for Kids & Families",
    description: "Hands-on cooking classes for kids and families exploring authentic Latin flavors. Where young chefs discover the joy of cooking in Hillsboro, Oregon.",
    images: ['https://cocinartepdx.com/openGraphCocinarte.png'],
    creator: '@cocinarte',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConditionalLayout showHeader={false}>
      {children}
    </ConditionalLayout>
  )
}
