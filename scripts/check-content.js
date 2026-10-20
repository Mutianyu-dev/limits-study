'use strict';

/**
 * 内容体检：JSON 是否合法、LaTeX 子集里的命令是否都被渲染器认识。
 * 运行：node scripts/check-content.js
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

// 与 public/assets/math.js 的解析表保持一致
const KNOWN = new Set([
  'frac', 'dfrac', 'tfrac', 'sqrt', 'text', 'mathrm', 'textrm', 'operatorname',
  'left', 'right', 'overline', 'bar', 'vec', 'hat', 'dot', 'begin', 'end',
  'to', 'rightarrow', 'leftarrow', 'Rightarrow', 'Leftrightarrow', 'mapsto',
  'infty', 'cdot', 'times', 'div', 'pm', 'mp', 'le', 'leq', 'ge', 'geq',
  'ne', 'neq', 'approx', 'sim', 'simeq', 'equiv', 'propto', 'partial', 'nabla',
  'in', 'notin', 'subset', 'subseteq', 'cup', 'cap', 'forall', 'exists',
  'emptyset', 'varnothing', 'angle', 'perp', 'parallel', 'circ', 'degree',
  'prime', 'ast', 'cdots', 'ldots', 'dots', 'vdots', 'ddots', 'quad', 'qquad',
  ':', ';', ',', '!', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon',
  'zeta', 'eta', 'theta', 'vartheta', 'iota', 'kappa', 'lambda', 'mu', 'nu',
  'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'varphi', 'chi', 'psi',
  'omega', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon',
  'Phi', 'Psi', 'Omega', 'lbrace', 'rbrace', '%', '#', '&', '_', 'mid', 'vert',
  'Vert', 'langle', 'rangle', 'bigcirc', 'square', 'triangle', 'bullet',
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan',
  'ln', 'log', 'lg', 'exp', 'limsup', 'liminf', 'det', 'mod', 'gcd',
  'lim', 'sum', 'prod', 'int', 'iint', 'oint',
]);

function walkStrings(value, visit, where = '') {
  if (typeof value === 'string') return visit(value, where);
  if (Array.isArray(value)) return value.forEach((v, i) => walkStrings(v, visit, `${where}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).forEach(([k, v]) => walkStrings(v, visit, `${where}.${k}`));
  }
}

const problems = [];
const seen = new Map();

function checkText(text, where) {
  // 内容里的反斜杠只用于公式，整段扫描即可
  for (const m of text.matchAll(/\\([a-zA-Z]+|.)/g)) {
    const name = m[1];
    if (name === '\\' || name === '{' || name === '}' || name === ' ') continue;
    if (!KNOWN.has(name)) {
      problems.push(`${where}: 未知命令 \\${name}  ← ${text.slice(0, 90)}`);
    }
  }
  // 只对含反斜杠的公式段检查花括号配平
  if (!text.includes('\\')) return;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\\') { i += 1; continue; }
    if (text[i] === '{') depth += 1;
    if (text[i] === '}') depth -= 1;
    if (depth < 0) break;
  }
  if (depth !== 0) problems.push(`${where}: 花括号不配平  ← ${text.slice(0, 90)}`);
}

function checkFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    problems.push(`${file}: JSON 解析失败 ${err.message}`);
    return;
  }
  seen.set(file, true);
  walkStrings(data, (text, where) => checkText(text, `${path.basename(file)}${where}`));
}

const methodsDir = path.join(ROOT, 'content', 'methods');
for (const f of fs.readdirSync(methodsDir).filter((x) => x.endsWith('.json'))) {
  checkFile(path.join(methodsDir, f));
}
checkFile(path.join(ROOT, 'content', 'questions.json'));

if (problems.length) {
  console.log(`发现 ${problems.length} 处问题：`);
  for (const p of problems) console.log('  - ' + p);
  process.exitCode = 1;
} else {
  console.log('内容体检通过：JSON 合法，公式命令均在渲染器覆盖范围内。');
}
