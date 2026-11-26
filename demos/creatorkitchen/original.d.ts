declare module '@creatorkitchen/original' {
  import type { ComponentType } from 'react';
  export const Editor: ComponentType<{
    initialContent: string;
    onChange: (html: string) => void;
    preview?: boolean;
  }>;
}
