/* 方法详情页：从 /api/methods/:slug 取内容并渲染 */
(function () {
  'use strict';

  const { initTheme, api, renderSections } = window.Limits;

  initTheme();
  document.getElementById('themeBtn').addEventListener('click', () => {
    window.Limits.toggleTheme();
  });

  const slug = (window.location.pathname.split('/')[2] || 'flow').replace(/[^a-z0-9-]/g, '');

  function setHeader(m) {
    document.title = `${m.name} · ${m.alias} · 极限研习`;
    document.getElementById('title').innerHTML = `${m.name}<i>·</i>${m.alias}`;
    document.getElementById('en').textContent = `${m.en} · ${m.enAlias}`;
    const leadEl = document.getElementById('lead');
    leadEl.textContent = m.lead || '';
    if (m.plain) {
      const plain = document.createElement('p');
      plain.className = 'plain';
      const label = document.createElement('b');
      label.textContent = '人话版';
      plain.appendChild(label);
      plain.appendChild(document.createTextNode('　' + m.plain));
      leadEl.insertAdjacentElement('afterend', plain);
    }
    const meta = document.getElementById('meta');
    meta.innerHTML = '';
    (m.meta || []).forEach((t) => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      meta.appendChild(span);
    });
  }

  function buildNav(list) {
    const nav = document.getElementById('methodNav');
    nav.innerHTML = '';
    list.forEach((m) => {
      const a = document.createElement('a');
      a.className = 'chip';
      a.href = '/method/' + m.slug;
      a.textContent = `${m.name} · ${m.alias}`;
      if (m.slug === slug) a.setAttribute('aria-pressed', 'true');
      nav.appendChild(a);
    });
  }

  function buildExampleNav(sections) {
    const nav = document.getElementById('methodNav');
    if (!nav || !Array.isArray(sections)) return;
    const bar = document.createElement('nav');
    bar.className = 'filters';
    bar.setAttribute('aria-label', '题型索引');
    bar.style.marginTop = '-6px';
    sections.forEach((s, i) => {
      const a = document.createElement('a');
      a.className = 'chip';
      a.href = '#sec-' + (i + 1);
      a.textContent = String(s.title || '').split(' · ')[0];
      bar.appendChild(a);
    });
    nav.insertAdjacentElement('afterend', bar);
  }

  async function load() {
    try {
      const [m, list] = await Promise.all([
        api('/api/methods/' + slug),
        api('/api/methods').catch(() => []),
      ]);
      setHeader(m);
      if (Array.isArray(list) && list.length) buildNav(list);
      renderSections(document.getElementById('sections'), m.sections);
      if (m.slug === 'examples') buildExampleNav(m.sections);
    } catch (err) {
      document.getElementById('lead').textContent = '内容加载失败：' + err.message;
    }
  }

  load();
})();
