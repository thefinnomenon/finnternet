import {
  FMAIL_CHANGE_EVENT,
  FMAIL_STORAGE_KEY,
  fmailSubject,
  getFmailStore,
  type FmailMessage,
} from './fmail';
import { demoProjects } from './demo-projects';

function messageCopy(message: FmailMessage) {
  if (message.project === 'guestography') {
    return {
      sender: 'Guestography',
      subject: fmailSubject(message.kind, message.project),
      paragraphs: [
        `Your ${demoProjects.guestography.eventTitle} gallery is now live and ready for guests! Share the QR code with your guests so they can view and upload photos from your event.`,
        '5 Printable QR Card Templates Attached!',
      ],
      snippet: 'Your event gallery and printable QR code cards are ready.',
    };
  }
  const { title, username } = demoProjects[message.project];
  const ready = message.kind === 'ready';
  const faceReel = message.project === 'facereel';
  return {
    sender: title,
    subject: fmailSubject(message.kind, message.project),
    paragraphs: faceReel
      ? ready
        ? [`FaceReel for @${username}.`]
        : [
            `FaceReel for @${username}.`,
            "You don't need to stay on the status page. We'll email you when your FaceReel is ready, or if we need you to try again.",
          ]
      : ready
        ? ['Your InstaMosaic for @neymarjr is ready.']
        : [
            'We’re downloading your Instagram photos now.',
            'This usually takes 5–15 minutes.',
            'Please keep your Instagram public until processing finishes.',
          ],
    snippet: ready
      ? faceReel
        ? `Your FaceReel for @${username} is ready to view.`
        : 'Your mosaic for @neymarjr is ready to view.'
      : faceReel
        ? 'We’re creating your FaceReel from Instagram photos.'
        : 'We’re downloading your Instagram photos now.',
  };
}

function required<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const element = document.querySelector(selector);
  if (!(element instanceof constructor))
    throw new Error(`Fmail element missing: ${selector}`);
  return element;
}
const root = required('#fmail', HTMLDivElement);
const trigger = required('#fmail-trigger', HTMLButtonElement);
const popup = required('#fmail-popover', HTMLDivElement);
const badge = required('#fmail-badge', HTMLSpanElement);
const list = required('#fmail-list', HTMLUListElement);
const modal = required('#fmail-modal', HTMLDialogElement);
const toast = required('#fmail-toast', HTMLElement);
const store = getFmailStore();
const locale = root.lang || 'en';
let timer: number | undefined;
let toastTimer: number | undefined;
let toastAnimation: Animation | undefined;
const TOAST_DURATION_MS = 5000;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let lastMessageId = store.snapshot().messages[0]?.id ?? '';
let toastMessageId: string | undefined;

function pauseToastDismissal(): void {
  window.clearTimeout(toastTimer);
  toastTimer = undefined;
}

function hideToast(): void {
  pauseToastDismissal();
  toastAnimation?.cancel();
  toastAnimation = undefined;
  toast.hidden = true;
}

function dismissToast(): void {
  pauseToastDismissal();
  if (toast.hidden) return;
  toastAnimation?.cancel();
  if (reducedMotion.matches) {
    hideToast();
    return;
  }
  const animation = toast.animate(
    [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(12px)' },
    ],
    { duration: 160, easing: 'ease-in' },
  );
  toastAnimation = animation;
  animation.addEventListener(
    'finish',
    () => {
      if (toastAnimation === animation) hideToast();
    },
    { once: true },
  );
}

