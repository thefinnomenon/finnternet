export const postFields = ['title', 'content', 'category'] as const;
export type PostField = (typeof postFields)[number];
export type FieldPolicy = {
  mode: 'include' | 'exclude';
  fields: readonly PostField[];
};
export type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
};
export type IndexedPost = Partial<Post> & { objectID: string };
export type StreamEvent =
  | { eventName: 'INSERT' | 'MODIFY'; post: Post }
  | { eventName: 'REMOVE'; id: string };
export type IndexOperation = {
  action: 'updateObject' | 'deleteObject';
  body: IndexedPost;
};

export const starterPosts: readonly Post[] = [
  {
    id: 'post-01',
    title: 'A smaller GraphQL API',
    content: 'Keep the schema focused and compose the rest.',
    category: 'GraphQL',
  },
  {
    id: 'post-02',
    title: 'Search without servers',
    content: 'Send model changes to a searchable index.',
    category: 'Architecture',
  },
];
export const newPost: Post = {
  id: 'post-03',
  title: 'Search beyond SQL',
  content: 'Add full-text search to a GraphQL API.',
  category: 'Architecture',
};
export const updatedPost: Post = {
  ...newPost,
  title: 'Search beyond SQL, updated',
  content: 'Stream every edit into the same search record.',
};

/** Mirrors field selection and key-to-objectID mapping without using an SDK. */
export function indexPost(post: Post, policy: FieldPolicy): IndexedPost {
  const result: IndexedPost = { objectID: post.id };
  if (policy.mode === 'exclude') result.id = post.id;
  for (const field of postFields) {
    const selected = policy.fields.includes(field);
    if (policy.mode === 'include' ? selected : !selected) {
      result[field] = post[field];
    }
  }
  return result;
}

export function operationFor(
  event: StreamEvent,
  policy: FieldPolicy,
): IndexOperation {
  return event.eventName === 'REMOVE'
    ? { action: 'deleteObject', body: { objectID: event.id } }
    : { action: 'updateObject', body: indexPost(event.post, policy) };
}

export function applyOperation(
  records: readonly IndexedPost[],
  operation: IndexOperation,
): IndexedPost[] {
  const remaining = records.filter(
    (record) => record.objectID !== operation.body.objectID,
  );
  return operation.action === 'deleteObject'
    ? remaining
    : [...remaining, operation.body];
}

/** Deliberately a local substring match, not an implementation of Algolia ranking. */
export function searchIndex(
  records: readonly IndexedPost[],
  query: string,
): IndexedPost[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return records.filter((record) => {
    const text = postFields
      .map((field) => record[field] ?? '')
      .join(' ')
      .toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function schemaFor(policy: FieldPolicy): string {
  const fields = policy.fields.map((field) => `"${field}"`).join(', ');
  return `type Post @model\n  @algolia(fields: {\n    ${policy.mode}: [${fields}]\n  }) {\n  id: ID!\n  title: String!\n  content: String\n  category: String\n}`;
}
