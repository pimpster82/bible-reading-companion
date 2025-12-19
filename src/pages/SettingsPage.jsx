import React, { useState, useEffect } from 'react'
import { ArrowLeft, Globe, Calendar, Bell, RotateCcw, ChevronDown, ChevronRight, BookOpen, Download, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setCurrentLanguage } from '../config/languages'
import { fetchScheduleFromWOL, fetchYeartextFromWOL, generateScheduleModule, generateYeartextModule, updateLoaderFile, downloadSchedulePackage } from '../utils/scheduleUpdater'
import loaderFileContent from '../../data/weekly-reading-schedule.js?raw'

const SettingsPage = () => {
  const navigate = useNavigate()

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState(null)

  // Language
  const [language, setLanguage] = useState(getCurrentLanguage())

  // Weekly Reading Settings
  const [meetingDay, setMeetingDay] = useState(
    localStorage.getItem('settings_meetingDay') || '1' // Monday default
  )

  // Personal Reading Settings
  const [readingPlan, setReadingPlan] = useState(
    localStorage.getItem('settings_readingPlan') || 'free'
  )

  // Notifications
  const [dailyReminder, setDailyReminder] = useState(
    localStorage.getItem('settings_dailyReminder') === 'true'
  )
  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem('settings_reminderTime') || '08:00'
  )

  // Schedule Update
  const [scheduleYear, setScheduleYear] = useState(new Date().getFullYear() + 1)
  const [scheduleStatus, setScheduleStatus] = useState(null) // 'loading', 'success', 'error'
  const [scheduleMessage, setScheduleMessage] = useState('')


  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
    setLanguage(newLanguage)
    // Navigate to home instead of reload to preserve router context
    setTimeout(() => navigate('/'), 100)
  }

  const handleMeetingDayChange = (day) => {
    setMeetingDay(day)
    localStorage.setItem('settings_meetingDay', day)
  }

  const handleReadingPlanChange = (plan) => {
    setReadingPlan(plan)
    localStorage.setItem('settings_readingPlan', plan)
  }

  const handleDailyReminderToggle = () => {
    const newValue = !dailyReminder
    setDailyReminder(newValue)
    localStorage.setItem('settings_dailyReminder', newValue.toString())
  }

  const handleReminderTimeChange = (time) => {
    setReminderTime(time)
    localStorage.setItem('settings_reminderTime', time)
  }

  const handleFetchSchedule = () => {
    // Show simplified instructions for loading schedule
    setScheduleStatus('info')
    setScheduleMessage(`📖 Leseplan & Jahrestext für ${scheduleYear}

Diese Funktion wird in einer zukünftigen Version implementiert. Der Leseplan wird automatisch aus den Dateien im data/ Ordner geladen.`)
  }


  const handleResetAll = () => {
    if (window.confirm('Alle Einstellungen zurücksetzen? Dies löscht NICHT deine Lesefortschritte.')) {
      // Reset to defaults
      localStorage.removeItem('settings_meetingDay')
      localStorage.removeItem('settings_readingPlan')
      localStorage.removeItem('settings_dailyReminder')
      localStorage.removeItem('settings_reminderTime')
      localStorage.removeItem('app_language')

      // Navigate to home instead of reload to preserve router context
      setTimeout(() => navigate('/'), 100)
    }
  }

  const handleResetProgress = () => {
    if (window.confirm('Möchtest du wirklich ALLE Lesefortschritte zurücksetzen? Dies kann nicht rückgängig gemacht werden!')) {
      // Reset all reading progress data
      localStorage.removeItem('bibleCompanion_dailyText') // Daily text streak
      localStorage.removeItem('weeklyReading_current') // Current week progress
      localStorage.removeItem('personalReading_progress') // Personal reading progress

      // Clear any chapter/verse data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('chapter') || key.includes('verse') || key.includes('reading'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Success message and navigate home instead of reload
      alert('✅ Lesefortschritt erfolgreich zurückgesetzt!')
      setTimeout(() => navigate('/'), 100)
    }
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getLanguageName = () => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'Deutsch'
  }

  const getMeetingDayName = () => {
    return weekDays.find(d => d.value === meetingDay)?.label || 'Montag'
  }

  const getReadingPlanName = () => {
    return readingPlans.find(p => p.value === readingPlan)?.label || 'Freies Lesen'
  }

  const weekDays = [
    { value: '0', label: 'Sonntag' },
    { value: '1', label: 'Montag' },
    { value: '2', label: 'Dienstag' },
    { value: '3', label: 'Mittwoch' },
    { value: '4', label: 'Donnerstag' },
    { value: '5', label: 'Freitag' },
    { value: '6', label: 'Samstag' }
  ]

  const readingPlans = [
    { value: 'free', label: 'Freies Lesen (Bible Tree)' },
    { value: '1year', label: 'Bibel in 1 Jahr' },
    { value: '2years', label: 'Bibel in 2 Jahren' },
    { value: 'chronological', label: 'Chronologisch' },
    { value: 'bookByBook', label: 'Buch für Buch' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Einstellungen
          </h1>
          <p className="text-sm text-gray-600">
            Passe die App an deine Bedürfnisse an
          </p>
        </div>

        {/* Language Settings */}
        <div className="card bg-white border border-gray-200 mb-3">
          <button
            onClick={() => toggleSection('language')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Sprache</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{getLanguageName()}</span>
              {expandedSection === 'language' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'language' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      language === lang.code
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Die App wird neu geladen um die Sprache zu ändern
              </p>
            </div>
          )}
        </div>

        {/* Weekly Reading Settings */}
        <div className="card bg-white border border-gray-200 mb-3">
          <button
            onClick={() => toggleSection('weekly')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Wöchentliches Lesen</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{getMeetingDayName()}</span>
              {expandedSection === 'weekly' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'weekly' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Meeting Day */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Versammlungstag
                </label>
                <select
                  value={meetingDay}
                  onChange={(e) => handleMeetingDayChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Die Woche läuft von einem Versammlungstag zum nächsten
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Personal Reading Plan */}
        <div className="card bg-white border border-gray-200 mb-3">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Persönliches Bibellesen</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{getReadingPlanName()}</span>
              {expandedSection === 'personal' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'personal' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Leseplan
                </label>
                <select
                  value={readingPlan}
                  onChange={(e) => handleReadingPlanChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {readingPlans.map((plan) => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Wähle wie du die Bibel lesen möchtest
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card bg-white border border-gray-200 mb-3">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Erinnerungen</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {dailyReminder ? `An (${reminderTime})` : 'Aus'}
              </span>
              {expandedSection === 'notifications' ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSection === 'notifications' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Daily Reminder Toggle */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tägliche Erinnerung</p>
                  <p className="text-xs text-gray-500">Für Tagestext</p>
                </div>
                <button
                  onClick={handleDailyReminderToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dailyReminder ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dailyReminder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reminder Time */}
              {dailyReminder && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Uhrzeit
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                ⚠️ Benachrichtigungen werden in einer späteren Version implementiert
              </p>
            </div>
          )}
        </div>

        {/* Schedule Update */}
        <div className="card bg-white border border-gray-200 mb-3">
          <button
            onClick={() => toggleSection('schedule')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Leseplan aktualisieren</h2>
            </div>
            {expandedSection === 'schedule' ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'schedule' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Lade den wöchentlichen Leseplan <strong>und Jahrestext</strong> für ein neues Jahr von JW.org herunter.
              </p>

              {/* Year Input */}
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Jahr
                </label>
                <input
                  type="number"
                  value={scheduleYear}
                  onChange={(e) => setScheduleYear(parseInt(e.target.value))}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fetch Button */}
              <button
                onClick={handleFetchSchedule}
                disabled={scheduleStatus === 'loading'}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  scheduleStatus === 'loading'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {scheduleStatus === 'loading' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Leseplan herunterladen
                  </>
                )}
              </button>

              {/* Status Message */}
              {scheduleMessage && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm ${
                    scheduleStatus === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : scheduleStatus === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  {scheduleMessage}
                </div>
              )}

              <div className="text-xs text-gray-500 mt-3 space-y-1">
                <p className="text-gray-600">
                  Der Leseplan wird automatisch aus den vorhandenen Dateien geladen.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reset All */}
        <div className="card bg-white border border-red-200 mb-4">
          <button
            onClick={() => toggleSection('reset')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-gray-800">Zurücksetzen</h2>
            </div>
            {expandedSection === 'reset' ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'reset' && (
            <div className="mt-4 pt-4 border-t border-red-200 space-y-3">
              {/* Reset Settings */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Einstellungen zurücksetzen</p>
                <p className="text-xs text-gray-600 mb-2">
                  Setze alle Einstellungen auf Standardwerte zurück. Deine Lesefortschritte bleiben erhalten.
                </p>
                <button
                  onClick={handleResetAll}
                  className="w-full bg-red-50 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
                >
                  Alle Einstellungen zurücksetzen
                </button>
              </div>

              {/* Reset Progress */}
              <div className="pt-3 border-t border-red-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Lesefortschritt zurücksetzen</p>
                <p className="text-xs text-gray-600 mb-2">
                  ⚠️ Löscht alle Lesefortschritte (Wöchentliches Lesen, Tagestext, Persönliches Lesen). Deine Einstellungen bleiben erhalten.
                </p>
                <button
                  onClick={handleResetProgress}
                  className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-lg font-medium hover:bg-red-200 transition-colors border border-red-300"
                >
                  Lesefortschritt löschen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Version Info */}
        <div className="text-center text-xs text-gray-500 mt-6 pb-4">
          <p>Bible Reading Companion v0.0.1</p>
          <p className="mt-1">Made with ❤️ for Bible readers</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
