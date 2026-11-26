/** @jsxImportSource react */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import ReactDOM from 'react-dom';
import { delegate, roundArrow } from 'tippy.js';
import { Editor } from '@creatorkitchen/original';
import { createDraft, updateDraft, type Draft } from './fixtures';
import { installFixtureFetch } from './adapters/services';
import { readOnlyHTML } from './preview';
import { EditorBridge } from './adapters/editor-bridge';
import type { Editor as TiptapEditor } from '@tiptap/react';
import './.generated/base.css';
import './shell.css';
import './theme.css';

installFixtureFetch();

function pauseMedia(root: ParentNode = document): void {
  for (const media of root.querySelectorAll<HTMLMediaElement>('audio, video'))
    media.pause();
}

function EditorPane({
  initialContent,
  onChange,
  preview,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  preview: boolean;
}): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const html = useMemo(
    () => (preview ? readOnlyHTML(initialContent) : ''),
    [preview, initialContent],
  );
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const label = () => {
      const editor = container.querySelector(
        '.ProseMirror[contenteditable=true]',
      );
      if (editor && !editor.hasAttribute('aria-label')) {
        editor.setAttribute('role', 'textbox');
        editor.setAttribute('aria-multiline', 'true');
        editor.setAttribute('aria-label', 'Post content');
      }
      for (const button of container.querySelectorAll('.node-callout button'))
        button.setAttribute('aria-label', 'Change callout style');
      for (const select of container.querySelectorAll('.code-block select'))
        select.setAttribute('aria-label', 'Code language');
      for (const video of container.querySelectorAll('video')) {
        video.setAttribute(
          'aria-label',
          video.closest('[data-type="media"]')?.getAttribute('alt') ||
            'Lesson pronunciation video',
        );
      }
    };
    label();
    const observer = new MutationObserver(label);
    observer.observe(container, { childList: true, subtree: true });
    const tooltips = preview
      ? delegate(container, {
          target: '[data-tooltip-content]',
          interactive: true,
          hideOnClick: false,
          appendTo: () => document.body,
          allowHTML: true,
          arrow: roundArrow,
          theme: 'my-tippy',
          onShow(instance) {
            const content = instance.reference.getAttribute(
              'data-tooltip-content',
            );
            if (!content) return false;
            instance.setContent(readOnlyHTML(content));
            return undefined;
          },
        })
      : null;
    if (preview) {
      container
        .querySelectorAll<HTMLElement>('[data-type="audiolink"]')
        .forEach((link) => {
          link.tabIndex = 0;
          link.setAttribute('role', 'button');
          link.setAttribute(
            'aria-label',
            `Play audio: ${link.textContent?.trim() || 'pronunciation'}`,
          );
        });
    }
    const playWithKeyboard = (event: KeyboardEvent) => {
      if (!preview || (event.key !== 'Enter' && event.key !== ' ')) return;
      if (
        !(event.target instanceof HTMLElement) ||
        !event.target.matches('[data-type="audiolink"]')
      )
        return;
      event.preventDefault();
      event.target.click();
    };
    container.addEventListener('keydown', playWithKeyboard);
    return () => {
      observer.disconnect();
      container.removeEventListener('keydown', playWithKeyboard);
      pauseMedia(container);
      if (tooltips)
        for (const instance of Array.isArray(tooltips) ? tooltips : [tooltips])
          instance.destroy();
    };
  }, [preview]);
  return (
    <div
      ref={root}
      className="ck-editor-body ck-prose"
      onPlayCapture={(event) => {
        for (const media of event.currentTarget.querySelectorAll<HTMLMediaElement>(
          'audio, video',
        ))
          if (media !== event.target) media.pause();
      }}
      onClickCapture={(event) => {
        if (
          !preview &&
          event.target instanceof Element &&
          event.target.closest('[data-type="audiolink"]')
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {preview ? (
        <div
          className="ProseMirror prose"
          role="document"
          aria-label="Content preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <Editor
          initialContent={initialContent}
          onChange={onChange}
          preview={false}
        />
      )}
    </div>
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
  const [preview, setPreview] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const editor = useRef<TiptapEditor | null>(null);
  const registerEditor = useCallback((value: TiptapEditor | null) => {
    editor.current = value;
    setEditorReady(Boolean(value));
  }, []);
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
    pauseMedia();
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
    setPreview(false);
    setDrafts((items) => [...items, next]);
    select(next);
  }
  return (
    <EditorBridge.Provider value={registerEditor}>
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
            <div className="ck-actions">
              <button
                type="button"
                className="ck-text-button"
                aria-label={preview ? 'Back to editor' : 'Preview content'}
                disabled={!preview && !editorReady}
                onClick={() => {
                  pauseMedia();
                  const content = preview
                    ? current.content
                    : editor.current?.getHTML();
                  if (content === undefined) return;
                  if (!preview)
                    setDrafts((items) =>
                      updateDraft(items, active, { content }),
                    );
                  setInitialHTML(content);
                  setPreview((value) => !value);
                }}
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                ref={gear}
                disabled={preview}
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
          </div>
          <div className="ck-document-scroll">
            <article className="ck-document">
              <h1>{current.title || 'Untitled'}</h1>
              <EditorPane
                key={`${active}:${preview ? 'preview' : 'edit'}`}
                preview={preview}
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
    </EditorBridge.Provider>
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
