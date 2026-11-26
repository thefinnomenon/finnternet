import type { translations } from './i18n';

interface WorkEntry {
  company: string;
  href?: string;
  roleKey: keyof typeof translations.en;
  descriptionKey?: keyof typeof translations.en;
  locationKey?: keyof typeof translations.en;
  startedOn: string;
  endedOn: string;
}

export const whistleWork = {
  company: 'Whistle LLC',
  href: '/work/whistle/',
  roleKey: 'founder',
  descriptionKey: 'whistleDescription',
  startedOn: '2025-09',
  endedOn: '2026-09',
} as const;

export const workEntries: readonly WorkEntry[] = [
  whistleWork,
  {
    company: 'Paragraph LLC',
    href: 'https://paragraph.com/',
    roleKey: 'seniorSoftwareEngineer',
    descriptionKey: 'paragraphWorkDescription',
    locationKey: 'remoteLocation',
    startedOn: '2022-08',
    endedOn: '2025-09',
  },
  {
    company: 'Freelance',
    roleKey: 'fullStackEngineer',
    descriptionKey: 'freelanceWorkDescription',
    locationKey: 'greaterBostonLocation',
    startedOn: '2015-03',
    endedOn: '2022-08',
  },
  {
    company: 'Saugus Fire Department',
    roleKey: 'firefighter',
    locationKey: 'saugusLocation',
    startedOn: '2015-03',
    endedOn: '2017-03',
  },
  {
    company: 'MITRE',
    roleKey: 'cyberResearcher',
    startedOn: '2013-07',
    endedOn: '2015-06',
  },
  {
    company: 'MIT Lincoln Laboratory',
    roleKey: 'cyberAssessmentIntern',
    descriptionKey: 'lincolnWorkDescription',
    locationKey: 'lexingtonLocation',
    startedOn: '2012-06',
    endedOn: '2012-08',
  },
  {
    company: 'University of Massachusetts Amherst',
    roleKey: 'undergraduateInstructorsAssistant',
    descriptionKey: 'engineeringLabWorkDescription',
    locationKey: 'amherstLocation',
    startedOn: '2011-09',
    endedOn: '2011-12',
  },
  {
    company: 'University of Massachusetts Amherst',
    roleKey: 'undergraduateResearchAssistant',
    descriptionKey: 'nfcResearchWorkDescription',
    startedOn: '2011-05',
    endedOn: '2011-08',
  },
  {
    company: 'University of Massachusetts Amherst',
    roleKey: 'undergraduateInstructingAssistant',
    descriptionKey: 'introEngineeringWorkDescription',
    startedOn: '2010-09',
    endedOn: '2010-12',
  },
];

export const educationEntries = [
  {
    school: 'Massachusetts Institute of Technology',
    qualificationKeys: ['mitEntrepreneurshipBootcamp'],
    startedOn: '2017',
    endedOn: '2018',
  },
  {
    school: 'Northeastern University',
    qualificationKeys: ['mastersElectricalComputerEngineering'],
    startedOn: '2014',
    endedOn: '2015',
  },
  {
    school: 'University of Massachusetts Amherst',
    qualificationKeys: [
      'bachelorsComputerScience',
      'bachelorsComputerSystemsEngineering',
    ],
    startedOn: '2009',
    endedOn: '2013',
  },
] as const;

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
