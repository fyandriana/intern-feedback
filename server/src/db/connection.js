// SQLite connection helper (ESM) for better-sqlite3
// Creates a singleton DB connection with sensible defaults.
// Loads .env automatically and supports DB_PATH override.
//
// Usage:
//   import { getDb, closeDb, DB_PATH } from '../db/connection.js';
//   const db = getDb();

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to a DB file beside this module: server/src/db/app.db
const DEFAULT_DB_PATH = path.resolve(__dirname, 'app.db');
export const DB_PATH = process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : DEFAULT_DB_PATH;

let _db = null;

function ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function configurePragmas(db) {
    // Improve concurrency & reliability for dev use-cases.
    try {
        db.pragma('journal_mode = WAL');     // better write concurrency
        db.pragma('synchronous = NORMAL');   // balance safety vs speed
        db.pragma('foreign_keys = ON');      // enforce FKs
        db.pragma('busy_timeout = 4000');    // wait for locks up to 4s
    } catch (e) {
        // Non-fatal; continue
        console.warn('[DB] pragma configuration warning:', e?.message);
    }
}

/**
 * Get the singleton database connection.
 * If it doesn't exist, it will be created.
 */
export function getDb() {
    if (_db) return _db;

    ensureDirectoryExists(DB_PATH);

    try {
        _db = new Database(DB_PATH, {
            // fileMustExist: true would require init script to run first.
            // Keep false so it can create the file on first run.
            fileMustExist: false,
            // verbose: console.log, // uncomment to debug SQL
        });

        configurePragmas(_db);
        return _db;
    } catch (err) {
        console.error('[DB] Failed to open database at', DB_PATH, err);
        throw err;
    }
}

/**
 * Close the singleton connection (useful in tests or graceful shutdowns).
 */
export function closeDb() {
    if (_db) {
        try {
            _db.close();
        } catch (e) {
            console.warn('[DB] close warning:', e?.message);
        } finally {
            _db = null;
        }
    }
}
