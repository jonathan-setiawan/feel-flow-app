"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const MOODS = [
  {
    emoji: "😄",
    label: "Very Happy",
    value: 5,
    color: "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700",
  },
  { emoji: "🙂", label: "Happy", value: 4, color: "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700" },
  {
    emoji: "😐",
    label: "Neutral",
    value: 3,
    color: "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600",
  },
  {
    emoji: "😔",
    label: "Sad",
    value: 2,
    color: "bg-orange-100 border-orange-300 dark:bg-orange-900 dark:border-orange-700",
  },
  { emoji: "😢", label: "Very Sad", value: 1, color: "bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700" },
  {
    emoji: "😰",
    label: "Anxious",
    value: 2,
    color: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700",
  },
  { emoji: "😡", label: "Angry", value: 2, color: "bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700" },
  {
    emoji: "😴",
    label: "Tired",
    value: 2,
    color: "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-700",
  },
  {
    emoji: "🤗",
    label: "Grateful",
    value: 4,
    color: "bg-pink-100 border-pink-300 dark:bg-pink-900 dark:border-pink-700",
  },
  {
    emoji: "😌",
    label: "Peaceful",
    value: 4,
    color: "bg-teal-100 border-teal-300 dark:bg-teal-900 dark:border-teal-700",
  },
]

interface MoodEntry {
  id: string
  date: string
  moods: any[]
  intensity: number
  energy: number
  reflection: string
  triggers: string[]
  sleepQuality?: number
  image?: string
  imageAnalysis?: {
    suggestedMoods: string[]
    confidence: number
    insights: string[]
    colors: string[]
    objects: string[]
  }
  timestamp: number
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [view, setView] = useState<"month" | "week">("month")

  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getEntryForDate = (date: Date | null) => {
    if (!date) return null
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
return entries.find((entry) => {
  const entryDate = new Date(entry.date)
  return (
    entryDate.getFullYear() === localDate.getFullYear() &&
    entryDate.getMonth() === localDate.getMonth() &&
    entryDate.getDate() === localDate.getDate()
  )
})
  }
  const getPrimaryMoodForEntry = (entry: MoodEntry) => {
    if (!entry.moods || entry.moods.length === 0) {
      return MOODS.find((m) => m.value === 3) // Default to neutral
    }

    // Get the first mood or the highest value mood
    const primaryMood = entry.moods[0]
    return (
      MOODS.find((m) => m.label === primaryMood.label && m.value === primaryMood.value) ||
      MOODS.find((m) => m.value === 3)
    )
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

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() + 7)
      }
      return newDate
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const days = view === "month" ? getDaysInMonth(currentDate) : getWeekDays(currentDate)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mood Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">Visualize your emotional journey over time</p>
      </div>

      {/* Calendar Header */}
      <Card className="shadow-sm mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {view === "month"
                  ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : `Week of ${getWeekDays(currentDate)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (view === "month" ? navigateMonth("next") : navigateWeek("next"))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>
                Month
              </Button>
              <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {/* Week day headers */}
          <div className={`grid ${view === "month" ? "grid-cols-7" : "grid-cols-7"} gap-2 mb-4`}>
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className={`grid ${view === "month" ? "grid-cols-7" : "grid-cols-7"} gap-2`}>
            {days.map((date, index) => {
              const entry = getEntryForDate(date)
              const primaryMood = entry ? getPrimaryMoodForEntry(entry) : null
              const today = isToday(date)

              return (
                <div
                  key={index}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all cursor-pointer
                    ${date ? "hover:shadow-md" : "border-transparent"}
                    ${today ? "ring-2 ring-blue-500" : ""}
                    ${
                      primaryMood
                        ? `${primaryMood.color} hover:scale-105`
                        : date
                          ? "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                          : "border-transparent"
                    }
                  `}
                  onClick={() => {
                    if (entry) {
                      setSelectedEntry(entry)
                    }
                  }}
                >
                  {date && (
                    <div className="h-full flex flex-col items-center justify-center">
                      <span
                        className={`text-sm font-medium ${today ? "text-blue-600" : "text-gray-900 dark:text-gray-100"}`}
                      >
                        {date.getDate()}
                      </span>
                      {entry && entry.moods && entry.moods.length > 0 && (
                        <div className="flex -space-x-1 mt-1">
                          {entry.moods.slice(0, 2).map((mood, moodIndex) => (
                            <span key={moodIndex} className="text-lg">
                              {mood.emoji}
                            </span>
                          ))}
                          {entry.moods.length > 2 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">+{entry.moods.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">Mood Legend</h3>
            <div className="flex flex-wrap gap-3">
              {MOODS.map((mood) => (
                <div key={mood.value} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 ${mood.color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {mood.emoji} {mood.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Mood Entry
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center -space-x-1 mb-2">
                  {selectedEntry.moods &&
                    selectedEntry.moods.slice(0, 3).map((mood, index) => (
                      <span key={index} className="text-4xl">
                        {mood.emoji}
                      </span>
                    ))}
                  {selectedEntry.moods && selectedEntry.moods.length > 3 && (
                    <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                      +{selectedEntry.moods.length - 3}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium mt-2">{formatDate(new Date(selectedEntry.date))}</h3>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {selectedEntry.moods &&
                    selectedEntry.moods.map((mood, index) => (
                      <span
                        key={index}
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${mood.color || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                      >
                        {mood.emoji} {mood.label}
                      </span>
                    ))}
                </div>
                {selectedEntry.intensity && (
                  <div className="flex justify-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>Intensity: {selectedEntry.intensity}/10</span>
                    <span>Energy: {selectedEntry.energy}/5</span>
                  </div>
                )}
              </div>

              {selectedEntry.reflection && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Reflection</h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg leading-relaxed">
                    {selectedEntry.reflection}
                  </p>
                </div>
              )}

              {selectedEntry.triggers && selectedEntry.triggers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Triggers</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.triggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setSelectedEntry(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
