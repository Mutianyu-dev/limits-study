/* 收藏错题：数据来自 /api/wrongbook，移除操作写回后端 */
(function () {
  'use strict';

  const { initTheme, api, renderRich } = window.Limits;

  initTheme();
  document.getElementById('themeBtn').addEventListener('click', () => window.Limits.toggleTheme());

  const state = { tab: 'errors', errors: [], favorites: [], stats: null, types: [], difficulties: [] };

  const els = {
    tabErrors: document.getElementById('tabErrors'),
    tabFavs: document.getElementById('tabFavs'),
    stats: document.getElementById('stats'),
    list: document.getElementById('list'),
  };

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function typeLabel(key) {
    const t = state.types.find((x) => x.key === key);
    return t ? t.label : key;
  }

  function diffLabel(key) {
    const d = state.difficulties.find((x) => x.key === key);
    return d ? d.label : key;
  }

  function switchTab(tab) {
    state.tab = tab;
    els.tabErrors.setAttribute('aria-selected', String(tab === 'errors'));
    els.tabFavs.setAttribute('aria-selected', String(tab === 'favs'));
    renderList();
  }

  function renderStats() {
    const s = state.stats || { answered: 0, accuracy: 0, distinct: 0 };
    els.stats.innerHTML = '';
    const cells = [
      { n: s.answered, label: 'Answered' },
      { n: s.accuracy + '%', label: 'Accuracy' },
      { n: state.errors.length, label: 'Errors' },
    ];
    cells.forEach((c) => {
      const cell = el('div', 'stat-cell');
      cell.appendChild(el('b', null, String(c.n)));
      cell.appendChild(el('span', null, c.label));
      els.stats.appendChild(cell);
    });
  }

  function renderList() {
    const items = state.tab === 'errors' ? state.errors : state.favorites;
    els.list.innerHTML = '';

    if (!items.length) {
      const empty = el('div', 'empty');
      empty.appendChild(el('div', 'big', state.tab === 'errors' ? '还没有错题' : '还没有收藏'));
      empty.appendChild(
        el('p', null, state.tab === 'errors' ? '去题库里认真答一遍，错题会自动留在这里。' : '在题库里点「收藏」，把想反复看的题钉住。')
      );
      const a = el('a', 'btn btn--primary', '去题库');
      a.href = '/practice';
      a.style.marginTop = '18px';
      a.style.display = 'inline-flex';
      empty.appendChild(a);
      els.list.appendChild(empty);
      return;
    }

    items.forEach((q) => {
      const box = el('article', 'wb-item');

      const meta = el('div', 'meta');
      meta.appendChild(el('span', 'tag', typeLabel(q.type)));
      if (q.difficulty) meta.appendChild(el('span', 'tag', diffLabel(q.difficulty)));
      box.appendChild(meta);

      const stem = el('div', 'stem');
      stem.appendChild(renderRich(q.stem));
      box.appendChild(stem);

      if (state.tab === 'errors') {
        const answers = el('div', 'answers');
        const mine = el('span');
        mine.appendChild(document.createTextNode('你的答案 '));
        mine.appendChild(el('b', null, q.chosen));
        const right = el('span');
        right.appendChild(document.createTextNode('正确答案 '));
        right.appendChild(el('b', 'ok', q.answer));
        answers.appendChild(mine);
        answers.appendChild(right);
        box.appendChild(answers);
      }

      if (q.explanation) {
        const explain = el('div', 'explain');
        explain.appendChild(renderRich(q.explanation));
        box.appendChild(explain);
      }

      const actions = el('div', 'wb-actions');
      const redo = el('a', 'btn btn--ghost', '重做此题');
      redo.href = '/practice?q=' + q.id;
      actions.appendChild(redo);

      const remove = el('button', 'btn btn--ghost', state.tab === 'errors' ? '移出错题' : '取消收藏');
      remove.type = 'button';
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
          await api(`/api/wrongbook/${q.id}?kind=${state.tab === 'errors' ? 'error' : 'favorite'}`, { method: 'DELETE' });
          if (state.tab === 'errors') state.errors = state.errors.filter((x) => x.id !== q.id);
          else state.favorites = state.favorites.filter((x) => x.id !== q.id);
          renderStats();
          renderList();
        } catch (err) {
          remove.disabled = false;
          remove.textContent = '失败：' + err.message;
        }
      });
      actions.appendChild(remove);
      box.appendChild(actions);

      els.list.appendChild(box);
    });
  }

  async function boot() {
    try {
      const [wb, bank] = await Promise.all([api('/api/wrongbook'), api('/api/questions')]);
      state.errors = wb.errors || [];
      state.favorites = wb.favorites || [];
      state.stats = wb.stats;
      state.types = bank.types || [];
      state.difficulties = bank.difficulties || [];
      renderStats();
      switchTab('errors');
    } catch (err) {
      els.list.innerHTML = '';
      const empty = el('div', 'empty');
      empty.appendChild(el('div', 'big', '加载失败'));
      empty.appendChild(el('p', null, err.message));
      els.list.appendChild(empty);
    }
  }

  els.tabErrors.addEventListener('click', () => switchTab('errors'));
  els.tabFavs.addEventListener('click', () => switchTab('favs'));

  boot();
})();
