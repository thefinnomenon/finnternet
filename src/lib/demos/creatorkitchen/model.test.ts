import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDraft,
  publishDraft,
  renderBlocks,
  slugify,
  type Draft,
} from './model.ts';

test('publishing keeps an independent snapshot while the draft is edited', () => {
  const draft = createDraft();
  const published = publishDraft(draft);
  draft.title = 'The next edition';
  const first = draft.blocks[0];
  if (first?.type === 'text') first.runs[0] = { text: 'Changed later' };
  assert.equal(published.title, 'Make room for good ideas');
  assert.match(renderBlocks(published.blocks), /Start with a little space/);
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
