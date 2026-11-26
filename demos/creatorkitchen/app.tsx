/** @jsxImportSource react */
import { useEffect, useRef, useState, type ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { delegate, roundArrow } from 'tippy.js';
import { Editor } from '@creatorkitchen/original';
import { createDraft, updateDraft, type Draft } from './fixtures';
import { installFixtureFetch } from './adapters/services';
import './.generated/base.css';
import './shell.css';
import './theme.css';

installFixtureFetch();

function EditorPane({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const audioHost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    const media = audioHost.current;
    if (!container || !media) return;
    const audio = new Map<string, HTMLAudioElement>();
    const sync = () => {
      const editor = container.querySelector(
        '.ProseMirror[contenteditable=true]',
      );
      if (!editor) return;
      if (!editor.hasAttribute('aria-label')) {
        editor.setAttribute('role', 'textbox');
        editor.setAttribute('aria-multiline', 'true');
        editor.setAttribute('aria-label', 'Post content');
      }
      // ProseMirror owns mark children while editing. Keep the original mark's
      // audio targets outside that DOM so its unchanged inline handler can play.
      const sources = new Set(
        Array.from(editor.querySelectorAll('[data-type="audiolink"][src]'))
          .map((mark) => mark.getAttribute('src'))
          .filter((src): src is string => Boolean(src)),
      );
      for (const [src, element] of audio) {
        if (sources.has(src)) continue;
        element.pause();
        element.remove();
        audio.delete(src);
      }
      for (const src of sources) {
        if (audio.has(src)) continue;
        const element = document.createElement('audio');
        element.id = src;
        element.src = src;
        element.preload = 'none';
        media.appendChild(element);
        audio.set(src, element);
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });
    // The original reader's Tippy behavior, attached to changing editor markup.
    const tooltips = delegate(container, {
      target: '[data-tooltip-content]',
      interactive: true,
      appendTo: () => document.body,
      allowHTML: true,
      arrow: roundArrow,
      theme: 'my-tippy',
      onShow(instance) {
        if (!window.getSelection()?.isCollapsed) return false;
        const content = instance.reference.getAttribute('data-tooltip-content');
        if (!content) return false;
        instance.setContent(content);
        return undefined;
      },
    });
    return () => {
      observer.disconnect();
      for (const element of audio.values()) {
        element.pause();
        element.remove();
      }
      for (const instance of Array.isArray(tooltips) ? tooltips : [tooltips])
        instance.destroy();
    };
  }, []);
  return (
    <>
      <div ref={root} className="ck-editor-body ck-prose">
        <Editor
          initialContent={initialContent}
          onChange={onChange}
          preview={false}
        />
      </div>
      <div ref={audioHost} hidden aria-hidden="true" />
    </>
  );
}

