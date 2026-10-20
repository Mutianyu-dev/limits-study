'use strict';

/**
 * 变限积分 · 50 题
 */

const m = (t) => '$' + t + '$';
const q = (stem, opts, diff, expl) => [stem, opts, diff, expl];

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function frac(n, d) {
  const g = gcd(n, d);
  const num = n / g;
  const den = d / g;
  return den === 1 ? String(num) : `\\frac{${num}}{${den}}`;
}

const rows = [];
const T = (tex) => m(tex);

// 一、∫₀^{kx} sin t dt / x² → k²/2
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{${k}x}\sin t\,dt}{x^{2}}`),
      [frac(k * k, 2), String(k + 1), String(k * k + k + 1), '0'].map((t) => m(t)),
      'medium',
      `积分得 $1-\\cos ${k}x\\sim\\frac{${k * k}x^{2}}{2}$，极限为 $\\frac{${k * k}}{2}$。`
    )
  );
}

// 二、∫₀^{kx} ln(1+t) dt / x² → k²/2
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{${k}x}\ln(1+t)\,dt}{x^{2}}`),
      [frac(k * k, 2), String(k + 1), String(k * k + k + 1), '0'].map((t) => m(t)),
      'hard',
      `$\\ln(1+t)\\sim t$，积分 $\\sim\\frac{(${k}x)^{2}}{2}$。`
    )
  );
}

// 三、∫₀^{kx} (e^t-1) dt / x² → k²/2
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{${k}x}(e^{t}-1)\,dt}{x^{2}}`),
      [frac(k * k, 2), String(k + 1), String(k * k + k + 1), '0'].map((t) => m(t)),
      'hard',
      `$e^{t}-1\\sim t$，积分 $\\sim\\frac{(${k}x)^{2}}{2}$。`
    )
  );
}

// 四、∫₀^{kx} sin(t²) dt / x³ → k³/3
for (let k = 2; k <= 6; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{${k}x}\sin(t^{2})\,dt}{x^{3}}`),
      [frac(k * k * k, 3), String(k * k * k), String(k * k + 1), '0'].map((t) => m(t)),
      'hard',
      `$\\sin(t^{2})\\sim t^{2}$，积分 $\\sim\\frac{(${k}x)^{3}}{3}$。`
    )
  );
}

// 五、∫₀^{x} (1-cos kt) dt / x³ → k²/6
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}(1-\cos ${k}t)\,dt}{x^{3}}`),
      [frac(k * k, 6), String(k * k + 1), String(k + 2), '0'].map((t) => m(t)),
      'hard',
      `$1-\\cos ${k}t\\sim\\frac{${k * k}t^{2}}{2}$，积分 $\\sim\\frac{${k * k}x^{3}}{6}$。`
    )
  );
}

// 六、∫₀^{x} t sin(kt) dt / x³ → k/3
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}t\sin(${k}t)\,dt}{x^{3}}`),
      [frac(k, 3), String(k + 1), String(k * k + 2), '0'].map((t) => m(t)),
      'hard',
      `$t\\sin(${k}t)\\sim ${k}t^{2}$，积分 $\\sim\\frac{${k}x^{3}}{3}$。`
    )
  );
}

// 七、∫₀^{kx} arctan t dt / x² → k²/2
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{${k}x}\arctan t\,dt}{x^{2}}`),
      [frac(k * k, 2), String(k + 1), String(k * k + k + 1), '0'].map((t) => m(t)),
      'hard',
      `$\\arctan t\\sim t$，积分 $\\sim\\frac{(${k}x)^{2}}{2}$。`
    )
  );
}

// 八、∫₀^{kx} tan t dt / x² → k²/2
for (let k = 1; k <= 5; k += 1) {
  rows.push(
    q(
      T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{${k}x}\tan t\,dt}{x^{2}}`),
      [frac(k * k, 2), String(k + 1), String(k * k + k + 1), '0'].map((t) => m(t)),
      'hard',
      `$\\tan t\\sim t$，积分 $\\sim\\frac{(${k}x)^{2}}{2}$。`
    )
  );
}

// 九、求导：d/dx ∫₀^{x^k} e^t dt
for (let k = 2; k <= 6; k += 1) {
  rows.push(
    q(
      T(String.raw`\frac{d}{dx}\int_{0}^{x^{${k}}}e^{t}\,dt=`),
      [
        `${k}x^{${k - 1}}e^{x^{${k}}}`,
        `x^{${k - 1}}e^{x^{${k}}}`,
        `${k}x^{${k}}e^{x^{${k}}}`,
        `e^{x^{${k}}}`,
      ].map((t) => m(t)),
      'medium',
      `由变上限积分求导公式，乘以上限导数 $${k}x^{${k - 1}}$。`
    )
  );
}

// 十、五道综合
rows.push(
  q(T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}(1-\cos t)^{2}\,dt}{x^{5}}`), [m('\\frac{1}{20}'), m('\\frac{1}{10}'), m('\\frac{1}{12}'), m('0')], 'hard', '$(1-\\cos t)^{2}\\sim\\frac{t^{4}}{4}$，积分 $\\sim\\frac{x^{5}}{20}$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}t^{2}e^{-t}\,dt}{x^{3}}`), [m('\\frac{1}{3}'), m('\\frac{1}{2}'), m('1'), m('0')], 'hard', '$t^{2}e^{-t}\\sim t^{2}$，积分 $\\sim\\frac{x^{3}}{3}$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}\frac{\sin t}{t}\,dt}{x}`), [m('1'), m('0'), m('\\frac{1}{2}'), m('\\infty')], 'medium', '$\\frac{\\sin t}{t}\\to 1$，积分 $\\sim x$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}(e^{t}-1-t)\,dt}{x^{3}}`), [m('\\frac{1}{6}'), m('\\frac{1}{2}'), m('\\frac{1}{3}'), m('0')], 'hard', '$e^{t}-1-t\\sim\\frac{t^{2}}{2}$，积分 $\\sim\\frac{x^{3}}{6}$。'),
  q(T(String.raw`\lim_{x\to 0}\frac{\int_{0}^{x}\ln(1+t^{2})\,dt}{x^{3}}`), [m('\\frac{1}{3}'), m('\\frac{1}{2}'), m('1'), m('0')], 'hard', '$\\ln(1+t^{2})\\sim t^{2}$，积分 $\\sim\\frac{x^{3}}{3}$。')
);

module.exports = rows;
