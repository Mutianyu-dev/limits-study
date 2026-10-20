'use strict';

/**
 * 例题合稿：把 content/examples/*.json 按文件名顺序合并为
 * content/methods/05-examples.json，供方法详情页直接读取。
 *
 * 每个源文件格式：
 *   { "order": 1, "title": "0/0 型", "examples": [ { title, tags, problem, steps, answer } ] }
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'content', 'examples');
const OUT = path.join(ROOT, 'content', 'methods', '05-examples.json');

const files = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (!files.length) throw new Error('content/examples 下没有内容');

const groups = files.map((file) => {
  const full = path.join(SRC, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    throw new Error(`${file} JSON 解析失败: ${err.message}`);
  }
  if (!data.title || !Array.isArray(data.examples) || !data.examples.length) {
    throw new Error(`${file} 缺少 title 或 examples`);
  }
  for (const [i, ex] of data.examples.entries()) {
    for (const key of ['title', 'problem', 'steps', 'answer']) {
      if (!ex[key]) throw new Error(`${file} 第 ${i + 1} 例缺少 ${key}`);
    }
    if (!Array.isArray(ex.steps) || ex.steps.length < 3) {
      throw new Error(`${file} 第 ${i + 1} 例 steps 太少`);
    }
  }
  return { title: data.title, examples: data.examples };
});

const doc = {
  slug: 'examples',
  order: 5,
  name: '例题',
  alias: '发凡起例',
  en: 'Examples',
  enAlias: 'Demonstration',
  lead: '按题型分组，每型三道。每道都按四步写：判断类型、预处理化简、匹配解法、二次校验。',
  plain: '例题不是用来背答案的，是练“先判型、再动手”的顺序；每一步都问一句：为什么可以这样做？',
  meta: [`${groups.length} 个题型`, `${groups.reduce((n, g) => n + g.examples.length, 0)} 道例题`, '四步解析'],
  sections: groups.map((g) => ({
    title: g.title,
    blocks: g.examples.map((ex) => ({
      t: 'example',
      title: ex.title,
      tags: ex.tags || [],
      problem: ex.problem,
      steps: ex.steps,
      answer: ex.answer,
    })),
  })),
};

fs.writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');
const total = doc.sections.reduce((n, s) => n + s.blocks.length, 0);
console.log(`例题合稿完成：${groups.length} 组 / ${total} 道 → ${path.relative(ROOT, OUT)}`);
