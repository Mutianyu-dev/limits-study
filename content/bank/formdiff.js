'use strict';

/**
 * ∞−∞ 型 · 50 题
 * 处理原则：通分、有理化、提公因子，把“差”变成“商”。
 */

const q = (stem, opts, diff, expl) => [
  '$' + stem + '$',
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];

// 一、√(x²+ax) − x → a/2
for (const a of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  const ans = a / 2;
  const ansTex = Number.isInteger(ans) ? String(ans) : `\\frac{${a}}{2}`;
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\sqrt{x^{2}+${a}x}-x\right)`,
      [ansTex, String(a), '0', String(a + 1)],
      'easy',
      `有理化：$\\frac{${a}x}{\\sqrt{x^{2}+${a}x}+x}\\to\\frac{${a}}{2}$。`
    )
  );
}

// 二、根式之差
const rootDiff = [
  [3, 1, '1', ['2', '0', '3']],
  [5, 1, '2', ['4', '0', '3']],
  [4, 2, '1', ['2', '0', '3']],
  [7, 3, '2', ['4', '0', '3']],
  [5, 3, '1', ['2', '0', '3']],
];
for (const [a, b, ans, wrongs] of rootDiff) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\sqrt{x^{2}+${a}x}-\sqrt{x^{2}+${b}x}\right)`,
      [ans, ...wrongs],
      'medium',
      `有理化后得 $\\frac{(${a} - ${b})x}{\\sqrt{x^{2}+${a}x}+\\sqrt{x^{2}+${b}x}}\\to\\frac{${a - b}}{2}=${ans}$。`
    )
  );
}

// 三、1/(1−x) − k/(1−x^k) → −(k−1)/2
const poleDiff = [
  [2, '-\\frac{1}{2}', ['\\frac{1}{2}', '-1', '1']],
  [3, '-1', ['1', '-\\frac{1}{2}', '-2']],
  [4, '-\\frac{3}{2}', ['\\frac{3}{2}', '-2', '-1']],
  [5, '-2', ['2', '-\\frac{3}{2}', '-1']],
];
for (const [k, ans, wrongs] of poleDiff) {
  rows.push(
    q(
      String.raw`\lim_{x\to 1}\left(\frac{1}{1-x}-\frac{${k}}{1-x^{${k}}}\right)`,
      [ans, ...wrongs],
      'hard',
      '通分后用 $1-x^{k}=(1-x)(1+x+\\cdots+x^{k-1})$ 约去公因子，极限为 $-\\frac{k-1}{2}$。'
    )
  );
}

// 四、1/x² − k²/sin²(kx) → −k²/3
const cosecDiff = [
  [1, '-\\frac{1}{3}', ['\\frac{1}{3}', '-1', '1']],
  [2, '-\\frac{4}{3}', ['\\frac{4}{3}', '-2', '1']],
  [3, '-3', ['3', '-\\frac{3}{2}', '1']],
];
for (const [k, ans, wrongs] of cosecDiff) {
  const kk = k * k;
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\left(\frac{1}{x^{2}}-\frac{${kk}}{\sin^{2}${k === 1 ? 'x' : k + 'x'}}\right)`,
      [ans, ...wrongs],
      'hard',
      `令 $u=${k === 1 ? 'x' : k + 'x'}$，原式为 $${k === 1 ? '' : kk + '\\cdot'}\\left(\\frac{1}{u^{2}}-\\frac{1}{\\sin^{2}u}\\right)$，利用 $\\sin u=u-\\frac{u^{3}}{6}+\\cdots$ 得 $-\\frac{${kk}}{3}$。`
    )
  );
}

// 五、1/(1−cos kx) − 2/(k²x²) → 1/6
for (const k of [1, 2, 3]) {
  const kk = k * k;
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\left(\frac{1}{1-\cos ${k === 1 ? 'x' : k + 'x'}}-\frac{2}{${kk}x^{2}}\right)`,
      ['\\frac{1}{6}', '\\frac{1}{2}', '\\frac{1}{3}', '0'],
      'hard',
      `$1-\\cos u\\sim\\frac{u^{2}}{2}$，通分后展开到 $u^{4}$ 项，极限为 $\\frac{1}{6}$。`
    )
  );
}

