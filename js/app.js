(function () {
  const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const TIMES = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
  const PAGES = [['home', 'Главная'], ['dept', 'Отделения'], ['doctors', 'Врачи'], ['prices', 'Цены'], ['reviews', 'Отзывы'], ['contacts', 'Контакты']];
  const DMAP = Object.fromEntries(DEPTS.map(d => [d.id, d]));

  const emptyBooking = () => ({ dept: null, doc: null, date: 0, time: null, anon: false, name: '', phone: '', comment: '' });

  const state = {
    page: 'home',
    deptId: 'derm',
    docFilter: 'all',
    revFilter: 'all',
    priceDept: 'derm',
    b: emptyBooking(),
    submitted: false,
    code: '',
    showHint: false
  };

  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const mobileNav = document.getElementById('mobileNav');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuBtn = document.getElementById('menuBtn');

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- routing ---------- */

  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const page = parts[0] || 'home';
    const known = ['home', 'dept', 'doctors', 'prices', 'booking', 'reviews', 'contacts'];
    state.page = known.includes(page) ? page : 'home';
    if (state.page === 'dept' && DMAP[parts[1]]) state.deptId = parts[1];
    if (state.page === 'prices' && DMAP[parts[1]]) state.priceDept = parts[1];
  }

  function go(hash) {
    if (location.hash === hash) { render(); window.scrollTo(0, 0); }
    else location.hash = hash;
  }

  window.addEventListener('hashchange', () => {
    parseHash();
    closeMenu();
    render();
    window.scrollTo(0, 0);
  });

  /* ---------- helpers ---------- */

  function bookingDates() {
    const today = new Date();
    const out = [];
    for (let i = 1; out.length < 8 && i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) out.push(d);
    }
    return out;
  }

  function pill(label, active, action, value) {
    return `<button type="button" class="pill${active ? ' active' : ''}" data-action="${action}" data-value="${esc(value)}">${esc(label)}</button>`;
  }

  function filterPills(key, action) {
    return [['all', 'Все'], ...DEPTS.map(d => [d.id, d.name])]
      .map(([id, label]) => pill(label, state[key] === id, action, id)).join('');
  }

  function bookBtn(doc, cls, label) {
    return `<button type="button" class="${cls}" data-action="book" data-dept="${doc.dept}" data-doc="${doc.id}">${label}</button>`;
  }

  /* ---------- nav ---------- */

  function renderNav() {
    const html = PAGES.map(([id, label]) => {
      const href = id === 'home' ? '#/' : id === 'dept' ? `#/dept/${state.deptId}` : `#/${id}`;
      return `<a class="nav-link${state.page === id ? ' active' : ''}" href="${href}">${label}</a>`;
    }).join('');
    nav.innerHTML = html;
    mobileNav.innerHTML = html;
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    menuBtn.textContent = 'Меню';
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    menuBtn.textContent = open ? 'Закрыть' : 'Меню';
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  /* ---------- pages ---------- */

  function viewHome() {
    const depts = DEPTS.map(d => `
      <a class="dept-card" href="#/dept/${d.id}">
        <div class="dept-label"><span class="dot" style="background:${d.color}"></span><span style="color:${d.color}">${d.label}</span></div>
        <h3>${d.name}</h3>
        <p>${d.tagline}</p>
        <div class="chips">${d.top.map(c => `<span class="chip" style="background:${d.soft}">${c}</span>`).join('')}</div>
        <span class="more">Подробнее →</span>
      </a>`).join('');

    const privacy = PRIVACY.map(p => `<div class="privacy-item"><b>${p.t}</b><span>${p.d}</span></div>`).join('');

    const reviews = REVIEWS.slice(0, 3).map(r => `
      <div class="review-feat">
        <p>«${r.text}»</p>
        <div class="review-meta"><b>${r.who}</b><span>${DMAP[r.dept].name}</span></div>
      </div>`).join('');

    return `
      <section class="wrap hero">
        <div class="hero-text">
          <span class="eyebrow">Многопрофильная клиника в Астане</span>
          <h1>Бережное лечение без спешки и осуждения</h1>
          <p class="hero-lead">Дерматовенерология, кардиология и психотерапия под одной крышей. Врачи, которые слушают, объясняют и хранят врачебную тайну.</p>
          <div class="btn-row">
            <button type="button" class="btn btn-primary" data-action="book">Записаться на приём</button>
            <button type="button" class="btn btn-outline" data-action="book" data-anon="1">Анонимная запись</button>
          </div>
        </div>
        <div class="hero-photo">
          <img src="img/hall.jpg" alt="Светлый холл клиники" width="1400" height="933">
          <div class="hero-note"><b>Отдельный тихий вход</b><span>для пациентов психотерапии и венерологии</span></div>
        </div>
      </section>

      <section class="wrap section-pad-b">
        <h2 class="h-section">Отделения</h2>
        <div class="dept-grid">${depts}</div>
      </section>

      <section class="privacy-block">
        <div class="wrap privacy-inner">
          <div class="privacy-text">
            <span class="eyebrow">Конфиденциальность</span>
            <h2>Ваша приватность тоже часть лечения</h2>
            <p>О некоторых вещах трудно говорить. Поэтому о вашем визите знаете только вы и врач.</p>
          </div>
          <div class="privacy-grid">${privacy}</div>
        </div>
      </section>

      <section class="wrap section-pad">
        <div class="row-head">
          <h2 class="h-section">Что говорят пациенты</h2>
          <a class="link-arrow" href="#/reviews" style="font-size:15px">Все отзывы →</a>
        </div>
        <div class="review-grid">${reviews}</div>
      </section>`;
  }

  function viewDept() {
    const d = DMAP[state.deptId];
    const tabs = DEPTS.map(x => `<a class="pill${x.id === d.id ? ' active' : ''}" href="#/dept/${x.id}">${x.name}</a>`).join('');
    const doctors = DOCTORS.filter(x => x.dept === d.id).map(doc => `
      <div class="doc-row">
        <img src="${doc.photo}" alt="${esc(doc.name)}" loading="lazy" width="64" height="64">
        <div class="doc-row-info"><b>${doc.name}</b><span>${doc.role} · стаж ${doc.exp}</span></div>
        ${bookBtn(doc, 'btn-small-outline', 'Записаться')}
      </div>`).join('');
    const prices = PRICES[d.id].map(p => `<div class="price-line"><span>${p.name}</span><b>${p.price}</b></div>`).join('');

    return `
      <section class="wrap dept-hero">
        <div class="pills">${tabs}</div>
        <div class="dept-hero-grid">
          <div class="dept-hero-text">
            <h1>${d.name}</h1>
            <p class="dept-tagline">${d.tagline}</p>
            <p class="dept-desc">${d.desc}</p>
            <div class="btn-row"><button type="button" class="btn btn-primary" data-action="book" data-dept="${d.id}" style="height:50px;padding:0 24px">Записаться в отделение</button></div>
          </div>
          <div class="dept-photo"><img src="${d.photo}" alt="${d.name}: кабинет отделения" width="1200" height="800"></div>
        </div>
      </section>

      <section class="wrap block">
        <h2 class="h-sub">С чем мы помогаем</h2>
        <div class="cond-grid">${d.conditions.map(c => `<div class="cond" style="background:${d.soft}">${c}</div>`).join('')}</div>
      </section>

      <section class="wrap block">
        <h2 class="h-sub">Как проходит приём</h2>
        <div class="steps">${d.steps.map(s => `<div class="step"><span class="step-n">${s.n}</span><span class="step-t">${s.t}</span><span class="step-d">${s.d}</span></div>`).join('')}</div>
      </section>

      <section class="wrap two-col">
        <div class="stack">
          <h2>Врачи отделения</h2>
          ${doctors}
        </div>
        <div class="stack">
          <h2>Стоимость</h2>
          <div class="price-box">${prices}</div>
          <a class="link-arrow" href="#/prices/${d.id}">Полный прайс →</a>
        </div>
      </section>`;
  }

  function viewDoctors() {
    const list = DOCTORS.filter(d => state.docFilter === 'all' || d.dept === state.docFilter).map(doc => {
      const dept = DMAP[doc.dept];
      return `
        <div class="doc-card">
          <img src="${doc.photo}" alt="${esc(doc.name)}" loading="lazy" width="600" height="600">
          <div class="doc-card-info">
            <span class="doc-dept" style="color:${dept.color}">${dept.name}</span>
            <span class="doc-name">${doc.name}</span>
            <span class="doc-role">${doc.role} · стаж ${doc.exp}</span>
            <span class="doc-about">${doc.about}</span>
          </div>
          ${bookBtn(doc, 'btn btn-primary', 'Записаться')}
        </div>`;
    }).join('');

    return `
      <section class="wrap page-pad">
        <h1 class="h-page">Врачи</h1>
        <p class="lead">Специалисты с опытом и уважением к пациенту.</p>
        <div class="pills" style="margin-bottom:32px">${filterPills('docFilter', 'docFilter')}</div>
        <div class="doc-grid">${list}</div>
      </section>`;
  }

  function viewPrices() {
    const tabs = DEPTS.map(d => pill(d.name, d.id === state.priceDept, 'priceDept', d.id)).join('');
    const rows = PRICES[state.priceDept].map(p => `
      <div class="price-row">
        <div class="price-row-name"><b>${p.name}</b>${p.note ? `<span>${p.note}</span>` : ''}</div>
        <span class="price-row-val">${p.price}</span>
      </div>`).join('');

    return `
      <section class="wrap narrow page-pad">
        <h1 class="h-page">Цены</h1>
        <p class="lead lead-wide">Стоимость фиксированная. Врач заранее скажет, если понадобятся дополнительные исследования.</p>
        <div class="pills" style="margin-bottom:24px">${tabs}</div>
        <div class="price-table">${rows}</div>
        <div class="pay-note">
          <span>Оплата наличными, картой или Kaspi. Чек можно получить без указания ФИО.</span>
          <button type="button" class="btn btn-primary btn-md" data-action="book" data-dept="${state.priceDept}">Записаться</button>
        </div>
      </section>`;
  }

  function bookingReady() {
    const b = state.b;
    const digits = b.phone.replace(/\D/g, '');
    const missing = [];
    if (!b.dept) missing.push('отделение');
    if (!b.time) missing.push('время');
    if (digits.length < 10) missing.push('телефон');
    return missing;
  }

  function summaryHtml() {
    const b = state.b;
    const dates = bookingDates();
    const dt = dates[b.date];
    const doc = DOCTORS.find(d => d.id === b.doc);
    const rows = [
      ['Отделение', b.dept ? DMAP[b.dept].name : 'не выбрано'],
      ['Врач', doc ? doc.name : 'Любой'],
      ['Дата', dt ? `${WD[dt.getDay()]}, ${dt.getDate()} ${MON[dt.getMonth()]}` : 'не выбрано'],
      ['Время', b.time || 'не выбрано'],
      ['Пациент', b.anon ? 'Анонимно (по коду)' : (b.name.trim() || 'не указано')]
    ];
    const missing = bookingReady();
    return `
      <span class="summary-title">Ваша запись</span>
      ${rows.map(([k, v]) => `<div class="summary-row"><span>${k}</span><span>${esc(v)}</span></div>`).join('')}
      <button type="button" class="btn btn-primary${missing.length ? ' is-disabled' : ''}" data-action="submit">Подтвердить запись</button>
      ${state.showHint && missing.length ? `<span class="summary-hint">Осталось указать: ${missing.join(', ')}.</span>` : ''}
      <span class="summary-note">Нажимая кнопку, вы соглашаетесь на обработку данных. Мы не передаём их третьим лицам.</span>`;
  }

  function viewBooking() {
    const b = state.b;

    if (state.submitted) {
      const dt = bookingDates()[b.date];
      const line = `${DMAP[b.dept].name} · ${dt.getDate()} ${MON[dt.getMonth()]}, ${b.time}${b.anon ? ' · ваш код: ' + state.code : ''}`;
      return `
        <section class="wrap page-pad">
          <div class="done">
            <h1>Вы записаны</h1>
            <p>${esc(line)}</p>
            <p class="small">Администратор перезвонит для подтверждения. SMS придёт без названия отделения.</p>
            <button type="button" class="btn btn-outline btn-md" data-action="reset">Новая запись</button>
          </div>
        </section>`;
    }

    const depts = DEPTS.map(d => {
      const on = b.dept === d.id;
      return `<button type="button" class="b-dept" data-action="bDept" data-value="${d.id}" style="background:${on ? d.soft : 'var(--card)'};border-color:${on ? d.color : 'var(--line)'}"><span class="dot" style="background:${d.color}"></span>${d.name}</button>`;
    }).join('');

    const docs = [{ id: null, name: 'Любой врач' }, ...DOCTORS.filter(d => !b.dept || d.dept === b.dept)]
      .map(d => pill(d.name, b.doc === d.id, 'bDoc', d.id === null ? '' : d.id)).join('');

    const dates = bookingDates().map((d, i) => `
      <button type="button" class="b-date${b.date === i ? ' active' : ''}" data-action="bDate" data-value="${i}">
        <small>${WD[d.getDay()]}</small><b>${d.getDate()}</b>
      </button>`).join('');

    const times = TIMES.map(t => `<button type="button" class="pill b-time${b.time === t ? ' active' : ''}" data-action="bTime" data-value="${t}">${t}</button>`).join('');

    return `
      <section class="wrap page-pad">
        <h1 class="h-page">Запись на приём</h1>
        <p class="lead" style="margin-bottom:36px">Около минуты. Данные видят только администратор и ваш врач.</p>
        <div class="booking-grid">
          <div class="booking-steps">
            <div class="b-step"><span class="b-step-title">1. Отделение</span><div class="b-depts">${depts}</div></div>
            <div class="b-step"><span class="b-step-title">2. Врач</span><div class="b-wrap">${docs}</div></div>
            <div class="b-step"><span class="b-step-title">3. Дата и время</span>
              <div class="b-dates">${dates}</div>
              <div class="b-wrap">${times}</div>
            </div>
            <div class="b-step"><span class="b-step-title">4. Контакты</span>
              <button type="button" class="anon-toggle${b.anon ? ' on' : ''}" data-action="toggleAnon" aria-pressed="${b.anon}">
                <span class="switch"><span></span></span>
                <span class="anon-text"><b>Анонимный приём</b><span>Вместо имени будет код. Документы не нужны.</span></span>
              </button>
              ${b.anon ? '' : `<input class="field" data-field="name" value="${esc(b.name)}" placeholder="Имя" autocomplete="given-name">`}
              <input class="field" data-field="phone" value="${esc(b.phone)}" placeholder="Телефон +7" inputmode="tel" autocomplete="tel">
              <textarea class="field" data-field="comment" rows="3" placeholder="Комментарий (необязательно). Жалобы можно не описывать.">${esc(b.comment)}</textarea>
            </div>
          </div>
          <aside class="summary" id="summary">${summaryHtml()}</aside>
        </div>
      </section>`;
  }

  function viewReviews() {
    const list = REVIEWS.filter(r => state.revFilter === 'all' || r.dept === state.revFilter).map(r => {
      const d = DMAP[r.dept];
      return `
        <div class="review-card">
          <div class="review-top"><span style="color:${d.color}">${d.name}</span><span>${r.date}</span></div>
          <p>${r.text}</p>
          <span class="who">${r.who}</span>
        </div>`;
    }).join('');

    return `
      <section class="wrap page-pad">
        <h1 class="h-page">Отзывы</h1>
        <p class="lead">Публикуем только с согласия пациента и без полных имён.</p>
        <div class="pills">${filterPills('revFilter', 'revFilter')}</div>
        <div class="review-all">${list}</div>
      </section>`;
  }

  function viewContacts() {
    const items = CONTACTS.map(c => `
      <div class="contact">
        <span class="contact-k">${c.k}</span>
        ${c.href ? `<a class="contact-v" href="${c.href}">${c.v}</a>` : `<span class="contact-v">${c.v}</span>`}
        <span class="contact-n">${c.n}</span>
      </div>`).join('');
    const q = encodeURIComponent(MAP_QUERY);

    return `
      <section class="wrap page-pad contacts-grid">
        <div class="contacts-list">
          <h1 class="h-page" style="margin:0">Контакты</h1>
          ${items}
          <a class="link-arrow" href="https://2gis.kz/astana/search/${q}" target="_blank" rel="noopener">Открыть в 2ГИС →</a>
        </div>
        <div class="map">
          <iframe title="Карта: ${esc(MAP_QUERY)}" src="https://maps.google.com/maps?q=${q}&z=16&hl=ru&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </section>`;
  }

  const VIEWS = { home: viewHome, dept: viewDept, doctors: viewDoctors, prices: viewPrices, booking: viewBooking, reviews: viewReviews, contacts: viewContacts };

  function render() {
    renderNav();
    app.innerHTML = VIEWS[state.page]();
    const titles = { home: 'Атом Астана · клиника', dept: DMAP[state.deptId].name, doctors: 'Врачи', prices: 'Цены', booking: 'Запись на приём', reviews: 'Отзывы', contacts: 'Контакты' };
    document.title = state.page === 'home' ? titles.home : `${titles[state.page]} · Атом Астана`;
  }

  function updateSummary() {
    const el = document.getElementById('summary');
    if (el) el.innerHTML = summaryHtml();
  }

  /* ---------- actions ---------- */

  const ACTIONS = {
    book(el) {
      const p = { };
      if (el.dataset.dept) { p.dept = el.dataset.dept; p.doc = null; }
      if (el.dataset.doc) p.doc = Number(el.dataset.doc);
      if (el.dataset.anon) p.anon = true;
      Object.assign(state.b, p);
      state.submitted = false;
      state.showHint = false;
      go('#/booking');
    },
    docFilter(el) { state.docFilter = el.dataset.value; render(); },
    revFilter(el) { state.revFilter = el.dataset.value; render(); },
    priceDept(el) { state.priceDept = el.dataset.value; render(); },
    bDept(el) { state.b.dept = el.dataset.value; state.b.doc = null; render(); },
    bDoc(el) {
      const id = el.dataset.value ? Number(el.dataset.value) : null;
      state.b.doc = id;
      if (id) state.b.dept = DOCTORS.find(d => d.id === id).dept;
      render();
    },
    bDate(el) { state.b.date = Number(el.dataset.value); render(); },
    bTime(el) { state.b.time = el.dataset.value; render(); },
    toggleAnon() { state.b.anon = !state.b.anon; render(); },
    submit() {
      if (bookingReady().length) { state.showHint = true; updateSummary(); return; }
      state.code = 'A' + (1000 + Math.floor(Math.random() * 9000));
      state.submitted = true;
      try {
        const saved = JSON.parse(localStorage.getItem('atom-bookings') || '[]');
        saved.push({ ...state.b, code: state.b.anon ? state.code : null, created: new Date().toISOString() });
        localStorage.setItem('atom-bookings', JSON.stringify(saved));
      } catch (e) { /* хранилище недоступно, запись всё равно показываем */ }
      render();
      window.scrollTo(0, 0);
    },
    reset() {
      state.b = emptyBooking();
      state.submitted = false;
      state.showHint = false;
      render();
    }
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el); }
  });

  document.addEventListener('input', e => {
    const field = e.target.dataset && e.target.dataset.field;
    if (!field) return;
    state.b[field] = e.target.value;
    updateSummary();
  });

  window.addEventListener('resize', () => { if (window.innerWidth >= 900) closeMenu(); });

  parseHash();
  render();
})();
