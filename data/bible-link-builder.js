/**
 * Bible Link Builder for JW.org
 * Generates links that open JW Library app if available, otherwise jw.org website
 */

import bibleBooks from './bible-books-en.json';

/**
 * Build a JW.org finder link for a Bible reading
 * @param {number} bookNumber - Bible book number (1-66)
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter (optional, defaults to startChapter)
 * @param {string} locale - Language code (default: 'E' for English)
 * @param {number} startVerse - Starting verse (optional, defaults to 1)
 * @returns {string} - JW.org finder URL with deep link fallback for JW Library app
 */
export function buildBibleLink(bookNumber, startChapter, endChapter = null, locale = 'E', startVerse = 1) {
  // If no end chapter specified, use start chapter
  if (endChapter === null) {
    endChapter = startChapter;
  }

  // Format: BBCCCVVV (Book, Chapter, Verse)
  const bookStr = bookNumber.toString().padStart(2, '0');
  const startChapterStr = startChapter.toString().padStart(3, '0');
  const endChapterStr = endChapter.toString().padStart(3, '0');
  const startVerseStr = startVerse.toString().padStart(3, '0');

  // Use specified start verse, 999 for end verse (auto-adjusts to last verse)
  const start = `${bookStr}${startChapterStr}${startVerseStr}`;
  const end = `${bookStr}${endChapterStr}999`;

  // Primary link for JW Library app deep linking
  const finderLink = `https://www.jw.org/finder?srcid=jwlshare&wtlocale=${locale}&prefer=lang&bible=${start}-${end}&pub=nwtsty`;

  // Return finder link (browser will use it, and JW Library app will intercept if available)
  return finderLink;
}

/**
 * Build a JW Library deep link (jwlibrary://) for direct app opening
 * @param {number} bookNumber - Bible book number (1-66)
 * @param {number} chapter - Chapter number
 * @param {number} verse - Starting verse (optional, defaults to 1)
 * @returns {string} - JW Library deep link
 */
export function buildJWLibraryDeepLink(bookNumber, chapter, verse = 1) {
  const bookStr = bookNumber.toString().padStart(2, '0');
  const chapterStr = chapter.toString().padStart(3, '0');
  const verseStr = verse.toString().padStart(3, '0');

  const reference = `${bookStr}${chapterStr}${verseStr}`;
  return `jwlibrary://bible/${reference}`;
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
