// Lightweight SQLite access layer (ESM) using better-sqlite3
// - No schema creation here (handled by init/seed scripts)
// - Provides: getDb, closeDb, run, getOne, allRows, list, tx

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default DB next to this file (used only if DB_PATH isn't set)
const DEFAULT_DB_PATH = path.resolve(__dirname, 'app.db');

// Resolve DB path (relative to server/ when using server/.env)
function resolveDbPath() {
  const p = (process.env.DB_PATH || '').trim();
  if (!p) return DEFAULT_DB_PATH;
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

export const DB_PATH = resolveDbPath();

let _db = null;

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function configurePragmas(db) {
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 4000');
  } catch {
    /* ignore */
  }
}

export function getDb() {
  if (_db) return _db;
  ensureDir(DB_PATH);
  _db = new Database(DB_PATH, { fileMustExist: false });
  configurePragmas(_db);
  return _db;
}

export function closeDb() {
  if (_db) {
    try {
      _db.close();
    } catch {}
    _db = null;
  }
}

/** Execute INSERT/UPDATE/DELETE. Returns { changes, lastInsertRowid }. */
export function run(sql, params = {}) {
  const stmt = getDb().prepare(sql);
  const info = stmt.run(params);
  return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
}

/** Get a single row (or undefined). */
export function getOne(sql, params = {}) {
  const stmt = getDb().prepare(sql);
  return stmt.get(params);
}

/** Get all rows as an array. */
export function allRows(sql, params = {}) {
  const stmt = getDb().prepare(sql);
  return stmt.all(params);
}

/**
 * List helper for simple SELECTs.
 * Example:
 *   list('feedback', {
 *     select: 'id,name,email,message,created_at',
 *     where: 'email = @email',
 *     params: { email: 'x@y.com' },
 *     orderBy: 'datetime(created_at) DESC, id DESC',
 *     limit: 50, offset: 0
 *   })
 */
export function list(table, opts = {}) {
  const { select = '*', where, params = {}, orderBy, limit, offset } = opts;

  let sql = `SELECT ${select} FROM ${table}`;
  if (where && where.trim()) sql += ` WHERE ${where}`;
  if (orderBy && orderBy.trim()) sql += ` ORDER BY ${orderBy}`;
  if (Number.isFinite(limit)) sql += ` LIMIT ${Math.max(0, limit)}`;
  if (Number.isFinite(offset)) sql += ` OFFSET ${Math.max(0, offset)}`;

  return allRows(sql, params);
}

/** Run a function inside a transaction: tx(db => { ... }) */
export function tx(fn) {
  const db = getDb();
  return db.transaction(() => fn(db))();
}
/** for db test */
export function pingDb() {
  const db = getDb();
  return db.prepare('SELECT 1 AS ok, sqlite_version() AS sqlite_version').get();
}
