import assert from 'node:assert/strict';
import test from 'node:test';
import { createDraft, updateDraft } from './fixtures.ts';

test('saving original editor HTML preserves annotation markup without changing other documents', () => {
  const first = createDraft('first', true);
  const second = createDraft('second');
  const html =
    '<p><span data-type="tooltip" data-tooltip-content="Hello"><span data-type="audiolink" src="blob:local-audio">Olá</span></span></p>';
  const saved = updateDraft([first, second], 'first', { content: html });
  assert.equal(saved[0]?.content, html);
  assert.equal(saved[1], second);
  assert.notEqual(first.content, html);
});

test('metadata changes keep a document’s saved editor content', () => {
  const first = createDraft('first', true);
  const updated = updateDraft([first], 'first', {
    title: 'My language notes',
    description: 'A new description.',
  });
  assert.equal(updated[0]?.title, 'My language notes');
  assert.equal(updated[0]?.content, first.content);
  assert.equal(first.title, 'Portuguese: the present subjunctive');
});
