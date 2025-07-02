"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Brain, Target, Calendar, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

interface EnhancedInsightsProps {
  entries: MoodEntry[]
}

export function EnhancedInsights({ entries }: EnhancedInsightsProps) {
  const [insights, setInsights] = useState<{
    patterns: string[]
    predictions: string[]
    recommendations: string[]
    streaks: { current: number; longest: number }
    moodStability: number
    energyTrend: "improving" | "declining" | "stable"
  } | null>(null)

  useEffect(() => {
    if (entries.length === 0) return

    const generateAdvancedInsights = () => {
      // Pattern Recognition
      const patterns = []
      const weeklyData = getWeeklyAverages()
      const monthlyData = getMonthlyTrends()

      // Detect weekly patterns
      if (weeklyData.length >= 4) {
        const weekendMood = getWeekendVsWeekdayMood()
        if (weekendMood.weekend > weekendMood.weekday + 0.5) {
          patterns.push("You tend to feel better on weekends")
        } else if (weekendMood.weekday > weekendMood.weekend + 0.5) {
          patterns.push("Your mood is more positive during weekdays")
        }
      }

      // Sleep correlation
      const sleepCorrelation = analyzeSleepMoodCorrelation()
      if (sleepCorrelation.correlation > 0.6) {
        patterns.push("Better sleep quality strongly correlates with improved mood")
      }

      // Trigger patterns
      const triggerAnalysis = analyzeTriggerPatterns()
      if (triggerAnalysis.mostPositive) {
        patterns.push(`${triggerAnalysis.mostPositive} activities tend to boost your mood`)
      }

      // Predictions
      const predictions = []
      const recentTrend = getRecentTrend()
      if (recentTrend === "improving") {
        predictions.push("Based on recent patterns, your mood trend is positive")
      } else if (recentTrend === "declining") {
        predictions.push("Consider focusing on self-care activities this week")
      }

      // Energy analysis
      const energyTrend = analyzeEnergyTrend()
      if (energyTrend === "declining") {
        predictions.push("Your energy levels may benefit from more rest or exercise")
      }

      // Recommendations
      const recommendations = generatePersonalizedRecommendations()

      // Streaks
      const streaks = calculateStreaks()

      // Mood stability
      const moodStability = calculateMoodStability()

      setInsights({
        patterns: patterns.slice(0, 4),
        predictions: predictions.slice(0, 3),
        recommendations: recommendations.slice(0, 4),
        streaks,
        moodStability,
        energyTrend,
      })
    }

    generateAdvancedInsights()
  }, [entries])

  const getWeeklyAverages = () => {
    const weeks: { [key: string]: { intensity: number[]; energy: number[]; count: number } } = {}

    entries.forEach((entry) => {
      const date = new Date(entry.date)
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`

      if (!weeks[weekKey]) {
        weeks[weekKey] = { intensity: [], energy: [], count: 0 }
      }

      weeks[weekKey].intensity.push(entry.intensity || 5)
      weeks[weekKey].energy.push(entry.energy || 3)
      weeks[weekKey].count++
    })

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      avgIntensity: data.intensity.reduce((a, b) => a + b, 0) / data.intensity.length,
      avgEnergy: data.energy.reduce((a, b) => a + b, 0) / data.energy.length,
      count: data.count,
    }))
  }

  const getMonthlyTrends = () => {
    // Similar to weekly but grouped by month
    return []
  }

  const getWeekendVsWeekdayMood = () => {
    const weekendEntries = entries.filter((entry) => {
      const day = new Date(entry.date).getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    })

    const weekdayEntries = entries.filter((entry) => {
      const day = new Date(entry.date).getDay()
      return day >= 1 && day <= 5 // Monday to Friday
    })

    const weekendAvg =
      weekendEntries.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / (weekendEntries.length || 1)
    const weekdayAvg =
      weekdayEntries.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / (weekdayEntries.length || 1)

    return { weekend: weekendAvg, weekday: weekdayAvg }
  }

  const analyzeSleepMoodCorrelation = () => {
    const entriesWithSleep = entries.filter((entry) => entry.sleepQuality)
    if (entriesWithSleep.length < 5) return { correlation: 0 }

    // Simple correlation calculation
    const sleepValues = entriesWithSleep.map((e) => e.sleepQuality || 3)
    const moodValues = entriesWithSleep.map((e) => e.intensity || 5)

    const correlation = calculateCorrelation(sleepValues, moodValues)
    return { correlation }
  }

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  const analyzeTriggerPatterns = () => {
    const triggerMoodMap: { [key: string]: number[] } = {}

    entries.forEach((entry) => {
      entry.triggers?.forEach((trigger) => {
        if (!triggerMoodMap[trigger]) triggerMoodMap[trigger] = []
        triggerMoodMap[trigger].push(entry.intensity || 5)
      })
    })

    let mostPositive = ""
    let highestAvg = 0

    Object.entries(triggerMoodMap).forEach(([trigger, moods]) => {
      const avg = moods.reduce((a, b) => a + b, 0) / moods.length
      if (avg > highestAvg && moods.length >= 2) {
        highestAvg = avg
        mostPositive = trigger
      }
    })

    return { mostPositive }
  }

  const getRecentTrend = () => {
    if (entries.length < 6) return "stable"

    const recent = entries.slice(-6)
    const older = entries.slice(-12, -6)

    const recentAvg = recent.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / recent.length
    const olderAvg = older.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / (older.length || 1)

    if (recentAvg > olderAvg + 0.5) return "improving"
    if (recentAvg < olderAvg - 0.5) return "declining"
    return "stable"
  }

  const analyzeEnergyTrend = () => {
    if (entries.length < 6) return "stable"

    const recent = entries.slice(-6)
    const older = entries.slice(-12, -6)

    const recentAvg = recent.reduce((acc, entry) => acc + (entry.energy || 3), 0) / recent.length
    const olderAvg = older.reduce((acc, entry) => acc + (entry.energy || 3), 0) / (older.length || 1)

    if (recentAvg > olderAvg + 0.3) return "improving"
    if (recentAvg < olderAvg - 0.3) return "declining"
    return "stable"
  }

  const generatePersonalizedRecommendations = () => {
    const recommendations = []

    // Based on energy levels
    const avgEnergy = entries.reduce((acc, entry) => acc + (entry.energy || 3), 0) / entries.length
    if (avgEnergy < 2.5) {
      recommendations.push("Consider incorporating more physical activity or ensuring adequate rest")
    }

    // Based on mood patterns
    const avgMood = entries.reduce((acc, entry) => acc + (entry.intensity || 5), 0) / entries.length
    if (avgMood < 4) {
      recommendations.push("Try practicing gratitude or mindfulness exercises")
    }

    // Based on reflection frequency
    const reflectionRate = entries.filter((e) => e.reflection && e.reflection.length > 10).length / entries.length
    if (reflectionRate < 0.5) {
      recommendations.push("Regular journaling could help you process emotions better")
    }

    // Based on consistency
    const streaks = calculateStreaks()
    if (streaks.current < 3) {
      recommendations.push("Try to maintain consistent daily mood tracking")
    }

    return recommendations
  }

  const calculateStreaks = () => {
    let current = 0
    let longest = 0
    let temp = 0

    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let lastDate: Date | null = null

    sortedEntries.forEach((entry) => {
      const entryDate = new Date(entry.date)

      if (lastDate) {
        const dayDiff = Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff === 1) {
          temp++
        } else {
          longest = Math.max(longest, temp)
          temp = 1
        }
      } else {
        temp = 1
      }

      lastDate = entryDate
    })

    longest = Math.max(longest, temp)

    // Calculate current streak from today backwards
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    if (entries.some((e) => e.date === todayStr)) {
      current = 1
      for (let i = 1; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const checkDateStr = checkDate.toISOString().split("T")[0]

        if (entries.some((e) => e.date === checkDateStr)) {
          current++
        } else {
          break
        }
      }
    }

    return { current, longest }
  }

  const calculateMoodStability = () => {
    if (entries.length < 5) return 50

    const intensities = entries.map((e) => e.intensity || 5)
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length
    const variance = intensities.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / intensities.length
    const standardDeviation = Math.sqrt(variance)

    // Convert to percentage (lower deviation = higher stability)
    const stability = Math.max(0, Math.min(100, 100 - standardDeviation * 20))
    return Math.round(stability)
  }

  if (!insights || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Add more mood entries to unlock advanced AI insights and patterns
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mood Stability & Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Mood Stability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stability Score</span>
                <span className="font-medium">{insights.moodStability}%</span>
              </div>
              <Progress value={insights.moodStability} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {insights.moodStability >= 70
                  ? "Very stable mood patterns"
                  : insights.moodStability >= 50
                    ? "Moderately stable patterns"
                    : "Consider focusing on consistency"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Tracking Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Current Streak</span>
                <Badge variant="outline">{insights.streaks.current} days</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Longest Streak</span>
                <Badge variant="outline">{insights.streaks.longest} days</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Energy Trend</span>
                <Badge
                  variant={
                    insights.energyTrend === "improving"
                      ? "default"
                      : insights.energyTrend === "declining"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {insights.energyTrend}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Recognition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Discovered Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.patterns.map((pattern, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">{pattern}</p>
              </div>
            ))}
            {insights.patterns.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Keep tracking to discover your unique mood patterns
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Predictions & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.predictions.map((prediction, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-purple-800 dark:text-purple-200">{prediction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-green-800 dark:text-green-200">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
