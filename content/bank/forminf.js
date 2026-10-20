'use strict';

/**
 * ∞/∞ 型 · 50 题
 */

const q = (stem, opts, diff, expl) => [
  '$' + stem + '$',
  opts.map((o) => '$' + o + '$'),
  diff,
  expl,
];

const rows = [];

// 一、同次二次多项式：系数比
const quad = [
  ['3x^{2}+2x-1', '2x^{2}-x+3', '\\frac{3}{2}', ['\\frac{2}{3}', '1', '3']],
  ['5x^{2}-3x+2', '4x^{2}+x-1', '\\frac{5}{4}', ['\\frac{4}{5}', '1', '5']],
  ['x^{2}+1', '2x^{2}-3', '\\frac{1}{2}', ['2', '1', '0']],
  ['7x^{2}-2', '3x^{2}+5', '\\frac{7}{3}', ['\\frac{3}{7}', '1', '7']],
  ['2x^{2}+x', '5x^{2}-x', '\\frac{2}{5}', ['\\frac{5}{2}', '1', '2']],
  ['4x^{2}-x+1', 'x^{2}+x+1', '4', ['\\frac{1}{4}', '1', '0']],
  ['9x^{2}+1', '3x^{2}-2', '3', ['\\frac{1}{3}', '1', '9']],
  ['6x^{2}-5x', '2x^{2}+7', '3', ['\\frac{1}{3}', '6', '2']],
];
for (const [num, den, ans, wrongs] of quad) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{${num}}{${den}}`,
      [ans, ...wrongs],
      'easy',
      '同次多项式之比等于最高次项系数之比；也可分子分母同除 $x^{2}$ 直接看出。'
    )
  );
}

// 二、分子次数高于分母：∞
const cubicOverQuad = [
  ['x^{3}+2x', 'x^{2}+1'],
  ['2x^{3}-1', 'x^{2}+3'],
  ['x^{3}+x', '3x^{2}-2'],
  ['5x^{3}+2', 'x^{2}+x'],
  ['x^{3}-x^{2}+1', '2x^{2}+1'],
];
for (const [num, den] of cubicOverQuad) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{${num}}{${den}}`,
      ['\\infty', '0', '1', '2'],
      'medium',
      '分子次数高于分母，同除最高次后仍剩正幂，极限为 $\\infty$。'
    )
  );
}

// 三、分母次数高于分子：0
const linearOverQuad = [
  ['2x+1', 'x^{2}+3'],
  ['x-5', '2x^{2}+1'],
  ['3x+2', 'x^{2}-x+1'],
  ['x+1', '4x^{2}+9'],
];
for (const [num, den] of linearOverQuad) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{${num}}{${den}}`,
      ['0', '1', '\\infty', '\\frac{1}{2}'],
      'easy',
      '分母次数高于分子，同除最高次后分子趋于 $0$，极限为 $0$。'
    )
  );
}

// 四、(a x + sin x)/x
for (const a of [2, 3, 4, 5, 6]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{${a}x+\sin x}{x}`,
      [String(a), '0', '1', String(a + 1)],
      'easy',
      `拆成 $${a}+\\frac{\\sin x}{x}$，第二项由“有界量乘无穷小”得 $0$，故极限为 $${a}$。`
    )
  );
}

// 五、x^n / e^x
for (const n of [1, 2, 3, 4, 5]) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{x^{${n}}}{e^{x}}`,
      ['0', '1', '\\infty', String(n + 1)],
      'medium',
      '指数增长快于任何幂函数，洛必达逐次求导（共 ' + n + ' 次）后分子为常数，极限为 $0$。'
    )
  );
}

// 六、ln x / x^a
const logDen = ['x', 'x^{2}', '\\sqrt{x}', 'x^{3}'];
for (const den of logDen) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{\ln x}{${den}}`,
      ['0', '1', '\\infty', 'e'],
      'medium',
      '$\\ln x$ 增长慢于任何正幂，洛必达一次即可得极限 $0$。'
    )
  );
}

// 七、三次之比
const cubicRatio = [
  ['2x^{3}+1', '3x^{3}-x', '\\frac{2}{3}', ['\\frac{3}{2}', '1', '2']],
  ['x^{3}-2x', '4x^{3}+1', '\\frac{1}{4}', ['4', '1', '0']],
  ['5x^{3}+x^{2}', '2x^{3}-3', '\\frac{5}{2}', ['\\frac{2}{5}', '1', '5']],
  ['3x^{3}-1', '7x^{3}+x', '\\frac{3}{7}', ['\\frac{7}{3}', '1', '3']],
  ['x^{3}+1', 'x^{3}-1', '1', ['0', '\\infty', '-1']],
];
for (const [num, den, ans, wrongs] of cubicRatio) {
  rows.push(
    q(
      String.raw`\lim_{x\to\infty}\frac{${num}}{${den}}`,
      [ans, ...wrongs],
      'medium',
      '同次多项式之比等于最高次项系数之比。'
    )
  );
}

