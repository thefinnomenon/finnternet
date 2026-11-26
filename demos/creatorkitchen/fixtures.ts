export interface Draft {
  id: string;
  title: string;
  description: string;
  content: string;
}
function audioPhrase(text: string, file: string, translation: string): string {
  const src = `/demos/creatorkitchen/${file}`;
  const click =
    `Array.from(document.getElementsByTagName('audio')).forEach(audio => { audio.pause(); audio.currentTime = 0; }); const audio = document.getElementById("${src}"); if(audio) audio.play();`.replaceAll(
      '"',
      '&quot;',
    );
  return `<span data-type="tooltip" data-tooltip-content="${translation}" activeLink="true"><span data-type="audiolink" src="${src}" title="${file}" onclick="${click}"><audio id="${src}" src="${src}" preload="none"></audio>${text}</span></span>`;
}
export const initialContent = `<h2>A first conversation</h2><p>${audioPhrase('Olá, tudo bem?', 'ola-tudo-bem.mp3', 'Hello, how are you?')} is a simple way to begin. A short greeting can open a whole conversation.</p><blockquote><p>A few words, used often, become familiar.</p></blockquote><p>When someone helps, a simple ${audioPhrase('obrigado', 'obrigado.mp3', 'Thank you.')} is a good place to start.</p>`;
export function createDraft(id: string, first = false): Draft {
  return {
    id,
    title: first ? 'A little Portuguese' : 'Untitled',
    description: first ? 'A few words for a first conversation.' : '',
    content: first ? initialContent : '<p></p>',
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
