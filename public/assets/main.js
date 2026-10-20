/* 主界面：三卡片 + 设置同步 */
(function () {
  'use strict';

  const { initTheme, applyTheme, readSettings, saveSettings, showReward, api } = window.Limits;

  initTheme();

  /* 主题按钮 */
  const themeBtn = document.getElementById('themeBtn');
  const themeSeg = document.getElementById('themeSeg');
  const freqSeg = document.getElementById('freqSeg');
  const tierSeg = document.getElementById('tierSeg');

  themeBtn.addEventListener('click', () => {
    const next = readSettings().theme === 'dark' ? 'light' : 'dark';
    saveSettings({ theme: next });
  });

  themeSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-opt]');
    if (!btn) return;
    saveSettings({ theme: btn.dataset.themeOpt });
  });

  freqSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-freq]');
    if (!btn) return;
    saveSettings({ rewardFrequency: Number(btn.dataset.freq) });
  });

  tierSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tier]');
    if (!btn) return;
    saveSettings({ rewardTier: btn.dataset.tier });
  });

  document.getElementById('tryReward').addEventListener('click', () => {
    showReward(readSettings().rewardTier);
  });

  function syncUI() {
    const s = readSettings();
    applyTheme(s.theme);
    themeSeg.querySelectorAll('[data-theme-opt]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.themeOpt === s.theme));
    });
    freqSeg.querySelectorAll('[data-freq]').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.freq) === s.rewardFrequency));
    });
    tierSeg.querySelectorAll('[data-tier]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.tier === s.rewardTier));
    });
  }

  document.addEventListener('limits:settings', syncUI);
  syncUI();

  /* 方法列表：优先用后端返回的数据渲染，失败时保留静态兜底 */
  const METHOD_FALLBACK = [
    { slug: 'flow', name: '总流程', alias: '纲举目张', en: 'General Flow', enAlias: 'Framework' },
    { slug: 'types', name: '题型分类', alias: '辨章流别', en: 'Type Classification', enAlias: 'Categories' },
    { slug: 'advanced', name: '进阶细节方法', alias: '探赜索隐', en: 'Advanced Techniques', enAlias: 'Details' },
    { slug: 'rules', name: '核心方法与失效', alias: '逾淮为枳', en: 'Rules & Limitations', enAlias: 'Boundaries' },
    { slug: 'examples', name: '例题', alias: '发凡起例', en: 'Examples', enAlias: 'Demonstration' },
  ];

  function renderMethods(list) {
    const box = document.getElementById('methodList');
    box.innerHTML = '';
    list.forEach((m) => {
      const a = document.createElement('a');
      a.className = 'entry';
      a.href = '/method/' + m.slug;
      a.innerHTML =
        `<span class="cn">${m.name} <i>·</i> ${m.alias}</span>` +
        `<span class="en">${m.en} · ${m.enAlias}</span>`;
      box.appendChild(a);
    });
  }

  api('/api/methods')
    .then((list) => {
      if (Array.isArray(list) && list.length) renderMethods(list);
    })
    .catch(() => {});

  /* 若本地还没有设置，则尝试从服务端取一次（换设备时保持一致） */
  api('/api/settings')
    .then((remote) => {
      if (remote && remote.theme) {
        const local = readSettings();
        const merged = { ...local, ...remote };
        localStorage.setItem('limits.settings.v1', JSON.stringify(merged));
        syncUI();
      }
    })
    .catch(() => {});

  /* 首页统计：作答数、正确率、错题数 */
  Promise.all([api('/api/progress'), api('/api/wrongbook')])
    .then(([progress, wb]) => {
      const s = progress.stats || {};
      document.getElementById('statAnswered').textContent = s.answered || 0;
      document.getElementById('statAccuracy').textContent =
        s.answered ? (s.accuracy || 0) + '%' : '—';
      document.getElementById('statErrors').textContent = (wb.errors || []).length;
    })
    .catch(() => {});
})();
