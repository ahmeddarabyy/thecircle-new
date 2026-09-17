/* ==========================================================================
   The Circle — iOS app preview
   Screen definitions shared by index.html (interactive) and gallery.html.

   Every price, address, opening hour and article title below is taken from
   the live site so the preview shows the real product, not placeholder text:
     - meeting room rates ....... book-a-space.html  (const prices)
     - day / shift pass ......... book-a-space.html  (prices.shared)
     - opening hours ............ book-a-space.html  (OPEN_HOUR / CLOSE_HOUR)
     - branch addresses ......... backend/server.js  (sendBookingConfirmation)
     - article titles ........... blog-*.html        (<title>)
   ========================================================================== */

const A = '../assets/'; // real photography from the website

/* ── Icons (SF Symbols-alike, 24px stroke) ────────────────────────────── */

const svg = (paths, o = {}) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${o.w || 1.7}"
      stroke-linecap="round" stroke-linejoin="round" width="${o.s || 24}" height="${o.s || 24}">${paths}</svg>`;

const ICON = {
    house: svg('<path d="M3 10.2 12 3.5l9 6.7V20a1 1 0 0 1-1 1h-5v-6.2H9V21H4a1 1 0 0 1-1-1z"/>'),
    grid: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
    calendar: svg('<rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M3.5 9.8h17M8 3.2v3.4M16 3.2v3.4M12 13v5M9.5 15.5h5"/>'),
    ticket: svg('<path d="M3.5 9.2V7a1.5 1.5 0 0 1 1.5-1.5h14A1.5 1.5 0 0 1 20.5 7v2.2a2.8 2.8 0 0 0 0 5.6V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17v-2.2a2.8 2.8 0 0 0 0-5.6Z"/><path d="M14 6.5v11" stroke-dasharray="2 2.4"/>'),
    person: svg('<circle cx="12" cy="8" r="3.9"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>'),
    desk: svg('<path d="M3 7.5h18M4.5 7.5v11M19.5 7.5v11M8 11.5h8M8 11.5v3"/>'),
    door: svg('<path d="M6 21V4.6a1.6 1.6 0 0 1 1.9-1.57l8 1.5A1.6 1.6 0 0 1 17.2 6.1v12.3a1.6 1.6 0 0 1-1.3 1.57l-8 1.5A1.6 1.6 0 0 1 6 19.9Z"/><circle cx="14" cy="12.4" r=".9" fill="currentColor" stroke="none"/><path d="M4 21h16"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"/>'),
    map: svg('<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>'),
    wifi: svg('<path d="M2.6 9.4a14 14 0 0 1 18.8 0M6 13a9 9 0 0 1 12 0M9.4 16.5a4 4 0 0 1 5.2 0"/><circle cx="12" cy="19.6" r="1.1" fill="currentColor" stroke="none"/>'),
    coffee: svg('<path d="M4 8h13v6.5a4.5 4.5 0 0 1-4.5 4.5h-4A4.5 4.5 0 0 1 4 14.5Z"/><path d="M17 9.5h1.6a2.4 2.4 0 0 1 0 4.8H17"/><path d="M7.5 3.2v2M11 3.2v2"/>'),
    screen: svg('<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9 20.5h6M12 16.5v4"/>'),
    printer: svg('<path d="M7 9V3.8h10V9"/><rect x="3.5" y="9" width="17" height="7.5" rx="2"/><path d="M7 14h10v6.2H7z"/>'),
    lock: svg('<rect x="4.5" y="10.5" width="15" height="10" rx="2.6"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>'),
    check: svg('<path d="M4.5 12.6 9.5 17.5 19.5 6.8"/>', { w: 2.2 }),
    chevron: svg('<path d="m9.5 4.5 7 7.5-7 7.5"/>', { s: 16, w: 2 }),
    chevronLeft: svg('<path d="m14.5 4.5-7 7.5 7 7.5"/>', { s: 18, w: 2.2 }),
    chevronUp: svg('<path d="m4.5 14.5 7.5-7 7.5 7"/>', { s: 15, w: 2.4 }),
    chevronDown: svg('<path d="m4.5 9.5 7.5 7 7.5-7"/>', { s: 15, w: 2.4 }),
    search: svg('<circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.5 4.5"/>', { s: 17, w: 2 }),
    plus: svg('<path d="M12 5v14M5 12h14"/>', { s: 18, w: 2 }),
    bell: svg('<path d="M6 9.5a6 6 0 1 1 12 0c0 4 1.4 5.6 2 6.3.3.4 0 1-.5 1H4.5c-.6 0-.9-.6-.5-1 .6-.7 2-2.3 2-6.3Z"/><path d="M9.8 20.2a2.4 2.4 0 0 0 4.4 0"/>'),
    globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c4.5 5 4.5 12 0 17-4.5-5-4.5-12 0-17Z"/>'),
    life: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/><path d="m6 6 3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>'),
    book: svg('<path d="M4 4.5h6a3 3 0 0 1 3 3v12a2.4 2.4 0 0 0-2.4-2.4H4Z"/><path d="M20 4.5h-6a3 3 0 0 0-3 3v12a2.4 2.4 0 0 1 2.4-2.4H20Z"/>'),
    building: svg('<path d="M4.5 20.5V5.2a1.6 1.6 0 0 1 1.6-1.6h7.8a1.6 1.6 0 0 1 1.6 1.6v15.3"/><path d="M15.5 10h2.9a1.6 1.6 0 0 1 1.6 1.6v8.9M3 20.5h18M8 7.5h3.5M8 11.5h3.5M8 15.5h3.5"/>'),
    wallet: svg('<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="17" cy="14" r="1.2" fill="currentColor" stroke="none"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>'),
    info: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 7.9v.1"/>', { s: 15 }),
    qr: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><path d="M13.5 13.5h3v3h-3zM20.5 13.5v3M13.5 20.5h7"/>'),
    handshake: svg('<path d="M8.5 12.5 11 15a1.8 1.8 0 0 0 2.6 0l4.4-4.4"/><path d="m2.5 9.5 3.4-3.4a2 2 0 0 1 1.4-.6h3.2l-3.5 3a1.9 1.9 0 0 0 2.5 2.8l3.3-2.8 6.7 5.7"/><path d="M21.5 9.5 18 6a2 2 0 0 0-1.4-.6h-2.4"/>')
};

/* ── Chrome ───────────────────────────────────────────────────────────── */

function statusBar(time = '9:41', overMedia = false) {
    return `<div class="statusbar${overMedia ? ' over-media' : ''}">
    <span>${time}</span>
    <span class="glyphs">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="7.5" width="3" height="4.5" rx="1"/>
        <rect x="4.6" y="5.2" width="3" height="6.8" rx="1"/>
        <rect x="9.2" y="2.8" width="3" height="9.2" rx="1"/>
        <rect x="13.8" y="0" width="3" height="12" rx="1"/>
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <path d="M1 4.1a10 10 0 0 1 14 0"/><path d="M3.6 6.9a6.3 6.3 0 0 1 8.8 0"/>
        <circle cx="8" cy="10.1" r="1.1" fill="currentColor" stroke="none"/>
      </svg>
      <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
        <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" stroke="currentColor" stroke-opacity="0.38"/>
        <rect x="2.4" y="2.4" width="15.6" height="7.2" rx="2" fill="currentColor"/>
        <path d="M23.4 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" fill-opacity="0.4"/>
      </svg>
    </span>
  </div>`;
}

const TABS = [
    { id: 'home', label: 'Home', icon: ICON.house },
    { id: 'spaces', label: 'Spaces', icon: ICON.grid },
    { id: 'book', label: 'Book', icon: ICON.calendar },
    { id: 'bookings', label: 'Passes', icon: ICON.ticket },
    { id: 'profile', label: 'Account', icon: ICON.person }
];

const TABS_AR = ['الرئيسية', 'المساحات', 'احجز', 'تذاكري', 'حسابي'];

function tabBar(active, ar = false) {
    return `<nav class="tabbar">${TABS.map(
        (t, i) => `<button class="tab${t.id === active ? ' active' : ''}" data-tab="${t.id}">
        ${t.icon}<span>${ar ? TABS_AR[i] : t.label}</span></button>`
    ).join('')}</nav>`;
}

const HOME_INDICATOR = '<div class="home-indicator"></div>';

/* Deterministic QR-looking matrix for the check-in pass mockup. */
function qrSvg(size = 25) {
    let seed = 20260917;
    const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const finder = (x, y, r, c) =>
        (r >= y && r < y + 7 && c >= x && c < x + 7) &&
        !((r === y + 1 || r === y + 5) && c > x && c < x + 6) &&
        !((c === x + 1 || c === x + 5) && r > y && r < y + 6);
    const inFinderZone = (r, c) =>
        (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8);

    let rects = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const on = inFinderZone(r, c)
                ? finder(0, 0, r, c) || finder(size - 7, 0, r, c) || finder(0, size - 7, r, c)
                : rand() > 0.52;
            if (on) rects += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
        }
    }
    return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" fill="currentColor">${rects}</svg>`;
}

