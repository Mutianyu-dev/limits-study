/*
 * MathTex —— 一个刻意做小的 TeX 子集渲染器。
 *
 * 为什么不用 KaTeX / MathJax：整个站点要求离线可运行，不依赖 CDN，
 * 也不引入 node_modules。这里只需覆盖极限一章用到的符号与结构：
 * 上下标、分式、根式、极限/求和/积分、希腊字母、常用关系符。
 *
 * 用法：
 *   MathTex.render('\\lim_{x\\to 0}\\frac{\\sin x}{x}')  -> HTML 字符串
 *   MathTex.typeset(document.body)                       -> 渲染所有 [data-tex]
 */
(function (global) {
  'use strict';

  const SYMBOLS = {
    to: '→', rightarrow: '→', leftarrow: '←', Rightarrow: '⇒', Leftrightarrow: '⇔',
    mapsto: '↦', infty: '∞', cdot: '·', times: '×', div: '÷', pm: '±', mp: '∓',
    le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈',
    sim: '∼', simeq: '≃', equiv: '≡', propto: '∝', partial: '∂', nabla: '∇',
    in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', cup: '∪', cap: '∩',
    forall: '∀', exists: '∃', emptyset: '∅', varnothing: '∅', angle: '∠',
    perp: '⊥', parallel: '∥', circ: '∘', degree: '°', prime: '′', ast: '∗',
    cdots: '⋯', ldots: '…', dots: '…', vdots: '⋮', ddots: '⋱',
    quad: '\u2003', qquad: '\u2003\u2003', ':': '\u2005', ';': '\u2005', ',': '\u2009', '!': '',
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε',
    zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
    lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
    tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
    Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
    lbrace: '{', rbrace: '}', '%': '%', '#': '#', '&': '&', _: '_',
    mid: '|', vert: '|', Vert: '‖', langle: '⟨', rangle: '⟩',
    bigcirc: '○', square: '□', triangle: '△', bullet: '•',
  };

  const FUNCS = {
    sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc',
    arcsin: 'arcsin', arccos: 'arccos', arctan: 'arctan', ln: 'ln', log: 'log',
    lg: 'lg', exp: 'exp', limsup: 'lim sup', liminf: 'lim inf', det: 'det',
    mod: 'mod', gcd: 'gcd',
  };

  const BIG_OPS = { lim: 'lim', sum: '∑', prod: '∏', int: '∫', iint: '∬', oint: '∮' };

  const BINARY = new Set(['+', '−', '=', '≤', '≥', '≠', '≈', '∼', '≡', '→', '⇒', '⇔', '±', '∓', '∈', '⊂', '⊆', '∪', '∩', '<', '>', '←']);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* ----------------------------- 词法 ----------------------------- */

  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') {
        let j = i + 1;
        if (j >= src.length) { tokens.push({ t: 'char', v: '\\' }); break; }
        if (/[a-zA-Z]/.test(src[j])) {
          while (j < src.length && /[a-zA-Z]/.test(src[j])) j += 1;
          tokens.push({ t: 'cmd', v: src.slice(i + 1, j) });
          i = j;
        } else if (src[j] === ' ') {
          tokens.push({ t: 'space', v: 0.25 });
          i = j + 1;
        } else if (src[j] === ',' || src[j] === ';' || src[j] === ':') {
          tokens.push({ t: 'space', v: src[j] === ',' ? 0.17 : src[j] === ';' ? 0.3 : 0.22 });
          i = j + 1;
        } else if (src[j] === '!') {
          tokens.push({ t: 'space', v: -0.14 });
          i = j + 1;
        } else {
          tokens.push({ t: 'sym', v: src[j] });
          i = j + 1;
        }
        continue;
      }
      if (c === '{' || c === '}' || c === '^' || c === '_' || c === '[' || c === ']') {
        tokens.push({ t: c });
        i += 1;
        continue;
      }
      if (/\s/.test(c)) { i += 1; continue; }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j += 1;
        const v = src.slice(i, j).replace(/\.$/, '');
        tokens.push({ t: 'num', v });
        i += v.length;
        continue;
      }
      if (/[a-zA-Z]/.test(c)) { tokens.push({ t: 'ident', v: c }); i += 1; continue; }
      tokens.push({ t: 'char', v: c });
      i += 1;
    }
    return tokens;
  }

  /* ----------------------------- 语法 ----------------------------- */

  function parse(tokens) {
    let pos = 0;

    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }

    function parseGroup() {
      const open = next();
      if (!open || open.t !== '{') throw new Error('expected {');
      const body = parseExpr(true);
      const close = next();
      if (!close || close.t !== '}') throw new Error('expected }');
      return { type: 'group', body };
    }

    // 只吃一个「参数」：花括号组或单个原子
    function parseArg() {
      const tok = peek();
      if (!tok) throw new Error('missing argument');
      if (tok.t === '{') return parseGroup();
      return parseAtom();
    }

    function parseScript() {
      const tok = peek();
      if (tok.t === '{') return parseGroup();
      return parseAtom();
    }

    function parseAtom() {
      const tok = next();
      if (!tok) throw new Error('unexpected end');
      if (tok.t === '{') {
        const body = parseExpr(true);
        next();
        return { type: 'group', body };
      }
      if (tok.t === 'num') return { type: 'num', v: tok.v };
      if (tok.t === 'ident') return { type: 'ident', v: tok.v };
      if (tok.t === 'sym') {
        if (tok.v === '{' || tok.v === '}') return { type: 'char', v: tok.v };
        return { type: 'sym', v: tok.v };
      }
      if (tok.t === 'char') return { type: 'char', v: tok.v };
      if (tok.t === 'space') return { type: 'space', w: tok.v };
      if (tok.t === 'cmd') return parseCommand(tok.v);
      throw new Error('unexpected token ' + tok.t);
    }

    function parseCommand(name) {
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        return { type: 'frac', num: parseArg(), den: parseArg() };
      }
      if (name === 'sqrt') {
        let index = null;
        if (peek() && peek().t === '[') {
          next();
          const parts = [];
          while (peek() && peek().t !== ']') parts.push(parseAtom());
          next();
          index = parts;
        }
        return { type: 'sqrt', index, body: parseArg() };
      }
      if (name === 'text' || name === 'mathrm' || name === 'textrm' || name === 'operatorname') {
        const tok = next();
        if (!tok || tok.t !== '{') throw new Error('expected text group');
        let depth = 1;
        let raw = '';
        while (pos < tokens.length && depth > 0) {
          const t = next();
          if (t.t === '{') depth += 1;
          if (t.t === '}') { depth -= 1; if (depth === 0) break; }
          if (t.t === 'cmd') raw += t.v;
          else if (t.t === 'sym') raw += t.v;
          else raw += t.v || '';
        }
        return { type: 'text', v: raw };
      }
      if (name === 'left' || name === 'right') {
        const t = next();
        // `[` 与 `]` 在词法里是独立 token，没有 v 字段
        const v = t.v !== undefined ? t.v : t.t;
        return { type: 'delim', v };
      }
      if (name === 'overline' || name === 'bar' || name === 'vec' || name === 'hat' || name === 'dot') {
        return { type: 'accent', kind: name, body: parseArg() };
      }
      if (name === 'begin' || name === 'end') {
        // cases 环境：\begin{cases} a & b \\ c & d \end{cases}
        const env = next();
        if (env && env.t === 'char' || (env && env.t === 'ident')) {
          // ignore env name chars until '}'
        }
        while (peek() && peek().t !== '}') next();
        next();
        const rows = [];
        let row = [];
        let cell = [];
        let depth = 0;
        while (pos < tokens.length) {
          const t = peek();
          if (t.t === 'cmd' && t.v === 'end') {
            next();
            while (peek() && peek().t !== '}') next();
            next();
            break;
          }
          if (t.t === 'char' && t.v === '&' && depth === 0) { row.push(cell); cell = []; next(); continue; }
          if (t.t === 'sym' && (t.v === '\\') && depth === 0) { row.push(cell); rows.push(row); row = []; cell = []; next(); continue; }
          if (t.t === '{') depth += 1;
          if (t.t === '}') depth -= 1;
          cell.push(parseAtom());
        }
        row.push(cell);
        rows.push(row);
        return { type: 'cases', rows };
      }
      if (BIG_OPS[name]) return { type: 'op', name };
      if (FUNCS[name]) return { type: 'func', v: FUNCS[name] };
      if (name === 'cdot' || name === 'times') return { type: 'bin', v: SYMBOLS[name] };
      if (Object.prototype.hasOwnProperty.call(SYMBOLS, name)) {
        const v = SYMBOLS[name];
        return BINARY.has(v) ? { type: 'bin', v } : { type: 'sym', v };
      }
      // 未知命令：按正体文字输出，保证不丢内容
      return { type: 'text', v: name };
    }

    function parseExpr(stopAtBrace) {
      const nodes = [];
      while (pos < tokens.length) {
        const tok = tokens[pos];
        if (stopAtBrace && tok.t === '}') break;
        if (tok.t === ']') break;
        let base = parseAtom();
        let sup = null;
        let sub = null;
        while (pos < tokens.length && (tokens[pos].t === '^' || tokens[pos].t === '_')) {
          const kind = next().t;
          const arg = parseScript();
          if (kind === '^') sup = arg; else sub = arg;
        }
        if (sup || sub) base = { type: 'script', base, sup, sub };
        nodes.push(base);
      }
      return nodes;
    }

    const result = parseExpr(false);
    return result;
  }

  let CURRENT = {};

  /* ----------------------------- 渲染 ----------------------------- */

  function nodesOf(node) {
    return node.type === 'group' ? node.body : [node];
  }

  function isComplex(node) {
    const nodes = nodesOf(node);
    if (nodes.length > 1) return true;
    return nodes.some((n) => n.type === 'bin' || (n.type === 'sym' && BINARY.has(n.v)));
  }

  function renderNodes(nodes) {
    return nodes.map(renderNode).join('');
  }

  function slashFrac(node) {
    const num = isComplex(node.num)
      ? '(' + renderNode(node.num) + ')'
      : renderNode(node.num);
    const den = isComplex(node.den)
      ? '(' + renderNode(node.den) + ')'
      : renderNode(node.den);
    return `<span class="mt-frac-slash">${num}/${den}</span>`;
  }

  function renderNode(node) {
    switch (node.type) {
      case 'num':
        return `<span class="mt-n">${esc(node.v)}</span>`;
      case 'ident':
        return `<i class="mt-i">${esc(node.v)}</i>`;
      case 'char':
        return `<span class="mt-ch">${esc(node.v)}</span>`;
      case 'space': {
        const w = typeof node.w === 'number' ? node.w : 0.25;
        return w < 0
          ? `<span class="mt-sp mt-sp--neg" style="margin-left:${w}em"></span>`
          : `<span class="mt-sp" style="width:${w}em"></span>`;
      }
      case 'sym':
        return BINARY.has(node.v)
          ? `<span class="mt-bin">${esc(node.v)}</span>`
          : `<span class="mt-sym">${esc(node.v)}</span>`;
      case 'bin':
        return `<span class="mt-bin">${esc(node.v)}</span>`;
      case 'text':
        return `<span class="mt-text">${esc(node.v)}</span>`;
      case 'func':
        return `<span class="mt-fn">${esc(node.v)}</span>`;
      case 'group':
        return `<span class="mt-grp">${renderNodes(node.body)}</span>`;
      case 'frac':
        if (CURRENT.slash) return slashFrac(node);
        return (
          '<span class="mt-frac">' +
          `<span class="mt-frac-num">${renderNode(node.num)}</span>` +
          `<span class="mt-frac-den">${renderNode(node.den)}</span>` +
          '</span>'
        );
      case 'sqrt': {
        const index = node.index
          ? `<span class="mt-sqrt-index">${renderNodes(node.index)}</span>`
          : '';
        return (
          '<span class="mt-sqrt">' +
          `<span class="mt-sqrt-sign">${index}√</span>` +
          `<span class="mt-sqrt-body">${renderNode(node.body)}</span>` +
          '</span>'
        );
      }
      case 'delim':
        return `<span class="mt-delim">${esc(node.v)}</span>`;
      case 'accent': {
        const inner = renderNode(node.body);
        if (node.kind === 'vec') return `<span class="mt-vec">${inner}</span>`;
        if (node.kind === 'hat') return `<span class="mt-hat">${inner}</span>`;
        if (node.kind === 'dot') return `<span class="mt-dot">${inner}</span>`;
        return `<span class="mt-overline">${inner}</span>`;
      }
      case 'cases': {
        const rows = node.rows
          .map((r) => `<span class="mt-case-row">${r.map((c) => `<span class="mt-case-cell">${renderNodes(c)}</span>`).join('')}</span>`)
          .join('');
        return `<span class="mt-cases">${rows}</span>`;
      }
      case 'op':
        return renderOp(node.name, null, null);
      case 'script':
        return renderScript(node);
      default:
        return '';
    }
  }

  function renderOp(name, sup, sub) {
    const sym = BIG_OPS[name] || name;
    if (name === 'int' || name === 'iint' || name === 'oint') {
      const scripts =
        (sup ? `<span class="mt-int-sup">${renderNode(sup)}</span>` : '') +
        (sub ? `<span class="mt-int-sub">${renderNode(sub)}</span>` : '');
      return `<span class="mt-int"><span class="mt-int-sign">${sym}</span><span class="mt-int-scripts">${scripts}</span></span>`;
    }
    if (name === 'lim') {
      const under = sub ? `<span class="mt-lim-sub">${renderNode(sub)}</span>` : '';
      const over = sup ? `<span class="mt-lim-over">${renderNode(sup)}</span>` : '';
      return `<span class="mt-lim">${over}<span class="mt-lim-main">lim</span>${under}</span>`;
    }
    const over = sup ? `<span class="mt-bigop-sup">${renderNode(sup)}</span>` : '';
    const under = sub ? `<span class="mt-bigop-sub">${renderNode(sub)}</span>` : '';
    return `<span class="mt-bigop">${over}<span class="mt-bigop-sign">${sym}</span>${under}</span>`;
  }

  function renderScript(node) {
    const { base, sup, sub } = node;
    if (base.type === 'op') {
      if (base.name === 'lim' || base.name === 'sum' || base.name === 'prod') {
        return renderOp(base.name, sup, sub);
      }
      const sym = BIG_OPS[base.name];
      return (
        `<span class="mt-int"><span class="mt-int-sign">${sym}</span>` +
        `<span class="mt-int-scripts">` +
        (sup ? `<span class="mt-int-sup">${renderNode(sup)}</span>` : '') +
        (sub ? `<span class="mt-int-sub">${renderNode(sub)}</span>` : '') +
        '</span></span>'
      );
    }
    const baseHtml = renderNode(base);
    return (
      '<span class="mt-scripts">' +
      `<span class="mt-sbase">${baseHtml}</span>` +
      (sup ? `<sup class="mt-sup">${renderNode(sup)}</sup>` : '') +
      (sub ? `<sub class="mt-sub">${renderNode(sub)}</sub>` : '') +
      '</span>'
    );
  }

  function render(src, opts = {}) {
    try {
      CURRENT = opts;
      const tokens = tokenize(String(src || ''));
      const ast = parse(tokens);
      const html = renderNodes(ast);
      CURRENT = {};
      return html;
    } catch (err) {
      CURRENT = {};
      return `<span class="mt-error" title="${esc(err.message)}">${esc(src)}</span>`;
    }
  }

  function typeset(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-tex]').forEach((el) => {
      const src = el.getAttribute('data-tex');
      el.innerHTML = render(src);
      el.classList.add('mt');
    });
  }

  global.MathTex = { render, typeset, tokenize };
})(window);
