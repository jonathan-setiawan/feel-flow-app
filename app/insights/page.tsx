"use client"

import { useState, useEffect } from "react"
import { TrendingUp, PieChart, BarChart3, Calendar, Lightbulb, Target, Zap, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartTooltip } from "@/components/ui/chart"
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
} from "recharts"
import { EnhancedInsights } from "@/components/enhanced-insights"

const MOODS = [
  { emoji: "😄", label: "Very Happy", value: 5, color: "#10b981" },
  { emoji: "🙂", label: "Happy", value: 4, color: "#3b82f6" },
  { emoji: "😐", label: "Neutral", value: 3, color: "#6b7280" },
  { emoji: "😔", label: "Sad", value: 2, color: "#f59e0b" },
  { emoji: "😢", label: "Very Sad", value: 1, color: "#ef4444" },
  { emoji: "😰", label: "Anxious", value: 2, color: "#eab308" },
  { emoji: "😡", label: "Angry", value: 2, color: "#dc2626" },
  { emoji: "😴", label: "Tired", value: 2, color: "#7c3aed" },
  { emoji: "🤗", label: "Grateful", value: 4, color: "#ec4899" },
  { emoji: "😌", label: "Peaceful", value: 4, color: "#14b8a6" },
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
  timestamp: number
}

