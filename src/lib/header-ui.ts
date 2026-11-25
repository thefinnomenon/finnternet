export {};

type Theme = 'light' | 'dark' | 'system';

const dropdowns = Array.from(
  document.querySelectorAll<HTMLElement>('[data-header-dropdown]'),
).map((root) => {
  const trigger = root.querySelector('[data-header-dropdown-trigger]');
  const panel = root.querySelector('[popover]');
  if (
    !(trigger instanceof HTMLButtonElement) ||
    !(panel instanceof HTMLElement)
  )
    throw new Error('Header dropdown is missing its trigger or panel.');

  const options = () =>
    Array.from(
      panel.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>(
        'a[href], button:not(:disabled)',
      ),
    );
  const position = () => {
    const bounds = trigger.getBoundingClientRect();
    const width = Math.min(200, window.innerWidth - 24);
    const left =
      root.dataset.align === 'start' ? bounds.left : bounds.right - width;
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, left))}px`;
    const top = Math.max(
      12,
      Math.min(bounds.bottom + 8, window.innerHeight - panel.offsetHeight - 12),
    );
    panel.style.top = `${top}px`;
    panel.style.maxHeight = `${Math.max(100, window.innerHeight - top - 12)}px`;
  };
  trigger.addEventListener('click', position);
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    panel.showPopover();
    position();
    const items = options();
    items[event.key === 'ArrowDown' ? 0 : items.length - 1]?.focus();
  });
  panel.addEventListener('toggle', () => {
    const open = panel.matches(':popover-open');
    trigger.setAttribute('aria-expanded', String(open));
    if (open) position();
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      panel.hidePopover();
      trigger.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = options();
    if (!items.length) return;
    event.preventDefault();
    const current = items.findIndex((item) => item === document.activeElement);
    const index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
            items.length;
    items[index]?.focus();
  });
  panel.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const option = event.target.closest('a[href], button');
    if (!option || !panel.contains(option)) return;
    panel.hidePopover();
    if (option instanceof HTMLButtonElement) trigger.focus();
  });
  return { panel, position };
});

const positionOpenDropdowns = () => {
  dropdowns.forEach(({ panel, position }) => {
    if (panel.matches(':popover-open')) position();
  });
};
window.addEventListener('resize', positionOpenDropdowns);
window.addEventListener('scroll', positionOpenDropdowns, { passive: true });

const themeButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-theme-choice]',
);
const themeTrigger = document.querySelector(
  '.theme-dropdown [data-header-dropdown-trigger]',
);
const updateTheme = (mode: Theme) => {
  document.documentElement.dataset.theme = mode;
  themeButtons.forEach((button) => {
    const selected = button.dataset.themeChoice === mode;
    button.setAttribute('aria-pressed', String(selected));
    if (selected && themeTrigger instanceof HTMLButtonElement) {
      const label = `${themeTrigger.dataset.label}: ${button.textContent?.trim()}`;
      themeTrigger.setAttribute('aria-label', label);
      themeTrigger.title = label;
    }
  });
};
const initialTheme = document.documentElement.dataset.theme;
updateTheme(
  initialTheme === 'light' || initialTheme === 'dark' ? initialTheme : 'system',
);
themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.themeChoice;
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') return;
    updateTheme(mode);
    try {
      if (mode === 'system') localStorage.removeItem('finnternet-theme');
      else localStorage.setItem('finnternet-theme', mode);
    } catch {
      /* The current page can change theme without persistence. */
    }
  });
});
