'use strict';

/**
 * 0·∞ 型 · 50 题
 * 处理原则：取倒数化成 0/0 或 ∞/∞，或先拆出已知极限。
 */

const q = (stem, opts, diff, expl) => [
  '$' + stem + '$',
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];
const ZERO = ['1', '-1', '-\\infty'];

// 一、x^n ln x（x→0+）
const logStems = [
  String.raw`x\ln x`,
  String.raw`x^{2}\ln x`,
  String.raw`x^{3}\ln x`,
  String.raw`x^{4}\ln x`,
  String.raw`\sqrt{x}\ln x`,
];
for (const stem of logStems) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0^{+}}` + stem,
      ['0', ...ZERO],
      'easy',
      '把 $x^{n}$ 放进分母，化成 $\\frac{\\ln x}{x^{-n}}$ 后用洛必达，极限为 $0$。'
    )
  );
}

// 二、x^n ln(sin x)
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}x\ln(\sin x)`, ['0', ...ZERO], 'medium', '$\\ln(\\sin x)=\\ln x+\\ln\\frac{\\sin x}{x}$，两项都趋于 $0$。'),
  q(String.raw`\lim_{x\to 0^{+}}x^{2}\ln(\sin x)`, ['0', ...ZERO], 'medium', '$\\ln(\\sin x)\\sim\\ln x$，而 $x^{2}\\ln x\\to 0$。')
);

// 三、x^n e^{-x}（x→∞）
const expStems = [
  String.raw`xe^{-x}`,
  String.raw`x^{2}e^{-x}`,
  String.raw`x^{3}e^{-x}`,
  String.raw`x^{4}e^{-x}`,
  String.raw`\sqrt{x}e^{-x}`,
];
for (const stem of expStems) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}` + stem,
      ['0', '1', '\\infty', 'e'],
      'easy',
      '指数衰减快于幂增长，极限为 $0$。'
    )
  );
}

// 四、倒代换后得 1
const toOne = [
  [String.raw`x\tan\frac{1}{x}`, '作 $t=\\frac{1}{x}$，$\\tan t\\sim t$，故极限为 $1$。'],
  [String.raw`x\sin\frac{1}{x}`, '作 $t=\\frac{1}{x}$，$\\sin t\\sim t$，故极限为 $1$。'],
  [String.raw`x\arctan\frac{1}{x}`, '作 $t=\\frac{1}{x}$，$\\arctan t\\sim t$，故极限为 $1$。'],
  [String.raw`x\ln\left(1+\frac{1}{x}\right)`, '作 $t=\\frac{1}{x}$，$\\ln(1+t)\\sim t$，故极限为 $1$。'],
  [String.raw`x\left(e^{\frac{1}{x}}-1\right)`, '作 $t=\\frac{1}{x}$，$e^{t}-1\\sim t$，故极限为 $1$。'],
];
for (const [stem, expl] of toOne) {
  rows.push(q(String.raw`\lim_{x\to\infty}` + stem, ['1', '0', '\\infty', 'e'], 'medium', expl));
}

// 五、(1-cos kx) ln x
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}(1-\cos x)\ln x`, ['0', ...ZERO], 'medium', '$1-\\cos x\\sim\\frac{x^{2}}{2}$，乘 $\\ln x$ 后仍趋于 $0$。'),
  q(String.raw`\lim_{x\to 0^{+}}(1-\cos 2x)\ln x`, ['0', ...ZERO], 'medium', '$1-\\cos 2x\\sim 2x^{2}$，乘 $\\ln x$ 后仍趋于 $0$。'),
  q(String.raw`\lim_{x\to 0^{+}}(1-\cos x)^{2}\ln x`, ['0', ...ZERO], 'medium', '$(1-\\cos x)^{2}\\sim\\frac{x^{4}}{4}$，压过 $\\ln x$ 的发散。')
);

// 六、三角函数乘 ln x
const trigLog = [
  String.raw`\sin x\ln x`,
  String.raw`\tan x\ln x`,
  String.raw`\arcsin x\ln x`,
];
for (const stem of trigLog) {
  rows.push(q(String.raw`\lim_{x\to 0^{+}}` + stem, ['0', ...ZERO], 'medium', '三角函数与 $x$ 等价，$x\\ln x\\to 0$。'));
}

