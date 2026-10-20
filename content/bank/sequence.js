'use strict';

/**
 * 数列极限 · 50 题
 */

const T = (tex) => '$' + tex + '$';
const q = (stem, opts, diff, expl) => [
  stem,
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];

// 一、(1+k/n)^n → e^k
for (const k of [1, 2, 3, 4, 5]) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}\left(1+\frac{${k}}{n}\right)^{n}`),
      [`e^{${k}}`, 'e', '1', `e^{${k + 1}}`],
      'easy',
      `$v(u-1)=n\\cdot\\frac{${k}}{n}=${k}$，故为 $e^{${k}}$。`
    )
  );
}

// 二、(1-k/n)^n → e^{-k}
for (const k of [1, 2, 3, 4]) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}\left(1-\frac{${k}}{n}\right)^{n}`),
      [`e^{-${k}}`, '1', `e^{${k}}`, String(-k)],
      'medium',
      `$v(u-1)=n\\cdot\\left(-\\frac{${k}}{n}\\right)=-${k}$。`
    )
  );
}

// 三、(1+1/(kn))^n → e^{1/k}
for (const k of [2, 3, 4, 5]) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{${k}n}\right)^{n}`),
      [`e^{\\frac{1}{${k}}}`, 'e', '1', `\\frac{1}{${k}}`],
      'medium',
      `$v(u-1)=n\\cdot\\frac{1}{${k}n}=\\frac{1}{${k}}$。`
    )
  );
}

// 四、(1+k/n²)^n → 1
for (const k of [1, 2, 3]) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}\left(1+\frac{${k}}{n^{2}}\right)^{n}`),
      ['1', 'e', '0', '\\infty'],
      'medium',
      `$v(u-1)=\\frac{${k}}{n}\\to 0$，故为 $e^{0}=1$。`
    )
  );
}

// 五、(1+1/n)^{kn} → e^k
for (const k of [2, 3, 4, 5]) {
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^{${k}n}`),
      [`e^{${k}}`, 'e', '1', `e^{${k + 1}}`],
      'easy',
      `$v(u-1)=${k}n\\cdot\\frac{1}{n}=${k}$。`
    )
  );
}

// 六、单调有界递推数列
rows.push(
  q(
    '设 $x_{1}=\\sqrt{2}$，$x_{n+1}=\\sqrt{2+x_{n}}$，求 $\\lim_{n\\to\\infty}x_{n}$。',
    ['2', '1', '\\sqrt{2}', '\\infty'],
    'hard',
    '设极限为 $A$，则 $A=\\sqrt{2+A}$，解得 $A=2$；数列单调递增且有上界 $2$。'
  ),
  q(
    '设 $x_{1}=\\sqrt{6}$，$x_{n+1}=\\sqrt{6+x_{n}}$，求 $\\lim_{n\\to\\infty}x_{n}$。',
    ['3', '2', '\\sqrt{6}', '\\infty'],
    'hard',
    '设极限为 $A$，则 $A=\\sqrt{6+A}$，解得 $A=3$。'
  ),
  q(
    '设 $x_{1}=1$，$x_{n+1}=\\dfrac{1}{2}\\left(x_{n}+\\dfrac{2}{x_{n}}\\right)$，求 $\\lim_{n\\to\\infty}x_{n}$。',
    ['\\sqrt{2}', '2', '1', '\\infty'],
    'hard',
    '不动点满足 $A=\\frac{1}{2}\\left(A+\\frac{2}{A}\\right)$，得 $A=\\sqrt{2}$。'
  ),
  q(
    '设 $x_{1}=1$，$x_{n+1}=1+\\dfrac{x_{n}}{2}$，求 $\\lim_{n\\to\\infty}x_{n}$。',
    ['2', '1', '\\frac{3}{2}', '\\infty'],
    'hard',
    '设极限为 $A$，则 $A=1+\\frac{A}{2}$，得 $A=2$。'
  )
);

// 七、夹逼：振荡项
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\frac{\sin n}{n}`), ['0', '1', '\\pi', '\\infty'], 'easy', '$|\\sin n|\\le 1$，故 $\\left|\\frac{\\sin n}{n}\\right|\\le\\frac{1}{n}\\to 0$。'),
  q(T(String.raw`\lim_{n\to\infty}\frac{\cos n}{n}`), ['0', '1', '\\pi', '\\infty'], 'easy', '$|\\cos n|\\le 1$，夹逼得 $0$。'),
  q(T(String.raw`\lim_{n\to\infty}\frac{(-1)^{n}}{n}`), ['0', '1', '-1', '\\infty'], 'easy', '绝对值不超过 $\\frac{1}{n}\\to 0$。'),
  q(T(String.raw`\lim_{n\to\infty}\frac{n!}{n^{n}}`), ['0', '1', '\\infty', 'e'], 'hard', '$0<\\frac{n!}{n^{n}}\\le\\frac{1}{n}\\to 0$。')
);