/* ── Screens ──────────────────────────────────────────────────────────── */

function homeScreen({ dark = false, ar = false, branch = 'kafr-abdo' } = {}) {
    if (ar) return homeScreenAr({ dark });

    const isKafr = branch === 'kafr-abdo';
    return `<div class="screen${dark ? ' dark' : ''}" data-screen="home">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row">
        <div>
          <div class="greeting">Good morning</div>
          <div class="nav-title" style="font-size:22px;letter-spacing:-0.6px">The Circle</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <span style="color:var(--label)">${ICON.bell}</span>
          <div class="nav-avatar">AD</div>
        </div>
      </div>
    </header>
    <div class="body">
      <div class="segmented" style="margin-top:4px">
        <button class="${isKafr ? 'active' : ''}" data-branch="kafr-abdo">Kafr Abdo</button>
        <button class="${isKafr ? '' : 'active'}" data-branch="roushdy">Roushdy</button>
      </div>

      <section class="next-booking">
        <span class="eyebrow">Your next booking</span>
        <h3>Meeting Room</h3>
        <div class="when">Today · 2:00 PM – 4:00 PM · ${isKafr ? 'Kafr Abdo' : 'Roushdy'}</div>
        <div class="actions">
          <button>Check in</button>
          <button class="ghost">Directions</button>
        </div>
      </section>

      <div class="quick-grid">
        <button class="quick"><span>${ICON.desk}</span><span><span class="t">Day pass</span><span class="s">EGP 200 · shared space</span></span></button>
        <button class="quick"><span>${ICON.calendar}</span><span><span class="t">Meeting room</span><span class="s">From EGP ${isKafr ? '250' : '200'}/hr</span></span></button>
        <button class="quick"><span>${ICON.door}</span><span><span class="t">Private office</span><span class="s">Request a quote</span></span></button>
        <button class="quick"><span>${ICON.map}</span><span><span class="t">Book a tour</span><span class="s">Both branches</span></span></button>
      </div>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Explore spaces</h2>
          <span class="section-link">See all</span>
        </div>
      </section>
      <div class="carousel">
        <article class="space-card">
          <img src="${A}private_office_thecircle_SyriaStreet.webp" alt="Private office">
          <div class="meta"><div class="t">Private Offices</div><div class="s">Lockable · 2–12 people</div></div>
        </article>
        <article class="space-card">
          <img src="${A}thecircle_space_kafrabdo1.webp" alt="Shared space">
          <div class="meta"><div class="t">Shared Spaces</div><div class="s">EGP 200 day · 100 shift</div></div>
        </article>
        <article class="space-card">
          <img src="${A}TheCirclePrivateRoomsKafrAbdo.webp" alt="Meeting room">
          <div class="meta"><div class="t">Meeting Rooms</div><div class="s">Hourly, by the slot</div></div>
        </article>
      </div>

      <section class="section">
        <div class="section-head"><h2 class="section-title">Open today</h2></div>
        <div class="card" style="padding:14px 16px;border:0.5px solid var(--separator)">
          <div style="display:flex;align-items:center;gap:8px;font-size:15px;letter-spacing:-0.3px">
            <span style="color:var(--emerald)">${ICON.clock}</span>
            <span>9:00 AM – 11:00 PM</span>
            <span class="pill brand" style="margin-left:auto">Open now</span>
          </div>
        </div>
      </section>
      <div class="amenity-strip">
        <span class="pill">${ICON.wifi} Fibre Wi-Fi</span>
        <span class="pill">${ICON.coffee} Unlimited coffee</span>
        <span class="pill">${ICON.printer} Printing</span>
        <span class="pill">${ICON.lock} 24/7 access</span>
      </div>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Insights</h2>
          <span class="section-link">All articles</span>
        </div>
      </section>
      <div class="insight">
        <img src="${A}thecircle_space_kafrabdo4.webp" alt="">
        <div>
          <div class="t">Office Space for Rent in Kafr Abdo</div>
          <div class="s">Complete 2026 guide · 6 min read</div>
        </div>
      </div>
    </div>
    ${tabBar('home')}
    ${HOME_INDICATOR}
  </div>`;
}

