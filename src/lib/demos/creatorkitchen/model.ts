export const audioClips = {
  hello: {
    file: 'ola-tudo-bem.mp3',
    text: 'Olá, tudo bem?',
  },
  thanks: {
    file: 'obrigado.mp3',
    text: 'Obrigado',
  },
} as const;
export type AudioClip = keyof typeof audioClips;
export function isAudioClip(value: unknown): value is AudioClip {
  return typeof value === 'string' && Object.hasOwn(audioClips, value);
}
export type TextRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  tooltip?: string;
  audio?: AudioClip;
};
export type TextChange =
  | { kind: 'tooltip'; value?: string }
  | { kind: 'audio'; value?: AudioClip }
  | { kind: 'bold' | 'italic'; value?: boolean };

export function updateRuns(
  runs: TextRun[],
  from: number,
  to: number,
  change: TextChange,
): TextRun[] {
  let formatting = false;
  if (change.kind === 'bold' || change.kind === 'italic') {
    const kind = change.kind;
    let position = 0;
    const selected = runs.filter((run) => {
      const start = position;
      position += run.text.length;
      return position > from && start < to && run.text.length > 0;
    });
    formatting = change.value ?? !selected.every((run) => run[kind]);
  }
  const output: TextRun[] = [];
  let offset = 0;
  for (const run of runs) {
    const boundaries = [
      ...new Set([
        0,
        run.text.length,
        Math.max(0, Math.min(run.text.length, from - offset)),
        Math.max(0, Math.min(run.text.length, to - offset)),
      ]),
    ].sort((a, b) => a - b);
    for (let index = 1; index < boundaries.length; index++) {
      const start = boundaries[index - 1];
      const end = boundaries[index];
      if (start === undefined || end === undefined || start === end) continue;
      const piece = { ...run, text: run.text.slice(start, end) };
      if (offset + start >= from && offset + end <= to) {
        if (change.kind === 'tooltip') {
          if (change.value) piece.tooltip = change.value;
          else delete piece.tooltip;
        } else if (change.kind === 'audio') {
          if (change.value) piece.audio = change.value;
          else delete piece.audio;
        } else piece[change.kind] = formatting;
      }
      const previous = output.at(-1);
      if (
        previous &&
        Boolean(previous.bold) === Boolean(piece.bold) &&
        Boolean(previous.italic) === Boolean(piece.italic) &&
        previous.tooltip === piece.tooltip &&
        previous.audio === piece.audio
      )
        previous.text += piece.text;
      else output.push(piece);
    }
    offset += run.text.length;
  }
  return output;
}
export type TextBlock = {
  type: 'text';
  style: 'paragraph' | 'heading' | 'quote';
  runs: TextRun[];
};
export type Asset = 'desk' | 'garden';
export type Block = TextBlock | { type: 'image'; asset: Asset };
export type Draft = {
  title: string;
  description: string;
  blocks: Block[];
};

export const assets = {
  desk: {
    title: 'A little space',
    alt: 'Illustration of an open notebook, a coffee cup, and a green plant on a sunlit desk',
    caption: 'A little space for the next good idea.',
  },
  garden: {
    title: 'Fresh perspective',
    alt: 'Illustration of rolling green hills beneath a warm sun',
    caption: 'Good ideas need room to grow.',
  },
} satisfies Record<Asset, { title: string; alt: string; caption: string }>;

export function createDraft(): Draft {
  return {
    title: 'A little Portuguese',
    description: 'A few words for a first conversation.',
    blocks: [
      {
        type: 'text',
        style: 'heading',
        runs: [{ text: 'A first conversation' }],
      },
      {
        type: 'text',
        style: 'paragraph',
        runs: [
          {
            text: 'Olá, tudo bem?',
            tooltip: 'Hello, how are you?',
            audio: 'hello',
          },
          {
            text: ' is a simple way to begin. A short greeting can open a whole conversation.',
          },
        ],
      },
      {
        type: 'text',
        style: 'quote',
        runs: [{ text: 'A few words, used often, become familiar.' }],
      },
      {
        type: 'text',
        style: 'paragraph',
        runs: [
          { text: 'When someone helps, a simple ' },
          { text: 'obrigado', tooltip: 'Thank you.', audio: 'thanks' },
          { text: ' is a good place to start.' },
        ],
      },
    ],
  };
}

export function slugify(title: string): string {
  return (
    title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled'
  );
}

export function publishDraft(draft: Draft): Draft {
  if (!draft.title.trim()) throw new Error('Title is required.');
  if (
    !draft.blocks.some(
      (block) =>
        block.type === 'image' || block.runs.some((run) => run.text.trim()),
    )
  ) {
    throw new Error('Add some content before publishing.');
  }
  return structuredClone({ ...draft, title: draft.title.trim() });
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}

function groupRuns(
  runs: TextRun[],
  key: (run: TextRun) => string | undefined,
): TextRun[][] {
  const groups: TextRun[][] = [];
  let previous: string | undefined;
  for (const run of runs) {
    const value = key(run);
    const group = groups.at(-1);
    if (group && value === previous) group.push(run);
    else groups.push([run]);
    previous = value;
  }
  return groups;
}

export function renderRuns(runs: TextRun[], editable = false): string {
  return groupRuns(runs, (run) =>
    isAudioClip(run.audio) ? run.audio : undefined,
  )
    .map((audioGroup) => {
      const audio = audioGroup[0]?.audio;
      const hasAudio = isAudioClip(audio);
      const content = groupRuns(audioGroup, (run) =>
        run.tooltip?.trim() ? run.tooltip : undefined,
      )
        .map((tooltipGroup) => {
          const text = tooltipGroup
            .map((run) => {
              let value = escapeHTML(run.text).replace(/\n/g, '<br>');
              if (run.bold) value = `<strong>${value}</strong>`;
              if (run.italic) value = `<em>${value}</em>`;
              return value;
            })
            .join('');
          const tooltip = tooltipGroup[0]?.tooltip;
          return tooltip?.trim()
            ? `<span data-type="tooltip" data-tooltip-content="${escapeHTML(tooltip)}"${!editable && !hasAudio ? ' tabindex="0"' : ''}>${text}</span>`
            : text;
        })
        .join('');
      if (!hasAudio) return content;
      const label = escapeHTML(audioGroup.map((run) => run.text).join(''));
      return `<span data-type="audiolink" data-audio-clip="${audio}"${editable ? '' : ` role="button" tabindex="0" aria-pressed="false" aria-label="Play audio: ${label}"`}>${content}</span>`;
    })
    .join('');
}

export function renderBlocks(blocks: Block[], editable = false): string {
  return blocks
    .map((block) => {
      if (block.type === 'image') {
        const asset = assets[block.asset];
        return `<figure data-asset="${block.asset}" contenteditable="false"><img src="/demos/creatorkitchen/${block.asset}.svg" alt="${asset.alt}" width="960" height="540"><figcaption>${asset.caption}</figcaption></figure>`;
      }
      const tag =
        block.style === 'heading'
          ? 'h2'
          : block.style === 'quote'
            ? 'blockquote'
            : 'p';
      const content = renderRuns(block.runs, editable);
      return `<${tag}>${content || '<br>'}</${tag}>`;
    })
    .join('');
}
