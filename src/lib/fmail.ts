export const FMAIL_STORAGE_KEY = 'finnternet-fmail-v1';
export const FMAIL_CHANGE_EVENT = 'fmail:changed';
export type EmailKind = 'processing' | 'ready';
export interface FmailMessage {
  id: string;
  runId: string;
  kind: EmailKind;
  receivedAt: number;
  read: boolean;
}
interface PendingEmail {
  runId: string;
  readyAt: number;
}
interface Mailbox {
  version: 1;
  messages: FmailMessage[];
  pending: PendingEmail[];
}
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export interface FmailStore {
  snapshot(): Mailbox;
  start(runId: string): void;
  complete(runId: string): void;
  cancel(runId: string): void;
  markRead(id: string): void;
  deliverDue(): void;
}

const MAX_MESSAGES = 2;
const GENERATION_MS = 8000;
const emptyMailbox = (): Mailbox => ({ version: 1, messages: [], pending: [] });
const validRunId = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(value);
const validTime = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value > 0 &&
  value < 8640000000000000;

function isMessage(value: unknown): value is FmailMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'runId' in value &&
    validRunId(value.runId) &&
    'kind' in value &&
    (value.kind === 'processing' || value.kind === 'ready') &&
    'id' in value &&
    value.id === `${value.runId}:${value.kind}` &&
    'receivedAt' in value &&
    validTime(value.receivedAt) &&
    'read' in value &&
    typeof value.read === 'boolean'
  );
}
function isPending(value: unknown): value is PendingEmail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'runId' in value &&
    validRunId(value.runId) &&
    'readyAt' in value &&
    validTime(value.readyAt)
  );
}
function parseMailbox(raw: string | null): Mailbox | null {
  if (!raw || raw.length > 50000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !data ||
      typeof data !== 'object' ||
      !('version' in data) ||
      data.version !== 1 ||
      !('messages' in data) ||
      !Array.isArray(data.messages) ||
      !('pending' in data) ||
      !Array.isArray(data.pending)
    )
      return null;
    const messages = data.messages
      .filter(isMessage)
      .sort((a, b) => b.receivedAt - a.receivedAt);
    return {
      version: 1,
      messages: messages
        .filter(
          (item, index) =>
            messages.findIndex((other) => other.kind === item.kind) === index,
        )
        .slice(0, MAX_MESSAGES),
      pending: data.pending
        .filter(isPending)
        .sort((a, b) => b.readyAt - a.readyAt)
        .slice(0, 1),
    };
  } catch {
    return null;
  }
}

/** Browser-local sample mail. No addresses, message bodies, or remote data are accepted. */
export function createFmailStore(
  storage: StoragePort | null,
  onChange: () => void,
  now: () => number = Date.now,
): FmailStore {
  let memory = emptyMailbox();
  const snapshot = (): Mailbox => {
    try {
      memory =
        parseMailbox(storage?.getItem(FMAIL_STORAGE_KEY) ?? null) ?? memory;
    } catch {
      /* Keep the current page's inbox if storage is unavailable. */
    }
    return structuredClone(memory);
  };
  const save = (box: Mailbox) => {
    box.messages.sort((a, b) => b.receivedAt - a.receivedAt);
    box.messages = box.messages.slice(0, MAX_MESSAGES);
    memory = box;
    try {
      storage?.setItem(FMAIL_STORAGE_KEY, JSON.stringify(box));
    } catch {
      /* The in-memory inbox remains usable. */
    }
    onChange();
  };
  const add = (
    box: Mailbox,
    runId: string,
    kind: EmailKind,
    receivedAt: number,
  ) => {
    const id = `${runId}:${kind}`;
    if (box.messages.some((message) => message.id === id)) return;
    box.messages = box.messages.filter((message) => message.kind !== kind);
    box.messages.push({ id, runId, kind, receivedAt, read: false });
  };
  return {
    snapshot,
    start(runId) {
      if (!validRunId(runId)) return;
      const box = snapshot();
      if (
        box.messages.some((message) => message.runId === runId) ||
        box.pending.some((item) => item.runId === runId)
      )
        return;
      add(box, runId, 'processing', now());
      box.pending.push({ runId, readyAt: now() + GENERATION_MS });
      box.pending = box.pending.slice(-1);
      save(box);
    },
    complete(runId) {
      if (!validRunId(runId)) return;
      const box = snapshot();
      if (
        !box.messages.some((message) => message.runId === runId) &&
        !box.pending.some((item) => item.runId === runId)
      )
        return;
      if (box.messages.some((message) => message.id === `${runId}:ready`))
        return;
      box.pending = box.pending.filter((item) => item.runId !== runId);
      add(box, runId, 'ready', now());
      save(box);
    },
    cancel(runId) {
      const box = snapshot();
      if (!box.pending.some((item) => item.runId === runId)) return;
      box.pending = box.pending.filter((item) => item.runId !== runId);
      save(box);
    },
    markRead(id) {
      const box = snapshot();
      const message = box.messages.find((item) => item.id === id);
      if (!message || message.read) return;
      message.read = true;
      save(box);
    },
    deliverDue() {
      const box = snapshot();
      const due = box.pending.filter((item) => item.readyAt <= now());
      if (!due.length) return;
      due.forEach((item) => add(box, item.runId, 'ready', item.readyAt));
      box.pending = box.pending.filter((item) => item.readyAt > now());
      save(box);
    },
  };
}

let browserStore: FmailStore | undefined;
export function getFmailStore(): FmailStore {
  if (!browserStore) {
    let storage: StoragePort | null = null;
    try {
      storage = window.localStorage;
    } catch {
      /* Use browser memory when storage is blocked. */
    }
    browserStore = createFmailStore(storage, () =>
      window.dispatchEvent(new Event(FMAIL_CHANGE_EVENT)),
    );
  }
  return browserStore;
}

export function fmailSubject(kind: EmailKind): string {
  return kind === 'ready'
    ? 'Your InstaMosaic is ready'
    : 'We’re creating your InstaMosaic';
}