function homeScreenAr({ dark = false } = {}) {
    return `<div class="screen${dark ? ' dark' : ''}" dir="rtl" data-screen="home-ar">
    ${statusBar('٩:٤١')}
    <header class="navbar">
      <div class="nav-row">
        <div>
          <div class="greeting">صباح الخير</div>
          <div class="nav-title" style="font-size:22px">ذا سيركل</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <span style="color:var(--label)">${ICON.bell}</span>
          <div class="nav-avatar">أد</div>
        </div>
      </div>
    </header>
    <div class="body">
      <div class="segmented" style="margin-top:4px">
        <button class="active">كفر عبده</button>
        <button>رشدي</button>
      </div>

      <section class="next-booking">
        <span class="eyebrow">حجزك القادم</span>
        <h3>قاعة اجتماعات</h3>
        <div class="when">اليوم · ٢:٠٠ م – ٤:٠٠ م · كفر عبده</div>
        <div class="actions">
          <button>تسجيل الدخول</button>
          <button class="ghost">الاتجاهات</button>
        </div>
      </section>

      <div class="quick-grid">
        <button class="quick"><span>${ICON.desk}</span><span><span class="t">تذكرة يوم</span><span class="s">٢٠٠ ج.م · مساحة مشتركة</span></span></button>
        <button class="quick"><span>${ICON.calendar}</span><span><span class="t">قاعة اجتماعات</span><span class="s">من ٢٥٠ ج.م/ساعة</span></span></button>
        <button class="quick"><span>${ICON.door}</span><span><span class="t">مكتب خاص</span><span class="s">اطلب عرض سعر</span></span></button>
        <button class="quick"><span>${ICON.map}</span><span><span class="t">احجز زيارة</span><span class="s">الفرعان</span></span></button>
      </div>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">استكشف المساحات</h2>
          <span class="section-link">عرض الكل</span>
        </div>
      </section>
      <div class="carousel">
        <article class="space-card">
          <img src="${A}private_office_thecircle_SyriaStreet.webp" alt="">
          <div class="meta"><div class="t">مكاتب خاصة</div><div class="s">مغلقة · ٢–١٢ فرد</div></div>
        </article>
        <article class="space-card">
          <img src="${A}thecircle_space_kafrabdo1.webp" alt="">
          <div class="meta"><div class="t">مساحات مشتركة</div><div class="s">٢٠٠ ج.م لليوم</div></div>
        </article>
        <article class="space-card">
          <img src="${A}TheCirclePrivateRoomsKafrAbdo.webp" alt="">
          <div class="meta"><div class="t">قاعات اجتماعات</div><div class="s">بالساعة</div></div>
        </article>
      </div>

      <section class="section">
        <div class="section-head"><h2 class="section-title">مفتوح اليوم</h2></div>
        <div class="card" style="padding:14px 16px;border:0.5px solid var(--separator)">
          <div style="display:flex;align-items:center;gap:8px;font-size:15px">
            <span style="color:var(--emerald)">${ICON.clock}</span>
            <span>٩:٠٠ ص – ١١:٠٠ م</span>
            <span class="pill brand" style="margin-right:auto">مفتوح الآن</span>
          </div>
        </div>
      </section>
      <div class="amenity-strip">
        <span class="pill">${ICON.wifi} إنترنت فايبر</span>
        <span class="pill">${ICON.coffee} قهوة مجانية</span>
        <span class="pill">${ICON.printer} طباعة</span>
      </div>
    </div>
    ${tabBar('home', true)}
    ${HOME_INDICATOR}
  </div>`;
}