export default function InsightsPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [timeRange, setTimeRange] = useState("month")
  const [goals, setGoals] = useState({
    dailyLogging: 7,
    positiveRatio: 70,
    energyLevel: 4,
  })

  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  const getFilteredEntries = () => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeRange) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      default:
        return entries
    }

    return entries.filter((entry) => new Date(entry.date) >= cutoffDate)
  }

  const filteredEntries = getFilteredEntries()

  // Enhanced mood distribution with multiple moods
  const moodDistribution = MOODS.map((mood) => {
    const count = filteredEntries.reduce((acc, entry) => {
      return acc + (entry.moods?.filter((m) => m.label === mood.label).length || 0)
    }, 0)
    return {
      name: mood.label,
      value: count,
      color: mood.color,
      emoji: mood.emoji,
    }
  }).filter((item) => item.value > 0)

  // Intensity vs Energy correlation
  const intensityEnergyData = filteredEntries.map((entry) => ({
    intensity: entry.intensity || 5,
    energy: entry.energy || 3,
    date: entry.date,
  }))

  // Trigger analysis
  const triggerAnalysis = () => {
    const triggerCounts: { [key: string]: number } = {}
    filteredEntries.forEach((entry) => {
      entry.triggers?.forEach((trigger) => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1
      })
    })

    return Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  const topTriggers = triggerAnalysis()

  // Sleep quality correlation
  const sleepMoodCorrelation = filteredEntries
    .filter((entry) => entry.sleepQuality)
    .map((entry) => ({
      sleep: entry.sleepQuality,
      avgMood: entry.moods?.reduce((acc, mood) => acc + mood.value, 0) / (entry.moods?.length || 1) || 3,
      date: entry.date,
    }))

  // Goal tracking
  const calculateGoalProgress = () => {
    const last7Days = entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    const dailyLoggingProgress = (last7Days.length / 7) * 100

    const positiveMoods = filteredEntries.filter((entry) => entry.moods?.some((mood) => mood.value >= 4)).length
    const positiveRatioProgress = filteredEntries.length > 0 ? (positiveMoods / filteredEntries.length) * 100 : 0

    const avgEnergy =
      filteredEntries.reduce((acc, entry) => acc + (entry.energy || 3), 0) / (filteredEntries.length || 1)
    const energyProgress = (avgEnergy / 5) * 100

    return {
      dailyLogging: Math.min(dailyLoggingProgress, 100),
      positiveRatio: Math.min(positiveRatioProgress, 100),
      energy: Math.min(energyProgress, 100),
    }
  }

  const goalProgress = calculateGoalProgress()

  // Advanced insights
  const generateAdvancedInsights = () => {
    if (filteredEntries.length === 0) return []

    const insights = []

    // Mood pattern analysis
    const avgIntensity =
      filteredEntries.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / filteredEntries.length
    insights.push(`Your average mood intensity is ${avgIntensity.toFixed(1)}/10`)

    // Energy correlation
    const avgEnergy = filteredEntries.reduce((acc, entry) => acc + (entry.energy || 3), 0) / filteredEntries.length
    if (avgEnergy >= 4) {
      insights.push("You maintain high energy levels consistently")
    } else if (avgEnergy <= 2) {
      insights.push("Consider focusing on activities that boost your energy")
    }

    // Trigger insights
    if (topTriggers.length > 0) {
      insights.push(`Your most common mood trigger is "${topTriggers[0].trigger}"`)
    }

    // Sleep correlation
    if (sleepMoodCorrelation.length >= 3) {
      const avgSleep = sleepMoodCorrelation.reduce((acc, item) => acc + item.sleep, 0) / sleepMoodCorrelation.length
      const avgMoodWithGoodSleep =
        sleepMoodCorrelation.filter((item) => item.sleep >= 4).reduce((acc, item) => acc + item.avgMood, 0) /
          sleepMoodCorrelation.filter((item) => item.sleep >= 4).length || 0

      if (avgMoodWithGoodSleep > avgIntensity) {
        insights.push("Better sleep quality correlates with improved mood")
      }
    }

    // Multiple mood insights
    const multiMoodEntries = filteredEntries.filter((entry) => entry.moods?.length > 1)
    if (multiMoodEntries.length > filteredEntries.length * 0.3) {
      insights.push("You often experience complex, mixed emotions")
    }

    return insights
  }

  const advancedInsights = generateAdvancedInsights()

  // Export functionality
  const exportReport = () => {
    const reportData = {
      period: timeRange,
      totalEntries: filteredEntries.length,
      moodDistribution,
      topTriggers,
      goalProgress,
      insights: advancedInsights,
      averageIntensity:
        filteredEntries.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / (filteredEntries.length || 1),
      averageEnergy:
        filteredEntries.reduce((acc, entry) => acc + (entry.energy || 3), 0) / (filteredEntries.length || 1),
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mood-insights-${timeRange}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Advanced Mood Insights</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive analysis of your emotional patterns</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <Card className="text-center py-12 bg-white dark:bg-gray-800 shadow-sm">
          <CardContent>
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No data available</h3>
            <p className="text-gray-600 dark:text-gray-400">Start logging your moods to see insights and trends</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Goal Progress */}
          <Card className="shadow-sm bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Target className="h-5 w-5 text-green-600" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-900 dark:text-gray-100">
                    <span className="text-sm font-medium">Daily Logging</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(goalProgress.dailyLogging)}%
                    </span>
                  </div>
                  <Progress value={goalProgress.dailyLogging} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-900 dark:text-gray-100">
                    <span className="text-sm font-medium">Positive Mood Ratio</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(goalProgress.positiveRatio)}%
                    </span>
                  </div>
                  <Progress value={goalProgress.positiveRatio} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-900 dark:text-gray-100">
                    <span className="text-sm font-medium">Energy Level</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(goalProgress.energy)}%</span>
                  </div>
                  <Progress value={goalProgress.energy} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Mood Distribution */}
            <Card className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Mood Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {moodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 border rounded-lg shadow-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{data.emoji}</span>
                                  <span className="font-medium">{data.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{data.value} occurrences</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Intensity vs Energy Correlation */}
            <Card className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Intensity vs Energy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={intensityEnergyData}>
                      <XAxis dataKey="intensity" domain={[1, 10]} />
                      <YAxis dataKey="energy" domain={[1, 5]} />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.date}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Intensity: {data.intensity}/10
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Energy: {data.energy}/5</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter dataKey="energy" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Triggers */}
            <Card className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Top Mood Triggers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTriggers.map((trigger, index) => (
                    <div
                      key={trigger.trigger}
                      className="flex items-center justify-between text-gray-900 dark:text-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{trigger.trigger}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(trigger.count / topTriggers[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{trigger.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Insights */}
            <Card className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {advancedInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                    </div>
                  ))}
                  {advancedInsights.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Add more mood entries to see personalized insights
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sleep Quality Correlation */}
          {sleepMoodCorrelation.length > 0 && (
            <Card className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Sleep Quality vs Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={sleepMoodCorrelation}>
                      <XAxis dataKey="sleep" domain={[1, 5]} />
                      <YAxis dataKey="avgMood" domain={[1, 5]} />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.date}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sleep: {data.sleep}/5</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Avg Mood: {data.avgMood.toFixed(1)}/5
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter dataKey="avgMood" fill="#6366f1" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced AI Insights */}
          <EnhancedInsights entries={filteredEntries} />
        </div>
      )}
    </div>
  )
}
