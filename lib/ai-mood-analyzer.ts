// AI-powered mood analysis for uploaded images


interface ImageAnalysis {
  suggestedMoods: string[]
  confidence: number
  insights: string[]
  colors: string[]
  objects: string[]
  emotions: string[]
}

// Color psychology mapping
const COLOR_MOOD_MAP: { [key: string]: string[] } = {
  red: ["energetic", "passionate", "angry", "excited"],
  blue: ["calm", "peaceful", "sad", "serene"],
  green: ["peaceful", "natural", "balanced", "hopeful"],
  yellow: ["happy", "optimistic", "cheerful", "energetic"],
  orange: ["enthusiastic", "warm", "creative", "social"],
  purple: ["creative", "mysterious", "spiritual", "imaginative"],
  pink: ["loving", "gentle", "romantic", "nurturing"],
  black: ["serious", "elegant", "mysterious", "sad"],
  white: ["pure", "clean", "peaceful", "minimalist"],
  brown: ["grounded", "stable", "natural", "comfortable"],
  gray: ["neutral", "balanced", "calm", "professional"],
}

// Object/scene mood associations
const SCENE_MOOD_MAP: { [key: string]: string[] } = {
  nature: ["peaceful", "calm", "refreshed", "grateful"],
  sunset: ["peaceful", "romantic", "reflective", "grateful"],
  beach: ["relaxed", "peaceful", "happy", "free"],
  mountains: ["inspired", "peaceful", "adventurous", "strong"],
  city: ["energetic", "busy", "social", "ambitious"],
  food: ["satisfied", "social", "grateful", "happy"],
  pets: ["happy", "loving", "grateful", "peaceful"],
  friends: ["social", "happy", "grateful", "connected"],
  family: ["loving", "grateful", "connected", "secure"],
  workout: ["energetic", "strong", "accomplished", "healthy"],
  art: ["creative", "inspired", "expressive", "thoughtful"],
  books: ["peaceful", "thoughtful", "learning", "focused"],
  music: ["expressive", "emotional", "creative", "energetic"],
  travel: ["adventurous", "excited", "grateful", "free"],
  work: ["focused", "productive", "professional", "busy"],
  home: ["comfortable", "peaceful", "secure", "relaxed"],
}

// Simulate color extraction from image
function extractDominantColors(imageDataUrl: string): string[] {
  
  const commonColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ]

  // Simulate random color selection based on image hash
  const hash = imageDataUrl.length % 10
  return commonColors.slice(hash, hash + 3)
}

// Simulate object/scene detection
function detectSceneElements(imageDataUrl: string): string[] {
  
  const possibleScenes = [
    "nature",
    "sunset",
    "food",
    "pets",
    "friends",
    "family",
    "city",
    "home",
    "art",
    "books",
    "workout",
    "travel",
  ]

  // Simulate detection based on image characteristics
  const hash = imageDataUrl.length % possibleScenes.length
  return [possibleScenes[hash], possibleScenes[(hash + 1) % possibleScenes.length]]
}

// Simulate facial emotion detection
function detectEmotions(imageDataUrl: string): string[] {
  
  const emotions = ["happy", "sad", "neutral", "surprised", "peaceful", "excited"]
  const hash = imageDataUrl.length % emotions.length
  return [emotions[hash]]
}

// Main AI analysis function
export async function analyzeImageMood(imageDataUrl: string): Promise<ImageAnalysis> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    // Extract image features
    const dominantColors = extractDominantColors(imageDataUrl)
    const sceneElements = detectSceneElements(imageDataUrl)
    const detectedEmotions = detectEmotions(imageDataUrl)

    // Analyze colors for mood suggestions
    const colorMoods: string[] = []
    dominantColors.forEach((color) => {
      // Convert hex to color name (simplified)
      const colorName = getColorName(color)
      if (COLOR_MOOD_MAP[colorName]) {
        colorMoods.push(...COLOR_MOOD_MAP[colorName])
      }
    })

    // Analyze scene elements for mood suggestions
    const sceneMoods: string[] = []
    sceneElements.forEach((scene) => {
      if (SCENE_MOOD_MAP[scene]) {
        sceneMoods.push(...SCENE_MOOD_MAP[scene])
      }
    })

    // Combine all mood suggestions and remove duplicates
    const allMoods = [...new Set([...colorMoods, ...sceneMoods, ...detectedEmotions])]

    // Generate insights
    const insights = generateInsights(dominantColors, sceneElements, detectedEmotions)

    // Calculate confidence based on number of detected features
    const confidence = Math.min(0.95, 0.6 + allMoods.length * 0.05)

    return {
      suggestedMoods: allMoods.slice(0, 4), // Top 4 mood suggestions
      confidence,
      insights,
      colors: dominantColors,
      objects: sceneElements,
      emotions: detectedEmotions,
    }
  } catch (error) {
    console.error("AI analysis error:", error)
    throw new Error("Failed to analyze image")
  }
}

// Helper function to convert hex color to color name
function getColorName(hex: string): string {
  const colorMap: { [key: string]: string } = {
    "#FF6B6B": "red",
    "#4ECDC4": "blue",
    "#45B7D1": "blue",
    "#96CEB4": "green",
    "#FFEAA7": "yellow",
    "#DDA0DD": "purple",
    "#98D8C8": "green",
    "#F7DC6F": "yellow",
    "#BB8FCE": "purple",
    "#85C1E9": "blue",
  }

  return colorMap[hex] || "gray"
}

// Generate contextual insights
function generateInsights(colors: string[], scenes: string[], emotions: string[]): string[] {
  const insights: string[] = []

  if (scenes.includes("nature")) {
    insights.push("Natural settings often promote feelings of peace and well-being")
  }

  if (scenes.includes("friends") || scenes.includes("family")) {
    insights.push("Social connections are visible, suggesting feelings of belonging and love")
  }

  if (colors.some((color) => getColorName(color) === "blue")) {
    insights.push("Blue tones suggest calmness and tranquility")
  }

  if (colors.some((color) => getColorName(color) === "yellow")) {
    insights.push("Warm yellow colors indicate positivity and energy")
  }

  if (scenes.includes("workout") || scenes.includes("travel")) {
    insights.push("Active lifestyle elements suggest energy and accomplishment")
  }

  if (emotions.includes("happy")) {
    insights.push("Facial expressions indicate positive emotional state")
  }

  return insights.slice(0, 3) // Return top 3 insights
}

// Advanced analysis for specific image types
export function analyzeImageComposition(imageDataUrl: string): {
  brightness: number
  contrast: number
  saturation: number
  moodScore: number
} {
  
  const hash = imageDataUrl.length

  return {
    brightness: (hash % 100) / 100,
    contrast: ((hash * 2) % 100) / 100,
    saturation: ((hash * 3) % 100) / 100,
    moodScore: ((hash % 10) + 1) / 10,
  }
}
