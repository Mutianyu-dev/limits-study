'use strict';

/**
 * 题库构建：content/bank/<type>.js 里的题目行 → content/questions.json
 *
 * 行格式：[题干, [正确项, 干扰项, 干扰项, 干扰项], 难度, 解析]
 * 正确项固定写在数组第一位，构建时用固定种子打乱，保证答案位置不总在 A。
 * 尚未提供题库文件的题型，自动回退到 content/legacy-questions.json 里的旧题。
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const BANK = path.join(ROOT, 'content', 'bank');
const LEGACY = path.join(ROOT, 'content', 'legacy-questions.json');
const OUT = path.join(ROOT, 'content', 'questions.json');

const legacy = JSON.parse(fs.readFileSync(LEGACY, 'utf8'));
const typeOrder = legacy.types.map((t) => t.key);
const legacyByType = new Map();
for (const q of legacy.questions) {
  if (!legacyByType.has(q.type)) legacyByType.set(q.type, []);
  legacyByType.get(q.type).push(q);
}

function mulberry32(seed) {
  return function rand() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LETTERS = ['A', 'B', 'C', 'D'];

function buildQuestion(row, type, index) {
  const [stem, opts, difficulty, explanation] = row;
  if (!stem || !Array.isArray(opts) || opts.length !== 4) {
    throw new Error(`${type} 第 ${index + 1} 行选项数量不是 4`);
  }
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    throw new Error(`${type} 第 ${index + 1} 行难度非法: ${difficulty}`);
  }
  if (new Set(opts).size !== 4) {
    throw new Error(`${type} 第 ${index + 1} 行选项重复`);
  }

  const rand = mulberry32(index * 7919 + type.length * 104729);
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const options = order.map((sourceIndex, i) => ({ key: LETTERS[i], text: opts[sourceIndex] }));
  const answerKey = LETTERS[order.indexOf(0)];

  return {
    id: `q-${type}-${String(index + 1).padStart(2, '0')}`,
    type,
    difficulty,
    stem,
    options,
    answer: answerKey,
    explanation: explanation || '',
  };
}

const questions = [];
const counts = {};

for (const type of typeOrder) {
  const file = path.join(BANK, `${type}.js`);
  if (fs.existsSync(file)) {
    const rows = require(file);
    if (!Array.isArray(rows) || !rows.length) throw new Error(`${type}.js 导出为空`);
    rows.forEach((row, i) => questions.push(buildQuestion(row, type, i)));
    counts[type] = rows.length;
  } else {
    const list = legacyByType.get(type) || [];
    questions.push(...list);
    counts[type] = list.length;
  }
}

const doc = { types: legacy.types, difficulties: legacy.difficulties, questions };
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');

console.log(`题库构建完成：${questions.length} 题`);
for (const type of typeOrder) {
  const flag = counts[type] === 50 ? '✓' : ' ';
  console.log(`  ${flag} ${type.padEnd(12)} ${counts[type]}`);
}
