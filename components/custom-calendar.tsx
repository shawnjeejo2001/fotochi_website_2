"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomCalendarProps {
  selectedDates?: Date[]
  onDateSelect?: (dates: Date[]) => void
  availableDates?: Date[]
  unavailableDates?: Date[]
  mode?: "single" | "multiple"
  className?: string
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CustomCalendar({
  selectedDates = [],
  onDateSelect,
  availableDates = [],
  unavailableDates = [],
  mode = "multiple",
  className,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: Date) => {
    if (!onDateSelect) return

    const dateString = date.toDateString()
    const isSelected = selectedDates.some((d) => d.toDateString() === dateString)

    let newSelectedDates: Date[]

    if (mode === "single") {
      newSelectedDates = [date]
    } else {
      if (isSelected) {
        newSelectedDates = selectedDates.filter((d) => d.toDateString() !== dateString)
      } else {
        newSelectedDates = [...selectedDates, date]
      }
    }

    onDateSelect(newSelectedDates)
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => d.toDateString() === date.toDateString())
  }

  const isDateAvailable = (date: Date) => {
    return availableDates.some((d) => d.toDateString() === date.toDateString())
  }

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some((d) => d.toDateString() === date.toDateString())
  }

  const isDatePast = (date: Date) => {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    return dateOnly < today
  }

  const isDateToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const getDateClasses = (date: Date) => {
    const classes = [
      "w-16 h-16 flex items-center justify-center text-lg font-medium rounded-lg cursor-pointer transition-all duration-200 hover:scale-105",
    ]

    if (isDatePast(date)) {
      classes.push("bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100")
    } else if (isDateToday(date)) {
      classes.push("bg-blue-100 text-blue-900 font-bold border-2 border-blue-400")
    } else if (isDateSelected(date)) {
      classes.push("bg-blue-600 text-white font-bold shadow-lg")
    } else if (isDateAvailable(date)) {
      classes.push("bg-green-100 text-green-800 border-2 border-green-300 font-semibold")
    } else if (isDateUnavailable(date)) {
      classes.push("bg-red-100 text-red-800 border-2 border-red-300 font-semibold")
    } else {
      classes.push("bg-white text-gray-900 border border-gray-200 hover:bg-gray-50")
    }

    return classes.join(" ")
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="h-10 w-10 p-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h2 className="text-2xl font-bold text-gray-900">
          {MONTHS[month]} {year}
        </h2>

        <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="h-10 w-10 p-0">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-12 flex items-center justify-center text-sm font-bold text-gray-600 bg-gray-50 rounded-lg"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => (
          <div key={index} className="flex items-center justify-center">
            {date ? (
              <button
                onClick={() => !isDatePast(date) && handleDateClick(date)}
                className={getDateClasses(date)}
                disabled={isDatePast(date)}
              >
                {date.getDate()}
              </button>
            ) : (
              <div className="w-16 h-16" />
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
          <span className="text-gray-700">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-700">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span className="text-gray-700">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-700">Past</span>
        </div>
      </div>
    </div>
  )
}
