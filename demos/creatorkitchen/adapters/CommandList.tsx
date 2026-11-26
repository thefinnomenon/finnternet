/** @jsxImportSource react */
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  RiText,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiListUnordered,
  RiListOrdered,
  RiDoubleQuotesL,
  RiSeparator,
  RiInformationLine,
  RiCodeSSlashLine,
  RiTableLine,
  RiImageLine,
} from 'react-icons/ri';

interface CommandItem {
  key: string;
  title: string;
  section: string;
}
interface Props {
  items: CommandItem[];
  command: (value: { section: string; type: string }) => void;
  editor: { view: { dom: HTMLElement } };
}
interface Handle {
  onKeyDown: (value: { event: KeyboardEvent }) => boolean;
}
const icons = new Map([
  ['p', RiText],
  ['h1', RiH1],
  ['h2', RiH2],
  ['h3', RiH3],
  ['h4', RiH4],
  ['ul', RiListUnordered],
  ['ol', RiListOrdered],
  ['blockquote', RiDoubleQuotesL],
  ['hr', RiSeparator],
  ['callout', RiInformationLine],
  ['code', RiCodeSSlashLine],
  ['table', RiTableLine],
  ['media', RiImageLine],
]);

// Presentation adapter only: the original suggestion and editor execute commands.
const CommandList = forwardRef<Handle, Props>(
  ({ items, command, editor }, ref) => {
    const list = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [id] = useState(() => `ck-command-${crypto.randomUUID()}`);
    useEffect(() => setSelected(0), [items]);
    useEffect(() => {
      const input = editor.view.dom;
      const dismiss = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setDismissed(true);
      };
      input.addEventListener('keydown', dismiss, true);
      return () => input.removeEventListener('keydown', dismiss, true);
    }, [editor]);
    useEffect(() => {
      if (dismissed) return;
      const input = editor.view.dom;
      const previousControls = input.getAttribute('aria-controls');
      input.setAttribute('aria-controls', id);
      return () => {
        if (input.getAttribute('aria-controls') === id) {
          if (previousControls)
            input.setAttribute('aria-controls', previousControls);
          else input.removeAttribute('aria-controls');
        }
        if (input.getAttribute('aria-activedescendant')?.startsWith(`${id}-`))
          input.removeAttribute('aria-activedescendant');
      };
    }, [editor, id, dismissed]);
    useEffect(() => {
      if (dismissed) return;
      const input = editor.view.dom;
      if (items[selected])
        input.setAttribute('aria-activedescendant', `${id}-${selected}`);
      else input.removeAttribute('aria-activedescendant');
    }, [editor, id, items, selected, dismissed]);
    useEffect(() => {
      const menu = list.current;
      const row = menu?.querySelector('[aria-selected="true"]');
      if (!menu || !(row instanceof HTMLElement)) return;
      const bottom = row.offsetTop + row.offsetHeight;
      if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop;
      else if (bottom > menu.scrollTop + menu.clientHeight)
        menu.scrollTop = bottom - menu.clientHeight;
    }, [selected, items]);
    function choose(index: number): void {
      const item = items[index];
      if (item) command({ section: item.section, type: item.key });
    }
    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (dismissed || !items.length) return false;
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          const step = event.key === 'ArrowUp' ? -1 : 1;
          setSelected((value) => (value + step + items.length) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          choose(selected);
          return true;
        }
        return false;
      },
    }));
    return (
      <div
        ref={list}
        id={id}
        className="ck-command-menu"
        role="listbox"
        aria-label="Insert a block"
        aria-activedescendant={
          items[selected] ? `${id}-${selected}` : undefined
        }
      >
        {items.length ? (
          items.map((item, index) => {
            const Icon = icons.get(item.key) ?? RiText;
            return (
              <button
                id={`${id}-${index}`}
                key={item.key}
                type="button"
                role="option"
                aria-selected={index === selected}
                className="ck-command-option"
                onMouseDown={(event) => event.preventDefault()}
                onFocus={() => setSelected(index)}
                onClick={() => choose(index)}
              >
                <Icon aria-hidden="true" />
                <span>{item.title}</span>
              </button>
            );
          })
        ) : (
          <p className="ck-command-empty">No matching commands</p>
        )}
      </div>
    );
  },
);
CommandList.displayName = 'CommandList';
export default CommandList;
