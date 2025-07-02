"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Download, Upload, Trash2, Bell, Moon, Sun, Shield, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { QRShare } from "@/components/qr-share"
import { DataValidator } from "@/components/data-validator"

interface MoodEntry {
  id: string
  date: string
  mood: any
  reflection: string
  timestamp: number
  intensity?: number
  energy?: number
  sleepQuality?: string
  triggers?: string[]
  image?: string
  audioNote?: string
}

export default function SettingsPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [notifications, setNotifications] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }

    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  const exportData = () => {
    const dataToExport = {
      entries,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mood-diary-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your mood data has been downloaded as a JSON file.",
    })
  }

  const createBackup = () => {
    const backupData = {
      entries,
      metadata: {
        totalEntries: entries.length,
        firstEntry: entries[0]?.date,
        lastEntry: entries[entries.length - 1]?.date,
        backupDate: new Date().toISOString(),
        version: "2.0",
      },
      settings: {
        notifications,
        theme: localStorage.getItem("theme"),
      },
    }

    // Store backup in localStorage with timestamp
    const backupKey = `moodDiary_backup_${Date.now()}`
    localStorage.setItem(backupKey, JSON.stringify(backupData))

    // Keep only last 5 backups
    const allKeys = Object.keys(localStorage).filter((key) => key.startsWith("moodDiary_backup_"))
    if (allKeys.length > 5) {
      allKeys
        .sort()
        .slice(0, -5)
        .forEach((key) => localStorage.removeItem(key))
    }

    toast({
      title: "Backup created",
      description: `Automatic backup saved locally. You have ${Math.min(allKeys.length + 1, 5)} backups stored.`,
    })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        if (importedData.entries && Array.isArray(importedData.entries)) {
          const mergedEntries = [...entries, ...importedData.entries]
          // Remove duplicates based on date
          const uniqueEntries = mergedEntries.filter(
            (entry, index, self) => index === self.findIndex((e) => e.date === entry.date),
          )

          setEntries(uniqueEntries)
          localStorage.setItem("moodEntries", JSON.stringify(uniqueEntries))

          toast({
            title: "Data imported",
            description: `Successfully imported ${importedData.entries.length} mood entries.`,
          })
        } else {
          throw new Error("Invalid file format")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The selected file is not a valid mood diary export.",
          variant: "destructive",
        })
      }
    }

    reader.readAsText(file)
    event.target.value = "" // Reset input
  }

  const clearAllData = () => {
    setEntries([])
    localStorage.removeItem("moodEntries")
    setShowClearDialog(false)

    toast({
      title: "Data cleared",
      description: "All your mood entries have been deleted.",
    })
  }

  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled)
    localStorage.setItem("notifications", JSON.stringify(enabled))

    if (enabled) {
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            toast({
              title: "Notifications enabled",
              description: "You'll receive daily reminders to log your mood.",
            })
          }
        })
      } else {
        toast({
          title: "Notifications enabled",
          description: "You'll receive daily reminders to log your mood.",
        })
      }
    } else {
      toast({
        title: "Notifications disabled",
        description: "Daily reminders have been turned off.",
      })
    }
  }

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    setTheme(newTheme)

    toast({
      title: `Switched to ${checked ? "dark" : "light"} mode`,
      description: `Theme changed successfully`,
    })
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Determine if dark mode is currently active
  const isDarkMode = resolvedTheme === "dark"

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and data</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch
                id="theme-toggle"
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
                aria-label="Toggle dark mode"
              />
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Current theme: <span className="font-medium">{resolvedTheme || theme}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications-toggle">Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to log your mood each day</p>
              </div>
              <Switch id="notifications-toggle" checked={notifications} onCheckedChange={toggleNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Export JSON</h3>
                <p className="text-sm text-muted-foreground">Complete data backup</p>
                <Button onClick={exportData} variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h3 className="font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">Upload exported JSON file</p>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Create Backup</h3>
                <p className="text-sm text-muted-foreground">Local safety backup</p>
                <Button onClick={createBackup} variant="outline" className="w-full bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <h3 className="font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Permanently delete all your mood entries</p>
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone. This will permanently delete all your mood entries and remove your
                        data from local storage.
                      </p>
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <p className="text-sm text-destructive">
                          <strong>Warning:</strong> You currently have {entries.length} mood entries. Consider exporting
                          your data first.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={clearAllData}>
                        Yes, delete everything
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Integrity & Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Integrity & Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DataValidator
              onDataRepaired={() => {
                // Refresh entries after repair
                const savedEntries = localStorage.getItem("moodEntries")
                if (savedEntries) {
                  setEntries(JSON.parse(savedEntries))
                }
              }}
            />

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Quick Share</h3>
                  <p className="text-sm text-muted-foreground">Share recent entries via QR code</p>
                </div>
                <QRShare data={entries} title="MoodDiary Export" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium">Data Storage</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• All your mood data is stored locally in your browser</p>
                <p>• No data is sent to external servers</p>
                <p>• Your reflections remain completely private</p>
                <p>• Clear your browser data to remove all entries</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Data Usage</h3>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm">
                  You have <strong>{entries.length}</strong> mood entries stored locally, using approximately{" "}
                  <strong>{Math.round(JSON.stringify(entries).length / 1024)}KB</strong> of storage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
