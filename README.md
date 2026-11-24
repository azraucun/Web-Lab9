# Assignment 9 — Reading List (Full-Stack)

A REST API with Node.js and Express 5 (ES modules) and a React client built with Vite.
The server keeps books in memory; the client lists, searches, filters, sorts, adds, edits, rates and deletes them and shows statistics.

Author: Azra Ucun

## Install and run

**Server** (port from `PORT`, default `3000`; allowed client origin from `CLIENT_ORIGIN`, default `http://localhost:5173`):

```bash
cd server
npm install
npm run dev        # node --watch server.js
# or: npm start    # node server.js
# example: PORT=4000 CLIENT_ORIGIN=http://localhost:5173 npm start
```

**Client** (API address from `VITE_API_URL`, see `client/.env.example`):

```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev             # http://localhost:5173
```

No Vite proxy is used: the server sends the CORS headers itself with the `cors` package, restricted to `CLIENT_ORIGIN`.

## File organization

```
/Web-Lab9
 ├─ server/
 │   ├─ server.js        middleware, routes, 404 for /api, error handler
 │   ├─ booksStore.js    in-memory data, async functions, immutable updates
 │   ├─ validate.js      id, book and query string validation (hand-written)
 │   ├─ package.json
 │   └─ package-lock.json
 ├─ client/
 │   ├─ src/
 │   │   ├─ api/books.js       all fetch calls + shared request helper
 │   │   ├─ components/        BookForm, Filters, BookList, StatsPanel
 │   │   ├─ App.jsx            state, AbortController, handlers
 │   │   └─ main.jsx
 │   ├─ .env.example
 │   ├─ index.html
 │   └─ package.json
 ├─ .gitignore           node_modules/, .env, dist/
 └─ README.md
```

## Error handling

- Unknown `/api` paths: `404` with `{ "error": "Not found" }`.
- Malformed JSON body: `400` with `{ "error": "Request body is not valid JSON" }` (handled in the error middleware by checking `err.type === 'entity.parse.failed'`).
- Error middleware with four parameters, registered last: logs the error with `console.error` and answers `500` with `{ "error": "Something went wrong" }`, without a stack trace.
- **`GET /api/crash`** is kept on purpose: it throws inside an `async` handler. Express 5 forwards the rejected promise to the error middleware, so the answer is a JSON `500`.

## Testing evidence (`curl --include`)

<!-- curl-evidence.txt içeriğini aşağıdaki ``` işaretlerinin arasına yapıştır -->

```
PASTE HERE
```

## Preflight (`OPTIONS`) in the Network tab

<!-- Network sekmesinde gördüğün şeye göre kontrol et / düzelt -->

When I add a book from the React page, the Network tab shows two requests to `/api/books`.
The first one is an `OPTIONS` preflight, because the request is cross-origin (`5173` → `3000`) and has a `Content-Type: application/json` header.
Its response has status `204` and these headers:
`Access-Control-Allow-Origin: http://localhost:5173`,
`Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`,
`Access-Control-Allow-Headers: content-type`.
After that the real `POST` is sent and returns `201`.

## Reasoning questions

### 1. Parameters
<!-- kendi cümlelerin -->

### 2. Body parsing
<!-- deney: express.json() route'ların altına -->

### 3. One response
<!-- deney: return silindi -->

### 4. PUT and PATCH
<!-- kendi cümlelerin -->

### 5. CORS
<!-- deney: yanlış CLIENT_ORIGIN -->

### 6. Validation
<!-- kendi cümlelerin -->

### 7. State
<!-- deney: sunucuyu yeniden başlat -->

## Self-study notes

- **`URLSearchParams`**: `params.set(key, value)` and `params.toString()` build the query string and encode special characters (spaces, `&`, non-English letters), so a search like `harry & co` cannot break the URL. Used in `getBooks` in `src/api/books.js`.
- **`localeCompare`**: `a.title.localeCompare(b.title)` returns a negative, zero or positive number, which is exactly what `sort` needs for alphabetical order. Used for `sort=title` and `sort=author`; numbers are compared with `a - b`. I always sort a copy (`[...filtered].sort(...)`).
- **`import.meta.env` in Vite**: Vite only exposes variables whose name starts with `VITE_` to the browser code, so secrets in `.env` are not shipped by accident. I read `import.meta.env.VITE_API_URL` and documented it in `.env.example`.
- **`204` in Express 5**: `res.status(204).end()` sends the status without a body. Sending JSON with a `204` would be wrong because a 204 response must have no body.
- **Cancelling `fetch`**: an `AbortController` signal is passed to `fetch`; the `useEffect` cleanup calls `controller.abort()`, so an old request cannot overwrite a newer list. The cancelled `fetch` rejects with an error named `AbortError`, which I ignore instead of showing it.
- **Repeated query parameters**: Express 5 turns `?genre=a&genre=b` into an array, so `validate.js` returns `400` when a query value is an array.

## Challenges

- I pasted the new `import` lines next to the old ones, so the same names were imported twice and the server did not start.
- I pasted the `PUT` and `PATCH` routes inside the `POST` handler, which broke the braces; I fixed it by rebuilding `server.js` in the right order.
- `npm run dev` said `Missing script: "dev"` because I ran it in the root folder instead of `server/`.