const SPACE_LIST = [
    {
        name: 'Private Offices',
        desc: 'Lockable rooms for 2–12, furnished and ready to move into.',
        price: 'Request pricing',
        img: 'private_office_thecircle_SyriaStreet.webp'
    },
    {
        name: 'Private Suites',
        desc: 'Larger corporate suites for whole departments.',
        price: 'Request pricing',
        img: 'private_suites_thecircle_kafrabdo.webp'
    },
    {
        name: 'Dedicated Desks',
        desc: 'Your own desk, kept exactly as you left it.',
        price: 'Monthly · request pricing',
        img: 'dedicated_desk_thecircle_kafrabdo.webp'
    },
    {
        name: 'Shared Spaces',
        desc: 'Hot desks in the open working area.',
        price: 'EGP 200 / day · EGP 100 / shift',
        img: 'thecircle_syriastreet_sharedspaces.webp'
    },
    {
        name: 'Meeting Rooms',
        desc: 'Book by the hour, 9:00 AM – 11:00 PM.',
        price: 'From EGP 200 / hour',
        img: 'TheCirclePrivateRoomsKafrAbdo.webp'
    },
    {
        name: 'Back Offices',
        desc: 'Operations and support teams, staffed and managed.',
        price: 'Request pricing',
        img: 'thecircle_space_kafrabdo2.webp'
    },
    {
        name: 'Virtual Office',
        desc: 'Business address, mail handling and call answering.',
        price: 'Request pricing',
        img: 'thecircle-kafrabdo-branch.webp'
    }
];

