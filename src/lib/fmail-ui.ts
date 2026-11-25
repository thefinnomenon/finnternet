import {
  FMAIL_CHANGE_EVENT,
  FMAIL_STORAGE_KEY,
  fmailSubject,
  getFmailStore,
  type FmailMessage,
} from './fmail';

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
let lastMessageId = store.snapshot().messages[0]?.id ?? '';
let toastMessageId: string | undefined;

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
  toast.hidden = true;
  store.markRead(message.id);
  if (popup.matches(':popover-open')) popup.hidePopover();
  required('#fmail-subject', HTMLHeadingElement).textContent = fmailSubject(
    message.kind,
  );
  const date = required('#fmail-date', HTMLTimeElement);
  date.dateTime = new Date(message.receivedAt).toISOString();
  date.textContent = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(message.receivedAt);
  const paragraphs =
    message.kind === 'ready'
      ? ['Your InstaMosaic for @neymarjr is ready.']
      : [
          'We’re downloading your Instagram photos now.',
          'This usually takes 5–15 minutes.',
          'Please keep your Instagram public until processing finishes.',
        ];
  required('#fmail-content', HTMLDivElement).replaceChildren(
    ...paragraphs.map((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      return p;
    }),
  );
  if (!modal.open) modal.showModal();
}

function messageRow(message: FmailMessage): HTMLLIElement {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fmail-message';
  button.dataset.messageId = message.id;
  const top = document.createElement('span');
  top.className = 'fmail-message-top';
  const from = document.createElement('span');
  from.textContent = 'InstaMosaic';
  const date = document.createElement('time');
  date.dateTime = new Date(message.receivedAt).toISOString();
  date.textContent = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(message.receivedAt);
  top.append(from, date);
  const subject = document.createElement('span');
  subject.className = 'fmail-message-subject';
  subject.textContent = fmailSubject(message.kind);
  const snippet = document.createElement('span');
  snippet.className = 'fmail-message-snippet';
  snippet.textContent =
    message.kind === 'ready'
      ? 'Your mosaic for @neymarjr is ready to view.'
      : 'We’re downloading your Instagram photos now.';
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
    required('#fmail-announcement', HTMLSpanElement).textContent =
      `Fmail: ${fmailSubject(latest.kind)}.`;
    required('#fmail-toast-subject', HTMLElement).textContent = fmailSubject(
      latest.kind,
    );
    required('#fmail-toast-snippet', HTMLSpanElement).textContent =
      latest.kind === 'ready'
        ? 'Your mosaic for @neymarjr is ready to view.'
        : 'We’re downloading your Instagram photos now.';
    toastMessageId = latest.id;
    toast.hidden = false;
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
  () => {
    toast.hidden = true;
  },
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
