import express from 'express';
import cors from 'cors';
import { getAllBooks, getBookById } from './booksStore.js';
import { parseId } from './validate.js';


const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({ origin: CLIENT_ORIGIN }));

app.use(express.json());

app.get('/api/books', async (req, res) => {
  const books = await getAllBooks();
  res.json(books);
});

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


app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${CLIENT_ORIGIN}`);
});