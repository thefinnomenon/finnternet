/** Synthetic games and players. Question wording and scoring follow the retired app. */
export type Sport = 'basketball' | 'football';
export type Team =
  | 'GSW'
  | 'LAL'
  | 'BOS'
  | 'NYK'
  | 'MIA'
  | 'CHI'
  | 'KC'
  | 'BUF'
  | 'PHI'
  | 'DAL'
  | 'BAL'
  | 'CIN'
  | 'SF'
  | 'SEA'
  | 'DEN'
  | 'MIL'
  | 'CLE'
  | 'SAC'
  | 'GB'
  | 'DET'
  | 'PIT'
  | 'LAR';
export interface ReplayGame {
  id: string;
  away: Team;
  home: Team;
  sport: Sport;
  day: number;
  time: string;
  players: number;
  prize: number;
}
export const scheduleDays = [
  { label: 'SAT', day: 14 },
  { label: 'SUN', day: 15 },
  { label: 'MON', day: 16 },
  { label: 'TUE', day: 17 },
  { label: 'WED', day: 18 },
  { label: 'THU', day: 19 },
  { label: 'FRI', day: 20 },
] as const;
const teamsBySport: Record<Sport, readonly Team[]> = {
  basketball: [
    'GSW',
    'BOS',
    'MIA',
    'DAL',
    'DEN',
    'CLE',
    'SAC',
    'MIL',
    'PHI',
    'CHI',
    'NYK',
    'LAL',
  ],
  football: [
    'KC',
    'PHI',
    'BAL',
    'SF',
    'GB',
    'PIT',
    'LAR',
    'DET',
    'SEA',
    'CIN',
    'DAL',
    'BUF',
  ],
};
const timesBySport = {
  basketball: [
    '6:00 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '9:00 PM',
    '10:00 PM',
  ],
  football: ['1:00 PM', '1:00 PM', '4:05 PM', '4:25 PM', '7:15 PM', '8:20 PM'],
};
// A deterministic fixture week keeps the demo repeatable without live schedules.
export const games: readonly ReplayGame[] = scheduleDays.flatMap(
  ({ day }, dayIndex) =>
    (['basketball', 'football'] as const).flatMap((sport) => {
      const teams = teamsBySport[sport];
      return Array.from({ length: 6 }, (_, index): ReplayGame => {
        const away = teams[(index + dayIndex) % teams.length];
        const home =
          teams[(teams.length - 1 - index + dayIndex) % teams.length];
        if (!away || !home)
          throw new Error('Whistle schedule needs twelve teams per sport.');
        const id =
          day === 14 && index === 0
            ? sport === 'basketball'
              ? 'golden-los-angeles'
              : 'kansas-buffalo'
            : day === 14 && index === 1 && sport === 'basketball'
              ? 'boston-new-york'
              : `${sport}-${day}-${away.toLowerCase()}-${home.toLowerCase()}`;
        return {
          id,
          sport,
          away,
          home,
          day,
          time: timesBySport[sport][index] ?? '7:00 PM',
          players: 18 + ((dayIndex * 13 + index * 7) % 45),
          prize:
            [250, 500, 750, 1000, 1500, 2000][(dayIndex + index) % 6] ?? 500,
        };
      });
    }),
);
export interface ReplayQuestion {
  id: string;
  sport: Sport;
  text: string;
  points: number;
  choices: readonly { id: string; label: string }[];
  answer: string;
  result: string;
}
export const questions: readonly ReplayQuestion[] = [
  {
    id: 'next-score',
    sport: 'basketball',
    text: 'Which team will score next?',
    points: 10,
    choices: [
      { id: 'away', label: 'away' },
      { id: 'home', label: 'home' },
    ],
    answer: 'away',
    result: 'away scores a two-point basket.',
  },
  {
    id: 'three',
    sport: 'basketball',
    text: 'Will the next shot be a 3?',
    points: 10,
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    answer: 'yes',
    result: 'The next shot is a three-point attempt.',
  },
  {
    id: 'quarter',
    sport: 'basketball',
    text: 'Which team will score more points this quarter?',
    points: 15,
    choices: [
      { id: 'away', label: 'away' },
      { id: 'home', label: 'home' },
      { id: 'tie', label: 'Tie' },
    ],
    answer: 'home',
    result: 'home finishes the quarter ahead, 28–25.',
  },
  {
    id: 'drive-score',
    sport: 'football',
    text: 'Will the offense score on this drive?',
    points: 10,
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    answer: 'yes',
    result: 'The offense scores a touchdown.',
  },
  {
    id: 'next-pass',
    sport: 'football',
    text: 'Will the next play be a pass?',
    points: 10,
    choices: [
      { id: 'pass', label: 'Pass' },
      { id: 'run', label: 'Run' },
    ],
    answer: 'pass',
    result: 'The quarterback completes a pass.',
  },
  {
    id: 'field-goal',
    sport: 'football',
    text: 'Field goal attempt result?',
    points: 10,
    choices: [
      { id: 'good', label: 'Good' },
      { id: 'miss', label: 'Miss' },
    ],
    answer: 'good',
    result: 'The field goal is good.',
  },
  {
    id: 'turnover',
    sport: 'football',
    text: 'Will the defense force a turnover?',
    points: 10,
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    answer: 'no',
    result: 'The offense keeps possession.',
  },
  {
    id: 'five-yards',
    sport: 'football',
    text: 'Will the next play gain 5+ yards?',
    points: 10,
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    answer: 'yes',
    result: 'The next play gains eight yards.',
  },
  {
    id: 'sack',
    sport: 'football',
    text: 'Will the QB be sacked on this drive?',
    points: 10,
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    answer: 'no',
    result: 'The quarterback avoids a sack.',
  },
];
export interface Prediction {
  choice: string;
  state: 'closed' | 'resolved';
}
export interface Replay {
  gameId: string;
  score: number;
  questionIds: readonly string[];
  questionSequence: number;
  expiresAt: Readonly<Partial<Record<string, number>>>;
  expiredQuestionIds: readonly string[];
  predictions: Readonly<Partial<Record<string, Prediction>>>;
}
export function createReplay(gameId: string): Replay {
  return {
    gameId,
    score: 0,
    questionIds: [],
    questionSequence: 0,
    expiresAt: {},
    expiredQuestionIds: [],
    predictions: {},
  };
}
export function replayQuestions(replay: Replay): ReplayQuestion[] {
  return replay.questionIds.flatMap((id) => {
    const template = questions.find(
      (question) => question.id === id.split(':')[0],
    );
    return template ? [{ ...template, id }] : [];
  });
}
export function triggerQuestion(replay: Replay, now = Date.now()): Replay {
  if (nextNotificationQuestion(replay)) return replay;
  const sport = games.find((game) => game.id === replay.gameId)?.sport;
  const bank = questions.filter((question) => question.sport === sport);
  const template = bank[replay.questionSequence % bank.length];
  if (!template) return replay;
  const round = Math.floor(replay.questionSequence / bank.length) + 1;
  const id = round === 1 ? template.id : `${template.id}:${round}`;
  const questionIds = [...replay.questionIds, id].slice(-20);
  const keep = new Set(questionIds);
  return {
    ...replay,
    questionIds,
    questionSequence: replay.questionSequence + 1,
    expiresAt: {
      ...Object.fromEntries(
        Object.entries(replay.expiresAt).filter(([key]) => keep.has(key)),
      ),
      [id]: now + 30_000,
    },
    predictions: Object.fromEntries(
      Object.entries(replay.predictions).filter(([key]) => keep.has(key)),
    ),
    expiredQuestionIds: replay.expiredQuestionIds.filter((key) =>
      keep.has(key),
    ),
  };
}
export function nextNotificationQuestion(
  replay: Replay,
): ReplayQuestion | undefined {
  return replayQuestions(replay).find(
    (question) =>
      !replay.expiredQuestionIds.includes(question.id) &&
      !replay.predictions[question.id],
  );
}
export function answerQuestion(
  replay: Replay,
  questionId: string,
  choice: string,
  now = Date.now(),
): Replay {
  const question = replayQuestions(replay).find(
    (item) => item.id === questionId,
  );
  if (
    !question ||
    !replay.questionIds.includes(questionId) ||
    replay.expiredQuestionIds.includes(questionId) ||
    (replay.expiresAt[questionId] ?? 0) <= now ||
    replay.predictions[questionId] ||
    !question.choices.some((item) => item.id === choice)
  )
    return replay;
  return {
    ...replay,
    predictions: {
      ...replay.predictions,
      [questionId]: { choice, state: 'closed' },
    },
  };
}
export function resolveQuestion(replay: Replay, questionId: string): Replay {
  const question = replayQuestions(replay).find(
    (item) => item.id === questionId,
  );
  const prediction = replay.predictions[questionId];
  if (!question || !prediction || prediction.state === 'resolved')
    return replay;
  return {
    ...replay,
    score:
      replay.score +
      (prediction.choice === question.answer ? question.points : 0),
    predictions: {
      ...replay.predictions,
      [questionId]: { ...prediction, state: 'resolved' },
    },
  };
}
export function questionSecondsRemaining(
  replay: Replay,
  questionId: string,
  now = Date.now(),
): number {
  return Math.max(
    0,
    Math.ceil(((replay.expiresAt[questionId] ?? 0) - now) / 1000),
  );
}
export function expireQuestion(
  replay: Replay,
  questionId: string,
  now = Date.now(),
): Replay {
  if (
    !replay.questionIds.includes(questionId) ||
    replay.predictions[questionId] ||
    replay.expiredQuestionIds.includes(questionId) ||
    questionSecondsRemaining(replay, questionId, now) > 0
  )
    return replay;
  return {
    ...replay,
    expiredQuestionIds: [...replay.expiredQuestionIds, questionId],
  };
}
export function getLeaderboard(
  replay: Replay,
): { name: string; score: number; place: number; current: boolean }[] {
  const players = [
    { name: 'Court Vision', score: 20, current: false },
    { name: 'Swish', score: 15, current: false },
    { name: 'Fast Break', score: 10, current: false },
    { name: 'Awesome User', score: replay.score, current: true },
  ].sort((a, b) => b.score - a.score);
  let place = 1;
  return players.map((player, index) => {
    if (index > 0 && player.score !== players[index - 1]?.score)
      place = index + 1;
    return { ...player, place };
  });
}
export function teamLabel(value: string, game: ReplayGame): string {
  return value.replaceAll('away', game.away).replaceAll('home', game.home);
}
export function teamImage(team: Team, game: ReplayGame): string {
  return game.sport === 'football'
    ? `/demos/whistle/nfl/${team}.jpg`
    : `/demos/whistle/${team}.png`;
}
