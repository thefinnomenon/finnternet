declare module '@creatorkitchen/original' {
  import type { ComponentType, MutableRefObject } from 'react';
  import type { Editor as TiptapEditor } from '@tiptap/react';
  export const Editor: ComponentType<{
    initialContent: string;
    onChange: (html: string) => void;
    preview?: boolean;
  }>;
  export const TooltipUI: ComponentType<{
    editor: TiptapEditor;
    tooltip: MutableRefObject<'show' | 'hide'>;
  }>;
}
