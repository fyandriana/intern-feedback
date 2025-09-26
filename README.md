# Feedback Module

This module implements a simple feedback system

- **Stack**: Node.js/Express, SQLite, React
- **Folders**: `server/`, `client/`, `server/src/db`
- **Goal**: Users can submit feedback (name, email, message); an admin view lists recent feedback.

---

## API Contract

### Base
- Base URL (dev): `http://localhost:3001`
- All requests/responses are JSON (`Content-Type: application/json`).
- CORS: allow your React dev origin (e.g., `http://localhost:5173` for Vite or `http://localhost:3001` for CRA).

---

### POST /api/feedback
Create a feedback entry.

**Request**
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "name": "Bob Junior",
  "email": "user@example.com",
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
- `500 Internal Server Error`
```json
{ "error": "Unexpected error" }
```

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
    "name": "Bob Junior",
    "email": "user@example.com",
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
  created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
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
curl -i http://localhost:3001/api/health

# Create feedback
curl -i -X POST http://localhost:3001/api/feedback   -H "Content-Type: application/json"   -d '{"name":"Fy","email":"fy@example.com","message":"Hi"}'

# List feedback
curl -i "http://localhost:3001/api/feedback?limit=10&offset=0"
```

---

# Database Setup

This project uses **SQLite** for persistence.  
All SQL is kept in `server/src/db/schema.sql` (for schema) and `server/src/db/seed.sql` (for sample data).

---

## 1. Install dependencies
```bash
npm install
```

This pulls in [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3), which the init/seed scripts use.

---

## 2. Initialize the database
```bash
npm run db:init
```

- Creates `server/src/db/feedback.db` (if missing).  
- Applies all SQL statements from `server/src/db/schema.sql`.  
- Sets `foreign_keys = ON` and `journal_mode = WAL`.  
- Creates the `feedback` table and indexes.

---

## 3. Seed the database (optional)
```bash
npm run db:seed
```

- Executes `server/src/db/seed.sql` against `server/src/db/feedback.db`.  
- Inserts sample feedback rows you can view in the admin panel or via SQLiteStudio.

---

## 4. Reset the database (dangerous – deletes everything)
```bash
npm run db:reset
```

- Removes the existing `server/src/db/feedback.db`.  
- Runs `db:init` and `db:seed` again.  
- Useful during development if you want a fresh start.

---

## 5. Inspect with SQLiteStudio
1. Open [SQLiteStudio](https://sqlitestudio.pl/) (v3.4.8 or later).  
2. Go to **Database → Add a database**.  
3. Choose the file: `server/src/db/feedback.db`.  
4. You can now view tables (`feedback`) and data, or run queries.

---

✅ That’s it! Your database is ready for the backend API to connect.


# How to Test the API with Postman

This project provides a Postman collection and environment to make testing the feedback API easy.
## 1. Import Postman Files
- Open Postman.
- Click **Import**.
- Select the following files from the `postman/` folder:
    - `feedback.collection.json`
    - `feedback.env.json`

## 2. Select Environment
- In the top-right environment dropdown, choose **Local**.

## 3. Verify Environment Variables
- `base_url` → defaults to `http://localhost:3001`
- `limit` → defaults to `5`

Adjust if your API runs on a different port.

## 4. Run Requests
The collection includes:
- **GET** `{{base_url}}/api/health` → health check
- **POST** `{{base_url}}/api/feedback` → create new feedback
- **GET** `{{base_url}}/api/feedback?limit={{limit}}` → list feedback

## 5. Run Tests
- Open the **Collection Runner** in Postman.
- Select **Intern Feedback API** and environment **Local**.
- Click **Run**.
- Postman will execute all requests and show test results.

---

> ✅ Ensure your API server is running (e.g., `npm run start` in `/server`) before executing the Postman tests.

# Test Api using command under server folder
```bash
# test api
npm run test:api

# generate html report
npm run test:api:html
```
