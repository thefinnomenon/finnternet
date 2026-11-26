import { createContext } from 'react';
import type { Editor } from '@tiptap/react';

/** Access the original editor's serializer without modifying its implementation. */
export const EditorBridge = createContext<(editor: Editor | null) => void>(
  () => {},
);
