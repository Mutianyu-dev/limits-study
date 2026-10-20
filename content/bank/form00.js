'use strict';

/**
 * 0/0 型 · 50 题
 * 行格式：[题干 LaTeX, [正确项, 干扰项×3], 难度, 解析]
 * 选项与解析里的公式用 $...$ 包裹。
 */

const q = (stem, opts, diff, expl) => [
  '$' + stem + '$',
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];

// 一、sin(kx)/x → k
for (const k of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{\sin ${k}x}{x}`,
      [String(k), '0', '1', String(k * k)],
      'easy',
      `$\\sin ${k}x\\sim ${k}x$，故极限为 $${k}$。`
    )
  );
}

// 二、(1-cos(kx))/x^2 → k^2/2
const cosCases = [
  [1, '\\frac{1}{2}', ['1', '0', '2']],
  [2, '2', ['\\frac{1}{2}', '4', '1']],
  [3, '\\frac{9}{2}', ['3', '9', '\\frac{1}{2}']],
  [4, '8', ['4', '16', '\\frac{1}{2}']],
  [5, '\\frac{25}{2}', ['5', '25', '\\frac{1}{2}']],
];
for (const [k, ans, wrongs] of cosCases) {
  const half = (k * k) % 2 === 0 ? String((k * k) / 2) : `\\frac{${k * k}}{2}`;
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{1-\cos ${k}x}{x^{2}}`,
      [ans, ...wrongs],
      'medium',
      `$1-\\cos ${k}x\\sim \\frac{${k * k}x^{2}}{2}$，故极限为 $${half}$。`
    )
  );
}

// 三、(e^{kx}-1)/x → k
for (const k of [2, 3, 4, 5, 6, 7]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{e^{${k}x}-1}{x}`,
      [String(k), '0', '1', `e^{${k}}`],
      'easy',
      `$e^{${k}x}-1\\sim ${k}x$，故极限为 $${k}$。`
    )
  );
}

// 四、ln(1+kx)/x → k
for (const k of [2, 3, 4, 5, 6, 7]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{\ln(1+${k}x)}{x}`,
      [String(k), '0', '1', String(k * k)],
      'medium',
      `$\\ln(1+${k}x)\\sim ${k}x$，故极限为 $${k}$。`
    )
  );
}

// 五、(sqrt(1+kx)-1)/x → k/2
for (const k of [2, 3, 4, 5, 6, 7]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{\sqrt{1+${k}x}-1}{x}`,
      [`\\frac{${k}}{2}`, String(k), '\\frac{1}{2}', '0'],
      'medium',
      `$\\sqrt{1+${k}x}-1\\sim \\frac{${k}x}{2}$，故极限为 $\\frac{${k}}{2}$。`
    )
  );
}

// 六、tan x - sin x
rows.push(
  q(
    String.raw`\lim_{x\to 0}\frac{\tan x-\sin x}{x^{3}}`,
    ['\\frac{1}{2}', '0', '1', '\\frac{1}{3}'],
    'hard',
    '加减结构中不能各自替换成 $x$；$\\tan x-\\sin x=\\frac{x^{3}}{2}+o(x^{3})$。'
  )
);

// 七、x - sin x
rows.push(
  q(
    String.raw`\lim_{x\to 0}\frac{x-\sin x}{x^{3}}`,
    ['\\frac{1}{6}', '\\frac{1}{2}', '0', '1'],
    'hard',
    '$\\sin x=x-\\frac{x^{3}}{6}+o(x^{3})$，故 $x-\\sin x\\sim\\frac{x^{3}}{6}$。'
  )
);

// 八、2x - sin 2x
rows.push(
  q(
    String.raw`\lim_{x\to 0}\frac{2x-\sin 2x}{x^{3}}`,
    ['\\frac{4}{3}', '\\frac{2}{3}', '\\frac{1}{3}', '\\frac{8}{3}'],
    'hard',
    '$2x-\\sin 2x=\\frac{(2x)^{3}}{6}+o(x^{3})=\\frac{4x^{3}}{3}+o(x^{3})$。'
  )
);

// 九、(1+x)^a - 1
const powCases = [
  ['2', '2', ['0', '1', '4']],
  ['3', '3', ['0', '1', '9']],
  ['\\frac{1}{2}', '\\frac{1}{2}', ['0', '1', '\\frac{1}{4}']],
  ['\\frac{1}{3}', '\\frac{1}{3}', ['0', '1', '\\frac{1}{9}']],
];
for (const [a, ans, wrongs] of powCases) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{(1+x)^{${a}}-1}{x}`,
      [ans, ...wrongs],
      'medium',
      `$(1+x)^{${a}}-1\\sim ${a}x$，故极限为 $${ans}$。`
    )
  );
}

// 十、(a^x - 1)/x
for (const a of [2, 3, 4]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{${a}^{x}-1}{x}`,
      [`\\ln ${a}`, '0', '1', String(a)],
      'medium',
      `$${a}^{x}-1\\sim x\\ln ${a}$，故极限为 $\\ln ${a}$。`
    )
  );
}

// 十一、arctan(kx)/x
for (const k of [2, 3, 4, 5, 6]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{\arctan ${k}x}{x}`,
      [String(k), '0', '1', String(k * k)],
      'easy',
      `$\\arctan ${k}x\\sim ${k}x$，故极限为 $${k}$。`
    )
  );
}

// 十二、tan(kx) - kx
for (const k of [1, 2]) {
  const ans = k === 1 ? '\\frac{1}{3}' : '\\frac{8}{3}';
  const wrongs =
    k === 1 ? ['\\frac{1}{2}', '1', '\\frac{1}{6}'] : ['\\frac{4}{3}', '\\frac{2}{3}', '4'];
  rows.push(
    q(
      String.raw`\lim_{x\to 0}\frac{\tan ${k}x-${k}x}{x^{3}}`,
      [ans, ...wrongs],
      'hard',
      `$\\tan ${k}x-${k}x\\sim \\frac{(${k}x)^{3}}{3}$，故极限为 $${ans}$。`
    )
  );
}

// 十三、sin x - x cos x
rows.push(
  q(
    String.raw`\lim_{x\to 0}\frac{\sin x-x\cos x}{x^{3}}`,
    ['\\frac{1}{3}', '\\frac{1}{6}', '\\frac{2}{3}', '1'],
    'hard',
    '$\\sin x-x\\cos x=\\frac{x^{3}}{3}+o(x^{3})$，故极限为 $\\frac{1}{3}$。'
  )
);

module.exports = rows;
