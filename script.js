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
