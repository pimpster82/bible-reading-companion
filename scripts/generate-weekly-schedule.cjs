#!/usr/bin/env node

/**
 * Generate Weekly Reading Schedule from JW.org
 *
 * This script creates the weekly-reading-schedule-YEAR.js file
 * by fetching data from wol.jw.org
 *
 * Usage: Run this script manually and paste the schedule data when prompted
 *        Or update the data object below with data from wol.jw.org
 */

// INSTRUCTIONS:
// 1. Visit https://wol.jw.org/en/wol/d/r1/lp-e/1102026214 (change year in URL)
// 2. Copy the complete schedule below and update the scheduleData array
// 3. Run: node scripts/generate-weekly-schedule.js 2026

const fs = require('fs')
const path = require('path')

const year = process.argv[2] || '2026'

// TODO: Paste schedule data here from wol.jw.org
// Format: Each entry should be: { month: 'January', day: 5, reading: 'Isaiah 17-20' }
const scheduleData = [
  // January
  { month: 'January', day: 5, reading: 'Isaiah 17-20' },
  { month: 'January', day: 12, reading: 'Isaiah 21-23' },
  { month: 'January', day: 19, reading: 'Isaiah 24-27' },
  { month: 'January', day: 26, reading: 'Isaiah 28-29' },

  // February
  { month: 'February', day: 2, reading: 'Isaiah 30-32' },
  { month: 'February', day: 9, reading: 'Isaiah 33-35' },
  { month: 'February', day: 16, reading: 'Isaiah 36-37' },
  { month: 'February', day: 23, reading: 'Isaiah 38-40' },

  // March
  { month: 'March', day: 2, reading: 'Isaiah 41-42' },
  { month: 'March', day: 9, reading: 'Isaiah 43-44' },
  { month: 'March', day: 16, reading: 'Isaiah 45-47' },
  { month: 'March', day: 23, reading: 'Isaiah 48-49' },
  { month: 'March', day: 30, reading: 'Memorial Week' },

  // April
  { month: 'April', day: 6, reading: 'Isaiah 50-51' },
  { month: 'April', day: 13, reading: 'Isaiah 52-53' },
  { month: 'April', day: 20, reading: 'Isaiah 54-55' },
  { month: 'April', day: 27, reading: 'Isaiah 56-57' },

  // May
  { month: 'May', day: 4, reading: 'Isaiah 58-59' },
  { month: 'May', day: 11, reading: 'Isaiah 60-61' },
  { month: 'May', day: 18, reading: 'Isaiah 62-64' },
  { month: 'May', day: 25, reading: 'Isaiah 65-66' },

  // June
  { month: 'June', day: 1, reading: 'Jeremiah 1-3' },
  { month: 'June', day: 8, reading: 'Jeremiah 4-6' },
  { month: 'June', day: 15, reading: 'Jeremiah 7-8' },
  { month: 'June', day: 22, reading: 'Jeremiah 9-10' },
  { month: 'June', day: 29, reading: 'Jeremiah 11-12' },

  // July
  { month: 'July', day: 6, reading: 'Jeremiah 13-15' },
  { month: 'July', day: 13, reading: 'Jeremiah 16-17' },
  { month: 'July', day: 20, reading: 'Jeremiah 18-19' },
  { month: 'July', day: 27, reading: 'Jeremiah 20-21' },

  // August
  { month: 'August', day: 3, reading: 'Jeremiah 22-23' },
  { month: 'August', day: 10, reading: 'Jeremiah 24-25' },
  { month: 'August', day: 17, reading: 'Jeremiah 26-28' },
  { month: 'August', day: 24, reading: 'Jeremiah 29-30' },
  { month: 'August', day: 31, reading: 'Jeremiah 31' },

  // September
  { month: 'September', day: 7, reading: 'Jeremiah 32-33' },
  { month: 'September', day: 14, reading: 'Jeremiah 34-35' },
  { month: 'September', day: 21, reading: 'Jeremiah 36-37' },
  { month: 'September', day: 28, reading: 'Jeremiah 38-39' },

  // October
  { month: 'October', day: 5, reading: 'Jeremiah 40-41' },
  { month: 'October', day: 12, reading: 'Jeremiah 42-44' },
  { month: 'October', day: 19, reading: 'Jeremiah 45-46' },
  { month: 'October', day: 26, reading: 'Jeremiah 47-48' },

  // November
  { month: 'November', day: 2, reading: 'Jeremiah 49-50' },
  { month: 'November', day: 9, reading: 'Jeremiah 51-52' },
  { month: 'November', day: 16, reading: 'Lamentations 1-2' },
  { month: 'November', day: 23, reading: 'Lamentations 3-5' },
  { month: 'November', day: 30, reading: 'Ezekiel 1-2' },

  // December
  { month: 'December', day: 7, reading: 'Ezekiel 3-4' },
  { month: 'December', day: 14, reading: 'Ezekiel 5-6' },
  { month: 'December', day: 21, reading: 'Ezekiel 7-8' },
  { month: 'December', day: 28, reading: 'Ezekiel 9-10' }
]

const monthNames = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
}

function generateSchedule() {
  console.log(`📖 Generating weekly reading schedule for ${year}`)
  console.log(`📊 Processing ${scheduleData.length} entries...`)

  const schedule = scheduleData.map(entry => {
    const month = monthNames[entry.month]
    const weekStart = new Date(parseInt(year), month - 1, entry.day)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const formatDate = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // Parse book and chapters
    let book = null
    let chapters = []

    if (entry.reading.includes('Memorial')) {
      book = null
      chapters = []
    } else {
      const match = entry.reading.match(/^([A-Za-z\s]+?)\s+(\d+)(?:[-–](\d+))?/)
      if (match) {
        book = match[1].trim()
        const startChapter = parseInt(match[2])
        const endChapter = match[3] ? parseInt(match[3]) : startChapter

        for (let i = startChapter; i <= endChapter; i++) {
          chapters.push(i)
        }
      }
    }

    return {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      reading: entry.reading,
      book: book,
      chapters: chapters,
      year: parseInt(year),
      month: month
    }
  })

  // Generate JavaScript file
  let jsContent = `// Weekly Bible Reading Schedule for ${year}
// Source: https://wol.jw.org/en/wol/d/r1/lp-e/110${year}214

export const weeklyReadingSchedule${year} = [\n`

  schedule.forEach(week => {
    jsContent += `  { weekStart: '${week.weekStart}', weekEnd: '${week.weekEnd}', reading: '${week.reading}', book: ${week.book ? `'${week.book}'` : 'null'}, chapters: [${week.chapters.join(', ')}], year: ${week.year}, month: ${week.month} },\n`
  })

  jsContent += `]\n\nexport default weeklyReadingSchedule${year}\n`

  const outputPath = path.join(__dirname, `../data/weekly-reading-schedule-${year}.js`)
  fs.writeFileSync(outputPath, jsContent, 'utf8')

  console.log(`✅ Generated ${schedule.length} weekly entries`)
  console.log(`💾 Saved to: ${outputPath}`)
  console.log('\n🎉 Done!')
}

generateSchedule()
