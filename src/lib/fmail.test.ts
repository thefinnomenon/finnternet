import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createFmailStore, FMAIL_STORAGE_KEY } from './fmail.ts';

function fixture() {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
  let time = 1000;
  let changes = 0;
  const create = () =>
    createFmailStore(
      storage,
      () => {
        changes += 1;
      },
      () => time,
    );
  return {
    storage,
    create,
    setTime: (value: number) => {
      time = value;
    },
    get changes() {
      return changes;
    },
  };
}

test('delivers once at completion time and deduplicates the demo completion event', () => {
  const clock = fixture();
  const mail = clock.create();
  mail.start('trial-1');
  mail.start('trial-1');
  assert.equal(mail.snapshot().messages.length, 1);
  clock.setTime(8999);
  mail.deliverDue();
  assert.equal(mail.snapshot().messages.length, 1);
  clock.setTime(9000);
  mail.deliverDue();
  mail.complete('trial-1');
  assert.deepEqual(
    mail.snapshot().messages.map((message) => message.kind),
    ['ready', 'processing'],
  );
  assert.equal(clock.changes, 2);
});

test('mail and read status survive navigation; an elapsed job completes on the next page', () => {
  const clock = fixture();
  const firstPage = clock.create();
  firstPage.start('trial-2');
  firstPage.markRead('trial-2:processing');
  clock.setTime(15000);
  const nextPage = clock.create();
  nextPage.deliverDue();
  assert.equal(
    nextPage.snapshot().messages.filter((message) => !message.read).length,
    1,
  );
  assert.equal(nextPage.snapshot().messages[1]?.read, true);
});

test('restart cancels pending delivery and retains mail already received', () => {
  const clock = fixture();
  const mail = clock.create();
  mail.start('cancelled');
  mail.cancel('cancelled');
  clock.setTime(20000);
  mail.deliverDue();
  assert.deepEqual(
    mail.snapshot().messages.map((message) => message.kind),
    ['processing'],
  );
});

test('untrusted or malformed browser storage cannot supply arbitrary messages', () => {
  const clock = fixture();
  clock.storage.setItem(
    FMAIL_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      messages: [
        {
          id: 'x',
          kind: '<script>',
          runId: 'x',
          receivedAt: 1000,
          read: false,
        },
      ],
      pending: [{ runId: 'bad id', readyAt: 1 }],
    }),
  );
  assert.deepEqual(clock.create().snapshot(), {
    version: 1,
    messages: [],
    pending: [],
  });
  clock.storage.setItem(FMAIL_STORAGE_KEY, '{broken');
  assert.equal(clock.create().snapshot().messages.length, 0);
});

test('history stays bounded and blocked storage still permits an inbox on the current page', () => {
  let now = 100;
  const mail = createFmailStore(
    {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    },
    () => {},
    () => now++,
  );
  for (let run = 0; run < 10; run++) {
    mail.start(`run-${run}`);
    mail.complete(`run-${run}`);
  }
  assert.equal(mail.snapshot().messages.length, 2);
  assert.equal(mail.snapshot().messages[0]?.id, 'run-9:ready');
});

test('repeated runs replace each email type and mark the replacement unread', () => {
  const clock = fixture();
  const mail = clock.create();
  mail.start('first');
  mail.complete('first');
  mail.markRead('first:processing');
  mail.markRead('first:ready');
  clock.setTime(2000);
  mail.start('second');
  assert.equal(mail.snapshot().messages.length, 2);
  assert.equal(
    mail.snapshot().messages.find((message) => message.kind === 'processing')
      ?.id,
    'second:processing',
  );
  assert.equal(
    mail.snapshot().messages.filter((message) => !message.read).length,
    1,
  );
  clock.setTime(10000);
  mail.complete('second');
  assert.equal(mail.snapshot().messages.length, 2);
  assert.equal(
    mail.snapshot().messages.filter((message) => !message.read).length,
    2,
  );
});

test('a newer run replaces pending mail and stale completion cannot overwrite it', () => {
  const clock = fixture();
  const mail = clock.create();
  mail.start('old');
  clock.setTime(2000);
  mail.start('new');
  mail.complete('old');
  assert.equal(mail.snapshot().pending.length, 1);
  clock.setTime(10000);
  mail.deliverDue();
  assert.deepEqual(
    mail.snapshot().messages.map((message) => message.runId),
    ['new', 'new'],
  );
});

