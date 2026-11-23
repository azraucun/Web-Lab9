
export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

export function parseId(value) {
  const id = Number(value);
  if (Number.isInteger(id) && id > 0 && String(id) === value) {
    return id;
  }
  return null;
}

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}


export function buildBook(input) {
  const trimIfString = (value) => (typeof value === 'string' ? value.trim() : value);

  return {
    title: trimIfString(input.title),
    author: trimIfString(input.author),
    year: input.year,
    genre: input.genre,
    read: input.read ?? false,
    rating: input.rating ?? null,
  };
}

export function validateBook(book) {
  const currentYear = new Date().getFullYear();

  if (typeof book.title !== 'string' || book.title.length < 1 || book.title.length > 100) {
    return 'title must be a string of 1 to 100 characters';
  }
  if (typeof book.author !== 'string' || book.author.length < 1 || book.author.length > 100) {
    return 'author must be a string of 1 to 100 characters';
  }
  if (!Number.isInteger(book.year) || book.year < 1000 || book.year > currentYear) {
    return `year must be an integer between 1000 and ${currentYear}`;
  }
  if (!GENRES.includes(book.genre)) {
    return `genre must be one of: ${GENRES.join(', ')}`;
  }
  if (typeof book.read !== 'boolean') {
    return 'read must be true or false';
  }
  if (book.rating !== null && (!Number.isInteger(book.rating) || book.rating < 1 || book.rating > 5)) {
    return 'rating must be an integer from 1 to 5, or null';
  }
  if (book.rating !== null && book.read === false) {
    return 'rating is only allowed when read is true';
  }
  return null;
}