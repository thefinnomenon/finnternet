import {
  createDraft,
  publishDraft,
  renderBlocks,
  slugify,
  type Asset,
  type Block,
  type Draft,
  type TextRun,
} from './model';

type Entry = { draft: Draft; published: Draft | null };
type ReaderMode = 'preview' | 'published';

function element<T extends HTMLElement>(
  selector: string,
  kind: { new (): T },
): T {
  const value = document.querySelector(selector);
  if (!(value instanceof kind))
    throw new Error(`CreatorKitchen element missing: ${selector}`);
  return value;
}

function readRuns(node: Node, bold = false, italic = false): TextRun[] {
  if (node.nodeType === Node.TEXT_NODE)
    return [{ text: node.textContent ?? '', bold, italic }];
  if (!(node instanceof HTMLElement)) return [];
  if (node.tagName === 'BR') return [{ text: '\n', bold, italic }];
  return Array.from(node.childNodes).flatMap((child) =>
    readRuns(
      child,
      bold || node.tagName === 'STRONG' || node.tagName === 'B',
      italic || node.tagName === 'EM' || node.tagName === 'I',
    ),
  );
}

function readBlocks(editor: HTMLElement): Block[] {
  return Array.from(editor.childNodes).flatMap((node): Block[] => {
    if (node instanceof HTMLElement && node.tagName === 'FIGURE') {
      const asset = node.dataset.asset;
      return asset === 'desk' || asset === 'garden'
        ? [{ type: 'image', asset }]
        : [];
    }
    const style =
      node instanceof HTMLElement && /^H[1-6]$/.test(node.tagName)
        ? 'heading'
        : node instanceof HTMLElement && node.tagName === 'BLOCKQUOTE'
          ? 'quote'
          : 'paragraph';
    return [{ type: 'text', style, runs: readRuns(node) }];
  });
}

