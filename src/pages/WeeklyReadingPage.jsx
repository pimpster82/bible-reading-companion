import React, { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink, Check, Circle, Edit3, RotateCcw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCurrentWeekReading, formatWeekRange } from '../../data/weekly-reading-schedule'
import { parseReadingInput, formatChapterStatus, getNextReading } from '../utils/readingParser'
import { buildJWLibraryDeepLink } from '../../data/bible-link-builder'

const WeeklyReadingPage = () => {
  const navigate = useNavigate()
  const [weekReading, setWeekReading] = useState(null)
  const [chaptersRead, setChaptersRead] = useState([])
  const [readingInput, setReadingInput] = useState('')
  const [inputError, setInputError] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [showInput, setShowInput] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [lastAction, setLastAction] = useState(null) // Track last action for undo

  useEffect(() => {
    // Get test date from localStorage if set
    const savedTestDate = localStorage.getItem('testDate')
    const testDate = savedTestDate ? new Date(savedTestDate) : null

    // Get meeting day from settings
    const meetingDay = parseInt(localStorage.getItem('settings_meetingDay') || '1')

    const reading = getCurrentWeekReading(meetingDay, testDate)
    setWeekReading(reading)

    if (reading) {
      const saved = localStorage.getItem('weeklyReading_current')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.weekStart === reading.weekStart) {
          setChaptersRead(data.chaptersRead || [])
        }
      }
    }
  }, [])

  const handleSubmitReading = () => {
    if (!readingInput.trim()) {
      setInputError('Bitte Eingabe machen')
      return
    }

    // Pass current book as default (Isaiah for now)
    const defaultBook = weekReading ? {
      name: weekReading.book,
      number: 23 // Isaiah
    } : null

    const result = parseReadingInput(readingInput, defaultBook)

    // Handle suggestions
    if (result.suggestion) {
      setSuggestion(result.suggestion)
      setInputError(null)
      return
    }

    if (result.error) {
      setInputError(result.error)
      setSuggestion(null)
      return
    }

    // Check if parsed book matches expected book
    if (result.book && result.book.name !== weekReading.book) {
      setInputError(`Erwartet: ${weekReading.book}, aber ${result.book.name} eingegeben`)
      setSuggestion(null)
      return
    }

    // Check if chapters are in the expected reading range
    const invalidChapters = result.chapters.filter(c => !weekReading.chapters.includes(c.chapter))
    if (invalidChapters.length > 0) {
      const invalidList = invalidChapters.map(c => c.chapter).join(', ')
      const expectedList = weekReading.chapters.join(', ')
      setInputError(`Kapitel ${invalidList} nicht in dieser Woche erwartet. Erwartet: Kapitel ${expectedList}`)
      setSuggestion(null)
      return
    }

    // Merge with existing data
    const updatedChapters = [...chaptersRead]

    for (const parsed of result.chapters) {
      // Remove existing entry for this chapter
      const filtered = updatedChapters.filter(c => c.chapter !== parsed.chapter)

      // Add new entry
      filtered.push(parsed)

      updatedChapters.length = 0
      updatedChapters.push(...filtered)
    }

    // Save current state before updating
    setLastAction({ type: 'add', previousState: [...chaptersRead] })
    setChaptersRead(updatedChapters)

    if (weekReading) {
      localStorage.setItem('weeklyReading_current', JSON.stringify({
        weekStart: weekReading.weekStart,
        chaptersRead: updatedChapters
      }))
    }

    // Reset input
    setReadingInput('')
    setInputError(null)
    setSuggestion(null)
    setShowInput(false)
  }

  const handleUndo = () => {
    if (!lastAction || !lastAction.previousState) return

    setChaptersRead(lastAction.previousState)
    setLastAction(null)

    if (weekReading) {
      localStorage.setItem('weeklyReading_current', JSON.stringify({
        weekStart: weekReading.weekStart,
        chaptersRead: lastAction.previousState
      }))
    }
  }

  const handleClearAll = () => {
    // Save current state before clearing
    setLastAction({ type: 'clear', previousState: [...chaptersRead] })
    setChaptersRead([])
    setShowClearConfirm(false)

    if (weekReading) {
      localStorage.setItem('weeklyReading_current', JSON.stringify({
        weekStart: weekReading.weekStart,
        chaptersRead: []
      }))
    }
  }

  const handleAcceptSuggestion = (suggestedBook) => {
    if (!suggestion) return

    // Reconstruct input with suggested book
    const newInput = `${suggestedBook.name} ${suggestion.referenceText}`
    setReadingInput(newInput)
    setSuggestion(null)
    setInputError(null)
  }

  const toggleChapterRead = (chapter) => {
    const existing = chaptersRead.find(c => c.chapter === chapter)

    let updated
    if (existing) {
      // Remove if exists
      updated = chaptersRead.filter(c => c.chapter !== chapter)
    } else {
      // Add as complete
      updated = [...chaptersRead, {
        chapter,
        status: 'complete',
        verses: null
      }]
    }

    setChaptersRead(updated)

    if (weekReading) {
      localStorage.setItem('weeklyReading_current', JSON.stringify({
        weekStart: weekReading.weekStart,
        chaptersRead: updated
      }))
    }
  }

  const getChapterData = (chapter) => {
    return chaptersRead.find(c => c.chapter === chapter)
  }

  const openChapter = (chapter) => {
    // Isaiah = Book 23
    const bookNumber = 23

    // Check if chapter has been started (has any verses read)
    const chapterData = getChapterData(chapter)
    let startVerse = 1 // Default to verse 1

    // If chapter is partial (has verses read), start from the next verse
    if (chapterData && chapterData.status === 'partial' && chapterData.verses) {
      // verses is a number representing the highest verse read
      startVerse = chapterData.verses + 1
    }

    // Build finder URL for JW Library app
    // Format: BBCCCVVV where BB=book, CCC=chapter, VVV=verse (001=start at verse 1)
    const startVerseStr = String(startVerse).padStart(3, '0')
    const bibleCode = `${String(bookNumber).padStart(2, '0')}${String(chapter).padStart(3, '0')}${startVerseStr}`
    const finderUrl = `https://www.jw.org/finder?pub=nwtsty&bible=${bibleCode}&wtlocale=E&srcid=share`

    // Debug: Log the generated URL
    console.log('Generated JW Library Deep Link:', finderUrl)
    console.log('Bible Code:', bibleCode)
    console.log('Chapter Data:', chapterData)
    console.log('Start Verse:', startVerse)

    // Open the finder URL - if JW Library app is installed, it will intercept this
    // Otherwise it opens in browser
    window.open(finderUrl, '_blank', 'noopener,noreferrer')
  }


  if (!weekReading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>
          <div className="card card-blue">
            <p className="text-gray-600">Keine Lesung für diese Woche verfügbar.</p>
          </div>
        </div>
      </div>
    )
  }

  const totalChapters = weekReading.chapters.length
  // Only count chapters that are in the expected week's reading
  const readCount = chaptersRead.filter(c => weekReading.chapters.includes(c.chapter)).length
  const progressPercent = totalChapters > 0 ? (readCount / totalChapters) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-4 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>

          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Wöchentliches Lesen
          </h1>
          <p className="text-sm text-gray-600">
            {formatWeekRange(weekReading.weekStart, weekReading.weekEnd)}
          </p>
        </div>

        {/* Reading Title Card */}
        <div className="card card-blue mb-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            {weekReading.reading}
          </h2>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">
              {readCount} von {totalChapters} Kapiteln gelesen · {Math.round(progressPercent)}%
            </p>
          </div>
        </div>

        {/* Smart Reading Input */}
        <div className="card card-blue mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Gelesen eingeben</h3>
            <button
              onClick={() => setShowInput(!showInput)}
              className="text-sm text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" />
              {showInput ? 'Schließen' : 'Eingeben'}
            </button>
          </div>

          {showInput && (
            <div>
              <div className="mb-3">
                <input
                  type="text"
                  value={readingInput}
                  onChange={(e) => {
                    setReadingInput(e.target.value)
                    setInputError(null)
                  }}
                  placeholder="Was hast du gelesen? (z.B. 9 oder 9-10)"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {inputError && (
                  <p className="text-xs text-red-600 mt-1">{inputError}</p>
                )}

                {suggestion && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    {suggestion.type === 'did_you_mean' && (
                      <>
                        <p className="text-sm font-medium text-yellow-900 mb-2">
                          Meintest du...?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.suggestions.map((book) => (
                            <button
                              key={book.number}
                              onClick={() => handleAcceptSuggestion(book)}
                              className="text-sm bg-white border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 text-yellow-900"
                            >
                              {book.name}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setSuggestion(null)}
                          className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                        >
                          Abbrechen
                        </button>
                      </>
                    )}
                    {suggestion.type === 'unclear' && (
                      <>
                        <p className="text-sm font-medium text-yellow-900 mb-2">
                          Welches Buch meinst du?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.suggestions.map((book) => (
                            <button
                              key={book.number}
                              onClick={() => handleAcceptSuggestion(book)}
                              className="text-sm bg-white border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 text-yellow-900"
                            >
                              {book.name}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setSuggestion(null)}
                          className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                        >
                          Neu eingeben
                        </button>
                      </>
                    )}
                    {suggestion.type === 'not_found' && (
                      <>
                        <p className="text-sm text-yellow-900">
                          Buch "{suggestion.input}" nicht gefunden. Bitte erneut versuchen.
                        </p>
                        <button
                          onClick={() => setSuggestion(null)}
                          className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                        >
                          OK
                        </button>
                      </>
                    )}
                    {suggestion.type === 'invalid_chapter' && (
                      <>
                        <p className="text-sm text-yellow-900 mb-2">
                          <strong>{suggestion.bookName}</strong> hat nur{' '}
                          <strong>{suggestion.maxChapters}</strong> Kapitel.
                        </p>
                        <p className="text-sm font-medium text-yellow-900 mb-2">
                          Meintest du:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setReadingInput(`${suggestion.bookName} ${sug.display}`)
                                setSuggestion(null)
                              }}
                              className="text-sm bg-white border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 text-yellow-900"
                            >
                              <strong>{sug.display}</strong>
                              <span className="text-xs text-gray-600 ml-1">({sug.description})</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setSuggestion(null)}
                          className="text-xs text-gray-600 mt-2 hover:text-gray-800"
                        >
                          Neu eingeben
                        </button>
                      </>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Beispiele: <code className="bg-gray-100 px-1">9</code> · <code className="bg-gray-100 px-1">9-10</code> · <code className="bg-gray-100 px-1">9:5-10</code>
                </p>
              </div>

              <button
                onClick={handleSubmitReading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          )}
        </div>

        {/* Chapter List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Kapitel einzeln:</h3>
            <div className="flex gap-2">
              {lastAction && (
                <button
                  onClick={handleUndo}
                  title="Letzte Aktion rückgängig machen"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rückgängig
                </button>
              )}
              {readCount > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  title="Alle Einträge löschen"
                  className="text-xs text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Alles löschen
                </button>
              )}
            </div>
          </div>

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900 mb-2">
                Möchtest du wirklich alle Einträge löschen?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Ja, löschen
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {weekReading.chapters.map((chapter) => {
            const chapterData = getChapterData(chapter)
            const isRead = chapterData && chapterData.status === 'complete'
            const isPartial = chapterData && chapterData.status === 'partial'

            return (
              <div
                key={chapter}
                className={`card ${
                  isRead ? 'border-green-200 bg-green-50' :
                  isPartial ? 'border-yellow-200 bg-yellow-50' :
                  'card-blue'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Checkbox + Title + Status */}
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleChapterRead(chapter)}
                      className="flex-shrink-0"
                    >
                      {isRead ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : isPartial ? (
                        <div className="w-6 h-6 rounded-full border-4 border-yellow-500 border-t-transparent" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <p className={`font-medium ${
                        isRead ? 'text-green-900' :
                        isPartial ? 'text-yellow-900' :
                        'text-gray-800'
                      }`}>
                        {weekReading.book} {chapter}
                      </p>
                      {isPartial && chapterData.verses && (
                        <p className="text-xs text-yellow-700">
                          Bis Vers {chapterData.verses}
                          {chapterData.continueFrom && ` · Weiter ab ${chapterData.continueFrom}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Open Button */}
                  <button
                    onClick={() => openChapter(chapter)}
                    className={`btn-open flex-shrink-0 ${
                      isRead ? 'text-green-700 hover:text-green-900' :
                      isPartial ? 'text-yellow-700 hover:text-yellow-900' :
                      'btn-open-blue'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Öffnen
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Footer */}
        {readCount === totalChapters && totalChapters > 0 && (
          <div className="mt-6 card bg-green-50 border-green-200">
            <p className="text-center text-green-800 font-medium">
              ✓ Woche abgeschlossen! Gut gemacht!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeeklyReadingPage
