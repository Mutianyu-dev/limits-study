/*
 * 站点公共逻辑：设置、主题、奖励、API、内容块渲染。
 * 所有页面共享，无构建步骤。
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'limits.settings.v1';

  const DEFAULTS = {
    theme: 'light',
    rewardFrequency: 3, // 1 / 3 / 5 = 连对几题奖励一次
    rewardTier: 'companion', // companion | instructor
  };

  /* ----------------------------- 设置 ----------------------------- */

  function readSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULTS, ...raw };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-icon]').forEach((el) => {
      el.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    });
  }

  function saveSettings(patch) {
    const next = { ...readSettings(), ...patch };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* 隐私模式下忽略 */
    }
    if (patch.theme) applyTheme(next.theme);
    api('/api/settings', { method: 'PUT', body: next }).catch(() => {});
    document.dispatchEvent(new CustomEvent('limits:settings', { detail: next }));
    return next;
  }

  function initTheme() {
    // 支持 ?theme=dark 强制预览，方便分享与截图
    const forced = new URLSearchParams(window.location.search).get('theme');
    if (forced === 'dark' || forced === 'light') {
      applyTheme(forced);
      return;
    }
    applyTheme(readSettings().theme);
  }

  function toggleTheme() {
    const next = readSettings().theme === 'dark' ? 'light' : 'dark';
    saveSettings({ theme: next });
    return next;
  }

  /* ----------------------------- API ----------------------------- */

  async function api(path, options = {}) {
    const opts = { credentials: 'same-origin', ...options };
    if (opts.body && typeof opts.body !== 'string') {
      opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
    return data;
  }

  /* ----------------------------- 奖励 ----------------------------- */

  const REWARDS = {
    companion: {
      label: '小爱同学 · 大爱仙尊',
      glyph: '愛',
      verses: [
        {
          text: '千磨万击心铸铁，殚精竭虑铸一剑。\n今朝剑指叠云处，练蛊练人还练天。',
          source: '《蛊真人》· 大爱仙尊',
        },
        { text: '早岁已知世事艰，仍许飞鸿荡云间。', source: '《蛊真人》· 大爱仙尊' },
        { text: '一路寒风身如絮，命海沉浮客独行。', source: '《蛊真人》· 大爱仙尊' },
        { text: '宿命天成命中败，仙尊悔而我不悔。', source: '《蛊真人》· 大爱仙尊' },
        { text: '落魄谷中寒风吹，春秋蝉鸣少年归。', source: '《蛊真人》· 大爱仙尊' },
      ],
    },
    instructor: {
      label: '教员 · 毛泽东',
      glyph: '★',
      verses: [
        { text: '雄关漫道真如铁，而今迈步从头越。', source: '《忆秦娥·娄山关》' },
        { text: '数风流人物，还看今朝。', source: '《沁园春·雪》' },
        { text: '世上无难事，只要肯登攀。', source: '《水调歌头·重上井冈山》' },
        { text: '无限风光在险峰。', source: '《七绝·为李进同志题所摄庐山仙人洞照》' },
        { text: '一万年太久，只争朝夕。', source: '《满江红·和郭沫若同志》' },
        { text: '自信人生二百年，会当水击三千里。', source: '《七古·残句》' },
        { text: '为有牺牲多壮志，敢教日月换新天。', source: '《七律·到韶山》' },
        { text: '天若有情天亦老，人间正道是沧桑。', source: '《七律·人民解放军占领南京》' },
      ],
    },
  };

  /* 扩充诗句：蛊真人诸位尊者 + 毛泽东诗词 */
  const EXTRA_VERSES = {
    companion: [
      { text: '当时年少掷春光，花马踏蹄酒溅香。', source: '《蛊真人》· 红莲魔尊' },
      { text: '荡魂山处石人泪，定仙游走魔向北。', source: '《蛊真人》· 大爱仙尊' },
      { text: '落魄谷中寒风吹，春秋蝉鸣少年归。', source: '《蛊真人》· 大爱仙尊' },
    ],
    instructor: [
      { text: '可上九天揽月，可下五洋捉鳖。', source: '《水调歌头·重上井冈山》' },
      { text: '问苍茫大地，谁主沉浮？', source: '《沁园春·长沙》' },
      { text: '到中流击水，浪遏飞舟。', source: '《沁园春·长沙》' },
      { text: '牢骚太盛防肠断，风物长宜放眼量。', source: '《七律·和柳亚子先生》' },
      { text: '春风杨柳万千条，六亿神州尽舜尧。', source: '《七律二首·送瘟神》' },
      { text: '不管风吹浪打，胜似闲庭信步。', source: '《水调歌头·游泳》' },
      { text: '萧瑟秋风今又是，换了人间。', source: '《浪淘沙·北戴河》' },
      { text: '宜将剩勇追穷寇，不可沽名学霸王。', source: '《七律·人民解放军占领南京》' },
    ],
  };

  for (const tier of Object.keys(EXTRA_VERSES)) {
    REWARDS[tier].verses.push(...EXTRA_VERSES[tier]);
  }
  function ensureLayer() {
    let layer = document.querySelector('.reward-layer');
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'reward-layer';
    layer.innerHTML =
      '<div class="reward-card" role="status" aria-live="polite">' +
      '<div class="glyph"></div>' +
      '<div class="tier"></div>' +
      '<div class="verse"></div>' +
      '<div class="source"></div>' +
      '<div class="tip">点击任意处关闭</div>' +
      '</div>';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'reward-close';
    closeBtn.setAttribute('aria-label', '关闭');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      hideReward();
    });
    layer.querySelector('.reward-card').appendChild(closeBtn);
    layer.addEventListener('click', hideReward);
    document.body.appendChild(layer);
    return layer;
  }

  let rewardTimer = null;

  function showReward(forceTier) {
    const settings = readSettings();
    const tier = forceTier || settings.rewardTier;
    const conf = REWARDS[tier] || REWARDS.companion;
    const verse = conf.verses[Math.floor(Math.random() * conf.verses.length)];
    const layer = ensureLayer();
    layer.querySelector('.glyph').textContent = conf.glyph;
    layer.querySelector('.tier').textContent = conf.label;
    layer.querySelector('.verse').textContent = verse.text;
    layer.querySelector('.source').textContent = '—— ' + verse.source;
    layer.classList.add('show');
    clearTimeout(rewardTimer);
    rewardTimer = setTimeout(hideReward, 7000);
  }

  function hideReward() {
    clearTimeout(rewardTimer);
    const layer = document.querySelector('.reward-layer');
    if (!layer) return;
    layer.classList.remove('show');
    /* 淡出期间继续挡住鼠标，防止第二次点击穿透到「试听」按钮又把它打开 */
    layer.classList.add('hiding');
    setTimeout(function () {
      layer.classList.remove('hiding');
    }, 480);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') hideReward();
  });
  /* 连对计数：答对累计，答错清零；达到设定次数即奖励并重新计数 */
  function getStreak() {
    const n = Number(localStorage.getItem('limits.streak') || 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  function setStreak(n) {
    try {
      localStorage.setItem('limits.streak', String(n));
    } catch {
      /* 隐私模式忽略 */
    }
  }

  function noteCorrect() {
    const settings = readSettings();
    const need = [1, 3, 5].includes(settings.rewardFrequency) ? settings.rewardFrequency : 3;
    let streak = getStreak() + 1;
    if (streak >= need) {
      showReward();
      streak = 0;
    }
    setStreak(streak);
    document.dispatchEvent(new CustomEvent('limits:streak', { detail: streak }));
  }

  function noteWrong() {
    setStreak(0);
    document.dispatchEvent(new CustomEvent('limits:streak', { detail: 0 }));
  }
  /* ----------------------------- 内容块渲染 ----------------------------- */

  function renderRich(text) {
    const frag = document.createDocumentFragment();
    const parts = String(text).split(/(\$[^$]+\$)/g);
    for (const part of parts) {
      if (!part) continue;
      if (part.length > 2 && part.startsWith('$') && part.endsWith('$')) {
        const span = document.createElement('span');
        span.className = 'mt mt--inline';
        span.innerHTML = global.MathTex ? global.MathTex.render(part.slice(1, -1)) : part;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    }
    return frag;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderBlock(block, index) {
    const wrap = el('div', 'section');
    if (block.title) {
      const head = el('div', 'section-title');
      head.appendChild(el('span', 'no', String(index + 1).padStart(2, '0')));
      const h2 = el('h2');
      h2.textContent = block.title;
      head.appendChild(h2);
      wrap.appendChild(head);
    }

    const body = el('div', 'prose');
    const blocks = block.blocks || [];

    for (const b of blocks) {
      switch (b.t) {
        case 'p': {
          const p = el('p');
          p.appendChild(renderRich(b.x));
          body.appendChild(p);
          break;
        }
        case 'eq': {
          const eq = el('div', 'eq');
          const span = el('span', 'mt');
          span.innerHTML = global.MathTex ? global.MathTex.render(b.x) : b.x;
          eq.appendChild(span);
          body.appendChild(eq);
          break;
        }
        case 'eqs': {
          for (const one of b.items || []) {
            const eq = el('div', 'eq eq--tight');
            const span = el('span', 'mt');
            span.innerHTML = global.MathTex ? global.MathTex.render(one) : one;
            eq.appendChild(span);
            body.appendChild(eq);
          }
          break;
        }
        case 'list': {
          const ul = el('ul', 'bullets');
          for (const item of b.items || []) {
            const li = el('li');
            li.appendChild(renderRich(item));
            ul.appendChild(li);
          }
          body.appendChild(ul);
          break;
        }
        case 'note': {
          const note = el('div', 'note' + (b.tone ? ` note--${b.tone}` : ''));
          const strong = el('b');
          strong.textContent = b.label || (b.tone === 'warn' ? '注意' : '提示');
          note.appendChild(strong);
          note.appendChild(document.createTextNode('　'));
          note.appendChild(renderRich(b.x));
          body.appendChild(note);
          break;
        }
        case 'table': {
          const wrapTable = el('div', 'table-wrap');
          const table = el('table', 'data');
          const thead = document.createElement('thead');
          const tr = document.createElement('tr');
          for (const h of b.head || []) {
            const th = document.createElement('th');
            th.appendChild(renderRich(h));
            tr.appendChild(th);
          }
          thead.appendChild(tr);
          table.appendChild(thead);
          const tbody = document.createElement('tbody');
          for (const row of b.rows || []) {
            const trb = document.createElement('tr');
            for (const cell of row) {
              const td = document.createElement('td');
              td.appendChild(renderRich(cell));
              trb.appendChild(td);
            }
            tbody.appendChild(trb);
          }
          table.appendChild(tbody);
          wrapTable.appendChild(table);
          body.appendChild(wrapTable);
          break;
        }
        case 'steps': {
          const list = el('div', 'steps');
          (b.items || []).forEach((s, i) => {
            const step = el('div', 'step');
            step.appendChild(el('div', 'step-no', String(i + 1).padStart(2, '0')));
            const sb = el('div', 'step-body');
            const h3 = el('h3');
            h3.textContent = s.label;
            sb.appendChild(h3);
            if (s.sub) sb.appendChild(el('div', 'sub', s.sub));
            if (s.x) {
              const p = el('p');
              p.appendChild(renderRich(s.x));
              sb.appendChild(p);
            }
            if (s.eq) {
              const eq = el('div', 'eq eq--tight');
              const span = el('span', 'mt');
              span.innerHTML = global.MathTex ? global.MathTex.render(s.eq) : s.eq;
              eq.appendChild(span);
              sb.appendChild(eq);
            }
            step.appendChild(sb);
            list.appendChild(step);
          });
          body.appendChild(list);
          break;
        }
        case 'example': {
          const box = el('div', 'example');
          const head = el('div', 'example-head');
          const h3 = el('h3');
          h3.textContent = b.title;
          head.appendChild(h3);
          const tags = el('div', 'tags');
          for (const t of b.tags || []) tags.appendChild(el('span', 'tag', t));
          head.appendChild(tags);
          box.appendChild(head);

          const problem = el('div', 'example-problem');
          problem.appendChild(renderRich(b.problem));
          box.appendChild(problem);

          if (b.steps && b.steps.length) {
            const ol = el('ol', 'example-steps');
            for (const s of b.steps) {
              const li = el('li');
              const match = String(s).match(/^([^：:]{2,8})[：:]\s*/);
              if (match) {
                li.appendChild(el('b', 'step-tag', match[1]));
                li.appendChild(renderRich(String(s).slice(match[0].length)));
              } else {
                li.appendChild(renderRich(s));
              }
              ol.appendChild(li);
            }
            box.appendChild(ol);
          }

          if (b.answer) {
            const ans = el('div', 'answer');
            ans.appendChild(renderRich('答案　' + b.answer));
            box.appendChild(ans);
          }
          body.appendChild(box);
          break;
        }
        default:
          break;
      }
    }

    wrap.appendChild(body);
    return wrap;
  }

  function renderSections(container, sections) {
    container.innerHTML = '';
    sections.forEach((s, i) => {
      const node = renderBlock(s, i);
      node.id = 'sec-' + (i + 1);
      container.appendChild(node);
    });
  }

  /* ----------------------------- 图标 ----------------------------- */

  const ICONS = {
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="m12 3.6 2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 16.7 6.8 19.5 8 13.7 3.6 9.7l5.9-.7Z"/></svg>',
  };

  global.Limits = {
    api,
    readSettings,
    saveSettings,
    applyTheme,
    initTheme,
    toggleTheme,
    showReward,
    noteCorrect,
    noteWrong,
    renderRich,
    renderSections,
    ICONS,
    REWARDS,
  };
})(window);