function spacesScreen() {
    return `<div class="screen grouped" data-screen="spaces">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row"><span class="nav-title">Spaces</span><span class="nav-action">${ICON.map} Map</span></div>
      <h1 class="large-title">Spaces</h1>
    </header>
    <div class="body">
      <div class="search">${ICON.search}<span>Search spaces</span></div>
      <div class="segmented" style="margin-top:12px">
        <button class="active">All</button>
        <button>Kafr Abdo</button>
        <button>Roushdy</button>
      </div>
      <div class="group-header">7 space types · 2 branches</div>
      <div class="list" style="padding:2px 0">
        ${SPACE_LIST.map(
            s => `<div class="space-row">
          <img src="${A}${s.img}" alt="">
          <div style="flex:1">
            <div class="t">${s.name}</div>
            <div class="s">${s.desc}</div>
            <div class="p">${s.price}</div>
          </div>
          <span class="chevron">${ICON.chevron}</span>
        </div>`
        ).join('')}
      </div>
    </div>
    ${tabBar('spaces')}
    ${HOME_INDICATOR}
  </div>`;
}

function detailScreen() {
    return `<div class="screen grouped" data-screen="detail">
    ${statusBar('9:41', true)}
    <div class="glass-back">${ICON.chevronLeft}</div>
    <div class="body flush">
      <div class="hero">
        <img src="${A}TheCirclePrivateRoomsKafrAbdo.webp" alt="Meeting room">
        <div class="scrim"></div>
        <div class="caption">
          <h2>Meeting Rooms</h2>
          <p>Kafr Abdo · Villa 15, Ali Zou El Fekar St</p>
        </div>
      </div>

      <div class="amenity-strip" style="margin-top:14px">
        <span class="pill">Seats 8</span>
        <span class="pill">${ICON.clock} Hourly</span>
        <span class="pill brand">${ICON.check} 3 slots free today</span>
      </div>

      <div class="group-header">Rates</div>
      <div class="price-rows">
        <div class="price-row"><div class="l">1 hour<small>Minimum booking</small></div><div class="v">EGP 250</div></div>
        <div class="price-row"><div class="l">5 hours<small>Half-day block · save EGP 250</small></div><div class="v">EGP 1,000</div></div>
        <div class="price-row"><div class="l">8 hours<small>Full-day block · save EGP 500</small></div><div class="v">EGP 1,500</div></div>
      </div>

      <div class="group-header">Included</div>
      <div class="amenities">
        <div class="amenity">${ICON.wifi} Fibre Wi-Fi</div>
        <div class="amenity">${ICON.screen} Screen &amp; HDMI</div>
        <div class="amenity">${ICON.coffee} Coffee service</div>
        <div class="amenity">${ICON.printer} Printing credits</div>
        <div class="amenity">${ICON.sun} Natural light</div>
        <div class="amenity">${ICON.lock} Private &amp; soundproof</div>
      </div>

      <div class="group-header">Branch</div>
      <div class="list">
        <div class="row inset-icon"><span class="row-icon">${ICON.map}</span><span class="row-label">Get directions</span><span class="chevron">${ICON.chevron}</span></div>
        <div class="row inset-icon"><span class="row-icon">${ICON.clock}</span><span class="row-label">Hours</span><span class="row-value">9 AM – 11 PM</span></div>
      </div>
      <div style="height:18px"></div>
    </div>
    <div class="action-bar">
      <div class="price"><div class="a">EGP 250</div><div class="b">per hour</div></div>
      <button class="btn">Check availability</button>
    </div>
    ${HOME_INDICATOR}
  </div>`;
}

function bookBranchScreen() {
    return `<div class="screen" data-screen="book1">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row">
        <span class="nav-back">${ICON.chevronLeft} Back</span>
        <span class="nav-title">Book a space</span>
        <span class="nav-action" style="opacity:.55">Step 1 of 4</span>
      </div>
      <div class="progress"><i class="on"></i><i></i><i></i><i></i></div>
    </header>
    <div class="body">
      <h1 class="step-title">Which branch?</h1>
      <p class="step-sub">Both locations are open 9:00 AM – 11:00 PM, seven days a week.</p>
      <div style="height:18px"></div>
      <button class="choice selected" data-choice="kafr-abdo">
        <span class="check">${ICON.check}</span>
        <img src="${A}thecircle-kafrabdo-branch.webp" alt="">
        <span style="flex:1">
          <span class="t">Kafr Abdo</span>
          <span class="s">Villa 15, Ali Zou El Fekar St<br>Meeting rooms from EGP 250/hr</span>
        </span>
      </button>
      <button class="choice" data-choice="roushdy">
        <span class="check">${ICON.check}</span>
        <img src="${A}TheCircleRoushdy1.webp" alt="">
        <span style="flex:1">
          <span class="t">Roushdy</span>
          <span class="s">15 Syria St, 1st Floor<br>Meeting rooms from EGP 200/hr</span>
        </span>
      </button>

      <div class="group-header">Space type</div>
      <button class="choice selected" style="padding:14px 12px" data-choice="meeting">
        <span class="check">${ICON.check}</span>
        <span style="flex:1">
          <span class="t">Meeting Room</span>
          <span class="s">Hourly slots · seats up to 8</span>
        </span>
        <span class="pill brand" style="margin-right:12px">EGP 250/hr</span>
      </button>
      <button class="choice" style="padding:14px 12px" data-choice="shared">
        <span class="check">${ICON.check}</span>
        <span style="flex:1">
          <span class="t">Shared Space</span>
          <span class="s">Day pass or shift pass</span>
        </span>
        <span class="pill" style="margin-right:12px">EGP 200</span>
      </button>
    </div>
    <div class="action-bar">
      <button class="btn" data-next="book2">Continue</button>
    </div>
    ${HOME_INDICATOR}
  </div>`;
}

