import {
  demoProjects,
  isDemoProject,
  type DemoProject,
} from './demo-projects.ts';

export const FMAIL_STORAGE_KEY = 'finnternet-fmail-v1';
export const FMAIL_CHANGE_EVENT = 'fmail:changed';
export type EmailKind = 'processing' | 'ready';
export interface FmailMessage {
  id: string;
  runId: string;
  kind: EmailKind;
  project: DemoProject;
  receivedAt: number;
  read: boolean;
}
interface PendingEmail {
  runId: string;
  readyAt: number;
  project: DemoProject;
}
type LegacyMessage = Omit<FmailMessage, 'project'> & { project?: DemoProject };
type LegacyPending = Omit<PendingEmail, 'project'> & { project?: DemoProject };
interface Mailbox {
  version: 1;
  messages: FmailMessage[];
  pending: PendingEmail[];
}
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export interface FmailStore {
  snapshot(): Mailbox;
  start(runId: string, project?: DemoProject): void;
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

function isMessage(value: unknown): value is LegacyMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'runId' in value &&
    validRunId(value.runId) &&
    'kind' in value &&
    (value.kind === 'processing' || value.kind === 'ready') &&
    (!('project' in value) || isDemoProject(value.project)) &&
    'id' in value &&
    value.id === `${value.runId}:${value.kind}` &&
    'receivedAt' in value &&
    validTime(value.receivedAt) &&
    'read' in value &&
    typeof value.read === 'boolean'
  );
}
function isPending(value: unknown): value is LegacyPending {
  return (
    typeof value === 'object' &&
    value !== null &&
    'runId' in value &&
    validRunId(value.runId) &&
    (!('project' in value) || isDemoProject(value.project)) &&
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
      .map(({ id, runId, kind, receivedAt, read, project }) => ({
        id,
        runId,
        kind,
        receivedAt,
        read,
        project: project ?? 'instamosaic',
      }))
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
        .map(({ runId, readyAt, project }) => ({
          runId,
          readyAt,
          project: project ?? 'instamosaic',
        }))
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
    project: DemoProject,
  ) => {
    const id = `${runId}:${kind}`;
    if (box.messages.some((message) => message.id === id)) return;
    box.messages = box.messages.filter((message) => message.kind !== kind);
    box.messages.push({ id, runId, kind, project, receivedAt, read: false });
  };
  return {
    snapshot,
    start(runId, project = 'instamosaic') {
      if (!validRunId(runId) || !isDemoProject(project)) return;
      const box = snapshot();
      if (
        box.messages.some((message) => message.runId === runId) ||
        box.pending.some((item) => item.runId === runId)
      )
        return;
      // Guestography originally sends its gallery-ready email after creation.
      if (project !== 'guestography')
        add(box, runId, 'processing', now(), project);
      const generationMs =
        project === 'guestography'
          ? demoProjects.guestography.generationMs
          : GENERATION_MS;
      box.pending.push({ runId, readyAt: now() + generationMs, project });
      box.pending = box.pending.slice(-1);
      save(box);
    },
    complete(runId) {
      if (!validRunId(runId)) return;
      const box = snapshot();
      const run =
        box.pending.find((item) => item.runId === runId) ??
        box.messages.find((message) => message.runId === runId);
      if (!run) return;
      if (box.messages.some((message) => message.id === `${runId}:ready`))
        return;
      box.pending = box.pending.filter((item) => item.runId !== runId);
      add(box, runId, 'ready', now(), run.project);
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
      due.forEach((item) =>
        add(box, item.runId, 'ready', item.readyAt, item.project),
      );
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

export function fmailSubject(
  kind: EmailKind,
  project: DemoProject = 'instamosaic',
): string {
  if (project === 'guestography') {
    return kind === 'ready'
      ? `${demoProjects.guestography.eventTitle} - Your Event Gallery is Ready! 📸`
      : 'We’re creating your event gallery';
  }
  const title = demoProjects[project].title;
  return kind === 'ready'
    ? `Your ${title} is ready`
    : `We’re creating your ${title}`;
}
