import { useState } from 'react';

export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const EMPTY_FORM = { title: '', author: '', year: '', genre: 'fiction', read: false, rating: '' };

export default function BookForm({ initialBook, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialBook ? { ...initialBook, rating: initialBook.rating ?? '' } : EMPTY_FORM
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value })); // new object
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave({
        title: form.title,
        author: form.author,
        year: Number(form.year),
        genre: form.genre,
        read: form.read,
        rating: form.rating === '' ? null : Number(form.rating),
      });
      if (!initialBook) {
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setError(err.message); // the server's error message
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <input placeholder="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
      <input placeholder="Author" value={form.author} onChange={(e) => update('author', e.target.value)} />
      <input type="number" placeholder="Year" value={form.year} onChange={(e) => update('year', e.target.value)} />
      <select value={form.genre} onChange={(e) => update('genre', e.target.value)}>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      <label>
        <input type="checkbox" checked={form.read} onChange={(e) => update('read', e.target.checked)} /> Read
      </label>
      <select value={form.rating} onChange={(e) => update('rating', e.target.value)}>
        <option value="">No rating</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button type="submit" disabled={busy}>{busy ? 'Saving...' : initialBook ? 'Save changes' : 'Add book'}</button>
      {initialBook && <button type="button" onClick={onCancel}>Cancel</button>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}