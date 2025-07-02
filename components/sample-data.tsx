"use client"

import { useEffect } from "react"

const SAMPLE_ENTRIES = [
  {
    id: "1",
    date: "2024-01-15",
    moods: [
      { emoji: "😄", label: "Very Happy", value: 5, color: "bg-green-100 text-green-800" },
      { emoji: "🤗", label: "Grateful", value: 4, color: "bg-pink-100 text-pink-800" },
    ],
    intensity: 8,
    energy: 4,
    reflection:
      "Had an amazing day at work! Got promoted and celebrated with friends. Feeling grateful for all the opportunities coming my way. The combination of professional success and social connection made this day truly special.",
    triggers: ["Work/Career", "Achievement", "Social"],
    sleepQuality: 4,
    timestamp: Date.now() - 86400000 * 7,
  },
  {
    id: "2",
    date: "2024-01-14",
    moods: [
      { emoji: "🙂", label: "Happy", value: 4, color: "bg-blue-100 text-blue-800" },
      { emoji: "😌", label: "Peaceful", value: 4, color: "bg-teal-100 text-teal-800" },
    ],
    intensity: 6,
    energy: 3,
    reflection:
      "Spent quality time with family. We went for a nice walk in the park and had dinner together. Simple pleasures make life beautiful. The peaceful evening helped me recharge.",
    triggers: ["Family", "Exercise"],
    sleepQuality: 5,
    timestamp: Date.now() - 86400000 * 8,
  },
  {
    id: "3",
    date: "2024-01-13",
    moods: [
      { emoji: "😐", label: "Neutral", value: 3, color: "bg-gray-100 text-gray-800" },
      { emoji: "😴", label: "Tired", value: 2, color: "bg-purple-100 text-purple-800" },
    ],
    intensity: 4,
    energy: 2,
    reflection:
      "Regular day at work. Nothing particularly exciting happened, but I got through my tasks efficiently. Feeling a bit tired from the week catching up with me. Sometimes neutral is perfectly fine.",
    triggers: ["Work/Career", "Sleep"],
    sleepQuality: 2,
    timestamp: Date.now() - 86400000 * 9,
  },
  {
    id: "4",
    date: "2024-01-12",
    moods: [
      { emoji: "😔", label: "Sad", value: 2, color: "bg-orange-100 text-orange-800" },
      { emoji: "😰", label: "Anxious", value: 2, color: "bg-yellow-100 text-yellow-800" },
    ],
    intensity: 7,
    energy: 2,
    reflection:
      "Feeling overwhelmed with deadlines and some conflicts at work that left me drained. The anxiety about upcoming presentations is affecting my mood. Need to practice better stress management techniques.",
    triggers: ["Work/Career", "Stress"],
    sleepQuality: 2,
    timestamp: Date.now() - 86400000 * 10,
  },
  {
    id: "5",
    date: "2024-01-11",
    moods: [
      { emoji: "🙂", label: "Happy", value: 4, color: "bg-blue-100 text-blue-800" },
      { emoji: "😌", label: "Peaceful", value: 4, color: "bg-teal-100 text-teal-800" },
    ],
    intensity: 6,
    energy: 4,
    reflection:
      "Started reading a new book that I've been wanting to read for months. Also had a great workout session at the gym. Self-care activities really help maintain balance and perspective.",
    triggers: ["Exercise", "Achievement"],
    sleepQuality: 4,
    timestamp: Date.now() - 86400000 * 11,
  },
  {
    id: "6",
    date: "2024-01-10",
    moods: [
      { emoji: "😡", label: "Angry", value: 2, color: "bg-red-100 text-red-800" },
      { emoji: "😔", label: "Sad", value: 2, color: "bg-orange-100 text-orange-800" },
    ],
    intensity: 8,
    energy: 3,
    reflection:
      "Had a frustrating argument with a close friend over something trivial. The anger quickly turned to sadness as I realized how much our relationship means to me. Planning to reach out and apologize tomorrow.",
    triggers: ["Relationships", "Social"],
    sleepQuality: 3,
    timestamp: Date.now() - 86400000 * 12,
  },
]

export function useSampleData() {
  useEffect(() => {
    // Comment out automatic sample data loading
    // const existingEntries = localStorage.getItem("moodEntries")
    // if (!existingEntries) {
    //   localStorage.setItem("moodEntries", JSON.stringify(SAMPLE_ENTRIES))
    // }
  }, [])
}
