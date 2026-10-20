'use strict';

/**
 * 幂指型 · 50 题（1^∞、0^0、∞^0、0^∞）
 */

const q = (stem, opts, diff, expl) => [
  '$' + stem + '$',
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];

// 一、(1+kx)^{1/x} → e^k
for (const k of [2, 3, 4, 5, 6, 7]) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}(1+${k}x)^{1/x}`,
      [`e^{${k}}`, '1', `e^{${k + 1}}`, String(k)],
      'easy',
      `$1^{\\infty}$ 型，$e^{\\lim v(u-1)}=e^{\\lim\\frac{1}{x}\\cdot ${k}x}=e^{${k}}$。`
    )
  );
}

// 二、(1+1/x)^{kx} → e^k
for (const k of [2, 3, 4, 5, 6]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(1+\frac{1}{x}\right)^{${k}x}`,
      [`e^{${k}}`, 'e', '1', String(k)],
      'medium',
      `$v(u-1)=${k}x\\cdot\\frac{1}{x}=${k}$，故极限为 $e^{${k}}$。`
    )
  );
}

// 三、(1-k/x)^x → e^{-k}
for (const k of [1, 2, 3, 4]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\left(1-\frac{${k}}{x}\right)^{x}`,
      [`e^{-${k}}`, '1', `e^{${k}}`, String(-k)],
      'medium',
      `$v(u-1)=x\\cdot\\left(-\\frac{${k}}{x}\\right)=-${k}$，故极限为 $e^{-${k}}$。`
    )
  );
}

// 四、数列中的 1^∞
rows.push(
  q(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^{n}`, ['e', '1', 'e^{2}', '\\infty'], 'easy', '第二个重要极限。'),
  q(String.raw`\lim_{n\to\infty}\left(1+\frac{2}{n}\right)^{n}`, ['e^{2}', 'e', '1', '2'], 'easy', '$v(u-1)=n\\cdot\\frac{2}{n}=2$。'),
  q(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{2n}\right)^{n}`, ['e^{1/2}', 'e', '1', '\\frac{1}{2}'], 'medium', '$v(u-1)=n\\cdot\\frac{1}{2n}=\\frac{1}{2}$。'),
  q(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n^{2}}\right)^{n}`, ['1', 'e', '\\infty', '0'], 'medium', '$v(u-1)=n\\cdot\\frac{1}{n^{2}}=\\frac{1}{n}\\to 0$，极限为 $e^{0}=1$。'),
  q(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^{n^{2}}`, ['\\infty', 'e', '1', '0'], 'medium', '$v(u-1)=n^{2}\\cdot\\frac{1}{n}=n\\to\\infty$，极限为 $\\infty$。')
);

// 五、底数为 sin x / x 等
rows.push(
  q(String.raw`\lim_{x\to 0}\left(\frac{\sin x}{x}\right)^{1/x^{2}}`, ['e^{-1/6}', 'e^{1/6}', '1', 'e^{-1/2}'], 'hard', '$\\frac{\\sin x-x}{x^{3}}\\to-\\frac{1}{6}$。'),
  q(String.raw`\lim_{x\to 0}\left(\frac{\tan x}{x}\right)^{1/x^{2}}`, ['e^{1/3}', 'e^{-1/3}', '1', 'e^{1/6}'], 'hard', '$\\frac{\\tan x-x}{x^{3}}\\to\\frac{1}{3}$。'),
  q(String.raw`\lim_{x\to 0}\left(\frac{\arcsin x}{x}\right)^{1/x^{2}}`, ['e^{1/6}', 'e^{-1/6}', '1', 'e^{1/3}'], 'hard', '$\\frac{\\arcsin x-x}{x^{3}}\\to\\frac{1}{6}$。')
);

// 六、底数为 cos
const cosBase = [
  ['x', 'e^{-1/2}'],
  ['2x', 'e^{-2}'],
  ['3x', 'e^{-\\frac{9}{2}}'],
];
for (const [arg, ans] of cosBase) {
  rows.push(
    q(
      String.raw`\lim_{x\to 0}(\cos ${arg})^{1/x^{2}}`,
      [ans, '1', 'e^{-1}', 'e'],
      'hard',
      '$\\ln\\cos u\\sim-\\frac{u^{2}}{2}$，指数部分为 $-\\frac{1}{2}\\left(\\frac{u}{x}\\right)^{2}$。'
    )
  );
}

// 七、∞^0：x^{1/x} 等
rows.push(
  q(String.raw`\lim_{x\to\infty}x^{1/x}`, ['1', 'e', '\\infty', '0'], 'easy', '取对数得 $\\frac{\\ln x}{x}\\to 0$。'),
  q(String.raw`\lim_{x\to\infty}x^{2/x}`, ['1', 'e^{2}', '\\infty', '2'], 'easy', '取对数得 $\\frac{2\\ln x}{x}\\to 0$。'),
  q(String.raw`\lim_{x\to\infty}x^{1/x^{2}}`, ['1', 'e', '\\infty', '0'], 'easy', '取对数得 $\\frac{\\ln x}{x^{2}}\\to 0$。'),
  q(String.raw`\lim_{n\to\infty}n^{\frac{1}{n}}`, ['1', 'e', '\\infty', '0'], 'easy', '取对数得 $\\frac{\\ln n}{n}\\to 0$。')
);

// 八、0^0：x^x 等
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}x^{x}`, ['1', '0', 'e', '\\infty'], 'easy', '$x\\ln x\\to 0$，故原式为 $e^{0}=1$。'),
  q(String.raw`\lim_{x\to 0^{+}}(\sin x)^{x}`, ['1', '0', 'e', '\\infty'], 'easy', '$\\sin x\\sim x$，$x\\ln x\\to 0$。'),
  q(String.raw`\lim_{x\to 0^{+}}(\tan x)^{x}`, ['1', '0', 'e', '\\infty'], 'easy', '$x\\ln\\tan x\\to 0$。'),
  q(String.raw`\lim_{x\to 0^{+}}(2x)^{x}`, ['1', '0', 'e', '2'], 'easy', '$x\\ln(2x)\\to 0$，原式为 $1$。')
);

