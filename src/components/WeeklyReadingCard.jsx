import React, { useState, useEffect } from 'react'
import { ExternalLink, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCurrentWeekReading } from '../../data/weekly-reading-schedule'

const WeeklyReadingCard = () => {
  const navigate = useNavigate()
  const [weekReading, setWeekReading] = useState(null)
  const [chaptersRead, setChaptersRead] = useState([])

  useEffect(() => {
    // Get test date from localStorage if set
    const savedTestDate = localStorage.getItem('testDate')
    const testDate = savedTestDate ? new Date(savedTestDate) : null

    // Get meeting day from settings
    const meetingDay = parseInt(localStorage.getItem('settings_meetingDay') || '1')

    // Get current week's reading
    const reading = getCurrentWeekReading(meetingDay, testDate)
    setWeekReading(reading)

    // Load saved progress from localStorage
    if (reading) {
      const saved = localStorage.getItem('weeklyReading_current')
      if (saved) {
        const data = JSON.parse(saved)
        // Check if it's the same week
        if (data.weekStart === reading.weekStart) {
          setChaptersRead(data.chaptersRead || [])
        }
      }
    }
  }, [])

  const handleOpenReading = () => {
    navigate('/weekly')
  }

  if (!weekReading) {
    return (
      <div className="card card-blue">
        <h2 className="card-header card-header-blue">
          <Calendar className="w-4 h-4" />
          WÖCHENTLICHES LESEN
        </h2>
        <p className="text-sm text-gray-600">Keine Lesung für diese Woche verfügbar.</p>
      </div>
    )
  }

  const totalChapters = weekReading.chapters.length
  const readCount = chaptersRead.length
  const progressPercent = (readCount / totalChapters) * 100

  return (
    <div className="card card-blue">
      <h2 className="card-header card-header-blue">
        <Calendar className="w-4 h-4" />
        WÖCHENTLICHES LESEN
      </h2>

      <p className="card-description">
        Diese Woche: {weekReading.reading}
      </p>

      <div className="card-footer card-footer-blue">
        <p className="card-stat-blue">
          {readCount} von {totalChapters} Kapiteln gelesen
        </p>
        <button
          onClick={handleOpenReading}
          className="btn-open btn-open-blue"
        >
          <ExternalLink className="w-4 h-4" />
          Öffnen
        </button>
      </div>
    </div>
  )
}

export default WeeklyReadingCard
