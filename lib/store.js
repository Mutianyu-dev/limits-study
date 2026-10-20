'use strict';

/**
 * 数据层：使用 Node 内置的 node:sqlite，无需安装任何依赖。
 * 三张表分别记录答题、收藏、设置；全部按匿名 uid 隔离。
 */

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'limits.db');

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS attempts (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    uid     TEXT    NOT NULL,
    qid     TEXT    NOT NULL,
    chosen  TEXT    NOT NULL,
    correct INTEGER NOT NULL,
    ts      INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_attempts_uid ON attempts(uid, id DESC);

  CREATE TABLE IF NOT EXISTS favorites (
    uid TEXT    NOT NULL,
    qid TEXT    NOT NULL,
    ts  INTEGER NOT NULL,
    PRIMARY KEY (uid, qid)
  );

  CREATE TABLE IF NOT EXISTS settings (
    uid     TEXT PRIMARY KEY,
    json    TEXT NOT NULL,
    updated INTEGER NOT NULL
  );
`);

const stmt = {
  insertAttempt: db.prepare(
    'INSERT INTO attempts (uid, qid, chosen, correct, ts) VALUES (?, ?, ?, ?, ?)'
  ),
  recentAttempts: db.prepare(
    'SELECT qid, chosen, correct, ts FROM attempts WHERE uid = ? ORDER BY id DESC LIMIT ?'
  ),
  latestWrong: db.prepare(
    `SELECT qid, chosen, ts, MAX(id) AS last_id
       FROM attempts
      WHERE uid = ? AND correct = 0
      GROUP BY qid
      ORDER BY last_id DESC`
  ),
  stats: db.prepare(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(correct), 0) AS correct,
            COUNT(DISTINCT qid) AS distinct_qids
       FROM attempts WHERE uid = ?`
  ),
  addFavorite: db.prepare(
    'INSERT INTO favorites (uid, qid, ts) VALUES (?, ?, ?) ON CONFLICT(uid, qid) DO NOTHING'
  ),
  removeFavorite: db.prepare('DELETE FROM favorites WHERE uid = ? AND qid = ?'),
  listFavorites: db.prepare('SELECT qid, ts FROM favorites WHERE uid = ? ORDER BY ts DESC'),
  getSettings: db.prepare('SELECT json FROM settings WHERE uid = ?'),
  saveSettings: db.prepare(
    `INSERT INTO settings (uid, json, updated) VALUES (?, ?, ?)
     ON CONFLICT(uid) DO UPDATE SET json = excluded.json, updated = excluded.updated`
  ),
  clearErrors: db.prepare('DELETE FROM attempts WHERE uid = ? AND qid = ? AND correct = 0'),
};

function recordAttempt(uid, qid, chosen, correct) {
  const ts = Date.now();
  stmt.insertAttempt.run(uid, qid, String(chosen).slice(0, 8), correct ? 1 : 0, ts);
  return ts;
}

function recentAttempts(uid, limit = 20) {
  return stmt.recentAttempts.all(uid, limit).map((r) => ({
    qid: r.qid,
    chosen: r.chosen,
    correct: r.correct,
    ts: r.ts,
  }));
}

function wrongQuestions(uid) {
  return stmt.latestWrong.all(uid).map((r) => ({ qid: r.qid, chosen: r.chosen, ts: r.ts }));
}

function stats(uid) {
  const row = stmt.stats.get(uid) || { total: 0, correct: 0, distinct_qids: 0 };
  return {
    answered: row.total,
    correct: row.correct,
    accuracy: row.total ? Math.round((row.correct / row.total) * 1000) / 10 : 0,
    distinct: row.distinct_qids,
  };
}

function toggleFavorite(uid, qid, on) {
  if (on) {
    stmt.addFavorite.run(uid, qid, Date.now());
    return true;
  }
  stmt.removeFavorite.run(uid, qid);
  return false;
}

function listFavorites(uid) {
  return stmt.listFavorites.all(uid).map((r) => ({ qid: r.qid, ts: r.ts }));
}

function getSettings(uid) {
  const row = stmt.getSettings.get(uid);
  if (!row) return null;
  try {
    return JSON.parse(row.json);
  } catch {
    return null;
  }
}

function saveSettings(uid, value) {
  const clean = {
    theme: value.theme === 'dark' ? 'dark' : 'light',
    rewardFrequency: [1, 3, 5].includes(Number(value.rewardFrequency))
      ? Number(value.rewardFrequency)
      : 3,
    rewardTier: value.rewardTier === 'instructor' ? 'instructor' : 'companion',
  };
  stmt.saveSettings.run(uid, JSON.stringify(clean), Date.now());
  return clean;
}

function clearError(uid, qid) {
  stmt.clearErrors.run(uid, qid);
}

module.exports = {
  recordAttempt,
  recentAttempts,
  wrongQuestions,
  stats,
  toggleFavorite,
  listFavorites,
  getSettings,
  saveSettings,
  clearError,
};
