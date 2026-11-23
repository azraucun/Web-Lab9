
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