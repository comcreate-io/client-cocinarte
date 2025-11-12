"use client"

import CocinarteMonthlyCalendar from "./cocinarte-monthly-calendar"

export default function CocinarteCalendar() {
  return (
    <section id="upcoming-classes" className="py-20 bg-cocinarte-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate mb-4">
            Upcoming Classes
          </h2>
          <p className="text-lg text-slate-medium max-w-3xl mx-auto">
            Choose your cooking adventure! All classes include ingredients and take-home treats.
          </p>
          <p className="text-sm text-cocinarte-orange font-semibold mt-2">*PRICES CAN VARY</p>
        </div>

        {/* Monthly Calendar */}
        <CocinarteMonthlyCalendar />
      </div>
    </section>
  )
}