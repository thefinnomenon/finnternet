import { geoDistance, geoInterpolate } from 'd3-geo';
import type { Leg, Mode } from './itineraries';

type Position = [longitude: number, latitude: number];

// Approximate highway corridors from the atlas prototype, ordered for the published trip.
const bostonToNiagara: Position[] = [
  [-71.8, 42.26],
  [-72.59, 42.1],
  [-73.76, 42.65],
  [-76.15, 43.05],
  [-77.61, 43.16],
  [-78.88, 42.89],
];
const niagaraToToronto: Position[] = [
  [-79.25, 43.16],
  [-79.87, 43.26],
  [-79.8, 43.33],
  [-79.64, 43.59],
];
const waypoints: Record<string, Position[] | undefined> = {
  'Boston → Toronto': [
    ...bostonToNiagara,
    [-78.97, 42.91],
    [-79.05, 42.91],
    ...niagaraToToronto,
  ],
  'Toronto → Niagara Falls': [...niagaraToToronto].reverse(),
  'Niagara Falls → Boston': [...bostonToNiagara].reverse(),
};

const speed: Record<Mode, number> = {
  Flight: 745,
  Drive: 85,
  Train: 95,
  Ferry: 25,
  Underground: 28,
};

export function trajectory([from, to, mode]: Leg) {
  const key = `${from[0]} → ${to[0]}`;
  const via = mode === 'Drive' ? waypoints[key] : undefined;
  const points: Position[] = [
    [from[1], from[2]],
    ...(via ?? []),
    [to[1], to[2]],
  ];
  const samples = points.slice(1).flatMap((end, index) => {
    const start = points[index];
    if (!start) return [];
    const interpolate = geoInterpolate(start, end);
    const count = Math.max(1, Math.ceil(geoDistance(start, end) * 40));
    return Array.from({ length: count }, (_, step) =>
      interpolate(step / count),
    );
  });
  samples.push([to[1], to[2]]);
  const km = points.slice(1).reduce((sum, end, index) => {
    const start = points[index];
    return sum + (start ? geoDistance(start, end) * 6371 : 0);
  }, 0);
  return { samples, km, via: Boolean(via) };
}

export function legReadout(leg: Leg) {
  const [from, to, mode] = leg;
  const { km, via } = trajectory(leg);
  const reported: Record<string, number | undefined> = {
    'Boston → Toronto': 540,
    'Knoxville → Nashville': 180,
    'Barcelona → Madrid': 180,
    'Boston → Keflavík Airport': 330,
  };
  const minutes =
    reported[`${from[0]} → ${to[0]}`] ??
    ((km *
      (!via && (mode === 'Drive' || mode === 'Train' || mode === 'Underground')
        ? 1.25
        : 1)) /
      speed[mode]) *
      60 +
      (mode === 'Flight' ? 30 : 0);
  const rounded = Math.max(
    5,
    Math.round(minutes / (minutes >= 120 ? 15 : 5)) * (minutes >= 120 ? 15 : 5),
  );
  return {
    distanceKm: Math.max(1, Math.round(km)),
    minutes: rounded,
    distanceLabel: via ? 'Approximate route distance' : 'Direct distance',
  };
}

export function formatDistance(km: number, language = 'en-US') {
  const region = new Intl.Locale(language).maximize().region;
  const miles = region === 'US' || region === 'GB';
  const distance = Math.max(1, Math.round(miles ? km / 1.609344 : km));
  return `${distance.toLocaleString(language)} ${miles ? 'mi' : 'km'}`;
}

export function formatTravelTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours ? `${hours}h` : '', remainder ? `${remainder}m` : '']
    .filter(Boolean)
    .join(' ');
}
