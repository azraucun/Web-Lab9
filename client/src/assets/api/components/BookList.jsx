export default function BookList({ books, onEdit, onToggleRead, onRate, onDelete }) {
  return (
    <ul className="book-list">
      {books.map((book) => (
        <li key={book.id}>
          <strong>{book.title}</strong> by {book.author} ({book.year}), {book.genre}
          <label>
            <input type="checkbox" checked={book.read} onChange={() => onToggleRead(book)} /> Read
          </label>
          <select
            value={book.rating ?? ''}
            disabled={!book.read}
            onChange={(e) => onRate(book, e.target.value === '' ? null : Number(e.target.value))}
          >
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{'★'.repeat(n)}</option>
            ))}
          </select>
          <button onClick={() => onEdit(book)}>Edit</button>
          <button onClick={() => onDelete(book)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}