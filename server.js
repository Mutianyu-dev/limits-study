'use strict';

/**
 * 极限研习 · Limits —— 本地服务
 *
 * 只使用 Node 内置模块：http / fs / path / crypto / sqlite。
 * 启动：node server.js     默认 http://127.0.0.1:8787
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { sendJson, sendText, readBody, parseCookies, withStatus } = require('./lib/http');
const { loadMethods, loadQuestions } = require('./lib/content');
const store = require('./lib/store');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');

const methods = loadMethods();
const bank = loadQuestions();
const methodBySlug = new Map(methods.map((m) => [m.slug, m]));
const questionById = new Map(bank.questions.map((q) => [q.id, q]));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const PAGE_ROUTES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/main': 'main.html',
  '/practice': 'practice.html',
  '/wrongbook': 'wrongbook.html',
};

/* ------------------------------------------------------------------ */
/* 工具                                                                */
/* ------------------------------------------------------------------ */

function ensureUid(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  let uid = cookies.uid;
  if (uid && /^[a-f0-9-]{16,40}$/i.test(uid)) return uid;
  uid = crypto.randomUUID();
  res.setHeader(
    'Set-Cookie',
    `uid=${uid}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`
  );
  return uid;
}

function publicQuestion(q) {
  const { answer, explanation, ...rest } = q;
  return rest;
}

function resolveStatic(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = path.normalize(path.join(PUBLIC_DIR, decoded));
  if (!target.startsWith(PUBLIC_DIR + path.sep) && target !== PUBLIC_DIR) return null;
  return target;
}

function serveFile(res, file) {
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': ['.html', '.js', '.css'].includes(ext) ? 'no-cache' : 'public, max-age=3600',
  });
  fs.createReadStream(file).pipe(res);
  return true;
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(
    '<!doctype html><meta charset="utf-8"><title>404</title>' +
      '<body style="font-family:system-ui;background:#f4f1ea;color:#17170f;display:grid;place-items:center;height:100vh;margin:0">' +
      '<div style="text-align:center"><p style="letter-spacing:.3em;font-size:12px">LIMITS</p>' +
      '<h1 style="font-weight:400;letter-spacing:.1em">这一页不存在</h1>' +
      '<a href="/" style="color:inherit">返回起始页</a></div>'
  );
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

async function handleApi(req, res, url) {
  const uid = ensureUid(req, res);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      methods: methods.length,
      questions: bank.questions.length,
      uptime: Math.round(process.uptime()),
    });
  }

  if (req.method === 'GET' && pathname === '/api/methods') {
    return sendJson(
      res,
      200,
      methods.map((m) => ({
        slug: m.slug,
        order: m.order,
        name: m.name,
        alias: m.alias,
        en: m.en,
        enAlias: m.enAlias,
        lead: m.lead,
        meta: m.meta || [],
        sections: m.sections.length,
      }))
    );
  }

  const methodMatch = pathname.match(/^\/api\/methods\/([a-z0-9-]+)$/);
  if (req.method === 'GET' && methodMatch) {
    const m = methodBySlug.get(methodMatch[1]);
    if (!m) return sendJson(res, 404, { error: 'method not found' });
    return sendJson(res, 200, m);
  }

  if (req.method === 'GET' && pathname === '/api/questions') {
    const type = url.searchParams.get('type');
    const difficulty = url.searchParams.get('difficulty');
    let list = bank.questions;
    if (type && type !== 'all') list = list.filter((q) => q.type === type);
    if (difficulty && difficulty !== 'all') list = list.filter((q) => q.difficulty === difficulty);
    return sendJson(res, 200, {
      total: list.length,
      types: bank.types,
      difficulties: bank.difficulties,
      questions: list.map(publicQuestion),
    });
  }

  if (req.method === 'POST' && pathname === '/api/answer') {
    const body = await readBody(req);
    const q = questionById.get(String(body.qid || ''));
    if (!q) return sendJson(res, 404, { error: 'question not found' });
    const chosen = String(body.chosen || '').toUpperCase();
    if (!q.options.some((o) => o.key === chosen)) {
      return sendJson(res, 400, { error: 'invalid choice' });
    }
    const correct = chosen === q.answer;
    store.recordAttempt(uid, q.id, chosen, correct);
    return sendJson(res, 200, {
      correct,
      answer: q.answer,
      explanation: q.explanation,
      stats: store.stats(uid),
    });
  }

  if (req.method === 'GET' && pathname === '/api/progress') {
    return sendJson(res, 200, {
      stats: store.stats(uid),
      recent: store.recentAttempts(uid, 12),
    });
  }

  if (req.method === 'GET' && pathname === '/api/wrongbook') {
    const errors = store
      .wrongQuestions(uid)
      .map((r) => {
        const q = questionById.get(r.qid);
        if (!q) return null;
        return { ...q, chosen: r.chosen, ts: r.ts };
      })
      .filter(Boolean);
    const favorites = store
      .listFavorites(uid)
      .map((r) => {
        const q = questionById.get(r.qid);
        if (!q) return null;
        return { ...q, ts: r.ts };
      })
      .filter(Boolean);
    return sendJson(res, 200, { errors, favorites, stats: store.stats(uid) });
  }

  if (req.method === 'POST' && pathname === '/api/favorites') {
    const body = await readBody(req);
    const qid = String(body.qid || '');
    if (!questionById.has(qid)) return sendJson(res, 404, { error: 'question not found' });
    const on = store.toggleFavorite(uid, qid, Boolean(body.on));
    return sendJson(res, 200, { qid, favorite: on });
  }

  const removeMatch = pathname.match(/^\/api\/wrongbook\/([a-z0-9-]+)$/);
  if (req.method === 'DELETE' && removeMatch) {
    const qid = removeMatch[1];
    if (!questionById.has(qid)) return sendJson(res, 404, { error: 'question not found' });
    const kind = url.searchParams.get('kind') || 'error';
    if (kind === 'favorite') store.toggleFavorite(uid, qid, false);
    else store.clearError(uid, qid);
    return sendJson(res, 200, { qid, removed: true });
  }

  if (pathname === '/api/settings') {
    if (req.method === 'GET') {
      return sendJson(res, 200, store.getSettings(uid) || {});
    }
    if (req.method === 'PUT') {
      const body = await readBody(req);
      return sendJson(res, 200, store.saveSettings(uid, body));
    }
  }

  return sendJson(res, 404, { error: 'not found' });
}

/* ------------------------------------------------------------------ */
/* 路由                                                                */
/* ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(req, res, url);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return sendText(res, 405, 'method not allowed');
    }

    const page = PAGE_ROUTES[url.pathname];
    if (page) {
      if (serveFile(res, path.join(PUBLIC_DIR, page))) return;
      return notFound(res);
    }

    if (/^\/method\/[a-z0-9-]+$/.test(url.pathname)) {
      if (serveFile(res, path.join(PUBLIC_DIR, 'method.html'))) return;
      return notFound(res);
    }

    const file = resolveStatic(url.pathname);
    if (file && serveFile(res, file)) return;

    return notFound(res);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('[error]', err);
    if (!res.headersSent) {
      sendJson(res, status, { error: err.message || 'server error' });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`极限研习 · Limits  http://${HOST}:${PORT}`);
  console.log(`题库 ${bank.questions.length} 题 · 方法 ${methods.length} 个`);
});
