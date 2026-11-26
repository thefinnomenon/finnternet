import { demoProjects } from './demo-projects';

export const portfolioDemos = {
  ...demoProjects,
  whistle: { title: 'Whistle' },
  'graphql-algolia-transformer': { title: 'GraphQL Algolia Transformer' },
  creatorkitchen: { title: 'CreatorKitchen' },
} as const;

export type PortfolioDemoProject = keyof typeof portfolioDemos;

export function isPortfolioDemoProject(
  value: unknown,
): value is PortfolioDemoProject {
  return typeof value === 'string' && Object.hasOwn(portfolioDemos, value);
}
