import { useEffect, useState } from 'react';
import * as api from './api/books.js';
import BookForm from './components/BookForm.jsx';
import Filters from './components/Filters.jsx';
import BookList from './components/BookList.jsx';
import StatsPanel from './components/StatsPanel.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null);

  // New list from the server whenever a control changes; old requests are cancelled
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api
      .getBooks(filters, controller.signal)
      .then((data) => setBooks(Array.isArray(data) ? data : [])) 
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [filters]);

  function refreshStats() {
    api.getStats().then(setStats).catch(() => setStats(null));
  }

  useEffect(() => {
    refreshStats();
  }, []);

  // The screen changes only AFTER the server confirms; lists are always new arrays
  async function handleSave(book) {
    if (editing) {
      const updated = await api.replaceBook(editing.id, book); // PUT
      setBooks((previous) => previous.map((b) => (b.id === updated.id ? updated : b)));
      setEditing(null);
    } else {
      const created = await api.createBook(book); // POST
      setBooks((previous) => [...previous, created]);
    }
    refreshStats();
  }

  async function runAction(action) {
    setActionError(null);
    try {
      await action();
      refreshStats();
    } catch (err) {
      setActionError(err.message);
    }
  }

  function replaceInList(updated) {
    setBooks((previous) => previous.map((b) => (b.id === updated.id ? updated : b)));
  }

  const handleToggleRead = (book) =>
    runAction(async () => {
      const changes = book.read ? { read: false, rating: null } : { read: true };
      replaceInList(await api.updateBook(book.id, changes)); // PATCH
    });

  const handleRate = (book, rating) =>
    runAction(async () => {
      replaceInList(await api.updateBook(book.id, { rating })); // PATCH
    });

  const handleDelete = (book) =>
    runAction(async () => {
      await api.deleteBook(book.id);
      setBooks((previous) => previous.filter((b) => b.id !== book.id));
      if (editing?.id === book.id) {
        setEditing(null);
      }
    });

  let content;
  if (loading) {
    content = <p>Loading books...</p>;
  } else if (error) {
    content = <p className="error">Could not load books: {error}</p>;
  } else if (books.length === 0) {
    content = <p>No books found.</p>;
  } else {
    content = (
      <BookList books={books} onEdit={setEditing} onToggleRead={handleToggleRead} onRate={handleRate} onDelete={handleDelete} />
    );
  }

  return (
    <main className="app">
      <h1>Reading List</h1>
      <StatsPanel stats={stats} />

      <section>
        <h2>{editing ? `Edit "${editing.title}"` : 'Add a book'}</h2>
        <BookForm key={editing?.id ?? 'new'} initialBook={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      </section>

      <section>
        <h2>Books</h2>
        <Filters filters={filters} onChange={setFilters} />
        {actionError && <p className="error">{actionError}</p>}
        {content}
      </section>
    </main>
  );
}