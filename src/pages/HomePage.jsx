import React, { useState, useEffect } from 'react'
import { BookOpen, Lightbulb, ExternalLink, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DailyTextCard from '../components/DailyTextCard'
import WeeklyReadingCard from '../components/WeeklyReadingCard'

// Import yeartext for available years
import yeartext2023 from '../../data/yeartext-2023.js'
import yeartext2026 from '../../data/yeartext-2026.js'

// Create yeartext registry
const yeartextRegistry = {
  2023: yeartext2023,
  2026: yeartext2026,
  // Add more years as they become available:
  // 2024: yeartext2024,
  // 2025: yeartext2025,
}

// Get yeartext for a specific year
const getYeartext = (year) => {
  return yeartextRegistry[year] || null
}

function HomePage() {
  const navigate = useNavigate()
  const [yeartext, setYeartext] = useState(null)

  // Load yeartext for current year
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const loadedYeartext = getYeartext(currentYear)
    setYeartext(loadedYeartext)
  }, [])

  // Get today's date in German format
  const getFormattedDate = () => {
    const date = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const formatted = date.toLocaleDateString('de-DE', options)
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Yeartext Banner - Overlay Style */}
        {yeartext && (
          <div className="pt-4 pb-2">
            <div className="relative">
              <div className="text-center px-4 py-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-200/30 shadow-sm">
                <p className="text-sm font-semibold text-indigo-900/80 mb-1">
                  {yeartext.year} Jahrestext
                </p>
                <p className="text-lg font-bold text-indigo-900 leading-snug mb-1">
                  "{yeartext.text}"
                </p>
                <p className="text-sm text-indigo-700/70 font-medium">
                  — {yeartext.scripture}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header with Date and Settings */}
        <div className="mb-4 pt-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              HEUTE - {getFormattedDate()}
            </h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              aria-label="Einstellungen"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content - Card Layout */}
        <div className="space-y-4">
          {/* Daily Text Card */}
          <DailyTextCard />

          {/* Weekly Reading */}
          <WeeklyReadingCard />

          {/* Personal Reading - Placeholder */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <h2 className="font-semibold text-green-900 mb-3 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              PERSÖNLICHES LESEN (PBP)
            </h2>

            <p className="text-sm text-gray-700 mb-2 italic">
              Plan: Bibel in 1 Jahr
            </p>

            <div className="flex items-center gap-1 mb-3">
              <Lightbulb className="w-3 h-3 text-green-700" />
              <p className="text-sm text-gray-700">
                <span className="text-xs text-gray-600">Als nächstes:</span> <span className="font-medium">Genesis 20-22</span>
              </p>
            </div>

            <div className="pt-3 border-t border-green-200 flex items-center justify-between">
              <p className="text-xs text-green-700">Tag 45 von 365 · 12% abgeschlossen</p>
              <button className="text-sm text-green-900 font-medium flex items-center gap-1 hover:text-green-700">
                <ExternalLink className="w-4 h-4" />
                Öffnen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
