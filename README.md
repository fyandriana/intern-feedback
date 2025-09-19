# Feedback Module

This module implements a simple feedback system

- **Stack**: Node.js/Express, SQLite, React
- **Folders**: `db/`, `server/`, `client/`
- **Goal**: Users can submit feedback (name, email, message); an admin view lists recent feedback.

---

## API Contract

### Base
- Base URL (dev): `http://localhost:3000`
- All requests/responses are JSON (`Content-Type: application/json`).
- CORS: allow your React dev origin (e.g., `http://localhost:5173` for Vite or `http://localhost:3000` for CRA).

---

### POST /api/feedback
Create a feedback entry.

**Request**
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "name": "Fy Andrianarison",
  "email": "fy@example.com",
  "message": "Loving the app!"
}
```
**Validation**
- `name`: string, required, 1–80 chars
- `email`: string, required, basic email format
- `message`: string, required, 1–1000 chars

**Responses**
- `201 Created`
```json
{ "id": 42, "created_at": "2025-09-19T15:04:05.000Z" }
```
- `400 Bad Request`
```json
{ "error": "ValidationError", "details": ["email invalid"] }
```
- `415 Unsupported Media Type`
```json
{ "error": "Expected application/json" }
```
- `500 Internal Server Error`
```json
{ "error": "Unexpected error" }
```

<!-- **Notes**
- Server may log the full payload; response keeps it minimal (id + created_at).
-->
---

### GET /api/feedback
Fetch recent feedback entries (for admin table).

**Query params**
- `limit` (optional, default `20`, max `100`)
- `offset` (optional, default `0`)
- Example: `/api/feedback?limit=20&offset=0`

**Response**
- `200 OK`
```json
[
  {
    "id": 42,
    "name": "Fy Andrianarison",
    "email": "fy@example.com",
    "message": "Loving the app!",
    "created_at": "2025-09-19T15:04:05.000Z"
  }
]
```

**Errors**
- `500 Internal Server Error`
```json
{ "error": "Unexpected error" }
```

---

### Data Model (SQLite)
```sql
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

---

### Acceptance Criteria
- `POST /api/feedback` returns `201` with `{id, created_at}` for valid input; rejects invalid with `400`.
- `GET /api/feedback` returns an array ordered by `created_at` DESC; respects `limit/offset`.
- JSON only; correct status codes; CORS enabled for the client port.
- Basic validation and a consistent error shape (`{ error, details? }`).

---

## Quick curl tests
```bash
# Health (once server scaffold exists)
curl -i http://localhost:3000/health

# Create feedback
curl -i -X POST http://localhost:3000/api/feedback   -H "Content-Type: application/json"   -d '{"name":"Fy","email":"fy@example.com","message":"Hi"}'

# List feedback
curl -i "http://localhost:3000/api/feedback?limit=10&offset=0"
```

---
