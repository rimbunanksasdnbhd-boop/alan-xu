(() => {
  const root = document.documentElement;
  const CV = { en: 'assets/Alan_Xu_CV_EN.pdf', zh: 'assets/Alan_Xu_CV_CN.pdf' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Language: swap innerHTML of every [data-zh] element, keeping the English original
  const langBtn = document.getElementById('langBtn');
  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-zh]').forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'zh' ? el.dataset.zh : el.dataset.en;
    });
    document.querySelectorAll('[data-cv]').forEach(a => a.setAttribute('href', CV[lang]));
    langBtn.textContent = lang === 'zh' ? 'EN' : '中文';
    langBtn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    document.title = lang === 'zh' ? '徐逸伦 Alan Xu — AI 转型，用工程的方式落地' : 'Alan Xu — AI transformation, engineered';
    localStorage.setItem('ax2-lang', lang);
  }
  langBtn.addEventListener('click', () => setLang(root.dataset.lang === 'zh' ? 'en' : 'zh'));
  const saved = localStorage.getItem('ax2-lang');
  if (saved === 'zh' || (!saved && /^zh/i.test(navigator.language))) setLang('zh');

  // Theme (default light; the inline script in <head> applies it before paint)
  const themeBtn = document.getElementById('themeBtn');
  const meta = document.querySelector('meta[name="theme-color"]');
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    meta.setAttribute('content', dark ? '#010102' : '#fbfbfc');
  }
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ax2-theme', root.dataset.theme);
    syncTheme();
  });
  syncTheme();

  // Profile numbers count up once
  if (!reduce) {
    document.querySelectorAll('[data-count]').forEach((el, i) => {
      const end = +el.dataset.count, t0 = performance.now() + 250 + i * 90, dur = 1100;
      el.textContent = '0';
      const tick = now => {
        const p = Math.max(0, Math.min(1, (now - t0) / dur));
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // Hero screenshot starts tilted back and settles flat as it scrolls into view
  const shot = document.querySelector('.hero-shot');
  if (!reduce && shot) {
    let start = null;
    const tilt = () => {
      if (innerWidth <= 768) { shot.style.transform = ''; return; }
      const top = shot.getBoundingClientRect().top;
      if (start === null) start = top + scrollY;
      const p = Math.min(1, Math.max(0, scrollY / Math.max(1, start - innerHeight * 0.25)));
      shot.style.transform = `perspective(1800px) rotateX(${(16 * (1 - p)).toFixed(2)}deg) scale(${(0.94 + 0.06 * p).toFixed(3)})`;
    };
    tilt();
    addEventListener('scroll', () => requestAnimationFrame(tilt), { passive: true });
    addEventListener('resize', () => { start = null; tilt(); });
  }

  // Delivery-line loop: reviewer works, a gate asks for a person, the person approves
  const $ = id => document.getElementById(id);
  const review = $('tlReview'), gate = $('tlGate'), reviewText = $('reviewText'), gateSub = $('gateSub');
  const stage = $('listStage'), toast = $('gateToast'), tTitle = $('toastTitle'), tSub = $('toastSub'), tBtn = $('toastBtn');
  if (!reduce && review) {
    const msgs = ['Challenging 2 assumptions', 'Checking R3 vs S4 flavour', 'Re-running 42 checks'];
    const setStage = (cls, text) => { stage.className = 'stage ' + cls; stage.innerHTML = '<i></i>' + text; };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    (async function loop() {
      for (;;) {
        review.className = 'run'; gate.className = 'gate wait'; gateSub.textContent = 'Waiting for a person';
        setStage('s-run', 'S9 Review');
        toast.className = 'toast'; tBtn.className = 't-btn'; tBtn.textContent = 'Approve';
        for (const m of msgs) { reviewText.textContent = m; await wait(1500); }
        review.className = 'ok'; reviewText.textContent = '2 findings resolved';
        setStage('s-gate', 'Gate · Release');
        tTitle.textContent = 'Release approval needed'; tSub.textContent = 'REQ-142 · reviewer finished S9';
        toast.classList.add('show');
        await wait(2400);
        tBtn.classList.add('press');
        await wait(300);
        toast.classList.add('done'); tBtn.classList.remove('press'); tBtn.textContent = '✓ Released';
        tTitle.textContent = 'Approved by Alan X.'; tSub.textContent = 'Product Owner · just now';
        gate.className = 'gate ok'; gateSub.textContent = 'Alan X. · approved just now';
        setStage('s-done', 'Done');
        await wait(3200);
        toast.classList.remove('show');
        await wait(900);
      }
    })();
  }

  // Reveal on scroll
  const targets = document.querySelectorAll('.feature, .card, .log li, .issues, .cta');
  if (!reduce) {
    targets.forEach(el => el.classList.add('rv'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  // Issue-list filters
  const items = [...document.querySelectorAll('.is-list li')];
  const shown = document.getElementById('shownCount');
  document.querySelectorAll('.tabs button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => { b.classList.toggle('on', b === btn); b.setAttribute('aria-pressed', b === btn); });
    const f = btn.dataset.f;
    let n = 0;
    items.forEach(li => { const hit = f === 'all' || li.dataset.cat === f; li.hidden = !hit; n += hit; });
    shown.textContent = n;
  }));

  // Contact form opens a prefilled email
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      ok = ok && !bad;
    });
    if (!ok) return;
    const d = Object.fromEntries(new FormData(form));
    const subject = `Role conversation — ${d.name}${d.role ? ' (' + d.role + ')' : ''}`;
    const body = `${d.msg}\n\n${d.name}\n${d.email}${d.role ? '\n' + d.role : ''}`;
    location.href = `mailto:370219478@qq.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
