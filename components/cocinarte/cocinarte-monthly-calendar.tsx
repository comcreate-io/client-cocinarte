"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Users,
  Clock,
  DollarSign,
  X,
  Calendar,
  Star,
  Printer
} from "lucide-react"
import CocinarteBookingPopup from "./cocinarte-booking-popup"
import Image from "next/image"
import { CalendarClassesService, CalendarClass } from "@/lib/supabase/calendar-classes"
import { useAuth } from "@/contexts/auth-context"

export default function CocinarteMonthlyCalendar() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date()) // Current month
  const [isMounted, setIsMounted] = useState(false)
  const [selectedClass, setSelectedClass] = useState<CalendarClass | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'cards'>('calendar')
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [cookingClasses, setCookingClasses] = useState<CalendarClass[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const calendarService = new CalendarClassesService()

  useEffect(() => {
    setIsMounted(true)
    loadClasses()
  }, [])

  useEffect(() => {
    if (isMounted) {
      loadClasses()
    }
  }, [currentMonth])

  const loadClasses = async () => {
    setIsLoading(true)
    try {
      const classes = await calendarService.getClasesByMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
      )
      setCookingClasses(classes)
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center bg-cocinarte-navy rounded-2xl p-4 sm:p-6 text-cocinarte-white h-20">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Loading Calendar...</h2>
          </div>
        </div>
      </div>
    )
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Classes are now loaded from database via loadClasses()
  // Remove old hardcoded array:
  /*
  const cookingClasses: CalendarClass[] = [
    // September 2025
    {
      id: "1",
      title: "Back to School",
      date: new Date(2025, 8, 6), // September 6, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Tostadas horneadas con pollo deshebrado, salsa BBQ-chipotle suave, frijoles refritos, lechuga y queso → Baked Tostadas with Shredded Chicken, Mild BBQ-Chipotle Sauce, Refried Beans, Lettuce, and Cheese",
        "Agua fresca de sandía con limón → Watermelon and Lime Agua Fresca"
      ]
    },
    {
      id: "2",
      title: "Apple Season",
      date: new Date(2025, 8, 13), // September 13, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Pie Salado de Calabaza, Chorizo y Queso Latino → Savory Pumpkin, Chorizo, and Latin-Style Cheese Pie",
        "Paletas de manzana con cajeta y granola → Apple Pops with Cajeta and Granola"
      ]
    },
    {
      id: "3",
      title: "Latin Independence Day Celebration",
      date: new Date(2025, 8, 20), // September 20, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 150,
      menu: [
        "Mini Tamales Express Tricolor → Tricolor Mini Tamales",
        "Encurtido de cebolla morada → Pickled Red Onion",
        "Flan de coco (o flan clásico latino) → Coconut Flan (or Classic Latin Flan)"
      ]
    },
    {
      id: "4",
      title: "Soft Autumn",
      date: new Date(2025, 8, 27), // September 27, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Arepas sliders de pavo y queso → Turkey and Cheese Arepa Sliders",
        "Arroz con leche de otoño (canela + manzana) → Autumn Rice Pudding (Cinnamon & Apple)"
      ]
    },
    // October 2025
    {
      id: "5",
      title: "Mes de la Calabaza",
      date: new Date(2025, 9, 4), // October 4, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Empanaditas de calabaza al horno → Baked Pumpkin Mini Empanadas",
        "Panecitos de manzana con dulce de leche → Apple Buns with Dulce de Leche"
      ],
      image: "/pictures/calendar/pumpkinEmpanadas.jpg"
    },
    {
      id: "6",
      title: "Mexican Corn",
      date: new Date(2025, 9, 11), // October 11, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Esquites Mexicanos (ranch-fusión) → Mexican Street Corn Cups (Ranch Fusion)",
        "Cocadas horneadas → Baked Coconut Cookies",
        "Atol de vainilla con canela → Vanilla Cinnamon Atol"
      ],
      image: "/pictures/calendar/esquite.jpg"
    },
    {
      id: "7",
      title: "Tacos Vegetarianos",
      date: new Date(2025, 9, 18), // October 18, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 150,
      menu: [
        "Tacos crujientes de camote y frijoles negros → Crispy Sweet Potato and Black Bean Tacos",
        "Torrejas de leche → Milk French Toast"
      ],
      image: "/pictures/calendar/tacos.jpg"
    },
    {
      id: "8",
      title: "Halloween",
      date: new Date(2025, 9, 25), // October 25, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Monster guac + mini quesadillas → Monster Guacamole + Mini Quesadillas",
        "Calabacitas de Gelatina de Mango y Leche → Mango and Milk Gelatin"
      ],
      image: "/pictures/calendar/quesadillas.jpg"
    },
    // November 2025
    {
      id: "9",
      title: "Remember Me",
      date: new Date(2025, 10, 1), // November 1, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Sopa de calabaza → Pumpkin Soup",
        "Pan de elote dulce → Sweet Cornbread",
        "Plátanos caramelizados en sartén → Pan-Fried Caramelized Plantains"
      ],
      image: "/pictures/calendar/november/plantains.jpg"
    },
    {
      id: "10",
      title: "Fall",
      date: new Date(2025, 10, 8), // November 8, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Empanaditas de pollo → Mini Chicken Empanadas",
        "Ensalada tibia de otoño → Warm Autumn Salad",
        "Chocolate de la Abuela → Grandma's Hot Chocolate"
      ],
      image: "/pictures/calendar/november/chickenEmpanadas.jpg"
    },
    {
      id: "11",
      title: "Greetings and Aromas of Latin America",
      date: new Date(2025, 10, 15), // November 15, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Cazuelitas de maíz con pavo y verduras → Mini Corn Casseroles with Turkey and Vegetables",
        "Muffins de Plátano y Canela con Toque de Dulce de Leche → Banana Cinnamon Muffins with a Touch of Dulce de Leche"
      ],
      image: "/pictures/calendar/november/turkeyCorn.jpg"
    },
    {
      id: "12",
      title: "Pre-Thanksgiving",
      date: new Date(2025, 10, 22), // November 22, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 150,
      menu: [
        "Birria de pavo → Turkey Birria",
        "Sopes de frijoles con queso fresco → Bean Sopes with Fresh Cheese",
        "Ensalada de frutas latina → Latin-Style Fruit Salad"
      ],
      image: "/pictures/calendar/november/quesabirria.jpg"
    },
    {
      id: "13",
      title: "Bye Bye Fall",
      date: new Date(2025, 10, 29), // November 29, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Quiche de calabaza y queso latino → Pumpkin and Latin-Style Cheese Quiche",
        "Pie de pera → Pear Pie"
      ],
      image: "/pictures/calendar/november/quiche.jpeg"
    },
    // December 2025
    {
      id: "14",
      title: "Mini Boards",
      date: new Date(2025, 11, 6), // December 6, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Tabla de Quesos y Frutas Navideña → Christmas Cheese and Fruit Board",
        "Tabla de Verduras y Dip de Yogurt → Vegetable Board with Yogurt Dip",
        "Tabla Dulce de Frutas y Galletas → Sweet Fruit and Cookie Board"
      ],
      image: "/pictures/calendar/december/christmasTree.jpg"
    },
    {
      id: "15",
      title: "Christmas Breakfast",
      date: new Date(2025, 11, 13), // December 13, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 150,
      menu: [
        "Burritos de huevo y pavo estilo navideño → Christmas-Style Egg and Turkey Burritos",
        "Panqueques de calabaza con canela → Pumpkin Cinnamon Pancakes",
        "Parfaits navideños de yogurt, granola y fruta → Christmas Yogurt, Granola, and Fruit Parfaits"
      ],
      image: "/pictures/calendar/december/burritos.jpg"
    },
    {
      id: "16",
      title: "Fancy Christmas",
      date: new Date(2025, 11, 20), // December 20, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Mini Rollitos de Pollo con Espinaca y Queso → Mini Spinach & Cheese Chicken Rolls",
        "Cheesecake Fácil al Estilo Latino → Easy Latin-Style Cheesecake"
      ],
      image: "/pictures/calendar/december/chickenRolls.jpg"
    },
    {
      id: "17",
      title: "Christmas Cookie Workshop",
      date: new Date(2025, 11, 27), // December 27, 2025 (Saturday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Receta Básica de Galletas de Mantequilla para decorar → Basic Butter Cookie Recipe for Decorating"
      ],
      image: "/pictures/calendar/december/cookies.jpg"
    },
    // January 2026
    {
      id: "18",
      title: "New Year Celebration",
      date: new Date(2026, 0, 4), // January 4, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: [
        "Mini wraps de pollo y vegetales → Mini Chicken and Veggie Wraps",
        "Mini tablas de snacks saludables (frutas, queso, frutos secos) → Mini Healthy Snack Boards (fruits, cheese, nuts)",
        "Smoothie bowls decorados con frutas y semillas → Smoothie Bowls Decorated with Fruits and Seeds"
      ]
    },
    {
      id: "19",
      title: "Comfort Foods",
      date: new Date(2026, 0, 11), // January 11, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 120,
      menu: [
        "Sopa de verduras con fideos cortos → Vegetable Soup with Short Noodles",
        "Mini sandwiches calientes de pavo o pollo → Mini Hot Turkey or Chicken Sandwiches",
        "Mac & cheese con vegetales escondidos → Mac & Cheese with Hidden Vegetables"
      ]
    },
    {
      id: "20",
      title: "Winter Fruits and Vegetables",
      date: new Date(2026, 0, 18), // January 18, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 60,
      menu: [
        "Paletas de yogurt con frutas de invierno (mandarina, kiwi, fresa) → Yogurt Pops with Winter Fruits (Mandarin, Kiwi, Strawberry)",
        "Muffins de zanahoria y manzana → Carrot and Apple Muffins",
        "Ensaladas de frutas con un toque de miel y canela → Fruit Salads with a Touch of Honey and Cinnamon"
      ]
    },
    {
      id: "21",
      title: "Healthy Goals",
      date: new Date(2026, 0, 25), // January 25, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 120,
      menu: [
        "Mini wraps de pollo y vegetales → Mini Chicken and Vegetable Wraps",
        "Mini tablas de snacks saludables (frutas, queso, frutos secos) → Mini Healthy Snack Boards (fruits, cheese, nuts)",
        "Smoothie bowls decorados con frutas y semillas → Smoothie Bowls Decorated with Fruits and Seeds"
      ]
    },
    // February 2026
    {
      id: "22",
      title: "Valentine's Special",
      date: new Date(2026, 1, 1), // February 1, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: ["Details coming soon"]
    },
    {
      id: "23",
      title: "TBD",
      date: new Date(2026, 1, 8), // February 8, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 100,
      menu: ["Details coming soon"]
    },
    {
      id: "24",
      title: "TBD",
      date: new Date(2026, 1, 15), // February 15, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mini-chef",
      price: 80,
      menu: ["Details coming soon"]
    },
    {
      id: "25",
      title: "TBD",
      date: new Date(2026, 1, 22), // February 22, 2026 (Sunday)
      time: "1:00 PM - 3:00 PM",
      type: "mom-me",
      price: 100,
      menu: ["Details coming soon"]
    }
  ] */

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay
  }

  const getClassesForDate = (date: Date) => {
    return cookingClasses.filter(classItem => 
      classItem.date.getDate() === date.getDate() &&
      classItem.date.getMonth() === date.getMonth() &&
      classItem.date.getFullYear() === date.getFullYear()
    )
  }

  const getClassesForMonth = (month: Date) => {
    return cookingClasses.filter(classItem => 
      classItem.date.getMonth() === month.getMonth() && 
      classItem.date.getFullYear() === month.getFullYear()
    )
  }

  const isClassDate = (date: Date) => {
    return cookingClasses.some(classItem => 
      classItem.date.getDate() === date.getDate() &&
      classItem.date.getMonth() === date.getMonth() &&
      classItem.date.getFullYear() === date.getFullYear()
    )
  }

  const getTypeColor = (type: string, price: number) => {
    switch (type) {
      case "mini-chef":
        if (price === 60) {
          return "bg-cocinarte-blue text-cocinarte-white"
        }
        return "bg-cocinarte-yellow text-cocinarte-black"
      case "mom-me":
        if (price === 100 || price === 120) {
          return "bg-cocinarte-blue text-cocinarte-white"
        }
        return "bg-cocinarte-orange text-cocinarte-white"
      default:
        return "bg-gray-400 text-white"
    }
  }



  const handleClassClick = (classItem: CalendarClass) => {
    console.log('Class clicked:', classItem)
    setSelectedClass(classItem)
    setIsDialogOpen(true)
    console.log('Dialog should be open:', true)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    // Generate the calendar HTML
    const calendarHTML = generatePrintCalendarHTML()
    
    // Generate class cards HTML
    const classCardsHTML = generateClassCardsHTML()
    
    // Create print content with proper CSS
    const printContent = `<!DOCTYPE html>
<html>
<head>
  <title>Cocinarte - Cooking Classes Calendar</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      color: black;
      padding: 20px;
      line-height: 1.4;
    }
    .print-container {
      max-width: 100%;
      margin: 0 auto;
      width: 100%;
    }
    .calendar-header {
      text-align: center;
      margin-bottom: 20px;
      padding: 20px;
      background: #1e3a8a !important;
      color: white !important;
      border-radius: 8px;
    }
    .calendar-header h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: bold;
    }
    .calendar-header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
    }
    .calendar-section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 5px;
    }
    .calendar-grid {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      overflow: hidden;
      width: 100%;
    }
    .calendar-header-row {
      display: flex;
      background: #1e3a8a !important;
      color: white !important;
    }
    .calendar-header-cell {
      flex: 1;
      padding: 12px 8px;
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      border-right: 1px solid #3b82f6;
    }
    .calendar-header-cell:last-child {
      border-right: none;
    }
    .calendar-days {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
    }
    .calendar-day {
      width: 14.28%;
      min-height: 100px;
      padding: 8px;
      border-right: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      background: white;
      position: relative;
      box-sizing: border-box;
    }
    .calendar-day:nth-child(7n) {
      border-right: none;
    }
    .calendar-day.empty {
      background: #f9fafb !important;
    }
    .calendar-day.today {
      background: #fef3c7 !important;
    }
    .calendar-day.weekend {
      background: #f9fafb !important;
    }
    .day-number {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #334155;
    }
    .day-number.today {
      font-weight: bold;
      color: #334155;
    }
    .day-number.weekend {
      color: #6b7280;
    }
    .event {
      font-size: 11px;
      padding: 3px 6px;
      margin: 2px 0;
      border-radius: 4px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
    .event.mini-chef {
      background: #fbbf24 !important;
      color: #1f2937 !important;
    }
    .event.mom-me {
      background: #f97316 !important;
      color: white !important;
    }
    .event-more {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
      font-style: italic;
    }
    .class-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .class-card {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 15px;
      background: #f8fafc;
      border-left: 4px solid #fbbf24;
    }
    .class-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .class-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .class-badge.mini-chef {
      background: #fbbf24;
      color: #1f2937;
    }
    .class-badge.mom-me {
      background: #f97316;
      color: white;
    }
    .class-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 5px;
    }
    .class-date {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    .class-menu {
      margin-bottom: 10px;
    }
    .class-menu-title {
      font-size: 14px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 5px;
    }
    .class-menu-item {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 3px;
    }
    .class-price {
      font-size: 20px;
      font-weight: bold;
      color: #f97316;
    }
    @media print {
      body {
        margin: 0;
        padding: 10px;
      }
      .calendar-header {
        border-radius: 0;
      }
      .calendar-grid {
        border-radius: 0;
      }
      .class-card {
        border-radius: 0;
        page-break-inside: avoid;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="calendar-header">
      <h2>${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}</h2>
      <p>Cocinarte - Cooking Classes Calendar</p>
    </div>
    
    <div class="calendar-section">
      <h3 class="section-title">Calendar View</h3>
      <div class="calendar-grid">
        <div class="calendar-header-row">
          <div class="calendar-header-cell">Sun</div>
          <div class="calendar-header-cell">Mon</div>
          <div class="calendar-header-cell">Tue</div>
          <div class="calendar-header-cell">Wed</div>
          <div class="calendar-header-cell">Thu</div>
          <div class="calendar-header-cell">Fri</div>
          <div class="calendar-header-cell">Sat</div>
        </div>
        <div class="calendar-days">
          ${calendarHTML}
        </div>
      </div>
    </div>
    
    <div class="calendar-section">
      <h3 class="section-title">Class Details</h3>
      <div class="class-cards">
        ${classCardsHTML}
      </div>
    </div>
  </div>
</body>
</html>`

    // Write content to print window
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      // Close the window after printing
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }, 500)
  }

  const generatePrintCalendarHTML = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const today = new Date()
    let html = ''

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day empty"></div>'
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dayClasses = getClassesForDate(date)
      const isCurrentDay = isToday(date)
      const isWeekendDay = isWeekend(date)

      let dayClass = 'calendar-day'
      if (isCurrentDay) dayClass += ' today'
      if (isWeekendDay) dayClass += ' weekend'

      let numberClass = 'day-number'
      if (isCurrentDay) numberClass += ' today'
      if (isWeekendDay) numberClass += ' weekend'

      html += `<div class="${dayClass}">`
      html += `<div class="${numberClass}">${day}</div>`

      // Add events directly in the calendar cell
      dayClasses.slice(0, 2).forEach(classItem => {
        html += `<div class="event ${classItem.type}">${classItem.title}</div>`
      })

      if (dayClasses.length > 2) {
        html += `<div class="event-more">+${dayClasses.length - 2} more</div>`
      }

      html += '</div>'
    }

    return html
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const generateClassCardsHTML = () => {
    const currentClasses = getClassesForMonth(currentMonth)
    
    return currentClasses.map(classItem => `
      <div class="class-card">
        <div class="class-card-header">

        </div>
        <div class="class-title">${classItem.title}</div>
        <div class="class-date">
          ${classItem.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })} • ${classItem.time}
        </div>
        ${classItem.description ? `<div class="class-menu">
          <div class="class-menu-title">Description:</div>
          <div class="class-menu-item">${classItem.description}</div>
        </div>` : ''}
        <div class="class-price">$${classItem.price} per ${classItem.type === 'mini-chef' ? 'child' : 'pair'}</div>
      </div>
    `).join('')
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 sm:h-32 bg-gray-50 border border-gray-200"></div>
      )
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dayClasses = getClassesForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const hasClass = isClassDate(date)

      // Get the image from the first class that has one
      const dayImage = dayClasses.find(classItem => classItem.image_url)?.image_url

      days.push(
        <div 
          key={day} 
          className={`h-24 sm:h-32 border border-gray-200 p-1 sm:p-2 relative overflow-hidden ${
            isToday ? 'bg-cocinarte-blue/10' : 
            hasClass ? 'bg-cocinarte-yellow/5' : 'bg-white'
          }`}
          style={dayImage ? {
            backgroundImage: `url(${dayImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}}
        >
          {/* Semi-transparent overlay for text readability when image is present */}
          {dayImage && (
            <div className="absolute inset-0 bg-black/30"></div>
          )}
          
          {/* Content */}
          <div className="relative z-10">
            {/* Day Number */}
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-semibold ${
                dayImage ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' :
                isToday ? 'text-cocinarte-blue' : 
                hasClass ? 'text-cocinarte-navy' : 'text-slate'
              }`}>
                {day}
              </span>
              {isToday && (
                <div className={`w-2 h-2 rounded-full ${dayImage ? 'bg-white' : 'bg-cocinarte-blue'}`}></div>
              )}
              {hasClass && !isToday && (
                <div className={`w-2 h-2 rounded-full ${dayImage ? 'bg-white' : 'bg-cocinarte-yellow'}`}></div>
              )}
            </div>

            {/* Classes */}
            <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
              {dayClasses.slice(0, 2).map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => handleClassClick(classItem)}
                  className={`text-xs p-0.5 sm:p-1 rounded font-medium w-full text-left hover:opacity-90 transition-all cursor-pointer ${dayImage ? 'bg-black/50 text-white' : getTypeColor(classItem.type, classItem.price)}`}
                >
                  <span className={`flex items-center gap-1 truncate ${dayImage ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' : ''}`}>
                    {classItem.requires_parent && <Users className="h-3 w-3 flex-shrink-0" />}
                    <span className="sm:hidden truncate">{classItem.title}</span>
                    <span className="hidden sm:inline truncate">{classItem.title}</span>
                  </span>
                </button>
              ))}
              {dayClasses.length > 2 && (
                <div className={`text-xs ${dayImage ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]' : 'text-slate-medium'}`}>
                  +{dayClasses.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return days
  }

  const currentClasses = getClassesForMonth(currentMonth)

  return (
    <div className="w-full space-y-6">
      {/* View Toggle Buttons and Print */}
      <div className="flex justify-center items-center space-x-1 sm:space-x-2">
        <Button
          onClick={() => setViewMode('calendar')}
          className={`px-3 py-2 sm:px-6 sm:py-2 rounded-full font-bold transition-all duration-200 text-xs sm:text-sm ${
            viewMode === 'calendar'
              ? 'bg-cocinarte-navy text-cocinarte-white shadow-lg'
              : 'bg-white text-cocinarte-navy border border-cocinarte-navy hover:bg-cocinarte-blue hover:text-cocinarte-white'
          }`}
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Calendar View</span>
          <span className="sm:hidden">Calendar</span>
        </Button>
        <Button
          onClick={() => setViewMode('cards')}
          className={`px-3 py-2 sm:px-6 sm:py-2 rounded-full font-bold transition-all duration-200 text-xs sm:text-sm ${
            viewMode === 'cards'
              ? 'bg-cocinarte-navy text-cocinarte-white shadow-lg'
              : 'bg-white text-cocinarte-navy border border-cocinarte-navy hover:bg-cocinarte-blue hover:text-cocinarte-white'
          }`}
        >
          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Class Cards</span>
          <span className="sm:hidden">Cards</span>
        </Button>
        <Button
          onClick={handlePrint}
          className="px-3 py-2 sm:px-4 sm:py-2 rounded-full font-bold transition-all duration-200 text-xs sm:text-sm bg-cocinarte-orange hover:bg-cocinarte-red text-cocinarte-white border-0 flex items-center justify-center"
        >
          <Printer className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      </div>

      {/* Header with Navigation */}
      <div className="flex items-center justify-between bg-cocinarte-navy rounded-2xl p-4 sm:p-6 text-cocinarte-white">
        <Button
          onClick={prevMonth}
          className="bg-cocinarte-blue hover:bg-cocinarte-orange text-cocinarte-white border-0 rounded-full p-2 sm:p-3 transition-colors duration-200"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="text-center flex-1 px-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <p className="text-cocinarte-white/80 text-xs sm:text-sm">
            {currentClasses.length} cooking {currentClasses.length === 1 ? 'class' : 'classes'} this month
          </p>
        </div>
        <Button
          onClick={nextMonth}
          className="bg-cocinarte-blue hover:bg-cocinarte-orange text-cocinarte-white border-0 rounded-full p-2 sm:p-3 transition-colors duration-200"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cocinarte-yellow rounded"></div>
            <span className="text-xs sm:text-sm text-slate">Mini Chef Classes ($60-$80)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cocinarte-orange rounded"></div>
            <span className="text-xs sm:text-sm text-slate">Mom & Me Classes ($100-$150)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cocinarte-blue rounded"></div>
            <span className="text-xs sm:text-sm text-slate">Special Pricing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded"></div>
            <span className="text-xs sm:text-sm text-slate">TBD - Details Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-cocinarte-navy text-cocinarte-white">
            {weekDays.map((day) => (
              <div key={day} className="p-2 sm:p-3 lg:p-4 text-center font-bold text-xs sm:text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </div>
      )}

      {/* Class Cards View */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {currentClasses.map((classItem) => (
            <Card
              key={classItem.id}
              className="group cursor-pointer hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-cocinarte-yellow"
              onClick={() => handleClassClick(classItem)}
            >
              <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {classItem.class_type && (
                        <Badge className="bg-cocinarte-navy text-cocinarte-white font-bold text-xs sm:text-sm px-2 py-0.5">
                          {classItem.class_type}
                        </Badge>
                      )}
                      {classItem.requires_parent && (
                        <Badge className="bg-blue-500 text-white font-bold text-xs sm:text-sm px-2 py-0.5 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Parent Required
                        </Badge>
                      )}
                    </div>
                  </div>
                <CardTitle className="text-lg sm:text-xl text-slate leading-tight">{classItem.title}</CardTitle>
                <CardDescription className="text-slate-medium text-sm sm:text-base mt-1.5">
                  {classItem.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })} • {classItem.time}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {classItem.description && (
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-slate-medium line-clamp-2 sm:line-clamp-3">
                      {classItem.description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm bg-white/60 rounded-lg p-2">
                    <span className="text-slate-medium block mb-0.5">Duration</span>
                    <span className="font-semibold text-slate">{classItem.classDuration}min</span>
                  </div>
                  <div className="text-xs sm:text-sm bg-white/60 rounded-lg p-2">
                    <span className="text-slate-medium block mb-0.5">Spots Left</span>
                    <span className="font-semibold text-slate">{classItem.maxStudents - classItem.enrolled}/{classItem.maxStudents}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-amber">${classItem.price}</span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedClass(classItem)
                      setIsBookingOpen(true)
                    }}
                    disabled={classItem.enrolled >= classItem.maxStudents}
                    className={`${
                      classItem.enrolled >= classItem.maxStudents
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber hover:bg-golden text-cocinarte-white'
                    } font-bold rounded-xl px-4 sm:px-6 py-2 text-sm sm:text-base`}
                  >
                    {classItem.enrolled >= classItem.maxStudents ? 'Full' : 'Book Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Classes Message */}
      {currentClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-cocinarte-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-cocinarte-white" />
          </div>
          <h3 className="text-xl font-bold text-slate mb-2">
            No cooking classes this month
          </h3>
          <p className="text-slate-medium">
            Check back next month for new cooking adventures!
          </p>
        </div>
      )}


      {/* Class Details Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center -top-10">
          <div className="w-[90vw] max-w-2xl max-h-[80vh] bg-white rounded-lg overflow-y-auto font-coming-soon p-4 sm:p-6" style={{ fontFamily: 'Coming Soon' }}>
          <div className="pb-4 relative">
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pr-8">
              <div className="flex items-center gap-2">

                {selectedClass?.class_type && (
                  <Badge className="bg-cocinarte-navy text-cocinarte-white font-bold w-fit">
                    {selectedClass.class_type}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl text-slate leading-tight font-bold">
                {selectedClass?.title}
              </h2>
            </div>
            <p className="text-slate-medium text-sm sm:text-base lg:text-lg pt-2">
              {selectedClass?.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })} • {selectedClass?.time}
            </p>
          </div>
          
          {selectedClass && (
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Price */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-cocinarte-orange">
                  ${selectedClass.price}
                </span>
                <span className="text-slate-medium text-xs sm:text-sm lg:text-base">per {selectedClass.type === 'mini-chef' ? 'child' : 'pair'}</span>
              </div>

              {/* Description */}
              {selectedClass.description && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-cocinarte-navy flex-shrink-0" />
                    <span>About This Class</span>
                  </h3>
                  <div className="p-2 sm:p-3 bg-slate-50 rounded-lg border-l-4 border-cocinarte-yellow">
                    <p className="text-slate-medium text-xs sm:text-sm lg:text-base leading-relaxed">{selectedClass.description}</p>
                  </div>
                </div>
              )}

              {/* Class Details */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate">Class Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-medium mb-1">Duration</p>
                    <p className="text-sm font-bold text-slate">{selectedClass.classDuration} minutes</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-medium mb-1">Available Spots</p>
                    <p className="text-sm font-bold text-slate">{selectedClass.maxStudents - selectedClass.enrolled} / {selectedClass.maxStudents}</p>
                  </div>
                </div>
                {selectedClass.requires_parent && (
                  <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-lg mt-3">
                    <div className="flex items-start space-x-2">
                      <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">Parent Participation Required</p>
                        <p className="text-xs text-blue-700 mt-1">A parent/guardian must attend and participate in this class with the child.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3 sm:pt-4">
                <Button 
                  onClick={() => {
                    setIsDialogOpen(false)
                    setIsBookingOpen(true)
                  }}
                  disabled={selectedClass.enrolled >= selectedClass.maxStudents}
                  className={`${
                    selectedClass.enrolled >= selectedClass.maxStudents 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white'
                  } font-bold rounded-xl px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg flex-[0.7]`}
                >
                  {selectedClass.enrolled >= selectedClass.maxStudents ? 'Class Full' : 'Book This Class'}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-cocinarte-navy text-cocinarte-navy hover:bg-cocinarte-navy hover:text-cocinarte-white font-bold rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg flex-[0.3]"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
      
      {/* Booking Popup */}
      <CocinarteBookingPopup
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialSelectedClassId={selectedClass ? selectedClass.id : undefined}
      />
    </div>
  )
}
