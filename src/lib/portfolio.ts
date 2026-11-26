export const whistleWork = {
  company: 'Whistle LLC',
  href: '/work/whistle/',
  roleKey: 'founder',
  descriptionKey: 'whistleDescription',
  startedOn: '2025-09',
  endedOn: '2026-09',
} as const;

export const workEntries = [whistleWork] as const;

export const projectEntries = [
  {
    title: 'Guestography',
    href: '/projects/guestography/',
    descriptionKey: 'guestographyDescription',
  },
  {
    title: 'InstaMosaic',
    href: '/projects/instamosaic/',
    descriptionKey: 'instamosaicDescription',
  },
  {
    title: 'FaceReel',
    href: '/projects/facereel/',
    descriptionKey: 'faceReelDescription',
  },
  {
    title: 'GraphQL Algolia Transformer',
    href: '/projects/graphql-algolia-transformer/',
    descriptionKey: 'graphqlAlgoliaDescription',
  },
  {
    title: 'CreatorKitchen',
    href: '/projects/creatorkitchen/',
    descriptionKey: 'creatorKitchenDescription',
  },
] as const;