// 六、1/(x−1) − 1/ln x → −1/2
rows.push(
  q(
    String.raw`\lim_{x\to 1}\left(\frac{1}{x-1}-\frac{1}{\ln x}\right)`,
    ['-\\frac{1}{2}', '\\frac{1}{2}', '-1', '0'],
    'hard',
    '令 $t=x-1$，$\\ln(1+t)=t-\\frac{t^{2}}{2}+\\cdots$，通分后得 $-\\frac{1}{2}$。'
  )
);

// 七、√(x+k√x) − √x
const nestedRoot = [
  ['1', '\\frac{1}{2}', ['0', '1', '2']],
  ['2', '1', ['0', '\\frac{1}{2}', '2']],
  ['3', '\\frac{3}{2}', ['0', '1', '2']],
];
for (const [k, ans, wrongs] of nestedRoot) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\sqrt{x+${k}\sqrt{x}}-\sqrt{x}\right)`,
      [ans, ...wrongs],
      'medium',
      `令 $u=\\sqrt{x}$，化为 $\\sqrt{u^{2}+${k}u}-u\\to\\frac{${k}}{2}$。`
    )
  );
}

// 八、(x²+k)/(x+1) − x → −1
for (const k of [1, 2]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\frac{x^{2}+${k}}{x+1}-x\right)`,
      ['-1', '0', '1', '\\infty'],
      'medium',
      `通分得 $\\frac{${k}-x}{x+1}\\to -1$。`
    )
  );
}

// 九、x(√(x²+k) − x) → k/2
for (const k of [1, 2, 3]) {
  const ans = k / 2;
  const ansTex = Number.isInteger(ans) ? String(ans) : `\\frac{${k}}{2}`;
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}x\left(\sqrt{x^{2}+${k}}-x\right)`,
      [ansTex, String(k), '0', String(k + 1)],
      'medium',
      `有理化后为 $\\frac{${k}x}{\\sqrt{x^{2}+${k}}+x}\\to\\frac{${k}}{2}$。`
    )
  );
}

// 十、√(x²+ax+b) − x → a/2
const withB = [
  [2, 1, '1'],
  [4, 1, '2'],
  [6, 1, '3'],
  [8, 1, '4'],
];
for (const [a, b, ans] of withB) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\sqrt{x^{2}+${a}x+${b}}-x\right)`,
      [ans, String(a), '0', String(a + 1)],
      'medium',
      `有理化后常数项被 $x$ 压掉，极限仍为 $\\frac{${a}}{2}$。`
    )
  );
}

// 十一、x − √(x²−ax) → a/2
for (const a of [1, 2, 3, 4]) {
  const ans = a / 2;
  const ansTex = Number.isInteger(ans) ? String(ans) : `\\frac{${a}}{2}`;
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(x-\sqrt{x^{2}-${a}x}\right)`,
      [ansTex, String(a), '0', String(a + 1)],
      'medium',
      `有理化：$\\frac{${a}x}{x+\\sqrt{x^{2}-${a}x}}\\to\\frac{${a}}{2}$。`
    )
  );
}

// 十二、(x³+ax²+1)/(x²+x+1) − x → a−1
for (const a of [2, 3, 4, 5]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\frac{x^{3}+${a}x^{2}+1}{x^{2}+x+1}-x\right)`,
      [String(a - 1), String(a), '0', String(a + 1)],
      'medium',
      `通分后分子为 $(${a}-1)x^{2}-x+1$，除以 $x^{2}+x+1$ 得 ${a - 1}$。`
    )
  );
}

// 十三、(x²+ax)/(x+1) − x → a−1
for (const a of [2, 3]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\frac{x^{2}+${a}x}{x+1}-x\right)`,
      [String(a - 1), String(a), '0', String(a + 1)],
      'medium',
      `通分得 $\\frac{(${a}-1)x}{x+1}\\to ${a - 1}$。`
    )
  );
}

// 十四、ln(x+a) − ln x → 0
for (const a of [1, 2]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(\ln(x+${a})-\ln x\right)`,
      ['0', '1', String(a + 1), '\\infty'],
      'easy',
      `化为 $\\ln\\left(1+\\frac{${a}}{x}\\right)\\to\\ln 1=0$。`
    )
  );
}

module.exports = rows;
