import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "..", "db", "feedback.db");
const db = new Database(DB_PATH);