// 八、底数含 2^n、3^n
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\left(2^{n}+3^{n}\right)^{\frac{1}{n}}`), ['3', '2', '5', '\\infty'], 'medium', '提出 $3^{n}$，得 $3\\left(1+\\left(\\frac{2}{3}\\right)^{n}\\right)^{1/n}\\to 3$。'),
  q(T(String.raw`\lim_{n\to\infty}\left(1+2^{n}\right)^{\frac{1}{n}}`), ['2', '1', '3', '\\infty'], 'medium', '提出 $2^{n}$，得 $2\\left(1+2^{-n}\\right)^{1/n}\\to 2$。'),
  q(T(String.raw`\lim_{n\to\infty}\left(3^{n}+4^{n}\right)^{\frac{1}{n}}`), ['4', '3', '7', '\\infty'], 'medium', '提出 $4^{n}$，得 $4\\left(1+\\left(\\frac{3}{4}\\right)^{n}\\right)^{1/n}\\to 4$。')
);

// 九、n(√(n²+k)-n)
for (const k of [1, 2]) {
  const ans = k / 2;
  const ansTex = Number.isInteger(ans) ? String(ans) : `\\frac{${k}}{2}`;
  rows.push(
    q(
      T(String.raw`\lim_{n\to\infty}n\left(\sqrt{n^{2}+${k}}-n\right)`),
      [ansTex, String(k), '0', '\\infty'],
      'medium',
      `有理化：$\\frac{${k}n}{\\sqrt{n^{2}+${k}}+n}\\to\\frac{${k}}{2}$。`
    )
  );
}

// 十、n+1 次幂
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^{n+1}`), ['e', '1', 'e^{2}', '\\infty'], 'medium', '$v(u-1)=(n+1)\\cdot\\frac{1}{n}\\to 1$。'),
  q(T(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n+1}\right)^{n}`), ['e', '1', 'e^{-1}', '\\infty'], 'medium', '$v(u-1)=n\\cdot\\frac{1}{n+1}\\to 1$。'),
  q(T(String.raw`\lim_{n\to\infty}\left(1-\frac{1}{n+1}\right)^{n}`), ['e^{-1}', 'e', '1', '0'], 'medium', '$v(u-1)=n\\cdot\\left(-\\frac{1}{n+1}\\right)\\to -1$。')
);

// 十一、n/(n+1) 型
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\left(\frac{n}{n+1}\right)^{n}`), ['e^{-1}', 'e', '1', '0'], 'medium', '化为 $\\left(1-\\frac{1}{n+1}\\right)^{n}$。'),
  q(T(String.raw`\lim_{n\to\infty}\left(\frac{n+1}{n}\right)^{n+1}`), ['e', 'e^{-1}', '1', '\\infty'], 'medium', '化为 $\\left(1+\\frac{1}{n}\\right)^{n+1}$。')
);