// 八、指数之比
rows.push(
  q(
    String.raw`\lim_{x\to\infty}\frac{e^{2x}+3}{e^{2x}-1}`,
    ['1', '0', '\\infty', '3'],
    'medium',
    '分子分母同除 $e^{2x}$，得 $\\frac{1+3e^{-2x}}{1-e^{-2x}}\\to 1$。'
  ),
  q(
    String.raw`\lim_{x\to\infty}\frac{e^{3x}-1}{e^{3x}+2}`,
    ['1', '0', '\\infty', '\\frac{1}{2}'],
    'medium',
    '同除 $e^{3x}$，得 $\\frac{1-e^{-3x}}{1+2e^{-3x}}\\to 1$。'
  ),
  q(
    String.raw`\lim_{x\to\infty}\frac{e^{x}+x}{e^{x}-x}`,
    ['1', '0', '\\infty', '2'],
    'medium',
    '分子分母同除 $e^{x}$，$\\frac{x}{e^{x}}\\to 0$，故极限为 $1$。'
  ),
  q(
    String.raw`\lim_{x\to\infty}\frac{e^{2x}+e^{x}}{e^{2x}-1}`,
    ['1', '0', '\\infty', '2'],
    'medium',
    '同除 $e^{2x}$，$e^{-x}\\to 0$，极限为 $1$。'
  )
);

// 九、a^x / b^x
rows.push(
  q(String.raw`\lim_{x\to\infty}\frac{2^{x}}{3^{x}}`, ['0', '1', '\\infty', '\\frac{2}{3}'], 'hard', '底数比 $\\frac{2}{3}<1$，故趋于 $0$。'),
  q(String.raw`\lim_{x\to\infty}\frac{3^{x}}{2^{x}}`, ['\\infty', '0', '1', '\\frac{3}{2}'], 'hard', '底数比 $\\frac{3}{2}>1$，故趋于 $\\infty$。'),
  q(String.raw`\lim_{x\to\infty}\frac{5^{x}+1}{2^{x}}`, ['\\infty', '0', '1', '\\frac{5}{2}'], 'hard', '主导项为 $\\left(\\frac{5}{2}\\right)^{x}\\to\\infty$。'),
  q(String.raw`\lim_{x\to\infty}\frac{1.1^{x}}{1.2^{x}}`, ['0', '1', '\\infty', '\\frac{11}{12}'], 'hard', '底数比 $\\frac{11}{12}<1$，故趋于 $0$。')
);

// 十、含振荡项但可拆
rows.push(
  q(String.raw`\lim_{x\to\infty}\frac{x+\cos x}{x}`, ['1', '0', '2', '\\infty'], 'easy', '拆成 $1+\\frac{\\cos x}{x}$，第二项趋于 $0$。'),
  q(String.raw`\lim_{x\to\infty}\frac{2x-\sin x}{x}`, ['2', '1', '0', '-1'], 'easy', '拆成 $2-\\frac{\\sin x}{x}$，极限为 $2$。'),
  q(String.raw`\lim_{x\to\infty}\frac{3x+\cos 2x}{x}`, ['3', '1', '0', '6'], 'easy', '拆成 $3+\\frac{\\cos 2x}{x}$，极限为 $3$。')
);

// 十一、分子分母都带小振荡
rows.push(
  q(String.raw`\lim_{x\to\infty}\frac{x^{2}+\sin x}{x^{2}+1}`, ['1', '0', '\\infty', '2'], 'medium', '同除 $x^{2}$，$\\frac{\\sin x}{x^{2}}\\to 0$，极限为 $1$。'),
  q(String.raw`\lim_{x\to\infty}\frac{2x^{2}+\cos x}{2x^{2}-1}`, ['1', '0', '\\infty', '2'], 'medium', '同除 $2x^{2}$，振荡项被压成 $0$，极限为 $1$。'),
  q(String.raw`\lim_{x\to\infty}\frac{x^{2}+x}{x^{2}+\sin x}`, ['1', '0', '\\infty', '2'], 'medium', '同除 $x^{2}$，$\\frac{\\sin x}{x^{2}}\\to 0$，极限为 $1$。')
);

module.exports = rows;
