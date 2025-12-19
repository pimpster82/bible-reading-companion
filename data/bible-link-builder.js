/**
 * Bible Link Builder for JW.org
 * Generates links that open JW Library app if available, otherwise jw.org website
 */

import bibleBooks from './bible-books-database.json';

/**
 * Build a JW.org finder link for a Bible reading
 * @param {number} bookNumber - Bible book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (optional, defaults to startChapter)
 * @param {string} locale - Language code (default: 'E' for English)
 * @returns {string} - JW.org finder URL
 */
export function buildBibleLink(bookNumber, startChapter, endChapter = null, locale = 'E') {
  // If no end chapter specified, use start chapter
  if (endChapter === null) {
    endChapter = startChapter;
  }

  // Format: BBCCCVVV (Book, Chapter, Verse)
  const bookStr = bookNumber.toString().padStart(2, '0');
  const startChapterStr = startChapter.toString().padStart(3, '0');
  const endChapterStr = endChapter.toString().padStart(3, '0');
  
  // Use 001 for start verse, 999 for end verse (auto-adjusts to last verse)
  const start = `${bookStr}${startChapterStr}001`;
  const end = `${bookStr}${endChapterStr}999`;
  
  return `https://www.jw.org/finder?srcid=jwlshare&wtlocale=${locale}&prefer=lang&bible=${start}-${end}&pub=nwtsty`;
}

/**
 * Build a link from book name and chapters
 * @param {string} bookName - Name of the Bible book (e.g., "Genesis", "Revelation")
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (optional)
 * @param {string} locale - Language code (default: 'E' for English)
 * @returns {string|null} - JW.org finder URL or null if book not found
 */
export function buildBibleLinkByName(bookName, startChapter, endChapter = null, locale = 'E') {
  const book = bibleBooks.books.find(
    b => b.name.toLowerCase() === bookName.toLowerCase() || 
         b.abbreviation.toLowerCase() === bookName.toLowerCase()
  );
  
  if (!book) {
    console.error(`Book "${bookName}" not found`);
    return null;
  }
  
  return buildBibleLink(book.number, startChapter, endChapter, locale);
}

/**
 * Get book information by name or number
 * @param {string|number} identifier - Book name or number
 * @returns {object|null} - Book object or null if not found
 */
export function getBookInfo(identifier) {
  if (typeof identifier === 'number') {
    return bibleBooks.books.find(b => b.number === identifier) || null;
  }
  
  return bibleBooks.books.find(
    b => b.name.toLowerCase() === identifier.toLowerCase() || 
         b.abbreviation.toLowerCase() === identifier.toLowerCase()
  ) || null;
}

/**
 * Parse a reading string like "Genesis 1-3" or "Rev 21-22"
 * @param {string} readingString - Reading in format "BookName Chapter-Chapter"
 * @param {string} locale - Language code
 * @returns {string|null} - JW.org finder URL or null if invalid format
 */
export function parseReadingString(readingString, locale = 'E') {
  // Match patterns like "Genesis 1-3", "Rev 21-22", "Psalms 1"
  const match = readingString.match(/^(.+?)\s+(\d+)(?:-(\d+))?$/);
  
  if (!match) {
    console.error(`Invalid reading format: "${readingString}"`);
    return null;
  }
  
  const [, bookName, startChapter, endChapter] = match;
  return buildBibleLinkByName(
    bookName.trim(), 
    parseInt(startChapter), 
    endChapter ? parseInt(endChapter) : null,
    locale
  );
}

// Example usage and tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Bible Link Builder Examples ===\n');
  
  console.log('Revelation 21-22:');
  console.log(buildBibleLink(66, 21, 22));
  console.log();
  
  console.log('Isaiah 1-2:');
  console.log(buildBibleLink(23, 1, 2));
  console.log();
  
  console.log('By name - Genesis 1-3:');
  console.log(buildBibleLinkByName('Genesis', 1, 3));
  console.log();
  
  console.log('By abbreviation - Ps 23:');
  console.log(buildBibleLinkByName('Ps', 23));
  console.log();
  
  console.log('Parsing string "Rev 21-22":');
  console.log(parseReadingString('Rev 21-22'));
  console.log();
  
  console.log('Parsing string "Proverbs 20":');
  console.log(parseReadingString('Proverbs 20'));
}
