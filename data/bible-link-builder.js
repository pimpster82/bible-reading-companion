/**
 * Bible Link Builder for JW.org
 * Generates links that open JW Library app if available, otherwise jw.org website
 */

import bibleBooks from './bible-books-en.json';

/**
 * Map of language codes to JW.org locale paths
 * Format: { languageCode: { locale: 'wtlocale code', path: 'url path' } }
 */
const LANGUAGE_LOCALES = {
  de: { locale: 'de', path: '/de/bibliothek/bibel/studienbibel/buecher' },
  en: { locale: 'E', path: '/en/library/bible/study-bible/books' },
  es: { locale: 'es', path: '/es/biblioteca/biblia/biblia-estudio/libros' },
  it: { locale: 'it', path: '/it/biblioteca-digitale/bibbia/bibbia-per-lo-studio/libri' },
  fr: { locale: 'fr', path: '/fr/bibliothèque/bible/bible-d-etude/livres' },
};

/**
 * Map of book numbers to localized names on JW.org
 * Key is book number, values are the URL slugs for each language
 */
const LOCALIZED_BOOK_SLUGS = {
  1: { de: 'mose', en: 'genesis', es: 'génesis', it: 'genesi', fr: 'genèse' },
  2: { de: 'mose', en: 'exodus', es: 'éxodo', it: 'esodo', fr: 'exode' },
  3: { de: 'mose', en: 'leviticus', es: 'levítico', it: 'levitico', fr: 'lévitique' },
  4: { de: 'mose', en: 'numbers', es: 'números', it: 'numeri', fr: 'nombres' },
  5: { de: 'mose', en: 'deuteronomy', es: 'deuteronomio', it: 'deuteronomio', fr: 'deutéronome' },
  6: { de: 'josua', en: 'joshua', es: 'josué', it: 'giosuè', fr: 'josué' },
  7: { de: 'richter', en: 'judges', es: 'jueces', it: 'giudici', fr: 'juges' },
  8: { de: 'ruth', en: 'ruth', es: 'rut', it: 'rut', fr: 'ruth' },
  9: { de: 'samuel', en: '1-samuel', es: '1-samuel', it: '1-samuele', fr: '1-samuel' },
  10: { de: 'samuel', en: '2-samuel', es: '2-samuel', it: '2-samuele', fr: '2-samuel' },
  11: { de: 'korinther', en: '1-kings', es: '1-reyes', it: '1-re', fr: '1-rois' },
  12: { de: 'korinther', en: '2-kings', es: '2-reyes', it: '2-re', fr: '2-rois' },
  13: { de: 'chronik', en: '1-chronicles', es: '1-crónicas', it: '1-cronache', fr: '1-chroniques' },
  14: { de: 'chronik', en: '2-chronicles', es: '2-crónicas', it: '2-cronache', fr: '2-chroniques' },
  15: { de: 'esra', en: 'ezra', es: 'esdras', it: 'esdra', fr: 'esdras' },
  16: { de: 'nehemia', en: 'nehemiah', es: 'nehemías', it: 'neemia', fr: 'néhémie' },
  17: { de: 'hiob', en: 'job', es: 'job', it: 'giobbe', fr: 'job' },
  18: { de: 'psalm', en: 'psalms', es: 'salmos', it: 'salmi', fr: 'psaumes' },
  19: { de: 'sprueche', en: 'proverbs', es: 'proverbios', it: 'proverbi', fr: 'proverbes' },
  20: { de: 'prediger', en: 'ecclesiastes', es: 'eclesiastés', it: 'ecclesiaste', fr: 'ecclésiaste' },
  21: { de: 'hohelied', en: 'song-of-solomon', es: 'cantares', it: 'cantico', fr: 'cantique-des-cantiques' },
  22: { de: 'jesaja', en: 'isaiah', es: 'isaías', it: 'isaia', fr: 'isaïe' },
  23: { de: 'jesaja', en: 'isaiah', es: 'isaías', it: 'isaia', fr: 'isaïe' },
  24: { de: 'jeremia', en: 'jeremiah', es: 'jeremías', it: 'geremia', fr: 'jérémie' },
  25: { de: 'klagelieder', en: 'lamentations', es: 'lamentaciones', it: 'lamentazioni', fr: 'lamentations' },
  26: { de: 'ezechiel', en: 'ezekiel', es: 'ezequiel', it: 'ezechiele', fr: 'ézéchiel' },
  27: { de: 'daniel', en: 'daniel', es: 'daniel', it: 'daniele', fr: 'daniel' },
  28: { de: 'hosea', en: 'hosea', es: 'oseas', it: 'osea', fr: 'osée' },
  29: { de: 'joel', en: 'joel', es: 'joel', it: 'gioele', fr: 'joël' },
  30: { de: 'amos', en: 'amos', es: 'amós', it: 'amos', fr: 'amos' },
  31: { de: 'obadja', en: 'obadiah', es: 'abdías', it: 'abdia', fr: 'abdias' },
  32: { de: 'jona', en: 'jonah', es: 'jonás', it: 'giona', fr: 'jonas' },
  33: { de: 'micha', en: 'micah', es: 'miqueas', it: 'michea', fr: 'michée' },
  34: { de: 'nahum', en: 'nahum', es: 'nahúm', it: 'naum', fr: 'nahum' },
  35: { de: 'habakuk', en: 'habakkuk', es: 'habacuc', it: 'abacuc', fr: 'habacuc' },
  36: { de: 'zefanja', en: 'zephaniah', es: 'sofonías', it: 'sofonia', fr: 'sophonie' },
  37: { de: 'haggai', en: 'haggai', es: 'hageo', it: 'aggeo', fr: 'aggée' },
  38: { de: 'sacharja', en: 'zechariah', es: 'zacarías', it: 'zaccaria', fr: 'zacharie' },
  39: { de: 'maleachi', en: 'malachi', es: 'malaquías', it: 'malachia', fr: 'malachie' },
  40: { de: 'matthaeus', en: 'matthew', es: 'mateo', it: 'matteo', fr: 'matthieu' },
  41: { de: 'markus', en: 'mark', es: 'marcos', it: 'marco', fr: 'marc' },
  42: { de: 'lukas', en: 'luke', es: 'lucas', it: 'luca', fr: 'luc' },
  43: { de: 'johannes', en: 'john', es: 'juan', it: 'giovanni', fr: 'jean' },
  44: { de: 'apostelgeschichte', en: 'acts', es: 'hechos', it: 'atti', fr: 'actes' },
  45: { de: 'romer', en: 'romans', es: 'romanos', it: 'romani', fr: 'romains' },
  46: { de: 'korinther', en: '1-corinthians', es: '1-corintios', it: '1-corinzi', fr: '1-corinthiens' },
  47: { de: 'korinther', en: '2-corinthians', es: '2-corintios', it: '2-corinzi', fr: '2-corinthiens' },
  48: { de: 'galater', en: 'galatians', es: 'gálatas', it: 'galati', fr: 'galates' },
  49: { de: 'epheser', en: 'ephesians', es: 'efesios', it: 'efesini', fr: 'éphésiens' },
  50: { de: 'philipper', en: 'philippians', es: 'filipenses', it: 'filippesi', fr: 'philippiens' },
  51: { de: 'kolosser', en: 'colossians', es: 'colosenses', it: 'colossesi', fr: 'colossiens' },
  52: { de: 'thessalonicher', en: '1-thessalonians', es: '1-tesalonicenses', it: '1-tessalonicesi', fr: '1-thessaloniciens' },
  53: { de: 'thessalonicher', en: '2-thessalonians', es: '2-tesalonicenses', it: '2-tessalonicesi', fr: '2-thessaloniciens' },
  54: { de: 'timotheus', en: '1-timothy', es: '1-timoteo', it: '1-timoteo', fr: '1-timothée' },
  55: { de: 'timotheus', en: '2-timothy', es: '2-timoteo', it: '2-timoteo', fr: '2-timothée' },
  56: { de: 'titus', en: 'titus', es: 'tito', it: 'tito', fr: 'tite' },
  57: { de: 'philemon', en: 'philemon', es: 'filemón', it: 'filemone', fr: 'philémon' },
  58: { de: 'hebraer', en: 'hebrews', es: 'hebreos', it: 'ebrei', fr: 'hébreux' },
  59: { de: 'jakobus', en: 'james', es: 'santiago', it: 'giacomo', fr: 'jacques' },
  60: { de: 'petrus', en: '1-peter', es: '1-pedro', it: '1-pietro', fr: '1-pierre' },
  61: { de: 'petrus', en: '2-peter', es: '2-pedro', it: '2-pietro', fr: '2-pierre' },
  62: { de: 'johannes', en: '1-john', es: '1-juan', it: '1-giovanni', fr: '1-jean' },
  63: { de: 'johannes', en: '2-john', es: '2-juan', it: '2-giovanni', fr: '2-jean' },
  64: { de: 'johannes', en: '3-john', es: '3-juan', it: '3-giovanni', fr: '3-jean' },
  65: { de: 'judas', en: 'jude', es: 'judas', it: 'giuda', fr: 'jude' },
  66: { de: 'offenbarung', en: 'revelation', es: 'apocalipsis', it: 'apocalisse', fr: 'apocalypse' },
};

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
 * Build a language-specific JW.org web link
 * @param {number} bookNumber - Bible book number (1-66)
 * @param {number} chapter - Chapter number
 * @param {number} startVerse - Starting verse (optional, defaults to 1)
 * @param {number} endVerse - Ending verse (optional, defaults to end of chapter)
 * @param {string} languageCode - Language code (de, en, es, it, fr) - defaults to current language or 'en'
 * @returns {string} - JW.org web link for the specified language
 */
