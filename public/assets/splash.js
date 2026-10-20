/* 启动页：中心 Math 标记 + 8 个 M 词辐射对称环绕 */
(function () {
  'use strict';

  const WORDS = [
    { en: 'Mastery', cn: '精通', angle: -90, radius: 43, big: true },
    { en: 'Mettle', cn: '锐气', angle: -45, radius: 33, big: false },
    { en: 'Mind', cn: '思维', angle: 0, radius: 43, big: true },
    { en: 'Method', cn: '方法', angle: 45, radius: 33, big: false },
    { en: 'Milestone', cn: '里程碑', angle: 90, radius: 43, big: true },
    { en: 'Momentum', cn: '势能', angle: 135, radius: 33, big: false },
    { en: 'Marvel', cn: '奇迹', angle: 180, radius: 43, big: true },
    { en: 'Might', cn: '力量', angle: 225, radius: 33, big: false },
  ];

  const orbit = document.getElementById('orbit');
  const splash = document.getElementById('splash');
  const mark = document.getElementById('mark');

  WORDS.forEach((w, i) => {
    const rad = (w.angle * Math.PI) / 180;
    const x = 50 + w.radius * Math.cos(rad);
    const y = 50 + w.radius * Math.sin(rad);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'word' + (w.big ? ' word--big' : '');
    btn.style.left = x + '%';
    btn.style.top = y + '%';
    btn.style.setProperty('--i', String(i));
    btn.setAttribute('aria-label', `${w.en} ${w.cn}，进入主界面`);
    btn.innerHTML = `${w.en}<small>${w.cn}</small>`;
    btn.addEventListener('click', enter);
    orbit.appendChild(btn);
  });

  mark.addEventListener('click', enter);

  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    splash.classList.add('leaving');
    setTimeout(() => {
      window.location.assign('/main');
    }, 460);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enter();
    }
  });
})();
