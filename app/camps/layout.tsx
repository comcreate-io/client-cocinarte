import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bake & Create Spring Break Cooking Camp | Cocinarte",
  description: "Join Cocinarte's Bake & Create Spring Break Cooking Camp for ages 7+. A hands-on, progressive baking experience where kids cook every single day while building real kitchen skills and confidence.",
  keywords: ["cooking camp", "baking camp", "spring break camp", "kids cooking", "Cocinarte", "Hillsboro"],
}

export default function CampsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
