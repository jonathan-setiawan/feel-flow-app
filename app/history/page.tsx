"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Edit, Trash2, Calendar, Volume2, Zap, Target, Brain, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"

const MOODS = [
  { emoji: "😄", label: "Very Happy", value: 5, color: "bg-green-100 text-green-800" },
  { emoji: "🙂", label: "Happy", value: 4, color: "bg-blue-100 text-blue-800" },
  { emoji: "😐", label: "Neutral", value: 3, color: "bg-gray-100 text-gray-800" },
  { emoji: "😔", label: "Sad", value: 2, color: "bg-orange-100 text-orange-800" },
  { emoji: "😢", label: "Very Sad", value: 1, color: "bg-red-100 text-red-800" },
  { emoji: "😰", label: "Anxious", value: 2, color: "bg-yellow-100 text-yellow-800" },
  { emoji: "😡", label: "Angry", value: 2, color: "bg-red-100 text-red-800" },
  { emoji: "😴", label: "Tired", value: 2, color: "bg-purple-100 text-purple-800" },
  { emoji: "🤗", label: "Grateful", value: 4, color: "bg-pink-100 text-pink-800" },
  { emoji: "😌", label: "Peaceful", value: 4, color: "bg-teal-100 text-teal-800" },
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  const [editReflection, setEditReflection] = useState("")
  const [editIntensity, setEditIntensity] = useState([5])
  const [editEnergy, setEditEnergy] = useState([3])
  const [viewingImage, setViewingImage] = useState<MoodEntry | null>(null)

  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries)
      setEntries(parsedEntries)
      setFilteredEntries(parsedEntries)
    }
  }, [])

  useEffect(() => {
  let filtered = [...entries];

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter((entry) =>
      entry.reflection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.moods?.some((mood) => mood.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.triggers?.some((trigger) => trigger.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.imageAnalysis?.insights?.some((insight) => insight.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filterPeriod === "today") {
    filtered = filtered.filter(
      (entry) => new Date(entry.date).toDateString() === today.toDateString()
    );
  } else if (filterPeriod === "week") {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Minggu

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sabtu

    // Normalisasi jam jadi 00:00:00
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);

    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });
  } else if (filterPeriod === "month") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfMonth && entryDate <= endOfMonth;
    });
  }

  // Sort
  filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  setFilteredEntries(filtered);
}, [entries, searchTerm, filterPeriod, sortOrder]);



  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id)
    setEntries(updatedEntries)
    localStorage.setItem("moodEntries", JSON.stringify(updatedEntries))
    toast({ title: "Entry deleted", description: "Your mood entry has been removed." })
  }

  const updateEntry = () => {
    if (!editingEntry) return

    const updatedEntries = entries.map((entry) =>
      entry.id === editingEntry.id
        ? { ...entry, reflection: editReflection, intensity: editIntensity[0], energy: editEnergy[0] }
        : entry
    )

    setEntries(updatedEntries)
    localStorage.setItem("moodEntries", JSON.stringify(updatedEntries))
    setEditingEntry(null)
    setEditReflection("")
    toast({ title: "Entry updated", description: "Your mood entry has been saved." })
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {
      toast({ title: "Audio playback failed", description: "Unable to play the voice note", variant: "destructive" })
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Mood History</h1>
        <p className="text-gray-600">Review and manage your comprehensive mood entries with AI insights</p>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reflections, moods, triggers, or AI insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Entries List */}
      {filteredEntries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
            <p className="text-gray-600">
              {searchTerm || filterPeriod !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first comprehensive mood entry with AI analysis"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Image thumbnail if available */}
                  {entry.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={entry.image || "/placeholder.svg"}
                        alt="Mood entry"
                        className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700"
                        onClick={() => setViewingImage(entry)}
                      />
                    </div>
                  )}

                  <div className="flex-shrink-0">
                    <div className="flex -space-x-1">
                      {entry.moods?.slice(0, 3).map((mood, index) => (
                        <span key={index} className="text-2xl">
                          {mood.emoji}
                        </span>
                      ))}
                      {entry.moods?.length > 3 && (
                        <span className="text-sm text-gray-600 ml-1">+{entry.moods.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{formatDate(entry.date)}</h3>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            {entry.intensity || 5}/10
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {entry.energy || 3}/5
                          </Badge>
                          {entry.sleepQuality && (
                            <Badge variant="outline" className="text-xs">
                              😴 {entry.sleepQuality}/5
                            </Badge>
                          )}
                          {entry.imageAnalysis && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              <Brain className="h-3 w-3 mr-1" />
                              AI {Math.round(entry.imageAnalysis.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.image && (
                          <Button variant="ghost" size="sm" onClick={() => setViewingImage(entry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {entry.audioNote && (
                          <Button variant="ghost" size="sm" onClick={() => playAudio(entry.audioNote!)}>
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingEntry(entry)
                                setEditReflection(entry.reflection)
                                setEditIntensity([entry.intensity || 5])
                                setEditEnergy([entry.energy || 3])
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Mood Entry</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-1">
                                  {editingEntry?.moods?.slice(0, 3).map((mood, index) => (
                                    <span key={index} className="text-2xl">
                                      {mood.emoji}
                                    </span>
                                  ))}
                                </div>
                                <div>
                                  <p className="font-medium">{editingEntry?.date}</p>
                                  <p className="text-sm text-gray-600">
                                    {editingEntry?.moods?.map((m) => m.label).join(", ")}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label>Intensity: {editIntensity[0]}/10</Label>
                                <Slider
                                  value={editIntensity}
                                  onValueChange={setEditIntensity}
                                  max={10}
                                  min={1}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-3">
                                <Label>Energy: {editEnergy[0]}/5</Label>
                                <Slider value={editEnergy} onValueChange={setEditEnergy} max={5} min={1} step={1} />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="edit-reflection">Reflection</Label>
                                <Textarea
                                  id="edit-reflection"
                                  value={editReflection}
                                  onChange={(e) => setEditReflection(e.target.value)}
                                  className="min-h-[120px] rounded-xl"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingEntry(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={updateEntry}>Save Changes</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-3">
                      {entry.reflection || <span className="text-gray-400 italic">No reflection added</span>}
                    </p>

                    {/* AI Insights */}
                    {entry.imageAnalysis && entry.imageAnalysis.insights.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Insights</span>
                        </div>
                        <div className="space-y-1">
                          {entry.imageAnalysis.insights.map((insight, index) => (
                            <p key={index} className="text-xs text-purple-700 dark:text-purple-300">
                              • {insight}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Triggers */}
                    {entry.triggers && entry.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.triggers.slice(0, 4).map((trigger, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                        {entry.triggers.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.triggers.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Mood badges */}
                    <div className="flex flex-wrap gap-1">
                      {entry.moods?.map((mood, index) => (
                        <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${mood.color}`}>
                          {mood.emoji} {mood.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Mood Entry Photo & AI Analysis
            </DialogTitle>
          </DialogHeader>
          {viewingImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={viewingImage.image || "/placeholder.svg"}
                  alt="Mood entry"
                  className="w-full rounded-lg object-contain max-h-96"
                  style={{ maxHeight: "24rem" }}
                />
              </div>

              {viewingImage.imageAnalysis && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-900 dark:text-purple-100">AI Analysis Results</span>
                      <Badge variant="secondary" className="text-xs bg-white/80 dark:bg-gray-800/80">
                        {Math.round(viewingImage.imageAnalysis.confidence * 100)}% confidence
                      </Badge>
                    </div>

                    {viewingImage.imageAnalysis.suggestedMoods.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Detected Moods:</p>
                        <div className="flex flex-wrap gap-1">
                          {viewingImage.imageAnalysis.suggestedMoods.map((mood: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white/80 dark:bg-gray-800/80">
                              {mood}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingImage.imageAnalysis.insights.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Insights:</p>
                        <div className="space-y-1">
                          {viewingImage.imageAnalysis.insights.map((insight: string, index: number) => (
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

                    {viewingImage.imageAnalysis.colors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dominant Colors:</p>
                        <div className="flex gap-1">
                          {viewingImage.imageAnalysis.colors.slice(0, 5).map((color: string, index: number) => (
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

              <div className="flex justify-end">
                <Button onClick={() => setViewingImage(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
