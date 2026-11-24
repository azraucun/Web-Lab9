// All fetch calls live here. Components never build URLs or call fetch.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Shared helper: JSON header only when there is a body, checks response.ok,
// turns the server's { error } into an Error, handles 204 (no body).
async function request(path, { body, ...options } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }
  return data;
}

// Builds the query string safely (URLSearchParams encodes the values)
export function getBooks(filters, signal) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '') {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return request(`/api/books${query ? `?${query}` : ''}`, { signal });
}

export const getStats = () => request('/api/stats');
export const createBook = (book) => request('/api/books', { method: 'POST', body: book });
export const replaceBook = (id, book) => request(`/api/books/${id}`, { method: 'PUT', body: book });
export const updateBook = (id, changes) =>
  request(`/api/books/${id}`, { method: 'PATCH', body: changes });
export const deleteBook = (id) => request(`/api/books/${id}`, { method: 'DELETE' });