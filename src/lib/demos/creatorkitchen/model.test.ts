import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDraft,
  publishDraft,
  renderBlocks,
  updateRuns,
  slugify,
  type Draft,
} from './model.ts';

test('publishing keeps an independent snapshot while the draft is edited', () => {
  const draft = createDraft();
  const published = publishDraft(draft);
  draft.title = 'The next edition';
  const first = draft.blocks[0];
  if (first?.type === 'text') first.runs[0] = { text: 'Changed later' };
  assert.equal(published.title, 'A little Portuguese');
  assert.match(renderBlocks(published.blocks), /A first conversation/);
  assert.notEqual(published.blocks, draft.blocks);
});

test('publish rejects an empty title and body instead of creating a blank page', () => {
  const draft: Draft = { ...createDraft(), title: ' ', blocks: [] };
  assert.throws(() => publishDraft(draft), /title/i);
  draft.title = 'A new idea';
  assert.throws(() => publishDraft(draft), /content/i);
});

test('rendering escapes user text and only emits approved image assets', () => {
  const draft = createDraft();
  draft.blocks = [
    {
      type: 'text',
      style: 'paragraph',
      runs: [{ text: '<script>alert(1)</script>', bold: true }],
    },
    { type: 'image', asset: 'desk' },
  ];
  const html = renderBlocks(draft.blocks);
  assert.match(html, /<strong>&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /src="\/demos\/creatorkitchen\/desk.svg"/);
  assert.match(html, /alt="/);
});

test('titles produce predictable local post paths', () => {
  assert.equal(
    slugify('  Make room for good ideas!  '),
    'make-room-for-good-ideas',
  );
  assert.equal(slugify('Café & notebooks'), 'cafe-notebooks');
  assert.equal(slugify('!!!'), 'untitled');
});

test('published text keeps combined tooltip and audio annotations after draft edits', () => {
  const run = {
    text: 'Olá',
    tooltip: 'Hello',
    audio: 'hello' as const,
    bold: true,
  };
  const draft: Draft = {
    title: 'A first conversation',
    description: '',
    blocks: [{ type: 'text', style: 'paragraph', runs: [run] }],
  };
  const published = publishDraft(draft);
  run.tooltip = 'Changed in the draft';
  const html = renderBlocks(published.blocks);
  assert.match(html, /data-type="tooltip"/);
  assert.match(html, /data-tooltip-content="Hello"/);
  assert.match(html, /data-type="audiolink"/);
  assert.match(html, /data-audio-clip="hello"/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /<strong>Olá<\/strong>/);
  assert.doesNotMatch(html, /Changed in the draft/);
});

test('tooltip content and audio labels cannot inject markup or attributes', () => {
  const run = {
    text: 'Olá "friend"',
    tooltip: '"><img src=x onerror=alert(1)>',
    audio: 'hello' as const,
  };
  const html = renderBlocks([
    { type: 'text', style: 'paragraph', runs: [run] },
  ]);
  assert.match(html, /data-tooltip-content="&quot;&gt;&lt;img/);
  assert.match(html, /aria-label="Play audio: Olá &quot;friend&quot;"/);
  assert.doesNotMatch(html, /<img| onerror="|<script/);
});

test('formatting within a phrase does not split its audio link or tooltip', () => {
  const html = renderBlocks([
    {
      type: 'text',
      style: 'paragraph',
      runs: [
        { text: 'Olá, ', audio: 'hello', tooltip: 'Hello, how are you?' },
        {
          text: 'tudo',
          bold: true,
          audio: 'hello',
          tooltip: 'Hello, how are you?',
        },
        { text: ' bem?', audio: 'hello', tooltip: 'Hello, how are you?' },
      ],
    },
  ]);
  assert.equal(html.match(/data-type="audiolink"/g)?.length, 1);
  assert.equal(html.match(/data-type="tooltip"/g)?.length, 1);
  assert.match(html, /<strong>tudo<\/strong>/);
  assert.match(html, /aria-label="Play audio: Olá, tudo bem\?"/);
});

test('a tooltip selection crossing an audio boundary preserves unrelated marks', () => {
  const runs = [
    { text: 'Olá', tooltip: 'Hello', audio: 'hello' as const },
    { text: ' world' },
  ];
  const annotated = updateRuns(runs, 1, 7, {
    kind: 'tooltip',
    value: 'Greeting',
  });
  assert.deepEqual(annotated, [
    { text: 'O', tooltip: 'Hello', audio: 'hello' },
    { text: 'lá', tooltip: 'Greeting', audio: 'hello' },
    { text: ' wor', tooltip: 'Greeting' },
    { text: 'ld' },
  ]);
  assert.deepEqual(updateRuns(annotated, 1, 7, { kind: 'tooltip' }), [
    { text: 'O', tooltip: 'Hello', audio: 'hello' },
    { text: 'lá', audio: 'hello' },
    { text: ' world' },
  ]);
  assert.deepEqual(runs, [
    { text: 'Olá', tooltip: 'Hello', audio: 'hello' },
    { text: ' world' },
  ]);
});

test('formatting a boundary selection cannot spread its audio to plain text', () => {
  assert.deepEqual(
    updateRuns([{ text: 'Olá', audio: 'hello' }, { text: ' world' }], 1, 7, {
      kind: 'bold',
      value: true,
    }),
    [
      { text: 'O', audio: 'hello' },
      { text: 'lá', audio: 'hello', bold: true },
      { text: ' wor', bold: true },
      { text: 'ld' },
    ],
  );
});

test('formatting toggles off across mixed annotation wrappers', () => {
  const runs = [{ text: 'Olá', audio: 'hello' as const }, { text: ' world' }];
  const bold = updateRuns(runs, 0, 9, { kind: 'bold' });
  assert.ok(bold.every((run) => run.bold));
  const plain = updateRuns(bold, 0, 9, { kind: 'bold' });
  assert.ok(plain.every((run) => !run.bold));
  assert.equal(plain[0]?.audio, 'hello');
  assert.equal(plain[1]?.audio, undefined);
});