test('old stored inboxes collapse to the latest message of each type', () => {
  const clock = fixture();
  clock.storage.setItem(
    FMAIL_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      messages: [
        {
          id: 'old:processing',
          runId: 'old',
          kind: 'processing',
          receivedAt: 100,
          read: false,
        },
        {
          id: 'new:processing',
          runId: 'new',
          kind: 'processing',
          receivedAt: 200,
          read: true,
        },
        {
          id: 'old:ready',
          runId: 'old',
          kind: 'ready',
          receivedAt: 300,
          read: false,
        },
        {
          id: 'new:ready',
          runId: 'new',
          kind: 'ready',
          receivedAt: 400,
          read: true,
        },
      ],
      pending: [],
    }),
  );
  assert.deepEqual(
    clock
      .create()
      .snapshot()
      .messages.map((message) => message.id),
    ['new:ready', 'new:processing'],
  );
});

test('FaceReel mail retains its sender identity after navigation and scheduled completion', () => {
  const clock = fixture();
  const firstPage = clock.create();
  firstPage.start('face-1', 'facereel');
  firstPage.markRead('face-1:processing');
  clock.setTime(9000);
  const nextPage = clock.create();
  nextPage.deliverDue();
  assert.deepEqual(
    nextPage
      .snapshot()
      .messages.map(({ kind, project, read }) => ({ kind, project, read })),
    [
      { kind: 'ready', project: 'facereel', read: false },
      { kind: 'processing', project: 'facereel', read: true },
    ],
  );
});

test('switching demos keeps existing email identity and delivers the latest project', () => {
  const clock = fixture();
  const mail = clock.create();
  mail.start('mosaic-1');
  clock.setTime(1500);
  mail.complete('mosaic-1');
  clock.setTime(2000);
  mail.start('face-2', 'facereel');
  assert.deepEqual(
    mail.snapshot().messages.map(({ kind, project }) => ({ kind, project })),
    [
      { kind: 'processing', project: 'facereel' },
      { kind: 'ready', project: 'instamosaic' },
    ],
  );
  clock.setTime(10000);
  mail.deliverDue();
  assert.deepEqual(
    mail.snapshot().messages.map(({ kind, project }) => ({ kind, project })),
    [
      { kind: 'ready', project: 'facereel' },
      { kind: 'processing', project: 'facereel' },
    ],
  );
});

test('legacy mail defaults to InstaMosaic while unknown stored projects are rejected', () => {
  const clock = fixture();
  clock.storage.setItem(
    FMAIL_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      messages: [
        {
          id: 'legacy:processing',
          runId: 'legacy',
          kind: 'processing',
          receivedAt: 1000,
          read: true,
        },
        {
          id: 'bad:ready',
          runId: 'bad',
          kind: 'ready',
          project: 'unknown',
          receivedAt: 2000,
          read: false,
        },
      ],
      pending: [
        { runId: 'legacy', readyAt: 3000 },
        { runId: 'bad', project: 'unknown', readyAt: 4000 },
      ],
    }),
  );
  const mail = clock.create();
  assert.deepEqual(
    mail.snapshot().messages.map(({ id, project }) => ({ id, project })),
    [{ id: 'legacy:processing', project: 'instamosaic' }],
  );
  clock.setTime(3000);
  mail.deliverDue();
  assert.deepEqual(
    mail.snapshot().messages.map(({ id, project }) => ({ id, project })),
    [
      { id: 'legacy:ready', project: 'instamosaic' },
      { id: 'legacy:processing', project: 'instamosaic' },
    ],
  );
});

test('Guestography delivers its gallery-ready email after two seconds, including navigation', () => {
  const clock = fixture();
  const firstPage = clock.create();
  firstPage.start('guest-1', 'guestography');
  assert.equal(firstPage.snapshot().messages.length, 0);
  assert.equal(firstPage.snapshot().pending.length, 1);
  clock.setTime(2999);
  firstPage.deliverDue();
  assert.equal(firstPage.snapshot().messages.length, 0);
  clock.setTime(3000);
  const nextPage = clock.create();
  nextPage.deliverDue();
  assert.deepEqual(
    nextPage
      .snapshot()
      .messages.map(({ kind, project }) => ({ kind, project })),
    [{ kind: 'ready', project: 'guestography' }],
  );
  assert.equal(nextPage.snapshot().messages[0]?.receivedAt, 3000);
  nextPage.complete('guest-1');
  assert.equal(nextPage.snapshot().messages.length, 1);
});

test('repeated Guestography creation replaces the email and ignores superseded runs', () => {
  const clock = fixture();
  const mail = clock.create();
  mail.start('guest-old', 'guestography');
  clock.setTime(2000);
  mail.start('guest-new', 'guestography');
  mail.complete('guest-old');
  assert.equal(mail.snapshot().messages.length, 0);
  mail.complete('guest-new');
  mail.markRead('guest-new:ready');
  clock.setTime(3000);
  mail.start('guest-latest', 'guestography');
  mail.complete('guest-latest');
  assert.deepEqual(
    mail
      .snapshot()
      .messages.map(({ id, project, read }) => ({ id, project, read })),
    [{ id: 'guest-latest:ready', project: 'guestography', read: false }],
  );
});
