"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, History, TrendingUp, Calendar, Settings, Menu, X, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "History", href: "/history", icon: History },
  { name: "Insights", href: "/insights", icon: TrendingUp },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800">
            <div className="flex flex-col h-full pt-16 pb-4">
              <div className="px-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      FeelFlow
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Your emotional journey</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white/80 lg:backdrop-blur-sm lg:border-r lg:border-gray-200 dark:lg:bg-gray-900/80 dark:lg:border-gray-800">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                FeelFlow
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your emotional journey</p>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-pink-100 dark:border-pink-800/30">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Stay Mindful</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Daily emotional awareness builds resilience and inner peace.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
