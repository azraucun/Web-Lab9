import express from 'express';
import cors from 'cors';
import { parseId, isPlainObject, buildBook, validateBook, parseListQuery } from './validate.js';
import {
  getAllBooks,
  getBookById,
  findDuplicate,
  createBook,
  replaceBook,
  deleteBook,
} from './booksStore.js';

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// --- Middleware (before the routes) ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(cors({ origin: CLIENT_ORIGIN })); // only our client's exact origin, not "*"
app.use(express.json());

// --- Helpers ---
function compareBooks(a, b, field) {
  if (field === 'title' || field === 'author') {
    return a[field].localeCompare(b[field]);
  }
  return a[field] - b[field];
}

// --- Routes ---

// GET /api/books -> list with filter, search, sort and pagination
app.get('/api/books', async (req, res) => {
  const { error, options } = parseListQuery(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  const books = await getAllBooks();

  // filter() always returns a NEW array, so the stored array is never changed
  const filtered = books.filter((book) => {
    if (options.genre !== undefined && book.genre !== options.genre) return false;
    if (options.read !== undefined && book.read !== options.read) return false;
    if (
      options.q &&
      !book.title.toLowerCase().includes(options.q) &&
      !book.author.toLowerCase().includes(options.q)
    ) {
      return false;
    }
    return true;
  });

  // sort a COPY; books without a rating always go last
  const sorted = [...filtered].sort((a, b) => {
    if (options.sort === 'rating') {
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
    }
    const result = compareBooks(a, b, options.sort);
    return options.order === 'desc' ? -result : result;
  });

  const start = (options.page - 1) * options.limit;
  res.json(sorted.slice(start, start + options.limit));
});

// GET /api/books/:id -> one book
app.get('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: `No book with id ${id}` });
  }

  res.json(book);
});

// POST /api/books -> create a book from a complete body
app.post('/api/books', async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const book = buildBook(req.body);
  const validationError = validateBook(book);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const duplicate = await findDuplicate(book.title, book.author);
  if (duplicate) {
    return res.status(409).json({
      error: `A book with this title and author already exists (id ${duplicate.id})`,
    });
  }

  const created = await createBook(book);
  res.status(201).location(`/api/books/${created.id}`).json(created);
});

// PUT /api/books/:id -> replace a book with a complete body
app.put('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: `No book with id ${id}` });
  }

  const book = buildBook(req.body);
  const validationError = validateBook(book);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const duplicate = await findDuplicate(book.title, book.author, id);
  if (duplicate) {
    return res.status(409).json({
      error: `A book with this title and author already exists (id ${duplicate.id})`,
    });
  }

  const updated = await replaceBook(id, book);
  res.json(updated);
});

// PATCH /api/books/:id -> change only the fields that were sent
app.patch('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: `No book with id ${id}` });
  }

  const merged = buildBook({ ...existing, ...req.body }); // merge, then validate
  const validationError = validateBook(merged);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const duplicate = await findDuplicate(merged.title, merged.author, id);
  if (duplicate) {
    return res.status(409).json({
      error: `A book with this title and author already exists (id ${duplicate.id})`,
    });
  }

  const updated = await replaceBook(id, merged);
  res.json(updated);
});

// DELETE /api/books/:id -> 204 with no body
app.delete('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const deleted = await deleteBook(id);
  if (!deleted) {
    return res.status(404).json({ error: `No book with id ${id}` });
  }

  res.status(204).end();
});

// GET /api/stats -> computed from the current data on every request
app.get('/api/stats', async (req, res) => {
  const books = await getAllBooks();
  const readCount = books.filter((book) => book.read).length;
  const rated = books.filter((book) => book.rating !== null);
  const ratingSum = rated.reduce((sum, book) => sum + book.rating, 0);
  const averageRating =
    rated.length === 0 ? null : Math.round((ratingSum / rated.length) * 10) / 10;
  const byGenre = books.reduce(
    (counts, book) => ({ ...counts, [book.genre]: (counts[book.genre] ?? 0) + 1 }),
    {}
  );

  res.json({
    total: books.length,
    read: readCount,
    unread: books.length - readCount,
    averageRating,
    byGenre,
  });
});

// GET /api/crash -> deliberately throws inside an async handler (documented in README)
app.get('/api/crash', async () => {
  throw new Error('Deliberate crash to test the error handler');
});

// --- 404 for any unknown /api path (after all routes) ---
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Error-handling middleware (4 parameters, last) ---
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${CLIENT_ORIGIN}`);
});