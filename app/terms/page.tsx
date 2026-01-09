"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Shield, AlertTriangle, Heart, Users, Camera, CreditCard, Calendar, Scale, CheckCircle } from "lucide-react"
import Link from "next/link"
import CocinarteHeader from "@/components/cocinarte/cocinarte-header"
import CocinarteFooter from "@/components/cocinarte/cocinarte-footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-coming-soon" style={{ fontFamily: 'Coming Soon' }}>
      <CocinarteHeader />
      {/* Hero Section */}
      <section className="bg-cocinarte-navy py-16 md:py-24 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-cocinarte-orange/20 rounded-full text-white text-sm font-medium mb-6">
              <FileText className="h-4 w-4 mr-2" />
              Legal Agreement
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Terms & Conditions
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto px-4">
              Welcome to Cocinarte! We are so excited to cook, learn, and create with your child. Please review the following Terms & Conditions carefully.
            </p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 bg-cocinarte-orange/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 text-cocinarte-navy">
            <AlertTriangle className="h-5 w-5 text-cocinarte-orange" />
            <p className="text-center font-medium">
              By enrolling your child in any Cocinarte class, camp, or event, you acknowledge and agree to the terms outlined below.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* Section 1: Program Overview */}
            <Card className="border-l-4 border-l-cocinarte-orange">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-cocinarte-orange" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">1. Program Overview</h2>
                    <p className="text-gray-700 mb-4">
                      Cocinarte is a hands-on cooking and culinary enrichment program for children, operating under the Casita Azul Education Collective. Our programs may include cooking classes, camps, birthday parties, and special events that involve food preparation, kitchen tools, movement, and group activities.
                    </p>
                    <p className="text-gray-700 font-medium">
                      All activities are designed to be age-appropriate, supervised, and educational.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Assumption of Risk */}
            <Card className="border-l-4 border-l-cocinarte-red">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-cocinarte-red" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">2. Assumption of Risk</h2>
                    <p className="text-gray-700 mb-4">
                      I understand that participation in cooking activities involves inherent risks, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                      <li>Minor cuts or scrapes</li>
                      <li>Burns from warm surfaces or foods</li>
                      <li>Slips, spills, or falls</li>
                      <li>Exposure to food ingredients</li>
                    </ul>
                    <p className="text-gray-700">
                      I acknowledge that Cocinarte takes reasonable precautions to maintain a safe environment, including close supervision, safety instruction, and the use of child-appropriate tools.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Liability Release */}
            <Card className="border-l-4 border-l-cocinarte-navy">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-cocinarte-navy" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">3. Liability Release & Hold Harmless Agreement</h2>
                    <p className="text-gray-700 mb-4">
                      By enrolling my child in Cocinarte, I agree to release, waive, and hold harmless Cocinarte and Casita Azul Education Collective, including its owners, employees, instructors, volunteers, and affiliates, from any and all claims, liabilities, or demands arising from my child's participation in program activities <strong>except in cases of gross negligence or willful misconduct</strong>.
                    </p>
                    <p className="text-gray-700">
                      This release applies to injuries, accidents, or losses that may occur during participation in normal program activities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Medical Information */}
            <Card className="border-l-4 border-l-cocinarte-yellow">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-cocinarte-yellow" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">4. Medical Information & Allergies</h2>
                    <p className="text-gray-700 mb-4">Parents/guardians are responsible for:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                      <li>Disclosing all food allergies, dietary restrictions, medical conditions, or special needs prior to participation</li>
                      <li>Updating Cocinarte promptly if any medical information changes</li>
                    </ul>
                    <div className="bg-cocinarte-yellow/10 border border-cocinarte-yellow/30 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 font-medium">
                        Cocinarte is not a nut-free or allergen-free facility. While we take reasonable steps to reduce risk, we cannot guarantee the absence of allergens.
                      </p>
                    </div>
                    <p className="text-gray-700">
                      In case of a medical emergency, Cocinarte staff may seek appropriate medical care. Parents/guardians are responsible for any related medical costs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Supervision & Behavior */}
            <Card className="border-l-4 border-l-cocinarte-blue">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-cocinarte-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">5. Supervision & Behavior Expectations</h2>
                    <p className="text-gray-700 mb-4">Children are expected to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                      <li>Follow instructor directions</li>
                      <li>Use tools safely</li>
                      <li>Treat peers and staff with respect</li>
                    </ul>
                    <div className="bg-cocinarte-red/10 border border-cocinarte-red/30 rounded-lg p-4">
                      <p className="text-gray-700">
                        Cocinarte reserves the right to remove a child from a class or program if their behavior poses a safety risk to themselves or others. <strong>No refunds will be issued in such cases.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Photo & Video */}
            <Card className="border-l-4 border-l-cocinarte-orange">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Camera className="h-6 w-6 text-cocinarte-orange" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">6. Photo & Video Use</h2>
                    <p className="text-gray-700 mb-4">
                      By enrolling, parents/guardians may be asked to provide separate consent for photo and video use. If consent is given, Cocinarte may use photos or videos of children for promotional purposes, including social media and website content.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>A child's last name will never be shared publicly.</li>
                      <li>Consent can be revoked at any time in writing.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Payments & Refunds */}
            <Card className="border-l-4 border-l-cocinarte-navy">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-cocinarte-navy" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">7. Enrollment, Payments & Refunds</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                      <li>Registration is not complete until payment is received</li>
                      <li>Spots are limited and filled on a first-come, first-served basis</li>
                      <li>Refunds, credits, or transfers are subject to Cocinarte's posted cancellation policy for each program or event</li>
                    </ul>
                    <p className="text-gray-700 italic">
                      Specific refund terms may vary by class, camp, or event.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Program Changes */}
            <Card className="border-l-4 border-l-cocinarte-yellow">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-cocinarte-yellow" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">8. Program Changes</h2>
                    <p className="text-gray-700 mb-4">Cocinarte reserves the right to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                      <li>Modify class schedules</li>
                      <li>Substitute instructors</li>
                      <li>Adjust menus or activities</li>
                      <li>Cancel or reschedule classes due to low enrollment, illness, or unforeseen circumstances</li>
                    </ul>
                    <p className="text-gray-700">
                      Families will be notified promptly if changes occur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 9: Governing Law */}
            <Card className="border-l-4 border-l-cocinarte-blue">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Scale className="h-6 w-6 text-cocinarte-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">9. Governing Law</h2>
                    <p className="text-gray-700">
                      These Terms & Conditions are governed by the laws of the <strong>State of Oregon</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 10: Acknowledgment */}
            <Card className="border-l-4 border-l-cocinarte-red bg-cocinarte-red/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cocinarte-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-cocinarte-red" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cocinarte-navy mb-4">10. Acknowledgment & Agreement</h2>
                    <p className="text-gray-700 mb-4">By enrolling my child in Cocinarte, I confirm that:</p>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-cocinarte-red flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">I have read and understood these Terms & Conditions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-cocinarte-red flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">I voluntarily agree to all terms, including the liability release</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-cocinarte-red flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">I am the legal parent or guardian of the enrolled child</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-cocinarte-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8">
            Create an account to enroll your child in our cooking classes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-cocinarte-red hover:bg-cocinarte-orange text-white font-semibold rounded-lg transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/30"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <CocinarteFooter />
    </div>
  )
}