// 十二、和式：定积分定义
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{1}{n+k}`), ['\\ln 2', '1', '0', '2'], 'hard', '化成 $\\frac{1}{n}\\sum\\frac{1}{1+\\frac{k}{n}}\\to\\int_{0}^{1}\\frac{dx}{1+x}=\\ln 2$。'),
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{n}{n^{2}+k^{2}}`), ['\\frac{\\pi}{4}', '\\frac{\\pi}{2}', '\\ln 2', '1'], 'hard', '化成 $\\frac{1}{n}\\sum\\frac{1}{1+\\left(\\frac{k}{n}\\right)^{2}}\\to\\int_{0}^{1}\\frac{dx}{1+x^{2}}=\\frac{\\pi}{4}$。'),
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{k}{n^{2}+k^{2}}`), ['\\frac{1}{2}\\ln 2', '\\ln 2', '\\frac{\\pi}{4}', '\\frac{1}{2}'], 'hard', '化成 $\\frac{1}{n}\\sum\\frac{\\frac{k}{n}}{1+\\left(\\frac{k}{n}\\right)^{2}}\\to\\int_{0}^{1}\\frac{x\\,dx}{1+x^{2}}=\\frac{1}{2}\\ln 2$。'),
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{k}{n^{2}}`), ['\\frac{1}{2}', '1', '0', '\\frac{1}{3}'], 'easy', '$\\sum k=\\frac{n(n+1)}{2}$，除以 $n^{2}$ 得 $\\frac{1}{2}$。'),
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{1}{\sqrt{n^{2}+k}}`), ['1', '0', '\\ln 2', '\\infty'], 'hard', '每项介于 $\\frac{1}{\\sqrt{n^{2}+n}}$ 与 $\\frac{1}{\\sqrt{n^{2}+1}}$ 之间，夹逼得 $1$。'),
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{1}{n^{2}+k}`), ['0', '1', '\\frac{1}{2}', '\\ln 2'], 'medium', '放缩：$0\\le\\sum\\frac{1}{n^{2}+k}\\le\\frac{n}{n^{2}+1}\\to 0$。'),
  q(T(String.raw`\lim_{n\to\infty}\sum_{k=1}^{n}\frac{1}{2n+k}`), ['\\ln\\frac{3}{2}', '\\ln 2', '\\frac{1}{2}\\ln 3', '0'], 'hard', '化成 $\\frac{1}{n}\\sum\\frac{1}{2+\\frac{k}{n}}\\to\\int_{0}^{1}\\frac{dx}{2+x}=\\ln\\frac{3}{2}$。')
);

// 十三、其它
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\frac{1+\frac{1}{2}+\cdots+\frac{1}{n}}{\ln n}`), ['1', '0', '\\ln 2', '\\infty'], 'hard', '施托尔茨：$\\frac{\\frac{1}{n+1}}{\\ln(n+1)-\\ln n}\\to 1$。'),
  q(T(String.raw`\lim_{n\to\infty}\frac{1^{2}+2^{2}+\cdots+n^{2}}{n^{3}}`), ['\\frac{1}{3}', '\\frac{1}{2}', '1', '0'], 'medium', '分子为 $\\frac{n(n+1)(2n+1)}{6}$，除以 $n^{3}$ 得 $\\frac{1}{3}$。'),
  q(T(String.raw`\lim_{n\to\infty}n\sin\frac{\pi}{n}`), ['\\pi', '1', '2', '\\infty'], 'medium', '$n\\sin\\frac{\\pi}{n}=\\pi\\cdot\\frac{\\sin(\\pi/n)}{\\pi/n}\\to\\pi$。')
);

// 十四、补充
rows.push(
  q(T(String.raw`\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^{n+2}`), ['e', '1', 'e^{2}', '\\infty'], 'easy', '$v(u-1)=(n+2)\\cdot\\frac{1}{n}\\to 1$。'),
  q(T(String.raw`\lim_{n\to\infty}\left(1+\frac{2}{n}\right)^{\frac{n}{2}}`), ['e', '1', 'e^{2}', '\\sqrt{e}'], 'medium', '$v(u-1)=\\frac{n}{2}\\cdot\\frac{2}{n}=1$。')
);

module.exports = rows;
