import path from "node:path";
import Database from "better-sqlite3";

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { DB_PATH, run, list, getDb, pingDb } from './src/db/connection.js';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors()); // dev: open; tighten in prod
app.use(express.json({ limit: '64kb' }));

// Touch the DB once so failures happen early
getDb();

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'feedback-api', db: DB_PATH, time: new Date().toISOString() });
});

/**
 * create new feedback
 */
app.post('/api/feedback', (req, res) => {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'name, email, and message are required' });
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    if (!emailOk) return res.status(400).json({ error: 'invalid email format' });

    try {
        const info = run(
            `INSERT INTO feedback (name, email, message) VALUES (@name, @email, @message)`,
            { name, email, message }
        );
        return res.status(201).json({
            id: info.lastInsertRowid, name, email, message,
            created_at: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[POST /api/feedback] DB error:', err);
        res.status(500).json({ error: 'database error' });
    }
});

/**
 * retrieve customer feedbacks
 */
app.get('/api/feedback', (req, res) => {
    const rawLimit  = Number.parseInt(req.query.limit, 10);
    const rawOffset = Number.parseInt(req.query.offset, 10);

    const limit  = Number.isFinite(rawLimit)  && rawLimit >= 1 ? Math.min(rawLimit, 200) : 50;
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

    try {
        const rows = list('feedback', {
            select: 'id,name,email,message,created_at',
            orderBy: 'datetime(created_at) DESC, id DESC',
            limit, offset,
        });
        res.json({ items: rows, limit, offset, count: rows.length, next_offset: offset + rows.length });
    } catch (err) {
        console.error('[GET /api/feedback] DB error:', err);
        res.status(500).json({ error: 'database error' });
    }
});


// 404 for unknown API routes
app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' });
    res.status(404).send('Not found');
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`API on http://localhost:${PORT}`);
        console.log(`DB: ${DB_PATH}`);
    });
}

export default app;