// 九、底为 x，指数为 0 型函数
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}x^{\sin x}`, ['1', '0', 'e', '\\infty'], 'hard', '$\\sin x\\ln x\\sim x\\ln x\\to 0$。'),
  q(String.raw`\lim_{x\to 0^{+}}x^{\tan x}`, ['1', '0', 'e', '\\infty'], 'hard', '$\\tan x\\ln x\\sim x\\ln x\\to 0$。')
);

// 十、∞^0 与 e 的抬升
rows.push(
  q(String.raw`\lim_{x\to\infty}\left(e^{x}\right)^{1/x}`, ['e', '1', 'e^{2}', '\\infty'], 'medium', '取对数得 $\\frac{x}{x}=1$。'),
  q(String.raw`\lim_{x\to 1^{+}}x^{1/\ln x}`, ['e', '1', 'x', '\\infty'], 'medium', '取对数得 $\\frac{\\ln x}{\\ln x}=1$。'),
  q(String.raw`\lim_{x\to\infty}(\ln x)^{1/x}`, ['1', 'e', '\\infty', '0'], 'medium', '取对数得 $\\frac{\\ln\\ln x}{x}\\to 0$。')
);

// 十一、1^∞ 的三角与线性变体
rows.push(
  q(String.raw`\lim_{x\to 0}(1+\sin x)^{1/x}`, ['e', '1', 'e^{2}', '\\infty'], 'medium', '$v(u-1)=\\frac{\\sin x}{x}\\to 1$。'),
  q(String.raw`\lim_{x\to 0}(1+\tan x)^{1/x}`, ['e', '1', 'e^{2}', '\\infty'], 'medium', '$v(u-1)=\\frac{\\tan x}{x}\\to 1$。'),
  q(String.raw`\lim_{x\to 0}(1+x)^{1/(2x)}`, ['e^{1/2}', 'e', '1', '\\frac{1}{2}'], 'medium', '$v(u-1)=\\frac{x}{2x}=\\frac{1}{2}$。'),
  q(String.raw`\lim_{x\to 0}(1+3x)^{1/x}`, ['e^{3}', 'e', '3', '1'], 'easy', '$v(u-1)=\\frac{3x}{x}=3$。')
);

// 十二、增长到无穷的幂指
rows.push(
  q(String.raw`\lim_{x\to\infty}\left(1+\frac{1}{x}\right)^{x^{2}}`, ['\\infty', 'e', '1', '0'], 'hard', '取对数得 $x^{2}\\ln\\left(1+\\frac{1}{x}\\right)\\sim x\\to\\infty$。'),
  q(String.raw`\lim_{n\to\infty}\left(1+\frac{2}{n}\right)^{n^{2}}`, ['\\infty', 'e^{2}', '1', '0'], 'hard', '取对数得 $n^{2}\\ln\\left(1+\\frac{2}{n}\\right)\\sim 2n\\to\\infty$。')
);

// 十三、n/(n+1) 型
rows.push(
  q(String.raw`\lim_{n\to\infty}\left(\frac{n}{n+1}\right)^{n}`, ['e^{-1}', 'e', '1', '0'], 'medium', '化为 $\\left(1-\\frac{1}{n+1}\\right)^{n}$，指数部分趋于 $-1$。'),
  q(String.raw`\lim_{n\to\infty}\left(\frac{n}{n+2}\right)^{n}`, ['e^{-2}', 'e^{-1}', 'e', '1'], 'medium', '化为 $\\left(1-\\frac{2}{n+2}\\right)^{n}$，指数部分趋于 $-2$。'),
  q(String.raw`\lim_{n\to\infty}\left(\frac{n+1}{n}\right)^{n}`, ['e', 'e^{-1}', '1', '\\infty'], 'easy', '即 $\\left(1+\\frac{1}{n}\\right)^{n}\\to e$。')
);

// 十四、阶数错位的幂指
rows.push(
  q(String.raw`\lim_{x\to 0^{+}}(1+x)^{1/x^{2}}`, ['\\infty', 'e', '1', '0'], 'hard', '取对数得 $\\frac{\\ln(1+x)}{x^{2}}\\sim\\frac{1}{x}\\to\\infty$。'),
  q(String.raw`\lim_{x\to 0}(1+x^{2})^{1/x}`, ['1', 'e', '\\infty', '0'], 'hard', '取对数得 $\\frac{\\ln(1+x^{2})}{x}\\sim x\\to 0$，故为 $1$。')
);

module.exports = rows;
