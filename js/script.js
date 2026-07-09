// Header scroll effect
document.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.nav');
  if (!header || !toggle || !nav) return;

  let scrollPosition = 0;

  const lockScroll = () => {
    scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const unlockScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
  };

  const closeMenu = () => {
    const wasOpen = header.classList.contains('is-mobile-nav-open');
    header.classList.remove('is-mobile-nav-open');
    document.body.classList.remove('is-mobile-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    if (wasOpen) {
      unlockScroll();
    }
  };

  const openMenu = () => {
    lockScroll();
    header.classList.add('is-mobile-nav-open');
    document.body.classList.add('is-mobile-nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
  };

  toggle.addEventListener('click', () => {
    if (header.classList.contains('is-mobile-nav-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!header.classList.contains('is-mobile-nav-open')) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('collectionSearch');
  const results = document.getElementById('collectionResults');
  const buttons = document.querySelectorAll('[data-filter]');
  if (!searchInput || !results) return;

  let items = [];
  let currentFilter = 'all';

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = items.filter(item => {
      const matchesFilter = currentFilter === 'all' || item.type === currentFilter;
      const haystack = `${item.type} ${item.title} ${item.subtitle} ${(item.tags || []).join(' ')}`.toLowerCase();
      return matchesFilter && haystack.includes(q);
    });

    results.innerHTML = filtered.map(item => `
      <article class="result-card">
        <small>${item.type}</small>
        <h3>${item.title}</h3>
        <p>${item.subtitle || ''}</p>
        <div class="result-tags">${(item.tags || []).map(tag => `<span>${tag}</span>`).join('')}</div>
      </article>
    `).join('') || '<p>검색 결과가 없습니다.</p>';
  }

  fetch('../data/collection.json')
    .then(res => res.json())
    .then(data => { items = data; render(); })
    .catch(() => { results.innerHTML = '<p>컬렉션 데이터를 불러오지 못했습니다.</p>'; });

  searchInput.addEventListener('input', render);
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.getElementById('businessCalendar');
  const noticeList = document.getElementById('calendarNotices');
  if (!calendar) return;

  const calendarMonths = [
    { year: 2026, month: 6 },
    { year: 2026, month: 7 }
  ];
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const publicHolidays = {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-03-01': '삼일절',
    '2026-03-02': '대체공휴일',
    '2026-05-05': '어린이날',
    '2026-05-24': '부처님오신날',
    '2026-05-25': '대체공휴일',
    '2026-06-03': '전국동시지방선거',
    '2026-06-06': '현충일',
    '2026-07-17': '제헌절',
    '2026-08-15': '광복절',
    '2026-08-17': '대체공휴일',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    '2026-10-03': '개천절',
    '2026-10-05': '대체공휴일',
    '2026-10-09': '한글날',
    '2026-12-25': '성탄절'
  };
  const calendarNotices = [
    {
      date: '2026-07-15',
      dayText: '7월 15일',
      title: '대관',
      displayTime: '오후 2시 30분 ~ 오후 4시',
      calendarTime: '',
      showInCalendar: true
    },
    {
      date: '2026-07-17',
      dayText: '7월 17일',
      title: '제헌절 정상영업',
      displayTime: '오전 11시 ~ 오후 8시',
      calendarTime: '11:00~20:00',
      showInCalendar: false
    }
  ];
  const specialOpenDays = {
    '2026-07-17': '정상영업',
    '2026-08-17': '정상 영업'
  };

  const formatDateKey = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mm}-${dd}`;
  };

  const noticesByDate = calendarNotices.reduce((acc, notice) => {
    if (!acc[notice.date]) {
      acc[notice.date] = [];
    }

    acc[notice.date].push(notice);
    return acc;
  }, {});

  if (noticeList) {
    noticeList.innerHTML = calendarNotices.map((notice) => `
      <article class="calendar-notice-item">
        <span class="calendar-notice-bullet" aria-hidden="true">•</span>
        <div>
          <p class="calendar-notice-date">${notice.dayText}</p>
          <p class="calendar-notice-title">${notice.title}</p>
          <p class="calendar-notice-time">${notice.displayTime}</p>
        </div>
      </article>
    `).join('');
  }

  const renderMonth = ({ year, month }) => {
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const cells = [];

    weekdays.forEach((weekday) => {
      cells.push(`<div class="calendar-weekday">${weekday}</div>`);
    });

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      cells.push('<div class="calendar-day is-empty" aria-hidden="true"></div>');
    }

    for (let dateNumber = 1; dateNumber <= lastDate; dateNumber += 1) {
      const date = new Date(year, month, dateNumber);
      const dateKey = formatDateKey(date);
      const holiday = publicHolidays[dateKey];
      const isMonday = date.getDay() === 1;
      const isSunday = date.getDay() === 0;
      const specialOpen = specialOpenDays[dateKey];
      const status = specialOpen || (isMonday ? (holiday ? '정상영업' : '정기 휴무') : '');
      const dayNotices = (noticesByDate[dateKey] || []).filter((notice) => notice.showInCalendar);
      const classes = [
        'calendar-day',
        isSunday ? 'is-sunday' : '',
        isMonday ? 'is-monday' : '',
        holiday ? 'is-holiday' : ''
      ].filter(Boolean).join(' ');

      cells.push(`
        <div class="${classes}">
          <div class="calendar-date-line">
            <span class="calendar-date">${dateNumber}</span>
            ${holiday ? `<span class="calendar-holiday">${holiday}</span>` : ''}
          </div>
          ${dayNotices.map((notice) => `
            <div class="calendar-event">
              <span>${notice.title}</span>
              ${notice.calendarTime ? `<span>${notice.calendarTime}</span>` : ''}
            </div>
          `).join('')}
          ${status ? `<div class="calendar-status">${status}</div>` : ''}
        </div>
      `);
    }

    return `
      <article class="calendar-month-panel" aria-label="${year}년 ${month + 1}월 영업일정">
        <div class="calendar-heading">
          <h2>${year}년 ${month + 1}월</h2>
          <p>화 - 일 11:00 - 20:00 / 매주 월요일 휴무</p>
        </div>
        <div class="business-calendar">
          ${cells.join('')}
        </div>
      </article>
    `;
  };

  calendar.innerHTML = calendarMonths.map(renderMonth).join('');
});
