'use strict';

/**
 * 无穷小比较 · 50 题
 */

const m = (t) => '$' + t + '$';
const q = (stem, opts, diff, expl) => [stem, opts, diff, expl];
const REL = ['等价无穷小', '同阶但不等价', '高阶无穷小', '低阶无穷小'];

const rows = [];

// 一、关系判断
const relations = [
  [m('x'), m('\\sin x'), '等价无穷小', '$\\lim\\frac{\\sin x}{x}=1$。'],
  [m('x'), m('\\tan x'), '等价无穷小', '$\\tan x\\sim x$。'],
  [m('x^{2}'), m('1-\\cos x'), '同阶但不等价', '比值为 $\\frac{1}{2}$，同阶但不等价。'],
  [m('x^{3}'), m('x-\\sin x'), '同阶但不等价', '比值为 $\\frac{1}{6}$。'],
  [m('x^{2}'), m('x-\\sin x'), '高阶无穷小', '$x-\\sin x\\sim\\frac{x^{3}}{6}$，比 $x^{2}$ 高阶。'],
  [m('x'), m('\\sqrt{1+x}-1'), '同阶但不等价', '比值为 $\\frac{1}{2}$。'],
  [m('x'), m('\\ln(1+x)'), '等价无穷小', '$\\ln(1+x)\\sim x$。'],
  [m('x^{2}'), m('x-\\ln(1+x)'), '同阶但不等价', '$x-\\ln(1+x)\\sim\\frac{x^{2}}{2}$。'],
  [m('x^{3}'), m('\\tan x-\\sin x'), '同阶但不等价', '$\\tan x-\\sin x\\sim\\frac{x^{3}}{2}$。'],
  [m('x'), m('1-\\cos x'), '高阶无穷小', '$1-\\cos x\\sim\\frac{x^{2}}{2}$，比 $x$ 高阶。'],
];
for (const [g, f, rel, expl] of relations) {
  const opts = [rel, ...REL.filter((r) => r !== rel)];
  rows.push(q(`当 $x\\to 0$ 时，${f} 与 ${g} 的关系是？`, opts, 'medium', expl));
}

// 二、求阶数
const orders = [
  ['x-\\sin x', '3', ['1', '2', '4'], '三阶'],
  ['\\tan x-x', '3', ['1', '2', '4'], '三阶'],
  ['1-\\cos x', '2', ['1', '3', '4'], '二阶'],
  ['\\sqrt{1+x}-1', '1', ['2', '3', '4'], '一阶'],
  ['\\ln(1+x)-x', '2', ['1', '3', '4'], '二阶'],
  ['e^{x}-1-x', '2', ['1', '3', '4'], '二阶'],
  ['\\sin x-x+\\frac{x^{3}}{6}', '5', ['3', '4', '6'], '五阶'],
  ['\\tan(\\sin x)-\\sin(\\tan x)', '7', ['5', '6', '8'], '七阶'],
  ['x-\\arctan x', '3', ['1', '2', '4'], '三阶'],
  ['\\arcsin x-x', '3', ['1', '2', '4'], '三阶'],
  ['x-\\ln(1+x)', '2', ['1', '3', '4'], '二阶'],
  ['1-\\cos\\left(x^{2}\\right)', '4', ['2', '3', '5'], '四阶'],
];
for (const [f, ans, wrongs, note] of orders) {
  rows.push(
    q(
      `当 $x\\to 0$ 时，${m(f)} 是 $x$ 的几阶无穷小？`,
      [`${ans} 阶`, ...wrongs.map((w) => `${w} 阶`)],
      'medium',
      `由等价式可知为${note}无穷小。`
    )
  );
}