function bookTimeScreen() {
    const dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    // September 2026: the 1st falls on a Tuesday.
    let days = '';
    for (let i = 0; i < 2; i++) days += '<button class="cal-day dim"><span></span></button>';
    for (let d = 1; d <= 30; d++) {
        const cls = d === 17 ? ' today' : d === 24 ? ' selected' : d < 17 ? ' dim' : '';
        days += `<button class="cal-day${cls}" data-day="${d}"><span>${d}</span></button>`;
    }

    const slots = [
        ['9:00', ''], ['10:00', ''], ['11:00', 'taken'], ['12:00', 'taken'],
        ['1:00', ''], ['2:00', 'selected'], ['3:00', 'range'], ['4:00', 'selected'],
        ['5:00', ''], ['6:00', ''], ['7:00', ''], ['8:00', '']
    ];

    return `<div class="screen" data-screen="book2">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row">
        <span class="nav-back">${ICON.chevronLeft} Back</span>
        <span class="nav-title">Kafr Abdo</span>
        <span class="nav-action" style="opacity:.55">Step 2 of 4</span>
      </div>
      <div class="progress"><i class="on"></i><i class="on"></i><i></i><i></i></div>
    </header>
    <div class="body">
      <h1 class="step-title">Pick a date &amp; time</h1>
      <p class="step-sub">Live availability from the branch calendar.</p>
      <div style="height:10px"></div>
      <div class="calendar">
        <div class="cal-head">
          <span class="m">September 2026</span>
          <span class="nav">${ICON.chevronLeft}${ICON.chevron}</span>
        </div>
        <div class="cal-grid">
          ${dows.map(d => `<div class="dow">${d}</div>`).join('')}
          ${days}
        </div>
      </div>

      <div class="group-header" style="margin-top:18px">Thursday, September 24</div>
      <div class="slot-grid">
        ${slots.map(([t, c]) => `<button class="slot ${c}">${t}</button>`).join('')}
      </div>
      <div style="height:10px"></div>
      <div class="note">${ICON.info} 2 slot(s) already booked on this date.</div>

      <div style="height:14px"></div>
      <div class="summary">
        <div class="line"><span class="muted">Meeting Room · Kafr Abdo</span><span>2 hours</span></div>
        <div class="line"><span class="muted">Thu 24 Sep</span><span>2:00 PM – 4:00 PM</span></div>
      </div>
      <div style="height:16px"></div>
    </div>
    <div class="action-bar">
      <div class="price"><div class="a">EGP 500</div><div class="b">2 hours</div></div>
      <button class="btn" data-next="book3">Continue</button>
    </div>
    ${HOME_INDICATOR}
  </div>`;
}

function bookDetailsScreen() {
    return `<div class="screen grouped" data-screen="book3">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row">
        <span class="nav-back">${ICON.chevronLeft} Back</span>
        <span class="nav-title">Your details</span>
        <span class="nav-action" style="opacity:.55">Step 3 of 4</span>
      </div>
      <div class="progress"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div>
    </header>
    <div class="body">
      <div class="group-header">Contact</div>
      <div class="list">
        <div class="row"><span class="row-label">Name</span><span class="row-value">Ahmed Darabi</span></div>
        <div class="row"><span class="row-label">Email</span><span class="row-value">ahmed@studio.eg</span></div>
        <div class="row"><span class="row-label">Phone</span><span class="row-value">+20 103 470 8850</span></div>
      </div>
      <div class="group-header">Booking</div>
      <div class="list">
        <div class="row"><span class="row-label">Branch</span><span class="row-value">Kafr Abdo</span></div>
        <div class="row"><span class="row-label">Space</span><span class="row-value">Meeting Room</span></div>
        <div class="row"><span class="row-label">Date</span><span class="row-value">Thu 24 Sep</span></div>
        <div class="row"><span class="row-label">Time</span><span class="row-value">2:00 – 4:00 PM</span></div>
        <div class="row"><span class="row-label">Attendees</span><span class="row-value">6</span></div>
      </div>
      <div class="group-header">Notes for the team</div>
      <div class="list">
        <div class="row" style="min-height:70px;align-items:flex-start;padding-top:13px">
          <span class="row-label muted">Client pitch — please set up the screen.</span>
        </div>
      </div>
      <div style="height:10px"></div>
      <div class="note">${ICON.lock} Payment is settled at reception. You'll get an email confirmation instantly.</div>
    </div>
    <div class="action-bar">
      <div class="price"><div class="a">EGP 500</div><div class="b">2 hours</div></div>
      <button class="btn" data-next="confirm">Confirm booking</button>
    </div>
    ${HOME_INDICATOR}
  </div>`;
}

