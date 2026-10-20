'use strict';

/**
 * 题库与资料内容的加载与校验。
 * 内容以 JSON 存放，服务启动时一次性载入，运行期只读。
 */

const fs = require('node:fs');
const path = require('node:path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`JSON 解析失败: ${file}\n${err.message}`);
  }
}

function loadMethods() {
  const dir = path.join(CONTENT_DIR, 'methods');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const methods = files.map((f) => readJson(path.join(dir, f)));
  methods.sort((a, b) => a.order - b.order);
  for (const m of methods) {
    if (!m.slug || !m.name || !Array.isArray(m.sections)) {
      throw new Error(`方法文件缺少字段: ${m.slug || '(unknown)'}`);
    }
  }
  return methods;
}

function loadQuestions() {
  const file = path.join(CONTENT_DIR, 'questions.json');
  const data = readJson(file);
  if (!Array.isArray(data.questions)) throw new Error('questions.json 缺少 questions 数组');
  const ids = new Set();
  for (const q of data.questions) {
    if (ids.has(q.id)) throw new Error(`题目 id 重复: ${q.id}`);
    ids.add(q.id);
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`题目选项不足: ${q.id}`);
    }
    if (!q.options.some((o) => o.key === q.answer)) {
      throw new Error(`题目答案不在选项中: ${q.id}`);
    }
  }
  return data;
}

module.exports = { loadMethods, loadQuestions };
