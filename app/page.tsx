"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Calendar, Plus, Smile, Sparkles, Mic, MicOff, Volume2, Trash2, Zap, Camera, X, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { analyzeImageMood } from "@/lib/ai-mood-analyzer"

const MOODS = [
  {
    emoji: "😄",
    label: "Very Happy",
    value: 5,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  { emoji: "🙂", label: "Happy", value: 4, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { emoji: "😐", label: "Neutral", value: 3, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" },
  {
    emoji: "😔",
    label: "Sad",
    value: 2,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  { emoji: "😢", label: "Very Sad", value: 1, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  {
    emoji: "😰",
    label: "Anxious",
    value: 2,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  { emoji: "😡", label: "Angry", value: 2, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  {
    emoji: "😴",
    label: "Tired",
    value: 2,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  { emoji: "🤗", label: "Grateful", value: 4, color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  { emoji: "😌", label: "Peaceful", value: 4, color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
]

const TRIGGERS = [
  "Work/Career",
  "Relationships",
  "Health",
  "Family",
  "Money",
  "Weather",
  "Sleep",
  "Exercise",
  "Social",
  "Achievement",
  "Stress",
  "Other",
]

const ENERGY_LEVELS = [
  { value: 1, label: "Exhausted", emoji: "🔋" },
  { value: 2, label: "Low", emoji: "🔋" },
  { value: 3, label: "Moderate", emoji: "🔋🔋" },
  { value: 4, label: "High", emoji: "🔋🔋🔋" },
  { value: 5, label: "Energized", emoji: "⚡" },
]

interface MoodEntry {
  id: string
  date: string
  moods: (typeof MOODS)[0][]
  intensity: number
  energy: number
  reflection: string
  audioNote?: string
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

export default function HomePage() {
  // Remove this line to stop loading sample data automatically
  // useSampleData()

  const [selectedMoods, setSelectedMoods] = useState<(typeof MOODS)[0][]>([])
  const [intensity, setIntensity] = useState([5])
  const [energy, setEnergy] = useState([3])
  const [reflection, setReflection] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [sleepQuality, setSleepQuality] = useState([3])
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries)
        setEntries(Array.isArray(parsedEntries) ? parsedEntries : [])
      } catch (error) {
        console.error("Error parsing saved entries:", error)
        setEntries([])
      }
    }
  }, [])

  const toggleMood = (mood: (typeof MOODS)[0]) => {
    setSelectedMoods((prev) => {
      const exists = prev.find((m) => m.value === mood.value && m.label === mood.label)
      if (exists) {
        return prev.filter((m) => !(m.value === mood.value && m.label === mood.label))
      } else {
        return [...prev, mood]
      }
    })
  }

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) => {
      if (prev.includes(trigger)) {
        return prev.filter((t) => t !== trigger)
      } else {
        return [...prev, trigger]
      }
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string
      setUploadedImage(imageDataUrl)

      // Analyze image with AI
      setIsAnalyzingImage(true)
      try {
        const analysis = await analyzeImageMood(imageDataUrl)
        setImageAnalysis(analysis)

        // Auto-suggest moods based on analysis
        if (analysis.suggestedMoods.length > 0) {
          const suggestedMoodObjects = analysis.suggestedMoods
            .map((moodLabel) => MOODS.find((m) => m.label.toLowerCase().includes(moodLabel.toLowerCase())))
            .filter(Boolean) as (typeof MOODS)[0][]

          if (suggestedMoodObjects.length > 0) {
            setSelectedMoods((prev) => {
              const newMoods = [...prev]
              suggestedMoodObjects.forEach((mood) => {
                if (!newMoods.find((m) => m.label === mood.label)) {
                  newMoods.push(mood)
                }
              })
              return newMoods
            })
          }
        }

        // Auto-suggest intensity based on analysis
        if (analysis.confidence > 0.7) {
          const avgMoodValue =
            analysis.suggestedMoods.reduce((acc, moodLabel) => {
              const mood = MOODS.find((m) => m.label.toLowerCase().includes(moodLabel.toLowerCase()))
              return acc + (mood?.value || 3)
            }, 0) / analysis.suggestedMoods.length

          setIntensity([Math.round(avgMoodValue * 2)]) // Scale to 1-10
        }

        toast({
          title: "Image analyzed!",
          description: `AI detected ${analysis.suggestedMoods.length} mood indicators`,
        })
      } catch (error) {
        console.error("Image analysis failed:", error)
        toast({
          title: "Analysis failed",
          description: "Could not analyze image, but you can still use it",
          variant: "destructive",
        })
      } finally {
        setIsAnalyzingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImageAnalysis(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Speak your reflection...",
      })
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please allow microphone access",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      toast({
        title: "Recording saved",
        description: "Your voice note has been captured",
      })
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const deleteAudio = () => {
    setAudioBlob(null)
    toast({
      title: "Audio deleted",
      description: "Voice note has been removed",
    })
  }

  const saveEntry = () => {
    if (selectedMoods.length === 0) {
      toast({
        title: "Please select at least one mood",
        description: "Choose how you're feeling today",
        variant: "destructive",
      })
      return
    }

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      moods: selectedMoods,
      intensity: intensity[0],
      energy: energy[0],
      reflection: reflection.trim(),
      triggers: selectedTriggers,
      sleepQuality: sleepQuality[0],
      audioNote: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      image: uploadedImage || undefined,
      imageAnalysis: imageAnalysis || undefined,
      timestamp: Date.now(),
    }

    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    localStorage.setItem("moodEntries", JSON.stringify(updatedEntries))

    // Reset form
    setSelectedMoods([])
    setIntensity([5])
    setEnergy([3])
    setReflection("")
    setSelectedTriggers([])
    setSleepQuality([3])
    setAudioBlob(null)
    setUploadedImage(null)
    setImageAnalysis(null)
    setSelectedDate(new Date().toISOString().split("T")[0])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: "Mood saved!",
      description: "Your comprehensive mood entry has been recorded.",
    })
  }

  const generateReflection = async () => {
    if (selectedMoods.length === 0) {
      toast({
        title: "Select moods first",
        description: "Choose your moods to generate a reflection prompt",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    setTimeout(() => {
      const moodLabels = selectedMoods.map((m) => m.label.toLowerCase()).join(", ")
      const intensityText = intensity[0] >= 4 ? "strongly" : intensity[0] >= 3 ? "moderately" : "mildly"
      const energyText = energy[0] >= 4 ? "high energy" : energy[0] >= 3 ? "moderate energy" : "low energy"

      const prompts = [
        `You're feeling ${intensityText} ${moodLabels} with ${energyText} today. What events or thoughts contributed to these feelings?`,
        `Reflecting on your ${moodLabels} mood at intensity ${intensity[0]}/10: What patterns do you notice? What would help you feel more balanced?`,
        `With your current ${moodLabels} feelings and ${energyText}, what are three things you're grateful for today?`,
        `You're experiencing ${moodLabels} emotions. What would you tell a friend feeling the same way?`,
      ]

      // Add image-specific prompts if available
      if (imageAnalysis && imageAnalysis.insights.length > 0) {
        prompts.push(
          `Looking at your photo, I notice ${imageAnalysis.insights.join(", ")}. How does this image reflect your current emotional state?`,
          `Your photo suggests ${imageAnalysis.suggestedMoods.join(" and ")} feelings. What story does this image tell about your day?`,
        )
      }

      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
      setReflection(randomPrompt)
      setIsGenerating(false)

      toast({
        title: "Reflection generated!",
        description: imageAnalysis
          ? "Personalized prompt including your photo analysis"
          : "Personalized prompt based on your mood selection",
      })
    }, 1500)
  }

  const todaysEntry = entries.find((entry) => entry.date === new Date().toISOString().split("T")[0])
  const currentStreak = calculateStreak(entries)

  function calculateStreak(entries: MoodEntry[]): number {
    if (!Array.isArray(entries) || entries.length === 0) return 0

    const today = new Date()
    let streak = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toISOString().split("T")[0]

      if (entries.some((entry) => entry.date === dateString)) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">How are you feeling today?</h1>
            <p className="text-gray-600 dark:text-gray-400">Take a moment to check in with yourself</p>
          </div>
          {currentStreak > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">day streak</div>
            </div>
          )}
        </div>
      </div>

      {todaysEntry && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {(todaysEntry.moods || []).slice(0, 3).map((mood, index) => (
                  <span key={index} className="text-2xl">
                    {mood.emoji}
                  </span>
                ))}
                {(todaysEntry.moods || []).length > 3 && (
                  <span className="text-sm text-green-600 dark:text-green-400 ml-1">
                    +{(todaysEntry.moods || []).length - 3}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">You've already logged your mood today!</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Intensity: {todaysEntry.intensity || 5}/10 • Energy: {todaysEntry.energy || 3}/5
                  {todaysEntry.image && " • 📸 Photo included"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-blue-600" />
              New Mood Entry
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selector */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Enhanced Image Upload with AI Analysis */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
              Add a photo
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600 text-xs">(AI mood detection)</span>
            </Label>

            {!uploadedImage ? (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Camera className="h-8 w-8 text-purple-500" />
                    <Brain className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Upload a photo for AI mood analysis
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    AI will suggest moods based on your image
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="w-full" style={{ minHeight: "200px", maxHeight: "400px" }}>
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded mood photo"
                      className="w-full h-full object-contain"
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        height: "auto",
                        minHeight: "200px",
                      }}
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement
                        const container = img.parentElement
                        if (container) {
                          const aspectRatio = img.naturalWidth / img.naturalHeight
                          const containerWidth = container.clientWidth
                          const newHeight = Math.min(400, Math.max(200, containerWidth / aspectRatio))
                          container.style.height = `${newHeight}px`
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-2 shadow-xl">
                        <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          AI analyzing image...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Analysis Results */}
                {imageAnalysis && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-purple-900 dark:text-purple-100">AI Analysis Results</span>
                        <Badge variant="secondary" className="text-xs bg-white/80 dark:bg-gray-800/80">
                          {Math.round(imageAnalysis.confidence * 100)}% confidence
                        </Badge>
                      </div>

                      {imageAnalysis.suggestedMoods.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Detected Moods:</p>
                          <div className="flex flex-wrap gap-1">
                            {imageAnalysis.suggestedMoods.map((mood: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-600"
                              >
                                {mood}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {imageAnalysis.insights.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Insights:</p>
                          <div className="space-y-1">
                            {imageAnalysis.insights.map((insight: string, index: number) => (
                              <p
                                key={index}
                                className="text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1"
                              >
                                • {insight}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {imageAnalysis.colors.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dominant Colors:</p>
                          <div className="flex gap-1">
                            {imageAnalysis.colors.slice(0, 5).map((color: string, index: number) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Multiple Mood Picker */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              How are you feeling? <span className="text-gray-500 dark:text-gray-400">(Select multiple)</span>
              {imageAnalysis && <span className="text-purple-600 text-xs ml-2">✨ AI suggested moods above</span>}
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={`${mood.value}-${mood.label}`}
                  onClick={() => toggleMood(mood)}
                  className={`p-3 rounded-2xl border-2 transition-all duration-200 hover:scale-105 bg-white dark:bg-gray-800 ${
                    selectedMoods.some((m) => m.value === mood.value && m.label === mood.label)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="text-xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{mood.label}</div>
                </button>
              ))}
            </div>
            {selectedMoods.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedMoods.map((mood, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {mood.emoji} {mood.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Intensity Slider */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Intensity Level: {intensity[0]}/10
            </Label>
            <Slider value={intensity} onValueChange={setIntensity} max={10} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Energy Level: {ENERGY_LEVELS.find((e) => e.value === energy[0])?.label}{" "}
              {ENERGY_LEVELS.find((e) => e.value === energy[0])?.emoji}
            </Label>
            <Slider value={energy} onValueChange={setEnergy} max={5} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>🔋 Low</span>
              <span>🔋🔋 Moderate</span>
              <span>⚡ High</span>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <>
              {/* Mood Triggers */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  What triggered these feelings?
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {TRIGGERS.map((trigger) => (
                    <div key={trigger} className="flex items-center space-x-2">
                      <Checkbox
                        id={trigger}
                        checked={selectedTriggers.includes(trigger)}
                        onCheckedChange={() => toggleTrigger(trigger)}
                      />
                      <Label htmlFor={trigger} className="text-sm text-gray-900 dark:text-gray-100">
                        {trigger}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Sleep Quality: {sleepQuality[0]}/5
                </Label>
                <Slider
                  value={sleepQuality}
                  onValueChange={setSleepQuality}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Excellent</span>
                </div>
              </div>
            </>
          )}

          {/* Voice Recording */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Voice Note (optional)</Label>
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button type="button" variant="outline" onClick={startRecording} className="flex-1 bg-transparent">
                  <Mic className="h-4 w-4 mr-2" />
                  Record Voice Note
                </Button>
              ) : (
                <Button type="button" variant="destructive" onClick={stopRecording} className="flex-1">
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}

              {audioBlob && (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={playAudio}>
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={deleteAudio}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="reflection" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Reflection
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateReflection}
                disabled={isGenerating}
                className="rounded-full bg-transparent"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
            <Textarea
              id="reflection"
              placeholder="What's on your mind? How was your day?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px] rounded-xl border-gray-200 dark:border-gray-700 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={saveEntry}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Save Comprehensive Mood Entry
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Recent Entries Preview */}
      {Array.isArray(entries) && entries.length > 0 && (
        <Card className="mt-6 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries
                .slice(-3)
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex -space-x-1">
                      {(entry.moods || []).slice(0, 2).map((mood, index) => (
                        <span key={index} className="text-xl">
                          {mood.emoji}
                        </span>
                      ))}
                      {(entry.moods || []).length > 2 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          +{(entry.moods || []).length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.date}</p>
                        <Badge variant="outline" className="text-xs">
                          {entry.intensity || 5}/10
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {entry.energy || 3}/5
                        </Badge>
                        {entry.image && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          >
                            📸 AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {entry.reflection || "No reflection added"}
                      </p>
                      {Array.isArray(entry.triggers) && entry.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.triggers.slice(0, 2).map((trigger, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                          {entry.triggers.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{entry.triggers.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