function confirmScreen() {
    return `<div class="screen" data-screen="confirm">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row"><span></span><span class="nav-action" data-next="bookings">Done</span></div>
    </header>
    <div class="body">
      <div class="confirm-wrap">
        <div class="confirm-mark">${svg('<path d="M4.5 12.6 9.5 17.5 19.5 6.8"/>', { s: 38, w: 2.6 })}</div>
        <h1>Confirmed.</h1>
        <p>Everything is set for your visit to Kafr Abdo.</p>
      </div>

      <div class="detail-card">
        <span class="eyebrow">Reservation details</span>
        <div class="detail-item"><div class="k">Location</div><div class="v">The Circle Kafr Abdo</div></div>
        <div class="detail-item"><div class="k">Date</div><div class="v">Thursday, September 24, 2026</div></div>
        <div class="detail-item"><div class="k">Assigned time slot</div><div class="v">2:00 PM — 4:00 PM</div></div>
        <div class="detail-item"><div class="k">Total</div><div class="v">EGP 500</div></div>
      </div>

      <div class="wallet-btn">${ICON.wallet} Add to Apple Wallet</div>
      <div style="padding:12px 16px 0;display:flex;gap:10px">
        <button class="btn secondary" style="height:44px;font-size:15px">${ICON.map} Directions</button>
        <button class="btn secondary" style="height:44px;font-size:15px">${ICON.calendar} Add to Calendar</button>
      </div>
      <div style="height:16px"></div>
      <div class="note" style="justify-content:center;text-align:center">A confirmation email is on its way to ahmed@studio.eg</div>
    </div>
    ${HOME_INDICATOR}
  </div>`;
}

function bookingsScreen() {
    return `<div class="screen grouped" data-screen="bookings">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row"><span class="nav-title">Passes</span><span class="nav-action">${ICON.plus}</span></div>
      <h1 class="large-title">Passes</h1>
    </header>
    <div class="body">
      <div class="segmented">
        <button class="active">Upcoming</button>
        <button>Past</button>
      </div>

      <div class="pass">
        <div class="top">
          <div>
            <div class="t">Meeting Room · Kafr Abdo</div>
            <div class="s">Thu 24 Sep · 2:00 – 4:00 PM</div>
          </div>
          <span class="status">Confirmed</span>
        </div>
        <div class="qr">
          ${qrSvg()}
          <div class="cap">Show this at reception to check in</div>
        </div>
        <div class="perforation"></div>
        <div class="facts">
          <div class="fact"><div class="k">Booking</div><div class="v">#4182</div></div>
          <div class="fact"><div class="k">Attendees</div><div class="v">6</div></div>
          <div class="fact"><div class="k">Total</div><div class="v">EGP 500</div></div>
        </div>
      </div>

      <div class="group-header">Later this month</div>
      <div class="list">
        <div class="booking-row">
          <div class="date-chip"><div class="m">Sep</div><div class="d">28</div></div>
          <div style="flex:1">
            <div style="font-size:16px;font-weight:600;letter-spacing:-0.4px">Day Pass · Roushdy</div>
            <div style="font-size:13px;color:var(--label-secondary);margin-top:2px">Full day access · EGP 200</div>
          </div>
          <span class="chevron">${ICON.chevron}</span>
        </div>
        <div class="booking-row">
          <div class="date-chip"><div class="m">Oct</div><div class="d">02</div></div>
          <div style="flex:1">
            <div style="font-size:16px;font-weight:600;letter-spacing:-0.4px">Meeting Room · Kafr Abdo</div>
            <div style="font-size:13px;color:var(--label-secondary);margin-top:2px">5-hour block · EGP 1,000</div>
          </div>
          <span class="chevron">${ICON.chevron}</span>
        </div>
      </div>
    </div>
    ${tabBar('bookings')}
    ${HOME_INDICATOR}
  </div>`;
}