export function buildLanguageSpecificWebLink(bookNumber, chapter, startVerse = 1, endVerse = null, languageCode = null) {
  // Get current language from localStorage if not specified
  if (!languageCode) {
    languageCode = localStorage.getItem('app_language') || 'en';
  }

  // Get locale info, default to English if language not found
  const localeInfo = LANGUAGE_LOCALES[languageCode] || LANGUAGE_LOCALES['en'];

  // Get localized book slug for this language
  const bookSlugs = LOCALIZED_BOOK_SLUGS[bookNumber];
  if (!bookSlugs) {
    console.error(`Book number ${bookNumber} not found in localized slugs`);
    return null;
  }

  // Use the slug for the current language, fallback to English if not available
  const bookSlug = bookSlugs[languageCode] || bookSlugs['en'];

  // Format verse range
  const startVerseStr = String(startVerse).padStart(3, '0');
  const endVerseStr = endVerse ? String(endVerse).padStart(3, '0') : '999'; // 999 auto-adjusts to end of chapter
  const bibleCode = `v${String(bookNumber).padStart(2, '0')}${String(chapter).padStart(3, '0')}`;

  // Build the URL with the correct language path and localized book name
  // Example: https://www.jw.org/de/bibliothek/bibel/studienbibel/buecher/jesaja/9/#v23009001-v23009021
  const baseUrl = `https://www.jw.org${localeInfo.path}`;
  const url = `${baseUrl}/${bookSlug}/${chapter}/#${bibleCode}${startVerseStr}-${bibleCode}${endVerseStr}`;

  return url;
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
