
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DELAY_MS = 100;

const seedBooks = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'fantasy', read: true, rating: 5 },
  { id: 2, title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'fiction', read: true, rating: 4 },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: true, rating: null },
  { id: 4, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: false, rating: null },
  { id: 5, title: 'Educated', author: 'Tara Westover', year: 2018, genre: 'non-fiction', read: false, rating: null },
  { id: 6, title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', year: 1997, genre: 'fantasy', read: true, rating: 3 },
  { id: 7, title: '1984', author: 'George Orwell', year: 1949, genre: 'fiction', read: false, rating: null },
];

let books = seedBooks;
let nextId = seedBooks.length + 1;

export async function getAllBooks() {
  await sleep(DELAY_MS);
  return books;
}

export async function getBookById(id) {
  await sleep(DELAY_MS);
  return books.find((book) => book.id === id) ?? null;
}

export async function findDuplicate(title, author, ignoreId = null) {
  await sleep(DELAY_MS);
  const titleLower = title.toLowerCase();
  const authorLower = author.toLowerCase();
  return (
    books.find(
      (book) =>
        book.id !== ignoreId &&
        book.title.toLowerCase() === titleLower &&
        book.author.toLowerCase() === authorLower
    ) ?? null
  );
}

export async function createBook(data) {
  await sleep(DELAY_MS);
  const newBook = { id: nextId, ...data };
  nextId += 1;
  books = [...books, newBook]; 
  return newBook;
}

// Replaces the book with this id by a new object. Returns the new book, or null if not found.
// Used by both PUT (complete body) and PATCH (merged body).
export async function replaceBook(id, data) {
  await sleep(DELAY_MS);
  const exists = books.some((book) => book.id === id);
  if (!exists) {
    return null;
  }
  const updated = { id, ...data };
  books = books.map((book) => (book.id === id ? updated : book)); // new array
  return updated;
}

export async function deleteBook(id) {
  await sleep(DELAY_MS);
  const exists = books.some((book) => book.id === id);
  if (!exists) {
    return false;
  }
  books = books.filter((book) => book.id !== id); // new array
  return true;
}