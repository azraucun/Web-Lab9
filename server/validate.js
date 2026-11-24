
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

const SORT_FIELDS = ['title', 'author', 'year', 'rating'];
const QUERY_NAMES = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];

// Checks the query string of GET /api/books. Returns { error } or { options }.
export function parseListQuery(query) {
  for (const name of QUERY_NAMES) {
    if (Array.isArray(query[name])) {
      return { error: `${name} must not be repeated` };
    }
  }

  const { genre, read, q, sort, order = 'asc', limit = '50', page = '1' } = query;

  if (genre !== undefined && !GENRES.includes(genre)) {
    return { error: `genre must be one of: ${GENRES.join(', ')}` };
  }
  if (read !== undefined && read !== 'true' && read !== 'false') {
    return { error: 'read must be true or false' };
  }
  if (sort !== undefined && !SORT_FIELDS.includes(sort)) {
    return { error: `sort must be one of: ${SORT_FIELDS.join(', ')}` };
  }
  if (order !== 'asc' && order !== 'desc') {
    return { error: 'order must be asc or desc' };
  }
  const limitNumber = Number(limit);
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 50) {
    return { error: 'limit must be an integer from 1 to 50' };
  }
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return { error: 'page must be a positive integer' };
  }

  return {
    options: {
      genre,
      read: read === undefined ? undefined : read === 'true',
      q: typeof q === 'string' ? q.trim().toLowerCase() : '',
      sort: sort ?? 'id',
      order,
      limit: limitNumber,
      page: pageNumber,
    },
  };
}