// 七、x^n ln(1/x)
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}x\ln\frac{1}{x}`, ['0', ...ZERO], 'easy', '$x\\ln\\frac{1}{x}=-x\\ln x\\to 0$。'),
  q(String.raw`\lim_{x\to 0^{+}}x^{2}\ln\frac{1}{x}`, ['0', ...ZERO], 'easy', '$x^{2}\\ln\\frac{1}{x}=-x^{2}\\ln x\\to 0$。')
);

// 八、x(π/2 - arctan kx)
const halfPi = [
  ['1', 'x\\left(\\frac{\\pi}{2}-\\arctan x\\right)', '1', ['0', '\\frac{1}{2}', '\\infty']],
  ['2', 'x\\left(\\frac{\\pi}{2}-\\arctan 2x\\right)', '\\frac{1}{2}', ['0', '1', '\\infty']],
  ['3', 'x\\left(\\frac{\\pi}{2}-\\arctan 3x\\right)', '\\frac{1}{3}', ['0', '1', '\\infty']],
];
for (const [k, stem, ans, wrongs] of halfPi) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}` + stem,
      [ans, ...wrongs],
      'medium',
      `$\\frac{\\pi}{2}-\\arctan ${k}x=\\arctan\\frac{1}{${k}x}\\sim\\frac{1}{${k}x}$，乘 $x$ 得 $${ans}$。`
    )
  );
}

// 九、x^2 (1 - cos(k/x))
const cosSmall = [
  ['1', '\\frac{1}{2}'],
  ['2', '2'],
  ['3', '\\frac{9}{2}'],
];
for (const [k, ans] of cosSmall) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}x^{2}\left(1-\cos\frac{${k}}{x}\right)`,
      [ans, '0', '1', '\\infty'],
      'medium',
      `$1-\\cos\\frac{${k}}{x}\\sim\\frac{${k * k}}{2x^{2}}$，乘 $x^{2}$ 得 $${ans}$。`
    )
  );
}

// 十、正幂压对数
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}x^{1/3}\ln x`, ['0', ...ZERO], 'easy', '幂次为正即可压住对数，极限为 $0$。'),
  q(String.raw`\lim_{x\to 0^{+}}x^{3/2}\ln x`, ['0', ...ZERO], 'easy', '幂次为正即可压住对数，极限为 $0$。')
);

