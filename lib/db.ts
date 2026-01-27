import Database from 'better-sqlite3';
import path from 'path';
import { getDatabaseDir } from './config';

const dbDir = getDatabaseDir();
const dbPath = path.join(dbDir, 'downloads.db');
const db = new Database(dbPath);

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    file_path TEXT,
    file_size INTEGER,
    thumbnail TEXT,
    duration TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// 用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    is_suspended INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Download {
  id?: number;
  user_id: number;
  url: string;
  title?: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress?: number;
  file_path?: string;
  file_size?: number;
  thumbnail?: string;
  duration?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

// 插入新下载任务
export function createDownload(url: string, userId: number): Download {
  const stmt = db.prepare('INSERT INTO downloads (url, status, user_id) VALUES (?, ?, ?)');
  const info = stmt.run(url, 'pending', userId);
  return {
    id: Number(info.lastInsertRowid),
    user_id: userId,
    url,
    status: 'pending',
    progress: 0
  };
}

// 更新下载状态
export function updateDownload(id: number, updates: Partial<Download>) {
  const fields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];
  
  const stmt = db.prepare(
    `UPDATE downloads SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  );
  stmt.run(...values);
}

// 获取所有下载
export function getAllDownloads(): Download[] {
  const stmt = db.prepare('SELECT * FROM downloads ORDER BY created_at DESC');
  return stmt.all() as Download[];
}

// 获取用户的所有下载
export function getUserDownloads(userId: number): Download[] {
  const stmt = db.prepare('SELECT * FROM downloads WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Download[];
}

// 获取单个下载
export function getDownload(id: number): Download | undefined {
  const stmt = db.prepare('SELECT * FROM downloads WHERE id = ?');
  return stmt.get(id) as Download | undefined;
}

// 删除下载记录
export function deleteDownload(id: number) {
  const stmt = db.prepare('DELETE FROM downloads WHERE id = ?');
  stmt.run(id);
}

export default db;