// 三、比较阶数高低
const highest = [
  [['x^{2}', 'x^{3}', '\\sin x', '1-\\cos x'], 'x^{3}', '三阶最高。'],
  [['x-\\sin x', '1-\\cos x', 'x^{2}', 'x^{4}'], 'x^{4}', '四阶最高。'],
  [['\\tan x-x', 'x^{2}', 'x', '1-\\cos x'], '\\tan x-x', '三阶高于二阶与一阶。'],
  [['x-\\ln(1+x)', 'x^{3}', 'x^{2}', '\\sqrt{1+x}-1'], 'x^{3}', '三阶最高。'],
  [['\\sin x', 'x-\\sin x', '1-\\cos x', 'x^{4}'], 'x^{4}', '四阶最高。'],
  [['e^{x}-1-x', 'x-\\sin x', 'x^{3}', 'x^{5}'], 'x^{5}', '五阶最高。'],
  [['\\arcsin x-x', 'x-\\arctan x', 'x^{2}', 'x^{4}'], 'x^{4}', '四阶最高。'],
  [['\\ln(1+x)-x', '\\tan x-x', '1-\\cos x', 'x^{5}'], 'x^{5}', '五阶最高。'],
  [['\\sin x-x+\\frac{x^{3}}{6}', 'x-\\sin x', 'x^{4}', '1-\\cos x'], '\\sin x-x+\\frac{x^{3}}{6}', '五阶最高。'],
  [['\\tan(\\sin x)-\\sin(\\tan x)', 'x^{5}', 'x^{3}', 'x^{4}'], '\\tan(\\sin x)-\\sin(\\tan x)', '七阶最高。'],
];
for (const [list, ans, expl] of highest) {
  const opts = [ans, ...list.filter((x) => x !== ans)];
  rows.push(q('当 $x\\to 0$ 时，下列无穷小中阶数最高的是？', opts.map((t) => m(t)), 'hard', expl));
}

// 四、主部系数
const coeff = [
  ['1-\\cos x', 'x^{2}', '\\frac{1}{2}', ['1', '\\frac{1}{4}', '2'], '$1-\\cos x\\sim\\frac{x^{2}}{2}$。'],
  ['e^{x}-1-x', 'x^{2}', '\\frac{1}{2}', ['1', '\\frac{1}{6}', '2'], '展开到二阶。'],
  ['x-\\sin x', 'x^{3}', '\\frac{1}{6}', ['\\frac{1}{3}', '\\frac{1}{2}', '1'], '$\\sin x=x-\\frac{x^{3}}{6}+\\cdots$。'],
  ['\\tan x-x', 'x^{3}', '\\frac{1}{3}', ['\\frac{1}{6}', '\\frac{1}{2}', '1'], '$\\tan x=x+\\frac{x^{3}}{3}+\\cdots$。'],
  ['x-\\ln(1+x)', 'x^{2}', '\\frac{1}{2}', ['1', '\\frac{1}{3}', '-\\frac{1}{2}'], '$\\ln(1+x)=x-\\frac{x^{2}}{2}+\\cdots$。'],
  ['\\sqrt{1+x}-1', 'x', '\\frac{1}{2}', ['1', '\\frac{1}{4}', '2'], '$\\sqrt{1+x}-1\\sim\\frac{x}{2}$。'],
  ['\\arcsin x-x', 'x^{3}', '\\frac{1}{6}', ['\\frac{1}{3}', '\\frac{1}{2}', '1'], '$\\arcsin x=x+\\frac{x^{3}}{6}+\\cdots$。'],
  ['x-\\arctan x', 'x^{3}', '\\frac{1}{3}', ['\\frac{1}{6}', '\\frac{1}{2}', '1'], '$\\arctan x=x-\\frac{x^{3}}{3}+\\cdots$。'],
  ['\\tan x-\\sin x', 'x^{3}', '\\frac{1}{2}', ['\\frac{1}{6}', '\\frac{1}{3}', '1'], '$\\tan x-\\sin x\\sim\\frac{x^{3}}{2}$。'],
  ['1-\\cos 2x', 'x^{2}', '2', ['1', '\\frac{1}{2}', '4'], '$1-\\cos 2x\\sim 2x^{2}$。'],
];
for (const [f, g, ans, wrongs, expl] of coeff) {
  rows.push(q(`$\\lim_{x\\to 0}\\dfrac{${f}}{${g}}=$`, [ans, ...wrongs].map((t) => m(t)), 'medium', expl));
}

// 五、带系数的比较
for (const k of [2, 3, 4, 5]) {
  const ans = (k * k) / 2;
  const ansTex = Number.isInteger(ans) ? String(ans) : `\\frac{${k * k}}{2}`;
  rows.push(
    q(
      `$\\lim_{x\\to 0}\\dfrac{1-\\cos ${k}x}{x^{2}}=$`,
      [ansTex, String(k + 1), String(k * k), '\\frac{1}{2}'].map((t) => m(t)),
      'medium',
      `$1-\\cos ${k}x\\sim\\frac{${k * k}x^{2}}{2}$。`
    )
  );
}
for (const k of [2, 3, 4, 5]) {
  rows.push(
    q(
      `$\\lim_{x\\to 0}\\dfrac{\\sin ${k}x}{x}=$`,
      [String(k), '0', '1', String(k * k)].map((t) => m(t)),
      'easy',
      `$\\sin ${k}x\\sim ${k}x$。`
    )
  );
}

module.exports = rows;
