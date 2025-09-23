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

export default app;
