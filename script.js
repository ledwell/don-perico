// Mobile nav toggle
document.documentElement.classList.add('js');

const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after following a link (same-page anchors don't reload)
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  window.matchMedia('(min-width: 900px)').addEventListener('change', () => setOpen(false));
}

// Menu page: highlight the chip for the category in view
const chips = document.querySelectorAll('.menu-chips a');

if (chips.length && 'IntersectionObserver' in window) {
  const chipFor = new Map([...chips].map((a) => [a.getAttribute('href').slice(1), a]));
  const chipBar = document.querySelector('.menu-chips ul');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const chip = chipFor.get(entry.target.id);
        if (!chip) return;
        chips.forEach((a) => a.removeAttribute('aria-current'));
        chip.setAttribute('aria-current', 'true');
        // Keep the active chip visible in the horizontal scroller
        chipBar.scrollTo({
          left: chip.offsetLeft - chipBar.clientWidth / 2 + chip.clientWidth / 2,
          behavior: 'smooth',
        });
      });
    },
    { rootMargin: '-30% 0px -65% 0px' }
  );

  document.querySelectorAll('.menu-category').forEach((section) => observer.observe(section));
}

// Home page: "Open now" status and today's special, based on Bakersfield time
// Opening hour by day (0 = Sunday); 10am unless listed. Closes at 9pm every day.
const OPEN_HOURS = { 0: 8 };
const DEFAULT_OPEN_HOUR = 10;
const CLOSE_HOUR = 21;

const openHour = (day) => OPEN_HOURS[day] ?? DEFAULT_OPEN_HOUR;
const formatHour = (h) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;

const status = document.querySelector('[data-open-status]');
const todayLink = document.querySelector('[data-today-link]');

if (status || todayLink) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const hour = Number(parts.hour);

  if (status) {
    const state = hour < openHour(day) ? 'before' : hour < CLOSE_HOUR ? 'open' : 'after';
    const nextOpen = openHour(state === 'after' ? (day + 1) % 7 : day);
    status.textContent = status.dataset[state].replace('{open}', formatHour(nextOpen));
    status.classList.add(`is-${state}`);
    status.hidden = false;
  }

  // Specials are marked up with data-day (0 = Sunday); data-until hides one after that hour
  const special = document.querySelector(`[data-day="${day}"]`);
  const stillOn = special && !(special.dataset.until && hour >= Number(special.dataset.until));
  if (todayLink && stillOn) {
    const label = todayLink.querySelector('.hero-today-label').textContent;
    const text =
      special.dataset.today ||
      [...special.querySelectorAll('.special-day, .special-deal')].map((el) => el.textContent).join(': ');
    todayLink.querySelector('[data-today-text]').textContent = text;
    todayLink.href = special.getAttribute('href') || `#${special.id}`;
    todayLink.hidden = false;

    special.classList.add('is-today');
    special.dataset.todayLabel = label;
  }
}
