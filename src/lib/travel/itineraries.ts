export type Place = readonly [
  name: string,
  longitude: number,
  latitude: number,
];
export type Mode = 'Flight' | 'Drive' | 'Train' | 'Ferry' | 'Underground';
export type Leg = readonly [
  from: Place,
  to: Place,
  mode: Mode,
  inferred?: true,
];

const boston = ['Boston', -71.06, 42.36] as const;
const heathrow = ['Heathrow', -0.45, 51.47] as const;
const sanDiego = ['San Diego', -117.16, 32.72] as const;
const knoxville = ['Knoxville', -83.92, 35.96] as const;
const valencia = ['Valencia', -0.38, 39.47] as const;
const london = ['London', -0.13, 51.51] as const;
const nashville = ['Nashville', -86.78, 36.16] as const;
const madrid = ['Madrid', -3.7, 40.42] as const;
const keflavik = ['Keflavík Airport', -22.61, 63.99] as const;
const reykjavik = ['Reykjavík', -21.94, 64.15] as const;
const fajardo = ['Fajardo', -65.65, 18.34] as const;
const culebra = ['Culebra', -65.3, 18.3] as const;
const cusco = ['Cusco', -71.97, -13.52] as const;
const lima = ['Lima', -77.04, -12.05] as const;
const machuPicchu = ['Machu Picchu', -72.55, -13.16] as const;
const toronto = ['Toronto', -79.38, 43.65] as const;
const niagara = ['Niagara Falls', -79.08, 43.09] as const;
const jersey = ['New Jersey', -74.67, 40.19] as const;
const virginia = ['Virginia', -78.65, 37.52] as const;
const newOrleans = ['New Orleans', -90.07, 29.95] as const;
const houston = ['Houston', -95.37, 29.76] as const;
const hondo = ['Hondo', -99.14, 29.35] as const;
const midlothian = ['Midlothian', -97.0, 32.48] as const;
const sanAntonio = ['San Antonio', -98.49, 29.42] as const;
const jobos = ['Jobos Beach', -67.07, 18.51] as const;
const arecibo = ['Arecibo', -66.72, 18.47] as const;
const camuy = ['Camuy Caverns', -66.82, 18.35] as const;
const elYunque = ['El Yunque', -65.79, 18.31] as const;
const sanJuan = ['Old San Juan', -66.12, 18.47] as const;
const lagoon = ['Blue Lagoon', -22.45, 63.88] as const;
const strokkur = ['Strokkur', -20.3, 64.31] as const;

export const itineraries: Readonly<Record<string, readonly Leg[] | undefined>> =
  {
    'travel-toronto-roadtrip': [
      [boston, toronto, 'Drive'],
      [toronto, niagara, 'Drive'],
      [niagara, boston, 'Drive'],
    ],
    'travel-texas-roadtrip': [
      [jersey, virginia, 'Drive', true],
      [virginia, nashville, 'Drive', true],
      [nashville, newOrleans, 'Drive'],
      [newOrleans, houston, 'Drive'],
      [houston, hondo, 'Drive'],
      [hondo, midlothian, 'Drive'],
      [midlothian, sanAntonio, 'Drive'],
      [sanAntonio, boston, 'Flight', true],
    ],
    'travel-tennessee': [
      [boston, knoxville, 'Flight', true],
      [knoxville, nashville, 'Drive'],
    ],
    'travel-san-diego': [
      [nashville, sanDiego, 'Flight'],
      [sanDiego, boston, 'Flight', true],
    ],
    'travel-london': [
      [boston, heathrow, 'Flight', true],
      [heathrow, london, 'Underground', true],
      [london, heathrow, 'Underground', true],
      [heathrow, boston, 'Flight', true],
    ],
    'travel-london-pt-2': [
      [boston, london, 'Flight'],
      [london, ['Cape Town', 18.42, -33.93], 'Flight'],
    ],
    'travel-spain': [
      [boston, ['Barcelona', 2.17, 41.39], 'Flight', true],
      [['Barcelona', 2.17, 41.39], madrid, 'Train'],
      [madrid, ['Toledo', -4.03, 39.86], 'Train'],
      [['Toledo', -4.03, 39.86], madrid, 'Train', true],
      [madrid, valencia, 'Train', true],
      [valencia, boston, 'Flight', true],
    ],
    'travel-peru': [
      [boston, lima, 'Flight', true],
      [lima, cusco, 'Flight'],
      [cusco, machuPicchu, 'Train'],
      [machuPicchu, cusco, 'Train', true],
      [cusco, lima, 'Flight', true],
      [lima, boston, 'Flight', true],
    ],
    'travel-iceland': [
      [boston, keflavik, 'Flight', true],
      [keflavik, strokkur, 'Drive', true],
      [strokkur, ['Gullfoss', -20.12, 64.33], 'Drive', true],
      [
        ['Gullfoss', -20.12, 64.33],
        ['Seljalandsfoss', -19.99, 63.62],
        'Drive',
        true,
      ],
      [['Seljalandsfoss', -19.99, 63.62], reykjavik, 'Drive', true],
      [reykjavik, lagoon, 'Drive', true],
      [lagoon, keflavik, 'Drive', true],
      [keflavik, boston, 'Flight', true],
    ],
    'travel-puerto-rico': [
      [boston, sanJuan, 'Flight', true],
      [sanJuan, elYunque, 'Drive', true],
      [elYunque, camuy, 'Drive', true],
      [camuy, arecibo, 'Drive', true],
      [arecibo, jobos, 'Drive', true],
      [jobos, fajardo, 'Drive', true],
      [fajardo, culebra, 'Ferry'],
      [culebra, fajardo, 'Ferry'],
      [fajardo, sanJuan, 'Drive', true],
      [sanJuan, boston, 'Flight', true],
    ],
  };
