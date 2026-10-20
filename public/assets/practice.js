/* 题库练习：判分走后端 /api/answer，错题与收藏落库 */
(function () {
  'use strict';

  const { initTheme, api, renderRich, noteCorrect, noteWrong, ICONS } = window.Limits;

  initTheme();
  document.getElementById('themeBtn').addEventListener('click', () => window.Limits.toggleTheme());

  const state = {
    all: [],
    list: [],
    types: [],
    difficulties: [],
    activeType: 'all',
    index: 0,
    selected: null,
    submitted: false,
    answered: 0,
    correct: 0,
    favs: new Set(),
    startQid: null,
    loading: true,
  };

  const els = {
    filters: document.getElementById('typeFilters'),
    qcard: document.getElementById('qcard'),
    progress: document.getElementById('progressText'),
    bar: document.getElementById('bar'),
    score: document.getElementById('scoreText'),
  };

  function typeLabel(key) {
    const t = state.types.find((x) => x.key === key);
    return t ? t.label : key;
  }

  function diffLabel(key) {
    const d = state.difficulties.find((x) => x.key === key);
    return d ? d.label : key;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function renderFilters() {
    els.filters.innerHTML = '';
    const items = [{ key: 'all', label: '全部' }].concat(state.types);
    items.forEach((t) => {
      const b = el('button', 'chip', t.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(state.activeType === t.key));
      b.addEventListener('click', () => {
        state.activeType = t.key;
        state.index = 0;
        state.correct = 0;
        state.answered = 0;
        state.selected = null;
        state.submitted = false;
        buildList();
        renderFilters();
      });
      els.filters.appendChild(b);
    });
  }

  function buildList() {
    state.list =
      state.activeType === 'all'
        ? state.all.slice()
        : state.all.filter((q) => q.type === state.activeType);
    if (state.startQid) {
      const idx = state.list.findIndex((q) => q.id === state.startQid);
      if (idx >= 0) state.index = idx;
      state.startQid = null;
    }
    if (state.index >= state.list.length) state.index = 0;
    render();
  }

  function updateProgress() {
    const total = state.list.length;
    const cur = total ? state.index + 1 : 0;
    els.progress.textContent = `${String(cur).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    els.bar.style.width = total ? `${(cur / total) * 100}%` : '0%';
    els.score.textContent = `答对 ${state.correct}${state.answered ? ` · 已答 ${state.answered}` : ''}`;
  }

  function render() {
    if (!state.list.length) {
      els.qcard.innerHTML = '';
      const empty = el('div', 'empty');
      empty.appendChild(el('div', 'big', '这里还没有题'));
      empty.appendChild(el('p', '换个题型试试'));
      els.qcard.appendChild(empty);
      updateProgress();
      return;
    }

    if (state.index >= state.list.length) {
      renderSummary();
      return;
    }

    const q = state.list[state.index];
    state.submitted = false;
    state.selected = null;

    els.qcard.innerHTML = '';

    const top = el('div', 'qcard-top');
    const kinds = el('div', 'kinds');
    kinds.appendChild(el('span', 'tag', typeLabel(q.type)));
    kinds.appendChild(el('span', 'tag', diffLabel(q.difficulty)));
    top.appendChild(kinds);

    const fav = el('button', 'fav');
    fav.type = 'button';
    fav.innerHTML = ICONS.star + '<span>收藏</span>';
    fav.setAttribute('aria-pressed', String(state.favs.has(q.id)));
    fav.addEventListener('click', () => toggleFav(q.id, fav));
    top.appendChild(fav);
    els.qcard.appendChild(top);

    const stem = el('div', 'qstem');
    stem.appendChild(renderRich(q.stem));
    els.qcard.appendChild(stem);

    const options = el('div', 'options');
    q.options.forEach((o) => {
      const b = el('button', 'opt');
      b.type = 'button';
      b.dataset.key = o.key;
      b.setAttribute('aria-pressed', 'false');
      const k = el('span', 'key', o.key);
      const v = el('span', 'val');
      v.appendChild(renderRich(o.text));
      b.appendChild(k);
      b.appendChild(v);
      b.addEventListener('click', () => select(o.key, options));
      options.appendChild(b);
    });
    els.qcard.appendChild(options);

    const feedback = el('div', 'feedback');
    feedback.style.display = 'none';
    els.qcard.appendChild(feedback);

    const foot = el('div', 'qfoot');
    const prev = el('button', 'btn btn--ghost', '← 上一题');
    prev.type = 'button';
    prev.disabled = state.index === 0;
    prev.addEventListener('click', () => {
      if (state.index > 0) {
        state.index -= 1;
        render();
      }
    });
    foot.appendChild(prev);

    const actions = el('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const submit = el('button', 'btn btn--primary', '提交答案');
    submit.type = 'button';
    submit.disabled = true;
    submit.addEventListener('click', submitAnswer);
    actions.appendChild(submit);

    const next = el('button', 'btn btn--primary', '下一题 →');
    next.type = 'button';
    next.style.display = 'none';
    next.addEventListener('click', goNext);
    actions.appendChild(next);

    foot.appendChild(actions);
    els.qcard.appendChild(foot);

    els.qcard._submit = submit;
    els.qcard._next = next;
    els.qcard._feedback = feedback;
    els.qcard._options = options;
    els.qcard._q = q;

    updateProgress();
  }

  function select(key, optionsEl) {
    if (state.submitted) return;
    state.selected = key;
    optionsEl.querySelectorAll('.opt').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.key === key));
    });
    const submit = els.qcard._submit;
    if (submit) submit.disabled = false;
  }

  async function submitAnswer() {
    const q = els.qcard._q;
    if (!q || !state.selected || state.submitted) return;
    state.submitted = true;

    const submit = els.qcard._submit;
    const next = els.qcard._next;
    const feedback = els.qcard._feedback;
    const optionsEl = els.qcard._options;
    submit.disabled = true;

    let result;
    try {
      result = await api('/api/answer', {
        method: 'POST',
        body: { qid: q.id, chosen: state.selected },
      });
    } catch (err) {
      feedback.style.display = 'block';
      feedback.textContent = '判分失败：' + err.message;
      state.submitted = false;
      submit.disabled = false;
      return;
    }

    state.answered += 1;
    if (result.correct) state.correct += 1;

    optionsEl.querySelectorAll('.opt').forEach((b) => {
      b.disabled = true;
      if (b.dataset.key === result.answer) b.classList.add('is-correct');
      if (b.dataset.key === state.selected && !result.correct) b.classList.add('is-wrong');
    });

    feedback.innerHTML = '';
    const verdict = el('div', 'verdict ' + (result.correct ? 'ok' : 'no'));
    verdict.textContent = result.correct ? '正确' : `不正确，正确答案是 ${result.answer}`;
    feedback.appendChild(verdict);
    const body = el('div');
    body.appendChild(renderRich(result.explanation || ''));
    feedback.appendChild(body);
    feedback.style.display = 'block';

    next.style.display = '';
    submit.style.display = 'none';

    if (result.correct) noteCorrect();
    else noteWrong();
    updateProgress();
  }

  function goNext() {
    if (state.index + 1 >= state.list.length) {
      state.index = state.list.length;
      renderSummary();
      return;
    }
    state.index += 1;
    render();
  }

  function renderSummary() {
    const total = state.list.length;
    els.qcard.innerHTML = '';
    const box = el('div', 'empty');
    box.appendChild(el('div', 'big', '本轮完成'));
    const p = el('p', null, `共 ${total} 题，答对 ${state.correct} 题 · 正确率 ${total ? Math.round((state.correct / total) * 100) : 0}%`);
    box.appendChild(p);

    const row = el('div', 'qfoot');
    row.style.justifyContent = 'center';
    row.style.marginTop = '22px';

    const again = el('button', 'btn btn--primary', '再来一轮');
    again.type = 'button';
    again.addEventListener('click', () => {
      state.index = 0;
      state.correct = 0;
      state.answered = 0;
      state.selected = null;
      render();
    });

    const wrong = el('a', 'btn', '去错题本');
    wrong.href = '/wrongbook';

    row.appendChild(again);
    row.appendChild(wrong);
    box.appendChild(row);
    els.qcard.appendChild(box);
    updateProgress();
  }

  async function toggleFav(qid, btn) {
    const on = !state.favs.has(qid);
    if (on) state.favs.add(qid);
    else state.favs.delete(qid);
    btn.setAttribute('aria-pressed', String(on));
    try {
      await api('/api/favorites', { method: 'POST', body: { qid, on } });
    } catch {
      /* 离线时只改本地 */
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.submitted && els.qcard._next && els.qcard._next.style.display !== 'none') goNext();
      else if (!state.submitted && state.selected) submitAnswer();
      return;
    }

    const key = e.key.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(key) && !state.submitted) {
      const opt = els.qcard._options && els.qcard._options.querySelector(`.opt[data-key="${key}"]`);
      if (opt) opt.click();
    }
  });

  async function boot() {
    try {
      const data = await api('/api/questions');
      state.all = data.questions;
      state.types = data.types || [];
      state.difficulties = data.difficulties || [];

      const params = new URLSearchParams(window.location.search);
      state.startQid = params.get('q');

      try {
        const wb = await api('/api/wrongbook');
        state.favs = new Set(wb.favorites.map((q) => q.id));
      } catch {
        state.favs = new Set();
      }

      renderFilters();
      buildList();
    } catch (err) {
      els.qcard.innerHTML = '';
      const empty = el('div', 'empty');
      empty.appendChild(el('div', 'big', '题库加载失败'));
      empty.appendChild(el('p', null, err.message));
      els.qcard.appendChild(empty);
    }
  }

  boot();
})();
