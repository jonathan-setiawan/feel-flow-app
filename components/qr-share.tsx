"use client"

import { useState } from "react"
import { QrCode, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface QRShareProps {
  data: any[]
  title?: string
}

export function QRShare({ data, title = "MoodDiary Data" }: QRShareProps) {
  const [copied, setCopied] = useState(false)

  const generateShareableData = () => {
    const shareData = {
      title,
      entries: data.slice(-10), // Last 10 entries for QR size limits
      exportDate: new Date().toISOString(),
      version: "1.0",
    }
    return shareData
  }

  const copyToClipboard = async () => {
    try {
      const shareData = generateShareableData()
      await navigator.clipboard.writeText(JSON.stringify(shareData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Data copied",
        description: "Share this text to transfer your mood data",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive",
      })
    }
  }

  const sanitizeDataForQR = (entries: any[]) => {
    // Create a simplified version without emojis and complex data for QR code
    return entries.map((entry) => ({
      date: entry.date,
      moods: entry.moods?.map((mood: any) => mood.label) || [],
      intensity: entry.intensity || 5,
      energy: entry.energy || 3,
      reflection: entry.reflection ? entry.reflection.substring(0, 50) + "..." : "",
    }))
  }

  const generateQRCodeURL = () => {
    try {
      // Create simplified data for QR code (remove emojis and limit size)
      const sanitizedEntries = sanitizeDataForQR(data.slice(-3)) // Only last 3 entries

      const limitedData = {
        title: "MoodDiary Export",
        entries: sanitizedEntries,
        count: data.length,
        exportDate: new Date().toISOString().split("T")[0], // Just date, not full timestamp
        version: "1.0",
      }

      const jsonString = JSON.stringify(limitedData)

      // Use direct URL encoding instead of base64 to avoid Unicode issues
      const encodedData = encodeURIComponent(jsonString)

      // Use QR Server API with the encoded data
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&ecc=L&data=${encodedData}`
    } catch (error) {
      console.error("QR code generation error:", error)
      // Simple fallback QR code with just basic info
      const fallbackData = encodeURIComponent(
        `MoodDiary Export - ${data.length} entries - ${new Date().toISOString().split("T")[0]}`,
      )
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${fallbackData}`
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          Share via QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Mood Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <img
              src={generateQRCodeURL() || "/placeholder.svg"}
              alt="QR Code for mood data"
              className="mx-auto border rounded-lg"
              width={200}
              height={200}
              onError={(e) => {
                // Fallback if QR code fails to load
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=200&width=200"
              }}
            />
            <p className="text-sm text-muted-foreground mt-2">Scan this QR code to transfer your last 3 mood entries</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Or copy the full data text:</label>
            <div className="relative">
              <textarea
                readOnly
                value={JSON.stringify(generateShareableData(), null, 2)}
                className="w-full h-24 p-2 text-xs border rounded resize-none bg-muted"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-transparent"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Privacy Note:</strong> QR code contains simplified data (last 3 entries). Full data available in
              text area above.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
