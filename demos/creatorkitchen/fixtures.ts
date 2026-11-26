import { lessonContent, lessonDescription, lessonTitle } from './lesson.ts';

export interface Draft {
  id: string;
  title: string;
  description: string;
  content: string;
}
export function createDraft(id: string, first = false): Draft {
  return {
    id,
    title: first ? lessonTitle : 'Untitled',
    description: first ? lessonDescription : '',
    content: first ? lessonContent : '<p></p>',
  };
}
export function updateDraft(
  drafts: Draft[],
  id: string,
  patch: Partial<Pick<Draft, 'title' | 'description' | 'content'>>,
): Draft[] {
  return drafts.map((draft) =>
    draft.id === id ? { ...draft, ...patch } : draft,
  );
}
