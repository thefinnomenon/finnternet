import {
  applyOperation,
  indexPost,
  newPost,
  operationFor,
  postFields,
  schemaFor,
  searchIndex,
  starterPosts,
  updatedPost,
  type FieldPolicy,
  type IndexedPost,
  type Post,
  type StreamEvent,
} from './model';

function element<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const node = document.querySelector(selector);
  if (!(node instanceof constructor)) {
    throw new Error(`Transformer demo element missing: ${selector}`);
  }
  return node;
}
const schema = element('#schema-code', HTMLElement);
const create = element('#create-post', HTMLButtonElement);
const update = element('#update-post', HTMLButtonElement);
const remove = element('#delete-post', HTMLButtonElement);
const reset = element('#reset-demo', HTMLButtonElement);
const query = element('#search-query', HTMLInputElement);
const queryCode = element('#query-code', HTMLElement);
const results = element('#search-results', HTMLDivElement);
const status = element('#pipeline-status', HTMLParagraphElement);
const payload = element('#indexed-payload', HTMLElement);
const streamSection = element('#stream-section', HTMLElement);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const stageNodes = Array.from(
  document.querySelectorAll<HTMLElement>('[data-stage]'),
);
let policy: FieldPolicy = { mode: 'include', fields: ['title', 'content'] };
let post: Post | null = null;
let records: IndexedPost[] = starterPosts.map((item) =>
  indexPost(item, policy),
);
let busy = false;
let revision = 0;

function setButtons(): void {
  create.disabled = busy || post !== null;
  update.disabled = busy || post === null || post.title === updatedPost.title;
  remove.disabled = busy || post === null;
  document
    .querySelectorAll<HTMLInputElement>('.field-policy input')
    .forEach((input) => {
      input.disabled = busy;
    });
}

function showSearch(): void {
  const hits = searchIndex(records, query.value);
  queryCode.textContent = `query {\n  searchPosts(query: ${JSON.stringify(query.value)})\n}`;
  element('#index-size', HTMLElement).textContent = `${records.length} records`;
  element('#hit-count', HTMLOutputElement).textContent =
    `${hits.length} ${hits.length === 1 ? 'result' : 'results'}`;
  results.replaceChildren();
  for (const hit of hits) {
    const item = document.createElement('article');
    item.className = 'search-hit';
    const id = document.createElement('span');
    id.className = 'record-id';
    id.textContent = hit.objectID;
    const title = document.createElement('strong');
    title.textContent = hit.title ?? 'Title is not indexed';
    item.append(id, title);
    if (hit.content) {
      const content = document.createElement('p');
      content.textContent = hit.content;
      item.append(content);
    }
    if (hit.category) {
      const category = document.createElement('span');
      category.className = 'result-category';
      category.textContent = hit.category;
      item.append(category);
    }
    results.append(item);
  }
  if (hits.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-results';
    empty.textContent =
      'No indexed fields match. Try another query or field selection.';
    results.append(empty);
  }
}

function rebuildPreview(): void {
  const mode = document.querySelector<HTMLInputElement>(
    'input[name="field-mode"]:checked',
  )?.value;
  policy = {
    mode: mode === 'exclude' ? 'exclude' : 'include',
    fields: postFields.filter(
      (field) =>
        document.querySelector<HTMLInputElement>(
          `input[name="indexed-field"][value="${field}"]`,
        )?.checked,
    ),
  };
  schema.textContent = schemaFor(policy);
  element('#field-hint', HTMLParagraphElement).textContent =
    policy.mode === 'include'
      ? 'Only checked fields enter the index.'
      : 'Checked fields stay out of the index.';
  records = [...starterPosts, ...(post ? [post] : [])].map((item) =>
    indexPost(item, policy),
  );
  if (post)
    payload.textContent = JSON.stringify(indexPost(post, policy), null, 2);
  showSearch();
}

const pause = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

async function animateEvent(event: StreamEvent): Promise<void> {
  if (busy) return;
  const run = ++revision;
  busy = true;
  setButtons();
  streamSection.setAttribute('aria-busy', 'true');
  const operation = operationFor(event, policy);
  element('#stream-event', HTMLElement).textContent = event.eventName;
  element('#index-action', HTMLElement).textContent = operation.action;
  status.textContent = `${event.eventName}: moving the change into the index…`;
  for (const stage of stageNodes) stage.classList.remove('active', 'complete');
  for (const stage of stageNodes) {
    if (run !== revision) return;
    stage.classList.add('active');
    if (!reducedMotion.matches) await pause(220);
    if (run !== revision) return;
    stage.classList.remove('active');
    stage.classList.add('complete');
  }
  records = applyOperation(records, operation);
  post = event.eventName === 'REMOVE' ? null : event.post;
  element('#source-title', HTMLElement).textContent = (post ?? newPost).title;
  element('#source-content', HTMLElement).textContent = (
    post ?? newPost
  ).content;
  element('#operation-label', HTMLElement).textContent =
    `${event.eventName} → ${operation.action}`;
  payload.textContent = JSON.stringify(operation.body, null, 2);
  status.textContent =
    event.eventName === 'REMOVE'
      ? 'post-03 removed from the index.'
      : `post-03 ${event.eventName === 'INSERT' ? 'added to' : 'updated in'} the index.`;
  busy = false;
  streamSection.removeAttribute('aria-busy');
  setButtons();
  showSearch();
}

create.addEventListener(
  'click',
  () => void animateEvent({ eventName: 'INSERT', post: newPost }),
);
update.addEventListener(
  'click',
  () => void animateEvent({ eventName: 'MODIFY', post: updatedPost }),
);
remove.addEventListener(
  'click',
  () => void animateEvent({ eventName: 'REMOVE', id: newPost.id }),
);
reset.addEventListener('click', () => {
  revision++;
  busy = false;
  post = null;
  streamSection.removeAttribute('aria-busy');
  stageNodes.forEach((stage) => stage.classList.remove('active', 'complete'));
  element('#source-title', HTMLElement).textContent = newPost.title;
  element('#source-content', HTMLElement).textContent = newPost.content;
  element('#operation-label', HTMLElement).textContent = 'Indexed payload';
  element('#stream-event', HTMLElement).textContent = 'Stream event';
  element('#index-action', HTMLElement).textContent = 'Search index';
  payload.textContent = 'Create a Post to see its indexed fields.';
  status.textContent = 'Ready for a model change.';
  query.value = 'search';
  rebuildPreview();
  setButtons();
});
document
  .querySelectorAll<HTMLInputElement>('.field-policy input')
  .forEach((input) => {
    input.addEventListener('change', () => {
      rebuildPreview();
      status.textContent = 'Preview rebuilt with the selected fields.';
    });
  });
query.addEventListener('input', showSearch);

function isThemeMessage(
  value: unknown,
): value is { type: string; theme: 'light' | 'dark' } {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'graphql-algolia-transformer:theme' &&
    'theme' in value &&
    (value.theme === 'light' || value.theme === 'dark')
  );
}
window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (
    event.origin !== window.location.origin ||
    event.source !== window.parent ||
    !isThemeMessage(event.data)
  )
    return;
  document.documentElement.dataset.theme = event.data.theme;
});
rebuildPreview();
setButtons();