function showToast(): void {
  toastAnimation?.cancel();
  toastAnimation = undefined;
  toast.hidden = false;
  if (!reducedMotion.matches) {
    toastAnimation = toast.animate(
      [
        { opacity: 0, transform: 'translateX(16px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: 200, easing: 'ease-out' },
    );
  }
  scheduleToastDismissal();
}

function scheduleToastDismissal(): void {
  pauseToastDismissal();
  if (
    toast.hidden ||
    toast.matches(':hover') ||
    toast.contains(document.activeElement)
  )
    return;
  toastTimer = window.setTimeout(dismissToast, TOAST_DURATION_MS);
}

toast.addEventListener('mouseenter', pauseToastDismissal);
toast.addEventListener('mouseleave', scheduleToastDismissal);
toast.addEventListener('focusin', pauseToastDismissal);
toast.addEventListener('focusout', () =>
  queueMicrotask(scheduleToastDismissal),
);

function positionPopup(): void {
  const bounds = trigger.getBoundingClientRect();
  const width = Math.min(370, window.innerWidth - 24);
  const left = Math.min(
    window.innerWidth - width - 12,
    Math.max(12, bounds.right - width),
  );
  const top = Math.min(bounds.bottom + 12, window.innerHeight - 140);
  popup.style.left = `${left}px`;
  popup.style.top = `${Math.max(12, top)}px`;
  popup.style.maxHeight = `${Math.max(100, window.innerHeight - top - 12)}px`;
}
trigger.addEventListener('click', positionPopup);
popup.addEventListener('toggle', () => {
  const open = popup.matches(':popover-open');
  trigger.setAttribute('aria-expanded', String(open));
  if (open) positionPopup();
});
window.addEventListener('resize', () => {
  if (popup.matches(':popover-open')) positionPopup();
});
window.addEventListener(
  'scroll',
  () => {
    if (popup.matches(':popover-open')) positionPopup();
  },
  { passive: true },
);

function openMessage(message: FmailMessage): void {
  const copy = messageCopy(message);
  hideToast();
  store.markRead(message.id);
  if (popup.matches(':popover-open')) popup.hidePopover();
  required('#fmail-subject', HTMLHeadingElement).textContent = copy.subject;
  required('#fmail-from', HTMLSpanElement).textContent = copy.sender;
  const date = required('#fmail-date', HTMLTimeElement);
  date.dateTime = new Date(message.receivedAt).toISOString();
  date.textContent = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(message.receivedAt);
  required('#fmail-content', HTMLDivElement).replaceChildren(
    ...copy.paragraphs.map((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      return p;
    }),
  );
  if (message.project === 'guestography') {
    const cards = document.createElement('div');
    cards.className = 'fmail-qr-cards';
    for (const style of [
      'classic',
      'celebration',
      'modern',
      'elegant',
      'minimal',
    ]) {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = `/demos/guestography/qr-${style}.png`;
      image.alt = `${style} QR card for ${demoProjects.guestography.eventTitle}`;
      image.width = 1200;
      image.height = 1800;
      image.loading = 'lazy';
      const caption = document.createElement('figcaption');
      caption.textContent = `${style[0]?.toUpperCase()}${style.slice(1)}`;
      figure.append(image, caption);
      cards.append(figure);
    }
    required('#fmail-content', HTMLDivElement).append(cards);
  }
  if (!modal.open) modal.showModal();
}

function messageRow(message: FmailMessage): HTMLLIElement {
  const copy = messageCopy(message);
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fmail-message';
  button.dataset.messageId = message.id;
  const top = document.createElement('span');
  top.className = 'fmail-message-top';
  const from = document.createElement('span');
  from.textContent = copy.sender;
  const date = document.createElement('time');
  date.dateTime = new Date(message.receivedAt).toISOString();
  date.textContent = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(message.receivedAt);
  top.append(from, date);
  const subject = document.createElement('span');
  subject.className = 'fmail-message-subject';
  subject.textContent = copy.subject;
  const snippet = document.createElement('span');
  snippet.className = 'fmail-message-snippet';
  snippet.textContent = copy.snippet;
  button.append(top, subject, snippet);
  if (!message.read) {
    const unread = document.createElement('span');
    unread.className = 'fmail-unread';
    unread.textContent = 'Unread';
    button.append(unread);
  }
  button.addEventListener('click', () => openMessage(message));
  item.append(button);
  return item;
}

function render(): void {
  const box = store.snapshot();
  const unreadMessages = box.messages.filter((message) => !message.read);
  const unread = unreadMessages.length;
  badge.textContent = String(unread);
  badge.hidden = unread === 0;
  trigger.setAttribute(
    'aria-label',
    `Fmail — Finnternet Mail${unread ? `. Unread: ${unread}` : ''}`,
  );
  required('#fmail-empty', HTMLDivElement).hidden = unread > 0;
  const focusedId =
    document.activeElement instanceof HTMLButtonElement
      ? document.activeElement.dataset.messageId
      : undefined;
  list.replaceChildren(...unreadMessages.map(messageRow));
  if (focusedId)
    list
      .querySelectorAll<HTMLButtonElement>('[data-message-id]')
      .forEach((button) => {
        if (button.dataset.messageId === focusedId) button.focus();
      });
  const latest = box.messages[0];
  if (latest && latest.id !== lastMessageId) {
    const copy = messageCopy(latest);
    required('#fmail-announcement', HTMLSpanElement).textContent =
      `Fmail: ${copy.subject}.`;
    required('#fmail-toast-sender', HTMLSpanElement).textContent =
      `Fmail · ${copy.sender}`;
    required('#fmail-toast-subject', HTMLElement).textContent = copy.subject;
    required('#fmail-toast-snippet', HTMLSpanElement).textContent =
      copy.snippet;
    toastMessageId = latest.id;
    showToast();
  }
  lastMessageId = latest?.id ?? '';
  window.clearTimeout(timer);
  const next = Math.min(...box.pending.map((item) => item.readyAt));
  if (Number.isFinite(next))
    timer = window.setTimeout(
      () => {
        store.deliverDue();
        render();
      },
      Math.min(2147000000, Math.max(10, next - Date.now())),
    );
}

required('#fmail-close', HTMLButtonElement).addEventListener('click', () =>
  modal.close(),
);
required('#fmail-toast-dismiss', HTMLButtonElement).addEventListener(
  'click',
  dismissToast,
);
required('#fmail-toast-open', HTMLButtonElement).addEventListener(
  'click',
  () => {
    const message = store
      .snapshot()
      .messages.find((item) => item.id === toastMessageId);
    if (message) openMessage(message);
  },
);
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});
modal.addEventListener('close', () => trigger.focus());
window.addEventListener(FMAIL_CHANGE_EVENT, render);
window.addEventListener('storage', (event) => {
  if (event.key === FMAIL_STORAGE_KEY || event.key === null) {
    store.deliverDue();
    render();
  }
});
window.addEventListener('fmail:open', () => {
  const latest = store.snapshot().messages[0];
  if (latest) openMessage(latest);
  else {
    positionPopup();
    popup.showPopover();
  }
});
store.deliverDue();
render();