function profileScreen() {
    return `<div class="screen grouped" data-screen="profile">
    ${statusBar()}
    <header class="navbar">
      <div class="nav-row"><span class="nav-title">Account</span><span class="nav-action">Edit</span></div>
    </header>
    <div class="body">
      <div class="member-card">
        <div class="brand">
          <span class="wordmark">
            <img src="${A}logocircletransparentwhite.png" alt="">
            The Circle
          </span>
          <span class="tier">Dedicated desk</span>
        </div>
        <div class="name">Ahmed Darabi</div>
        <div class="sub">Member since March 2026 · Kafr Abdo</div>
        <div class="stats">
          <div><div class="k">Visits</div><div class="v">38</div></div>
          <div><div class="k">Hours booked</div><div class="v">64</div></div>
          <div><div class="k">Credits</div><div class="v">4 hrs</div></div>
        </div>
      </div>

      <div class="group-header">Workspace</div>
      <div class="list">
        <div class="row inset-icon"><span class="row-icon">${ICON.building}</span><span class="row-label">Locations</span><span class="row-value">2</span><span class="chevron">${ICON.chevron}</span></div>
        <div class="row inset-icon"><span class="row-icon">${ICON.life}</span><span class="row-label">Support request</span><span class="chevron">${ICON.chevron}</span></div>
        <div class="row inset-icon"><span class="row-icon">${ICON.handshake}</span><span class="row-label">Partner with us</span><span class="chevron">${ICON.chevron}</span></div>
        <div class="row inset-icon"><span class="row-icon">${ICON.book}</span><span class="row-label">Insights</span><span class="chevron">${ICON.chevron}</span></div>
      </div>

      <div class="group-header">Preferences</div>
      <div class="list">
        <div class="row inset-icon"><span class="row-icon">${ICON.globe}</span><span class="row-label">Language</span><span class="row-value">English</span><span class="chevron">${ICON.chevron}</span></div>
        <div class="row inset-icon"><span class="row-icon">${ICON.bell}</span><span class="row-label">Notifications</span><span class="chevron">${ICON.chevron}</span></div>
        <div class="row inset-icon"><span class="row-icon">${ICON.wallet}</span><span class="row-label">Payment methods</span><span class="chevron">${ICON.chevron}</span></div>
      </div>

      <div class="group-header">&nbsp;</div>
      <div class="list">
        <div class="row"><span class="row-label" style="color:#ff3b30">Sign out</span></div>
      </div>
      <div style="text-align:center;font-size:13px;color:var(--label-secondary);padding:22px 16px 0">
        The Circle · Alexandria, Egypt<br>Version 1.0 (preview)
      </div>
    </div>
    ${tabBar('profile')}
    ${HOME_INDICATOR}
  </div>`;
}

/* ── Registry ─────────────────────────────────────────────────────────── */

const SCREENS = {
    home: {
        name: 'Home',
        desc: 'Branch switcher, next booking, quick actions and today’s opening hours.',
        render: () => homeScreen()
    },
    spaces: {
        name: 'Spaces',
        desc: 'All seven space types from the website, filtered by branch.',
        render: spacesScreen
    },
    detail: {
        name: 'Space detail',
        desc: 'Real meeting-room rates: EGP 250/hr, 1,000 for 5 hrs, 1,500 for 8 hrs.',
        render: detailScreen
    },
    book1: {
        name: 'Booking · branch',
        desc: 'Step 1 of the wizard that book-a-space.html runs on the web.',
        render: bookBranchScreen
    },
    book2: {
        name: 'Booking · date & time',
        desc: 'Calendar plus hourly slots, with taken slots struck through.',
        render: bookTimeScreen
    },
    book3: {
        name: 'Booking · details',
        desc: 'Grouped form that posts to the existing POST /api/bookings.',
        render: bookDetailsScreen
    },
    confirm: {
        name: 'Confirmation',
        desc: 'Mirrors the confirmation email, plus an Apple Wallet pass.',
        render: confirmScreen
    },
    bookings: {
        name: 'Passes',
        desc: 'Upcoming bookings with a QR code for reception check-in.',
        render: bookingsScreen
    },
    profile: {
        name: 'Account',
        desc: 'Membership card and the site’s secondary pages as native rows.',
        render: profileScreen
    },
    homeAr: {
        name: 'Home — العربية',
        desc: 'Full RTL mirror, matching the 47 Arabic pages already in /ar.',
        render: () => homeScreen({ ar: true })
    },
    homeDark: {
        name: 'Home — dark mode',
        desc: 'The same screen in iOS dark appearance.',
        render: () => homeScreen({ dark: true })
    }
};
