export type TextRun = { text: string; bold?: boolean; italic?: boolean };
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
    title: 'Make room for good ideas',
    description: 'A few notes on finding the space to create.',
    blocks: [
      {
        type: 'text',
        style: 'heading',
        runs: [{ text: 'Start with a little space' }],
      },
      {
        type: 'text',
        style: 'paragraph',
        runs: [
          {
            text: 'A quiet corner. An open notebook. A few minutes without a plan. Sometimes the best way to begin is to ',
          },
          { text: 'make a little room', bold: true },
          { text: ' and see what shows up.' },
        ],
      },
      {
        type: 'text',
        style: 'quote',
        runs: [
          { text: 'You don’t need the whole picture to take the first step.' },
        ],
      },
      {
        type: 'text',
        style: 'paragraph',
        runs: [
          {
            text: 'Collect what catches your attention. Follow the questions. Give an unfinished idea enough time to become something worth sharing.',
          },
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

export function renderBlocks(blocks: Block[]): string {
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
      const content = block.runs
        .map((run) => {
          let text = escapeHTML(run.text).replace(/\n/g, '<br>');
          if (run.bold) text = `<strong>${text}</strong>`;
          if (run.italic) text = `<em>${text}</em>`;
          return text;
        })
        .join('');
      return `<${tag}>${content || '<br>'}</${tag}>`;
    })
    .join('');
}
