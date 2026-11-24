import { GENRES } from './BookForm.jsx';

export default function Filters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value }); // new object
  }

  return (
    <div className="filters">
      <input type="search" placeholder="Search title or author" value={filters.q} onChange={(e) => update('q', e.target.value)} />
      <select value={filters.genre} onChange={(e) => update('genre', e.target.value)}>
        <option value="">All genres</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      <select value={filters.read} onChange={(e) => update('read', e.target.value)}>
        <option value="">Read and unread</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>
      <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
        <option value="">Sort: default</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="year">Year</option>
        <option value="rating">Rating</option>
      </select>
      <select value={filters.order} onChange={(e) => update('order', e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}