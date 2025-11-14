import { Metadata } from "next"
import ConditionalLayout from "@/components/conditional-layout"

export const metadata: Metadata = {
  title: "Cocinarte | Cooking Classes for Kids & Families",
  description: "Hands-on cooking classes for kids and families exploring authentic Latin flavors. Where young chefs discover the joy of cooking in Hillsboro, Oregon.",
  keywords: ["Cocinarte", "cooking classes", "kids cooking", "Latin cuisine", "family cooking", "Hillsboro Oregon", "cooking workshops", "culinary classes"],
  openGraph: {
    title: "Cocinarte | Cooking Classes for Kids & Families",
    description: "Hands-on cooking classes for kids and families exploring authentic Latin flavors. Where young chefs discover the joy of cooking in Hillsboro, Oregon.",
    type: "website",
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
