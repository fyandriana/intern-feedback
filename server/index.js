import path from "node:path";
import Database from "better-sqlite3";

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { DB_PATH, run, list, getDb } from './src/db/connection.js';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors()); // dev: open; tighten in prod
app.use(express.json({ limit: '64kb' }));

// Touch the DB once so failures happen early
getDb();

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'feedback-api', db: DB_PATH, time: new Date().toISOString() });
});

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

app.get('/api/feedback', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    try {
        const rows = list('feedback', {
            select: 'id,name,email,message,created_at',
            orderBy: 'datetime(created_at) DESC, id DESC',
            limit,
        });
        res.json(rows);
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
