/** Synthetic games and players. Question wording and scoring follow the retired app. */
export type Team = 'GSW' | 'LAL' | 'BOS' | 'NYK' | 'MIA' | 'CHI';
export interface ReplayGame {
  id: string;
  away: Team;
  home: Team;
  day: number;
  time: string;
  players: number;
  prize: number;
}
export const games: readonly ReplayGame[] = [
  {
    id: 'golden-los-angeles',
    away: 'GSW',
    home: 'LAL',
    day: 14,
    time: '7:30 PM',
    players: 23,
    prize: 500,
  },
  {
    id: 'boston-new-york',
    away: 'BOS',
    home: 'NYK',
    day: 14,
    time: '8:00 PM',
    players: 18,
    prize: 300,
  },
  {
    id: 'miami-chicago',
    away: 'MIA',
    home: 'CHI',
    day: 15,
    time: '7:00 PM',
    players: 12,
    prize: 250,
  },
  {
    id: 'los-angeles-boston',
    away: 'LAL',
    home: 'BOS',
    day: 16,
    time: '8:30 PM',
    players: 31,
    prize: 750,
  },
];
export interface ReplayQuestion {
  id: string;
  text: string;
  points: number;
  choices: readonly { id: string; label: string }[];
  answer: string;
  result: string;
}
export const questions: readonly ReplayQuestion[] = [
  {
    id: 'next-score',
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
];
export interface Prediction {
  choice: string;
  state: 'closed' | 'resolved';
}
export interface Replay {
  gameId: string;
  score: number;
  predictions: Readonly<Partial<Record<string, Prediction>>>;
}
export function createReplay(gameId: string): Replay {
  return { gameId, score: 0, predictions: {} };
}
export function answerQuestion(
  replay: Replay,
  questionId: string,
  choice: string,
): Replay {
  const question = questions.find((item) => item.id === questionId);
  if (
    !question ||
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
  const question = questions.find((item) => item.id === questionId);
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
