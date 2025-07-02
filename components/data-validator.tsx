"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface DataValidatorProps {
  onDataRepaired?: () => void
}

export function DataValidator({ onDataRepaired }: DataValidatorProps) {
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean
    issues: string[]
    totalEntries: number
    corruptedEntries: number
  } | null>(null)

  const validateData = () => {
    try {
      const savedEntries = localStorage.getItem("moodEntries")
      if (!savedEntries) {
        setValidationStatus({
          isValid: true,
          issues: [],
          totalEntries: 0,
          corruptedEntries: 0,
        })
        return
      }

      const entries = JSON.parse(savedEntries)
      const issues: string[] = []
      let corruptedCount = 0

      if (!Array.isArray(entries)) {
        issues.push("Data is not in correct array format")
        setValidationStatus({
          isValid: false,
          issues,
          totalEntries: 0,
          corruptedEntries: 1,
        })
        return
      }

      entries.forEach((entry, index) => {
        if (!entry.id) issues.push(`Entry ${index + 1}: Missing ID`)
        if (!entry.date) issues.push(`Entry ${index + 1}: Missing date`)
        if (!entry.moods || !Array.isArray(entry.moods)) {
          issues.push(`Entry ${index + 1}: Invalid moods data`)
          corruptedCount++
        }
        if (typeof entry.intensity !== "number" || entry.intensity < 1 || entry.intensity > 10) {
          issues.push(`Entry ${index + 1}: Invalid intensity value`)
        }
        if (typeof entry.energy !== "number" || entry.energy < 1 || entry.energy > 5) {
          issues.push(`Entry ${index + 1}: Invalid energy value`)
        }
      })

      setValidationStatus({
        isValid: issues.length === 0,
        issues: issues.slice(0, 10), // Show max 10 issues
        totalEntries: entries.length,
        corruptedEntries: corruptedCount,
      })
    } catch (error) {
      setValidationStatus({
        isValid: false,
        issues: ["Data is corrupted and cannot be parsed"],
        totalEntries: 0,
        corruptedEntries: 1,
      })
    }
  }

  const repairData = () => {
    try {
      const savedEntries = localStorage.getItem("moodEntries")
      if (!savedEntries) return

      let entries = JSON.parse(savedEntries)
      let repairedCount = 0

      if (!Array.isArray(entries)) {
        entries = []
      }

      const repairedEntries = entries
        .map((entry: any, index: number) => {
          const repaired = { ...entry }
          let wasRepaired = false

          // Fix missing ID
          if (!repaired.id) {
            repaired.id = `repaired_${Date.now()}_${index}`
            wasRepaired = true
          }

          // Fix missing date
          if (!repaired.date) {
            repaired.date = new Date().toISOString().split("T")[0]
            wasRepaired = true
          }

          // Fix moods array
          if (!repaired.moods || !Array.isArray(repaired.moods)) {
            repaired.moods = [{ emoji: "😐", label: "Neutral", value: 3, color: "bg-gray-100 text-gray-800" }]
            wasRepaired = true
          }

          // Fix intensity
          if (typeof repaired.intensity !== "number" || repaired.intensity < 1 || repaired.intensity > 10) {
            repaired.intensity = 5
            wasRepaired = true
          }

          // Fix energy
          if (typeof repaired.energy !== "number" || repaired.energy < 1 || repaired.energy > 5) {
            repaired.energy = 3
            wasRepaired = true
          }

          // Fix reflection
          if (typeof repaired.reflection !== "string") {
            repaired.reflection = ""
            wasRepaired = true
          }

          // Fix triggers
          if (!Array.isArray(repaired.triggers)) {
            repaired.triggers = []
            wasRepaired = true
          }

          // Add timestamp if missing
          if (!repaired.timestamp) {
            repaired.timestamp = new Date(repaired.date).getTime()
            wasRepaired = true
          }

          if (wasRepaired) repairedCount++
          return repaired
        })
        .filter((entry) => entry.id && entry.date) // Remove entries that couldn't be repaired

      localStorage.setItem("moodEntries", JSON.stringify(repairedEntries))

      toast({
        title: "Data repaired",
        description: `Successfully repaired ${repairedCount} entries`,
      })

      validateData()
      onDataRepaired?.()
    } catch (error) {
      toast({
        title: "Repair failed",
        description: "Could not repair the corrupted data",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    validateData()
  }, [])

  if (!validationStatus) return null

  return (
    <Card
      className={`${validationStatus.isValid ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-orange-200 bg-orange-50 dark:bg-orange-900/20"}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {validationStatus.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          )}
          Data Integrity Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p>
            <strong>Total Entries:</strong> {validationStatus.totalEntries}
          </p>
          {validationStatus.corruptedEntries > 0 && (
            <p className="text-orange-600">
              <strong>Issues Found:</strong> {validationStatus.corruptedEntries}
            </p>
          )}
        </div>

        {validationStatus.issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Issues detected:</p>
            <ul className="text-xs space-y-1 text-orange-700 dark:text-orange-300">
              {validationStatus.issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={validateData}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Re-check
          </Button>
          {!validationStatus.isValid && (
            <Button size="sm" onClick={repairData}>
              Repair Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
