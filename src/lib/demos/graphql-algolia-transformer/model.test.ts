import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyOperation,
  indexPost,
  newPost,
  operationFor,
  schemaFor,
  searchIndex,
  updatedPost,
} from './model.ts';

test('include projects only selected fields while retaining the derived objectID', () => {
  assert.deepEqual(indexPost(newPost, { mode: 'include', fields: ['title'] }), {
    objectID: 'post-03',
    title: 'Search beyond SQL',
  });
  assert.deepEqual(indexPost(newPost, { mode: 'include', fields: [] }), {
    objectID: 'post-03',
  });
});

test('exclude removes selected content and retains other source fields', () => {
  assert.deepEqual(
    indexPost(newPost, { mode: 'exclude', fields: ['content'] }),
    {
      objectID: 'post-03',
      id: 'post-03',
      title: 'Search beyond SQL',
      category: 'Architecture',
    },
  );
});

test('stream updates replace the same objectID and deletes remove it', () => {
  const policy = { mode: 'include', fields: ['title'] } as const;
  const inserted = applyOperation(
    [],
    operationFor({ eventName: 'INSERT', post: newPost }, policy),
  );
  const updated = applyOperation(
    inserted,
    operationFor({ eventName: 'MODIFY', post: updatedPost }, policy),
  );
  assert.equal(updated.length, 1);
  assert.equal(updated[0]?.title, updatedPost.title);
  const deleted = applyOperation(
    updated,
    operationFor({ eventName: 'REMOVE', id: newPost.id }, policy),
  );
  assert.deepEqual(deleted, []);
});

test('search only reads indexed fields and supports empty and multi-term queries', () => {
  const record = indexPost(newPost, { mode: 'include', fields: ['title'] });
  assert.equal(searchIndex([record], 'GRAPHQL').length, 0);
  assert.equal(searchIndex([record], 'search sql').length, 1);
  assert.equal(searchIndex([record], 'search missing').length, 0);
  assert.equal(searchIndex([record], '  ').length, 1);
});

test('schema reflects mutually exclusive include/exclude selection', () => {
  const schema = schemaFor({ mode: 'exclude', fields: ['category'] });
  assert.match(schema, /exclude: \["category"\]/);
  assert.doesNotMatch(schema, /include:/);
});