// 十一、指数型无穷小乘对数
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}(e^{x}-1)\ln x`, ['0', ...ZERO], 'easy', '$e^{x}-1\\sim x$，$x\\ln x\\to 0$。'),
  q(String.raw`\lim_{x\to 0^{+}}(e^{2x}-1)\ln x`, ['0', ...ZERO], 'easy', '$e^{2x}-1\\sim 2x$，$2x\\ln x\\to 0$。')
);

// 十二、x ln(1 + k/x^2)
rows.push(
  q(String.raw`\lim_{x\to\infty}x\ln\left(1+\frac{1}{x^{2}}\right)`, ['0', ...ZERO], 'easy', '$\\ln\\left(1+\\frac{1}{x^{2}}\\right)\\sim\\frac{1}{x^{2}}$，乘 $x$ 得 $\\frac{1}{x}\\to 0$。'),
  q(String.raw`\lim_{x\to\infty}x\ln\left(1+\frac{2}{x^{2}}\right)`, ['0', ...ZERO], 'easy', '$\\ln\\left(1+\\frac{2}{x^{2}}\\right)\\sim\\frac{2}{x^{2}}$，乘 $x$ 得 $\\frac{2}{x}\\to 0$。')
);

// 十三、x^2 ln(1 + k/x^2)
rows.push(
  q(String.raw`\lim_{x\to\infty}x^{2}\ln\left(1+\frac{1}{x^{2}}\right)`, ['1', '0', '2', '\\infty'], 'hard', '$\\ln\\left(1+\\frac{1}{x^{2}}\\right)\\sim\\frac{1}{x^{2}}$，乘 $x^{2}$ 得 $1$。'),
  q(String.raw`\lim_{x\to\infty}x^{2}\ln\left(1+\frac{2}{x^{2}}\right)`, ['2', '0', '1', '\\infty'], 'hard', '$\\ln\\left(1+\\frac{2}{x^{2}}\\right)\\sim\\frac{2}{x^{2}}$，乘 $x^{2}$ 得 $2$。')
);

// 十四、x sin(1/x^2)、x tan(1/x^2)
rows.push(
  q(String.raw`\lim_{x\to\infty}x\sin\frac{1}{x^{2}}`, ['0', ...ZERO], 'easy', '$\\sin\\frac{1}{x^{2}}\\sim\\frac{1}{x^{2}}$，乘 $x$ 得 $\\frac{1}{x}\\to 0$。'),
  q(String.raw`\lim_{x\to\infty}x\tan\frac{1}{x^{2}}`, ['0', ...ZERO], 'easy', '$\\tan\\frac{1}{x^{2}}\\sim\\frac{1}{x^{2}}$，乘 $x$ 得 $\\frac{1}{x}\\to 0$。')
);

// 十五、x(1 - cos(k/x))
rows.push(
  q(String.raw`\lim_{x\to\infty}x\left(1-\cos\frac{1}{x}\right)`, ['0', ...ZERO], 'easy', '$1-\\cos\\frac{1}{x}\\sim\\frac{1}{2x^{2}}$，乘 $x$ 得 $\\frac{1}{2x}\\to 0$。'),
  q(String.raw`\lim_{x\to\infty}x\left(1-\cos\frac{2}{x}\right)`, ['0', ...ZERO], 'easy', '$1-\\cos\\frac{2}{x}\\sim\\frac{2}{x^{2}}$，乘 $x$ 得 $\\frac{2}{x}\\to 0$。')
);

// 十六、更高次幂压对数
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}x^{5}\ln x`, ['0', ...ZERO], 'easy', '幂次为正即可压住对数，极限为 $0$。'),
  q(String.raw`\lim_{x\to 0^{+}}x^{1/4}\ln x`, ['0', ...ZERO], 'easy', '幂次为正即可压住对数，极限为 $0$。')
);

// 十七、复合三角
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}(1-\cos x)\ln(\sin x)`, ['0', ...ZERO], 'medium', '$1-\\cos x\\sim\\frac{x^{2}}{2}$，而 $\\ln(\\sin x)\\sim\\ln x$，乘积极限为 $0$。')
);

// 十八、x ln(cos(1/x))
rows.push(
  q(String.raw`\lim_{x\to\infty}x\ln\left(\cos\frac{1}{x}\right)`, ['0', ...ZERO], 'medium', '$\\ln\\cos\\frac{1}{x}\\sim-\\frac{1}{2x^{2}}$，乘 $x$ 得 $-\\frac{1}{2x}\\to 0$。')
);

// 十九、x^2 ln(cos(1/x))
rows.push(
  q(String.raw`\lim_{x\to\infty}x^{2}\ln\left(\cos\frac{1}{x}\right)`, ['-\\frac{1}{2}', '\\frac{1}{2}', '-1', '0'], 'hard', '$\\ln\\cos\\frac{1}{x}\\sim-\\frac{1}{2x^{2}}$，乘 $x^{2}$ 得 $-\\frac{1}{2}$。')
);

// 二十、n sin(π/n)、n tan(π/n)
rows.push(
  q(String.raw`\lim_{n\to\infty}n\sin\frac{\pi}{n}`, ['\\pi', '1', '2', '\\infty'], 'medium', '$n\\sin\\frac{\\pi}{n}=\\pi\\cdot\\frac{\\sin(\\pi/n)}{\\pi/n}\\to\\pi$。'),
  q(String.raw`\lim_{n\to\infty}n\tan\frac{\\pi}{n}`, ['\\pi', '1', '2', '\\infty'], 'medium', '$n\\tan\\frac{\\pi}{n}=\\pi\\cdot\\frac{\\tan(\\pi/n)}{\\pi/n}\\to\\pi$。')
);

module.exports = rows;
