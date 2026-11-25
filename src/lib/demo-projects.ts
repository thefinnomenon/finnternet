export const demoProjects = {
  instamosaic: { title: 'InstaMosaic', username: 'neymarjr' },
  facereel: { title: 'FaceReel', username: 'cristiano' },
} as const;

export type DemoProject = keyof typeof demoProjects;

export function isDemoProject(value: unknown): value is DemoProject {
  return typeof value === 'string' && Object.hasOwn(demoProjects, value);
}