function App(): ReactElement {
  const [drafts, setDrafts] = useState<Draft[]>(() => [
    createDraft('lesson', true),
  ]);
  const [active, setActive] = useState('lesson');
  const [initialHTML, setInitialHTML] = useState(
    () => createDraft('lesson', true).content,
  );
  const [saved, setSaved] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const settings = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLInputElement>(null);
  const gear = useRef<HTMLButtonElement>(null);
  const current = drafts.find((draft) => draft.id === active);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (settings.current?.open) title.current?.select();
  }, [active]);
  useEffect(() => {
    const dialog = settings.current;
    if (!dialog) return;
    const closed = () => {
      setSettingsOpen(false);
      gear.current?.focus();
    };
    dialog.addEventListener('close', closed);
    return () => dialog.removeEventListener('close', closed);
  }, []);
  if (!current) throw new Error('Selected content is unavailable.');

  function change(
    id: string,
    patch: Partial<Pick<Draft, 'title' | 'description' | 'content'>>,
  ): void {
    setDrafts((items) => updateDraft(items, id, patch));
    clearTimeout(timer.current);
    setSaved(false);
    timer.current = setTimeout(() => setSaved(true), 350);
  }
  function select(draft: Draft): void {
    clearTimeout(timer.current);
    setSaved(true);
    setInitialHTML(draft.content);
    setActive(draft.id);
  }
  function openSettings(): void {
    settings.current?.showModal();
    setSettingsOpen(true);
    title.current?.select();
  }
  function add(): void {
    const next = createDraft(crypto.randomUUID());
    setDrafts((items) => [...items, next]);
    select(next);
  }
  return (
    <>
      <div className="ck-app">
        <aside className="ck-sidebar" aria-label="Content">
          <div className="ck-content-heading">
            <h1>Content</h1>
            <button
              className="ck-icon-button"
              type="button"
              aria-label="Create new content"
              title="Create new content"
              onClick={add}
            >
              ＋
            </button>
          </div>
          <div className="ck-author">
            <span className="ck-avatar" aria-hidden="true">
              AU
            </span>
            Awesome User
          </div>
          <p className="ck-site-button">awesome.creatorkitchen.net</p>
          <nav className="ck-content-list" aria-label="Drafts">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                className="ck-content-item"
                aria-current={draft.id === active ? 'page' : undefined}
                onClick={() => select(draft)}
              >
                {draft.title || 'Untitled'}
              </button>
            ))}
          </nav>
          <div className="ck-sidebar-footer">CreatorKitchen</div>
        </aside>
        <main className="ck-workspace">
          <div className="ck-topbar">
            <span className="ck-save-status" role="status">
              {saved ? 'Saved' : 'Saving…'}
            </span>
            <button
              ref={gear}
              className="ck-icon-button ck-settings-toggle"
              type="button"
              aria-label="Content settings"
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              onClick={openSettings}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3h-6Z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
            </button>
          </div>
          <div className="ck-document-scroll">
            <article className="ck-document">
              <h1>{current.title || 'Untitled'}</h1>
              <EditorPane
                key={active}
                initialContent={initialHTML}
                onChange={(content) => change(active, { content })}
              />
            </article>
          </div>
        </main>
      </div>
      <dialog
        ref={settings}
        className="ck-settings-dialog"
        aria-labelledby="ck-settings-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <aside className="ck-settings">
          <div className="ck-settings-header">
            <h2 id="ck-settings-title">Content Settings</h2>
            <button
              className="ck-icon-button"
              type="button"
              aria-label="Close content settings"
              onClick={() => settings.current?.close()}
            >
              ×
            </button>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              clearTimeout(timer.current);
              setSaved(true);
              settings.current?.close();
            }}
          >
            <div className="ck-settings-fields">
              <label htmlFor="ck-title">Title</label>
              <input
                ref={title}
                id="ck-title"
                value={current.title}
                required
                maxLength={160}
                onChange={(event) =>
                  change(active, { title: event.target.value })
                }
              />
              <label htmlFor="ck-description">Description</label>
              <textarea
                id="ck-description"
                value={current.description}
                rows={4}
                maxLength={500}
                onChange={(event) =>
                  change(active, { description: event.target.value })
                }
              />
            </div>
            <div className="ck-settings-bottom">
              <button className="ck-primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </aside>
      </dialog>
    </>
  );
}

let theme = matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';
try {
  const saved = localStorage.getItem('finnternet-theme');
  if (saved === 'dark' || saved === 'light') theme = saved;
} catch {
  /* Follow system appearance. */
}
document.documentElement.dataset.theme = theme;
window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (event.source !== window.parent || event.origin !== location.origin)
    return;
  const value = event.data;
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === 'creatorkitchen:theme' &&
    'theme' in value &&
    (value.theme === 'light' || value.theme === 'dark')
  )
    document.documentElement.dataset.theme = value.theme;
});
const root = document.querySelector('#creatorkitchen-original');
if (!(root instanceof HTMLDivElement))
  throw new Error('CreatorKitchen mount is missing.');
ReactDOM.render(<App />, root);
