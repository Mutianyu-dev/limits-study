'use strict';

/**
 * 中值定理 · 50 题
 * 差值型统一思路：f(a) − f(b) = f'(ξ)(a − b)，再用夹逼或等价求出。
 */

const T = (tex) => '$' + tex + '$';
const q = (stem, opts, diff, expl) => [
  stem,
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];
const intOpt = (k) => [String(k), '0', String(k + 1), String(k + 2)];

// 一、arctan 差值
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n^{2}\left[\arctan\frac{${k}}{n}-\arctan\frac{${k}}{n+1}\right]`),
      intOpt(k),
      'medium',
      `取 $f(t)=\\arctan t$，区间长度 $\\frac{${k}}{n(n+1)}$，$f'(\\xi)\\to 1$，极限为 $${k}$。`
    )
  );
}

// 二、sin 差值
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n^{2}\left[\sin\frac{${k}}{n}-\sin\frac{${k}}{n+1}\right]`),
      intOpt(k),
      'medium',
      `取 $f(t)=\\sin t$，$f'(\\xi)\\to 1$，极限为 $${k}$。`
    )
  );
}

// 三、指数差值
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n^{2}\left[e^{\frac{${k}}{n}}-e^{\frac{${k}}{n+1}}\right]`),
      intOpt(k),
      'hard',
      `取 $f(t)=e^{t}$，$f'(\\xi)\\to 1$，极限为 $${k}$。`
    )
  );
}

// 四、对数差值
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n^{2}\left[\ln\left(1+\frac{${k}}{n}\right)-\ln\left(1+\frac{${k}}{n+1}\right)\right]`),
      intOpt(k),
      'hard',
      `取 $f(t)=\\ln(1+t)$，$f'(\\xi)\\to 1$，极限为 $${k}$。`
    )
  );
}

// 五、根式差值
for (let k = 1; k <= 5; k += 1) {
  const ans = k / 2;
  const ansTex = Number.isInteger(ans) ? String(ans) : `\\frac{${k}}{2}`;
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n^{2}\left[\sqrt{1+\frac{${k}}{n}}-\sqrt{1+\frac{${k}}{n+1}}\right]`),
      [ansTex, String(k), '0', String(k + 1)],
      'hard',
      `取 $f(t)=\\sqrt{1+t}$，$f'(0)=\\frac{1}{2}$，故极限为 $\\frac{${k}}{2}$。`
    )
  );
}

// 六、n sin(k/n)
for (let k = 1; k <= 4; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n\sin\frac{${k}}{n}`),
      intOpt(k),
      'easy',
      `$\\frac{\\sin(${k}/n)}{${k}/n}\\to 1$，故极限为 $${k}$。`
    )
  );
}

// 七、n arctan(k/n)
for (let k = 1; k <= 4; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n\arctan\frac{${k}}{n}`),
      intOpt(k),
      'easy',
      `$\\arctan\\frac{${k}}{n}\\sim\\frac{${k}}{n}$，故极限为 $${k}$。`
    )
  );
}

// 八、n ln(1+k/n)
for (let k = 1; k <= 4; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n\ln\left(1+\frac{${k}}{n}\right)`),
      intOpt(k),
      'easy',
      `$\\ln\\left(1+\\frac{${k}}{n}\\right)\\sim\\frac{${k}}{n}$，故极限为 $${k}$。`
    )
  );
}

// 九、n(e^{k/n}-1)
for (let k = 1; k <= 4; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n\left(e^{\frac{${k}}{n}}-1\right)`),
      intOpt(k),
      'easy',
      `$e^{${k}/n}-1\\sim\\frac{${k}}{n}$，故极限为 $${k}$。`
    )
  );
}

// 十、典型差值极限
rows.push(
  q(T(String.raw`\lim_{x\to 0}\frac{\cos x-\cos 2x}{x^{2}}`), ['\\frac{3}{2}', '\\frac{1}{2}', '2', '1'], 'hard', '泰勒：$\\cos x-\\cos 2x=\\frac{3x^{2}}{2}+o(x^{2})$；中值定理只能给范围。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\cos x-\cos 3x}{x^{2}}`), ['4', '2', '8', '1'], 'hard', '和差化积：$2\\sin 2x\\sin x\\sim 4x^{2}$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\cos 2x-\cos 4x}{x^{2}}`), ['6', '2', '12', '3'], 'hard', '和差化积：$2\\sin 3x\\sin x\\sim 6x^{2}$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\sin 3x-\sin x}{x}`), ['2', '1', '3', '0'], 'medium', '和差化积：$2\\cos 2x\\sin x\\sim 2x$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{e^{2x}-e^{x}}{x}`), ['1', '2', '0', 'e'], 'medium', '提取 $e^{x}$：$e^{x}\\cdot\\frac{e^{x}-1}{x}\\to 1$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{e^{x}-e^{-x}}{x}`), ['2', '1', '0', 'e'], 'medium', '等价：$(e^{x}-1)+(1-e^{-x})\\sim x+x=2x$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\tan x-x}{x^{3}}`), ['\\frac{1}{3}', '\\frac{1}{2}', '1', '0'], 'hard', '$\\tan x=x+\\frac{x^{3}}{3}+o(x^{3})$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{x-\arctan x}{x^{3}}`), ['\\frac{1}{3}', '\\frac{1}{6}', '\\frac{1}{2}', '1'], 'hard', '$\\arctan x=x-\\frac{x^{3}}{3}+o(x^{3})$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\arcsin x-x}{x^{3}}`), ['\\frac{1}{6}', '\\frac{1}{3}', '\\frac{1}{2}', '0'], 'hard', '$\\arcsin x=x+\\frac{x^{3}}{6}+o(x^{3})$。')
);

module.exports = rows;
