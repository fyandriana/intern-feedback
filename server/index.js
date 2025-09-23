import path from "node:path";
import Database from "better-sqlite3";
import { getDb } from './src/db/connection.js';

const db = getDb();