export function initCreatorKitchen(): void {
  const app = element('#ck-app', HTMLDivElement);
  const editor = element('#ck-editor', HTMLDivElement);
  const title = element('#ck-title', HTMLInputElement);
  const description = element('#ck-description', HTMLTextAreaElement);
  const documentTitle = element('#ck-document-title', HTMLHeadingElement);
  const contentList = element('#ck-content-list', HTMLElement);
  const status = element('#ck-save-status', HTMLSpanElement);
  const notice = element('#ck-notice', HTMLParagraphElement);
  const publish = element('#ck-publish', HTMLButtonElement);
  const view = element('#ck-view', HTMLButtonElement);
  const reader = element('#ck-reader', HTMLElement);
  const readerTitle = element('#ck-reader-title', HTMLHeadingElement);
  const readerBody = element('#ck-reader-body', HTMLDivElement);
  const readerMode = element('#ck-reader-mode', HTMLSpanElement);
  const readerPublish = element('#ck-reader-publish', HTMLButtonElement);
  const settings = element('#ck-settings', HTMLElement);
  const settingsToggle = element('#ck-settings-toggle', HTMLButtonElement);
  const mediaDialog = element('#ck-media-dialog', HTMLDialogElement);
  const siteDialog = element('#ck-site-dialog', HTMLDialogElement);
  const siteTitle = element('#ck-site-title', HTMLInputElement);
  const subdomain = element('#ck-subdomain', HTMLInputElement);
  const siteButton = element('#ck-site', HTMLButtonElement);
  const entries: Entry[] = [{ draft: createDraft(), published: null }];
  let active = 0;
  let mode: ReaderMode = 'preview';
  let savedRange: Range | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;
  let publishing = false;
  let siteName = 'A little room';
  let siteSubdomain = 'awesome';

  function current(): Entry {
    const entry = entries[active];
    if (!entry) throw new Error('The selected draft is unavailable.');
    return entry;
  }

  function listContent(): void {
    contentList.replaceChildren();
    entries.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ck-content-item';
      button.textContent = entry.draft.title || 'Untitled';
      button.dataset.draft = String(index);
      if (index === active) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => openDraft(index));
      contentList.append(button);
    });
  }

  function updateURL(): void {
    element('#ck-post-url', HTMLParagraphElement).textContent =
      `${siteSubdomain}.creatorkitchen.net/posts/${slugify(current().draft.title)}`;
    siteButton.textContent = `${siteSubdomain}.creatorkitchen.net`;
  }

  function saveChanges(): void {
    clearTimeout(saveTimer);
    status.textContent = 'Saving…';
    saveTimer = setTimeout(() => {
      status.textContent = 'Saved';
    }, 350);
  }

  function tell(message: string): void {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = setTimeout(() => {
      notice.hidden = true;
    }, 2400);
  }

  function syncEditor(): void {
    current().draft.blocks = readBlocks(editor);
    saveChanges();
  }

  function setSettings(open: boolean): void {
    settings.dataset.open = String(open);
    settingsToggle.setAttribute('aria-expanded', String(open));
    if (open) title.focus();
  }

  function openDraft(index: number): void {
    if (!entries[index]) return;
    active = index;
    const entry = current();
    title.value = entry.draft.title;
    title.setCustomValidity('');
    description.value = entry.draft.description;
    documentTitle.textContent = entry.draft.title || 'Untitled';
    editor.innerHTML = renderBlocks(entry.draft.blocks);
    savedRange = null;
    clearTimeout(saveTimer);
    status.textContent = 'Saved';
    view.disabled = entry.published === null;
    view.title = entry.published
      ? 'View published content'
      : 'Publish this content first';
    notice.hidden = true;
    setSettings(false);
    app.hidden = false;
    reader.hidden = true;
    listContent();
    updateURL();
  }

  function openReader(nextMode: ReaderMode): void {
    const entry = current();
    const content = nextMode === 'published' ? entry.published : entry.draft;
    if (!content) return;
    if (!content.title.trim()) {
      title.setCustomValidity('Title is required.');
      setSettings(true);
      title.reportValidity();
      return;
    }
    mode = nextMode;
    readerTitle.textContent = content.title;
    readerBody.innerHTML = renderBlocks(content.blocks);
    readerMode.textContent = nextMode === 'published' ? 'Published' : 'Preview';
    readerPublish.hidden = nextMode === 'published';
    readerPublish.textContent = 'Publish';
    readerPublish.dataset.action = 'publish';
    element('#ck-reader-site', HTMLDivElement).textContent = siteName;
    app.hidden = true;
    reader.hidden = false;
    window.scrollTo(0, 0);
    readerTitle.focus({ preventScroll: true });
  }

  function publishContent(): void {
    if (publishing) return;
    let snapshot: Draft;
    try {
      snapshot = publishDraft(current().draft);
    } catch (error) {
      if (error instanceof Error) tell(error.message);
      app.hidden = false;
      reader.hidden = true;
      if (!title.value.trim()) {
        title.setCustomValidity('Title is required.');
        setSettings(true);
        title.reportValidity();
      } else editor.focus();
      return;
    }
    publishing = true;
    publish.disabled = true;
    readerPublish.disabled = true;
    publish.textContent = 'Publishing…';
    readerPublish.textContent = 'Publishing…';
    const entry = current();
    setTimeout(() => {
      entry.published = snapshot;
      publishing = false;
      publish.disabled = false;
      readerPublish.disabled = false;
      publish.textContent = 'Publish';
      view.disabled = current().published === null;
      view.title = view.disabled
        ? 'Publish this content first'
        : 'View published content';
      if (current() === entry && !reader.hidden && mode === 'preview') {
        readerMode.textContent = 'Published';
        readerPublish.textContent = 'View published content';
        readerPublish.dataset.action = 'view';
      }
      tell('Published');
    }, 500);
  }

  function restoreRange(): Range | null {
    const selection = window.getSelection();
    if (!selection) return null;
    let range = savedRange;
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      const block = editor.querySelector('p, h2, blockquote');
      if (!block) return null;
      range = document.createRange();
      range.selectNodeContents(block);
    }
    editor.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  }

  function activeBlock(range: Range): HTMLElement | null {
    const container =
      range.startContainer instanceof HTMLElement
        ? range.startContainer
        : range.startContainer.parentElement;
    const block = container?.closest('p, h1, h2, h3, blockquote, div');
    return block instanceof HTMLElement &&
      block !== editor &&
      editor.contains(block)
      ? block
      : editor.querySelector('p, h2, blockquote');
  }

  function format(tag: 'strong' | 'em'): void {
    const range = restoreRange();
    if (!range) return;
    if (range.collapsed) {
      const block = activeBlock(range);
      if (!block) return;
      range.selectNodeContents(block);
    }
    const parent =
      range.commonAncestorContainer instanceof HTMLElement
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
    const existing = parent?.closest(tag);
    if (existing && editor.contains(existing)) {
      existing.replaceWith(...existing.childNodes);
    } else {
      const wrapper = document.createElement(tag);
      wrapper.append(range.extractContents());
      range.insertNode(wrapper);
      range.selectNodeContents(wrapper);
    }
    savedRange = range;
    syncEditor();
  }

  function style(kind: 'heading' | 'quote'): void {
    const range = restoreRange();
    if (!range) return;
    const block = activeBlock(range);
    if (!block) return;
    const target = kind === 'heading' ? 'H2' : 'BLOCKQUOTE';
    const replacement = document.createElement(
      block.tagName === target ? 'p' : target.toLowerCase(),
    );
    replacement.append(...block.childNodes);
    block.replaceWith(replacement);
    const selection = window.getSelection();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(replacement);
    nextRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
    savedRange = nextRange;
    syncEditor();
  }

  function insertMedia(asset: Asset): void {
    current().draft.blocks = readBlocks(editor);
    const block: Block = { type: 'image', asset };
    const holder = document.createElement('div');
    holder.innerHTML = renderBlocks([block]);
    const figure = holder.firstElementChild;
    if (!figure) return;
    const range = savedRange;
    const anchor =
      range && editor.contains(range.commonAncestorContainer)
        ? activeBlock(range)
        : null;
    if (anchor) anchor.after(figure);
    else editor.append(figure);
    mediaDialog.close();
    syncEditor();
    figure.scrollIntoView({ block: 'nearest' });
    editor.focus({ preventScroll: true });
  }

  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer))
        savedRange = range.cloneRange();
    }
  });
  editor.addEventListener('input', syncEditor);
  editor.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return;
    const range = restoreRange();
    if (!range) return;
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    savedRange = range;
    syncEditor();
  });
  editor.addEventListener('drop', (event) => event.preventDefault());
  editor.addEventListener('keydown', (event) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      ['b', 'i'].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      format(event.key.toLowerCase() === 'b' ? 'strong' : 'em');
    }
  });
  title.addEventListener('input', () => {
    title.setCustomValidity('');
    current().draft.title = title.value;
    documentTitle.textContent = title.value || 'Untitled';
    listContent();
    updateURL();
    saveChanges();
  });
  description.addEventListener('input', () => {
    current().draft.description = description.value;
    saveChanges();
  });
  element('#ck-content-form', HTMLFormElement).addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      clearTimeout(saveTimer);
      status.textContent = 'Saved';
      setSettings(false);
      tell('Saved');
    },
  );
  element('#ck-create', HTMLButtonElement).addEventListener('click', () => {
    entries.push({
      draft: {
        title: '',
        description: '',
        blocks: [{ type: 'text', style: 'paragraph', runs: [] }],
      },
      published: null,
    });
    openDraft(entries.length - 1);
    setSettings(true);
  });
  element('#ck-preview', HTMLButtonElement).addEventListener('click', () =>
    openReader('preview'),
  );
  publish.addEventListener('click', publishContent);
  view.addEventListener('click', () => openReader('published'));
  readerPublish.addEventListener('click', () => {
    if (readerPublish.dataset.action === 'view') openReader('published');
    else publishContent();
  });
  element('#ck-back', HTMLButtonElement).addEventListener('click', () => {
    reader.hidden = true;
    app.hidden = false;
    element('#ck-preview', HTMLButtonElement).focus();
  });
  settingsToggle.addEventListener('click', () =>
    setSettings(settings.dataset.open !== 'true'),
  );
  element('#ck-add-block', HTMLButtonElement).addEventListener('click', () => {
    const paragraph = document.createElement('p');
    paragraph.append(document.createElement('br'));
    editor.append(paragraph);
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRange = range;
    paragraph.scrollIntoView({ block: 'nearest' });
    syncEditor();
  });
  document
    .querySelectorAll<HTMLButtonElement>('[data-format]')
    .forEach((button) => {
      button.addEventListener('pointerdown', (event) => event.preventDefault());
      button.addEventListener('click', () => {
        const tag = button.dataset.format;
        if (tag === 'strong' || tag === 'em') format(tag);
      });
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-style]')
    .forEach((button) => {
      button.addEventListener('pointerdown', (event) => event.preventDefault());
      button.addEventListener('click', () => {
        const kind = button.dataset.style;
        if (kind === 'heading' || kind === 'quote') style(kind);
      });
    });
  element('#ck-media', HTMLButtonElement).addEventListener('click', () =>
    mediaDialog.showModal(),
  );
  document
    .querySelectorAll<HTMLButtonElement>('[data-asset-choice]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const asset = button.dataset.assetChoice;
        if (asset === 'desk' || asset === 'garden') insertMedia(asset);
      });
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-close]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.close;
        if (id) element(`#${id}`, HTMLDialogElement).close();
      });
    });
  siteButton.addEventListener('click', () => siteDialog.showModal());
  element('#ck-site-form', HTMLFormElement).addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      siteName = siteTitle.value.trim();
      siteSubdomain = subdomain.value.trim();
      updateURL();
      siteDialog.close();
      tell('Saved');
    },
  );
  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== window.parent
    )
      return;
    const message = event.data;
    if (
      message &&
      typeof message === 'object' &&
      'type' in message &&
      message.type === 'creatorkitchen:theme' &&
      'theme' in message &&
      (message.theme === 'light' || message.theme === 'dark')
    ) {
      document.documentElement.dataset.theme = message.theme;
    }
  });
  listContent();
  updateURL();
}
