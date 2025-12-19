// Schedule Updater - Fetches weekly reading schedule, yeartext, and memorial reading from WOL

/**
 * Fetch yeartext from JW.org WOL using a CORS proxy
 * @param {number} year - The year to fetch (e.g., 2027)
 * @returns {Promise<Object>} - { success: boolean, yeartext: Object, error: string }
 */
export const fetchYeartextFromWOL = async (year) => {
  const wolUrl = `https://wol.jw.org/en/wol/d/r1/lp-e/110${year}212`

  // Try multiple CORS proxies in order (try the most reliable first)
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(wolUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(wolUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${wolUrl}`,
  ]

  for (let i = 0; i < proxies.length; i++) {
    try {
      console.log(`Fetching yeartext with proxy ${i + 1}/${proxies.length}...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(proxies[i], {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const yeartext = parseYeartextFromHTML(html, year)

      if (!yeartext.scripture) {
        throw new Error('Yeartext not found in HTML')
      }

      console.log(`Successfully fetched yeartext from proxy ${i + 1}`)

      return {
        success: true,
        yeartext: yeartext,
        error: null
      }
    } catch (error) {
      console.warn(`Yeartext proxy ${i + 1} failed:`, error.message)

      if (i === proxies.length - 1) {
        return {
          success: false,
          yeartext: null,
          error: `Fehler beim Abrufen des Jahrestextes.\n\nDirektlink: ${wolUrl}`
        }
      }

      continue
    }
  }

  return {
    success: false,
    yeartext: null,
    error: 'Unerwarteter Fehler beim Abrufen des Jahrestextes'
  }
}

/**
 * Parse HTML from yeartext page and extract the scripture
 */
function parseYeartextFromHTML(html, year) {
  // Look for paragraph with class="sn" containing "Yeartext"
  // Format: <p id="p3" data-pid="3" class="sn">Yeartext "Happy are those conscious of their spiritual need."​—<a href="..." class="b">Matthew 5:3</a>.</p>
  const yeartextMatch = html.match(/<p[^>]*class="sn"[^>]*>Yeartext\s+(.*?)<\/p>/s)

  if (!yeartextMatch) {
    console.warn('No yeartext paragraph found in HTML')
    return { scripture: null, text: null, year: parseInt(year) }
  }

  const yeartextContent = yeartextMatch[1]

  // Extract the quoted text
  const textMatch = yeartextContent.match(/[""]([^"""]+)[""]/)
  let text = textMatch ? textMatch[1].trim() : null

  // Extract scripture reference from the <a> tag
  const scriptureMatch = yeartextContent.match(/>([1-3]?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)<\/a>/)
  let scripture = null

  if (scriptureMatch) {
    const book = scriptureMatch[1].trim()
    const chapter = scriptureMatch[2]
    const verse = scriptureMatch[3]
    scripture = `${book} ${chapter}:${verse}`
  }

  // Remove any HTML entities (like ​ zero-width space)
  if (text) {
    text = text.replace(/&#?\w+;/g, '').trim()
  }

  console.log('Parsed yeartext:', { scripture, text, year: parseInt(year) })

  return {
    scripture: scripture,
    text: text,
    year: parseInt(year)
  }
}

/**
 * Fetch weekly reading schedule from JW.org WOL using a CORS proxy
 * @param {number} year - The year to fetch (e.g., 2027)
 * @returns {Promise<Object>} - { success: boolean, schedule: Array, error: string }
 */
export const fetchScheduleFromWOL = async (year) => {
  const wolUrl = `https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214`

  // Try multiple CORS proxies in order (try the most reliable first)
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(wolUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(wolUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${wolUrl}`,
  ]

  for (let i = 0; i < proxies.length; i++) {
    try {
      console.log(`Attempting to fetch with proxy ${i + 1}/${proxies.length}...`)

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(proxies[i], {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const schedule = parseScheduleFromHTML(html, year)

      if (schedule.length === 0) {
        throw new Error('No schedule data found in HTML')
      }

      console.log(`Successfully fetched ${schedule.length} weeks from proxy ${i + 1}`)

      return {
        success: true,
        schedule: schedule,
        error: null
      }
    } catch (error) {
      console.warn(`Proxy ${i + 1} failed:`, error.message)

      // If this is the last proxy, return error
      if (i === proxies.length - 1) {
        return {
          success: false,
          schedule: [],
          error: `Alle CORS-Proxys fehlgeschlagen. Bitte versuchen Sie es später erneut oder verwenden Sie den manuellen Download.\n\nDirektlink: ${wolUrl}`
        }
      }

      // Otherwise try next proxy
      continue
    }
  }

  // Fallback (should never reach here)
  return {
    success: false,
    schedule: [],
    error: 'Unerwarteter Fehler beim Abrufen des Zeitplans'
  }
}

/**
 * Parse HTML from WOL and extract schedule data
 */
function parseScheduleFromHTML(html, year) {
  const schedule = []

  const monthNames = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }

  // Extract all month sections
  const monthRegex = /<h2[^>]*>(?:<[^>]*>)*<strong>(January|February|March|April|May|June|July|August|September|October|November|December)<\/strong>(?:<\/[^>]*>)*<\/h2>(.*?)(?=<h2|$)/gs

  let monthMatch
  while ((monthMatch = monthRegex.exec(html)) !== null) {
    const month = monthMatch[1]
    const monthContent = monthMatch[2]
    const currentMonth = monthNames[month]

    // Extract readings from list items
    // Format: <span class="txtSrcBullet">5 </span><a...>Isaiah 17-20</a>
    const readingRegex = /<span class="txtSrcBullet">(\d+)\s*<\/span>(?:.*?<a[^>]*>(.*?)<\/a>|(.*?)(?=<\/p>))/g

    let readingMatch
    while ((readingMatch = readingRegex.exec(monthContent)) !== null) {
      const dayOfMonth = parseInt(readingMatch[1])
      const reading = (readingMatch[2] || readingMatch[3] || '').trim()

      // Skip empty or invalid readings
      if (!reading || reading.includes('<')) continue

      const weekStart = new Date(parseInt(year), currentMonth - 1, dayOfMonth)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }

      // Parse book and chapters
      let book = null
      let chapters = []

      if (reading.includes('Memorial') || reading.includes('memorial')) {
        book = null
        chapters = []
      } else {
        const match = reading.match(/^([A-Za-z\s]+?)\s+(\d+)(?:[-–](\d+))?/)
        if (match) {
          book = match[1].trim()
          const startChapter = parseInt(match[2])
          const endChapter = match[3] ? parseInt(match[3]) : startChapter

          for (let i = startChapter; i <= endChapter; i++) {
            chapters.push(i)
          }
        }
      }

      schedule.push({
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
        reading: reading,
        book: book,
        chapters: chapters,
        year: parseInt(year),
        month: currentMonth
      })
    }
  }

  return schedule
}

/**
 * Generate JavaScript module content from schedule data
 */
export const generateScheduleModule = (schedule, year) => {
  let jsContent = `// Weekly Bible Reading Schedule for ${year}
// Auto-generated from JW.org WOL
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214
// Generated: ${new Date().toISOString()}

export const weeklyReadingSchedule${year} = [\n`

  schedule.forEach(week => {
    jsContent += `  { weekStart: '${week.weekStart}', weekEnd: '${week.weekEnd}', reading: '${week.reading}', book: ${week.book ? `'${week.book}'` : 'null'}, chapters: [${week.chapters.join(', ')}], year: ${week.year}, month: ${week.month} },\n`
  })

  jsContent += `]\n\nexport default weeklyReadingSchedule${year}\n`

  return jsContent
}

/**
 * Save schedule file - triggers download
 */
export const saveScheduleForDownload = (scheduleModule, year) => {
  const blob = new Blob([scheduleModule], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `weekly-reading-schedule-${year}.js`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Update the main loader file to include new year
 * @param {number} year - The year to add
 * @returns {string} - Updated loader file content
 */
export const updateLoaderFile = (currentLoaderContent, year) => {
  let updatedContent = currentLoaderContent

  // 1. Add import statement after existing imports
  const importLine = `import { weeklyReadingSchedule${year} } from './weekly-reading-schedule-${year}.js'`
  const importRegex = /(import\s+{[^}]+}\s+from\s+['"]\.\/weekly-reading-schedule-\d{4}\.js['"]\s*\n)/g
  const imports = currentLoaderContent.match(importRegex) || []

  // Check if import already exists
  if (!currentLoaderContent.includes(importLine)) {
    if (imports.length > 0) {
      // Add after last import
      const lastImport = imports[imports.length - 1]
      updatedContent = updatedContent.replace(lastImport, lastImport + importLine + '\n')
    } else {
      // Add after the initial comment block
      const afterComments = /\/\/ Import all available years\n/
      updatedContent = updatedContent.replace(afterComments, `$&${importLine}\n`)
    }
  }

  // 2. Add to registry
  const registryLine = `  ${year}: weeklyReadingSchedule${year},`
  const registryRegex = /const allSchedules = \{([^}]*)\}/s
  const registryMatch = currentLoaderContent.match(registryRegex)

  if (registryMatch && !currentLoaderContent.includes(`${year}: weeklyReadingSchedule${year}`)) {
    const registryContent = registryMatch[1]
    const registryEntries = registryContent
      .trim()
      .split('\n')
      .filter(line => line.trim() && !line.includes('//'))
      .map(line => {
        const trimmed = line.trim()
        // Ensure proper formatting: "  YEAR: schedule,"
        if (trimmed && !trimmed.startsWith('  ')) {
          return '  ' + trimmed
        }
        return trimmed
      })
      .filter(line => line.trim())

    // Add new entry and sort by year
    registryEntries.push(registryLine)

    // Sort entries by year number
    const sortedEntries = registryEntries.sort((a, b) => {
      const yearA = parseInt(a.match(/(\d{4}):/)?.[1] || '0')
      const yearB = parseInt(b.match(/(\d{4}):/)?.[1] || '0')
      return yearA - yearB
    })

    const newRegistry = `const allSchedules = {\n${sortedEntries.join('\n')}\n}`
    updatedContent = updatedContent.replace(registryRegex, newRegistry)
  }

  // 3. Add to exports
  const exportLine = `weeklyReadingSchedule${year}`
  const exportRegex = /export\s+\{([^}]+)\}/
  const exportMatch = currentLoaderContent.match(exportRegex)

  if (exportMatch && !currentLoaderContent.includes(exportLine)) {
    const currentExports = exportMatch[1].trim().split(',').map(e => e.trim())
    currentExports.push(exportLine)
    const newExports = `export { ${currentExports.join(', ')} }`
    updatedContent = updatedContent.replace(exportRegex, newExports)
  }

  return updatedContent
}

/**
 * Download all necessary files as a ZIP
 */
export const downloadSchedulePackage = async (scheduleModule, year, loaderContent, yeartextModule = null) => {
  try {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // Add the schedule file
    zip.file(`weekly-reading-schedule-${year}.js`, scheduleModule)

    // Add the updated loader file
    zip.file('weekly-reading-schedule.js', loaderContent)

    // Add yeartext file if provided
    if (yeartextModule) {
      zip.file(`yeartext-${year}.js`, yeartextModule)
    }

    // Add README with instructions
    const readme = `# Installation Instructions - ${year}

## Dateien im Paket:
- weekly-reading-schedule-${year}.js (Wöchentlicher Leseplan)
- weekly-reading-schedule.js (Aktualisierter Loader)${yeartextModule ? `\n- yeartext-${year}.js (Jahrestext)` : ''}

## Installation:

1. Kopiere "weekly-reading-schedule-${year}.js" nach:
   data/weekly-reading-schedule-${year}.js

2. Ersetze "weekly-reading-schedule.js" mit der neuen Version:
   data/weekly-reading-schedule.js
${yeartextModule ? `
3. Kopiere "yeartext-${year}.js" nach:
   data/yeartext-${year}.js
` : ''}
${yeartextModule ? '4' : '3'}. Fertig! Die App verwendet jetzt automatisch alle Daten für ${year}.

---
Generiert: ${new Date().toLocaleString('de-DE')}
`
    zip.file('INSTALLATION.txt', readme)

    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `bible-reading-${year}-package.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, method: 'zip-download' }
  } catch (error) {
    console.error('ZIP creation failed:', error)
    // Fallback to individual file download
    saveScheduleForDownload(scheduleModule, year)
    return { success: true, method: 'fallback-download' }
  }
}

/**
 * Save schedule directly to file system (requires File System Access API)
 * Falls back to download if not supported
 */
export const saveScheduleToDataFolder = async (scheduleModule, year) => {
  try {
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      const opts = {
        suggestedName: `weekly-reading-schedule-${year}.js`,
        types: [{
          description: 'JavaScript Files',
          accept: { 'text/javascript': ['.js'] },
        }],
      }

      const handle = await window.showSaveFilePicker(opts)
      const writable = await handle.createWritable()
      await writable.write(scheduleModule)
      await writable.close()

      return { success: true, method: 'file-system' }
    } else {
      // Fallback to download
      saveScheduleForDownload(scheduleModule, year)
      return { success: true, method: 'download' }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Save cancelled' }
    }
    // Fallback to download on any error
    saveScheduleForDownload(scheduleModule, year)
    return { success: true, method: 'download-fallback' }
  }
}

/**
 * Generate JavaScript module content for yeartext
 */
export const generateYeartextModule = (yeartext, year) => {
  const jsContent = `// Annual Yeartext for ${year}
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}212
// Generated: ${new Date().toISOString()}

export const yeartext${year} = {
  year: ${year},
  scripture: '${yeartext.scripture}',
  text: '${yeartext.text.replace(/'/g, "\\'")}',
}

export default yeartext${year}
`
  return jsContent
}

/**
 * Get memorial week from schedule
 */
export const getMemorialWeekFromSchedule = (schedule) => {
  return schedule.find(week =>
    week.reading.toLowerCase().includes('memorial') ||
    week.book === null
  ) || null
}

export default {
  fetchScheduleFromWOL,
  fetchYeartextFromWOL,
  generateScheduleModule,
  generateYeartextModule,
  getMemorialWeekFromSchedule,
  saveScheduleForDownload,
  saveScheduleToDataFolder,
  updateLoaderFile,
  downloadSchedulePackage
}
