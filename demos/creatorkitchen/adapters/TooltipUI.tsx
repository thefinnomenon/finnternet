/** @jsxImportSource react */
import { useContext, useEffect, type MutableRefObject } from 'react';
import type { Editor } from '@tiptap/react';
import { delegate, roundArrow } from 'tippy.js';
import { TooltipUI as OriginalTooltipUI } from '@creatorkitchen/original';
import { EditorBridge } from './editor-bridge';

interface Props {
  editor: Editor;
  tooltip: MutableRefObject<'show' | 'hide'>;
}
export default function TooltipUI(props: Props) {
  const { editor } = props;
  const register = useContext(EditorBridge);
  useEffect(() => {
    register(editor);
    return () => register(null);
  }, [editor, register]);
  useEffect(() => {
    const popups = delegate(editor.view.dom, {
      target: '[data-tooltip-content]',
      appendTo: () => document.body,
      interactive: true,
      hideOnClick: false,
      arrow: roundArrow,
      theme: 'my-tippy',
      onHide(instance) {
        if (
          !editor.isDestroyed &&
          instance.popper.contains(document.activeElement)
        )
          return false;
        return undefined;
      },
      onShow(instance) {
        if (!editor.state.selection.empty) return false;
        const reference = instance.reference;
        const initial = reference.getAttribute('data-tooltip-content') || '';
        const field = document.createElement('div');
        field.className = 'ck-hover-tooltip';
        field.contentEditable = 'true';
        field.setAttribute('role', 'textbox');
        field.setAttribute('aria-label', 'Edit tooltip');
        field.setAttribute('aria-multiline', 'true');
        field.innerHTML = initial;
        let cancelled = false;
        field.addEventListener('keydown', (event) => {
          if (event.key !== 'Escape') return;
          cancelled = true;
          editor.commands.focus();
          instance.hide();
        });
        field.addEventListener('blur', () => {
          if (
            cancelled ||
            editor.isDestroyed ||
            !reference.isConnected ||
            field.innerHTML === initial
          ) {
            instance.hide();
            return;
          }
          const from = editor.view.posAtDOM(reference, 0);
          const to = editor.view.posAtDOM(
            reference,
            reference.childNodes.length,
          );
          const selection = {
            from: editor.state.selection.from,
            to: editor.state.selection.to,
          };
          const chain = editor.chain().setTextSelection({ from, to });
          if (field.innerHTML)
            chain.setMark('tooltip', {
              'data-tooltip-content': field.innerHTML,
              activeLink: reference.getAttribute('activelink') === 'true',
            });
          else chain.unsetMark('tooltip');
          chain.setTextSelection(selection).run();
          instance.hide();
        });
        instance.setContent(field);
        return undefined;
      },
    });
    return () => {
      for (const popup of Array.isArray(popups) ? popups : [popups])
        popup.destroy();
    };
  }, [editor]);
  return <OriginalTooltipUI {...props} />;
}
