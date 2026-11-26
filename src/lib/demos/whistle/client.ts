import {
  answerQuestion,
  createReplay,
  games,
  getLeaderboard,
  questions,
  resolveQuestion,
  teamLabel,
  type Replay,
  type ReplayGame,
  type ReplayQuestion,
} from './model';

type Screen = 'home' | 'lobby' | 'game' | 'leaderboard' | 'settings';
function required<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const node = document.querySelector(selector);
  if (!(node instanceof constructor))
    throw new Error(`Whistle element missing: ${selector}`);
  return node;
}
const dialog = required('#whistle-answer-dialog', HTMLDialogElement);
const questionList = required('#whistle-questions', HTMLDivElement);
const replays = new Map<string, Replay>();
const timers = new Map<number, string>();
let screen: Screen = 'home';
let returnScreen: Screen = 'home';
let activeGame: ReplayGame | undefined;
let selectedQuestion: ReplayQuestion | undefined;
let answerTrigger: HTMLButtonElement | undefined;

function announce(message: string): void {
  required('#whistle-announcement', HTMLParagraphElement).textContent = message;
}
function showScreen(next: Screen): void {
  screen = next;
  for (const name of [
    'home',
    'lobby',
    'game',
    'leaderboard',
    'settings',
  ] as const)
    required(`#whistle-${name}`, HTMLElement).hidden = name !== next;
  window.scrollTo(0, 0);
  const heading = document.querySelector(`#whistle-${next} h1`);
  if (heading instanceof HTMLHeadingElement) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = '',
  className = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}
function team(code: string): HTMLDivElement {
  const node = element('div', '', 'team');
  const logo = element('img');
  logo.src = `/demos/whistle/${code}.png`;
  logo.alt = '';
  logo.width = 112;
  logo.height = 112;
  node.append(logo, element('strong', code));
  return node;
}
function replayFor(game: ReplayGame): Replay {
  return replays.get(game.id) ?? createReplay(game.id);
}
function openGame(game: ReplayGame): void {
  activeGame = game;
  if (replays.has(game.id)) {
    enterGame();
    return;
  }
  required('#whistle-lobby-teams', HTMLDivElement).replaceChildren(
    team(game.away),
    element('b', 'VS'),
    team(game.home),
  );
  required('#whistle-lobby-prize', HTMLElement).textContent = `◉ ${game.prize}`;
  required('#whistle-lobby-date', HTMLSpanElement).textContent =
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeZone: 'UTC',
    }).format(new Date(`2026-11-${game.day}T12:00:00Z`));
  required('#whistle-lobby-time', HTMLSpanElement).textContent = game.time;
  showScreen('lobby');
}
function enterGame(): void {
  const game = activeGame;
  if (!game) return;
  if (!replays.has(game.id)) replays.set(game.id, createReplay(game.id));
  const joinButton = document.querySelector<HTMLButtonElement>(
    `[data-open-game="${game.id}"]`,
  );
  if (joinButton) {
    joinButton.textContent = 'Enter';
    joinButton.setAttribute('aria-label', `Enter ${game.away} vs ${game.home}`);
  }
  const count = document.querySelector(
    `[data-game-card="${game.id}"] .player-count`,
  );
  if (count) count.textContent = '♧ 4';
  const matchup = required('#whistle-game-title', HTMLHeadingElement);
  const away = element('img');
  away.src = `/demos/whistle/${game.away}.png`;
  away.alt = game.away;
  away.width = 44;
  away.height = 44;
  const home = element('img');
  home.src = `/demos/whistle/${game.home}.png`;
  home.alt = game.home;
  home.width = 44;
  home.height = 44;
  matchup.replaceChildren(away, element('span', 'VS'), home);
  required('#whistle-game-prize', HTMLSpanElement).textContent = String(
    game.prize,
  );
  renderQuestions();
  showScreen('game');
}
function renderQuestions(): void {
  const game = activeGame;
  if (!game) return;
  const replay = replayFor(game);
  required('#whistle-score', HTMLElement).textContent = String(replay.score);
  const nodes = questions.map((question) => {
    const prediction = replay.predictions[question.id];
    const resolved = prediction?.state === 'resolved';
    const correct = resolved && prediction.choice === question.answer;
    const state = resolved
      ? correct
        ? 'correct'
        : 'incorrect'
      : prediction
        ? 'closed'
        : 'open';
    const button = element('button', '', 'question');
    button.type = 'button';
    button.dataset.state = state;
    button.dataset.questionId = question.id;
    button.disabled = Boolean(prediction);
    const symbol = element(
      'span',
      resolved ? (correct ? '✓' : '×') : prediction ? '◷' : '◴',
      'question-symbol',
    );
    symbol.setAttribute('aria-hidden', 'true');
    const body = element('span', '', 'question-body');
    body.append(
      element('span', question.text),
      element(
        'span',
        `${correct ? '+' : ''}${question.points} pts`,
        'question-points',
      ),
    );
    if (prediction) {
      const choice = question.choices.find(
        (item) => item.id === prediction.choice,
      );
      const label = teamLabel(choice?.label ?? prediction.choice, game);
      if (resolved && !correct) {
        const text = element('span', '', 'prediction');
        const answer = question.choices.find(
          (item) => item.id === question.answer,
        );
        text.append(
          element('span', 'Incorrect · '),
          element('del', label),
          element(
            'span',
            ` · ${teamLabel(answer?.label ?? question.answer, game)}`,
          ),
        );
        body.append(text);
      } else
        body.append(
          element(
            'span',
            `${correct ? 'Correct · ' : ''}${label}`,
            'prediction',
          ),
        );
      body.append(
        element(
          'span',
          resolved
            ? teamLabel(question.result, game)
            : 'Awaiting the next play…',
          'question-result',
        ),
      );
    } else
      button.addEventListener('click', () => openQuestion(question, button));
    button.append(symbol, body);
    return button;
  });
  questionList.replaceChildren(...nodes);
}
function openQuestion(
  question: ReplayQuestion,
  trigger: HTMLButtonElement,
): void {
  const game = activeGame;
  if (!game || replayFor(game).predictions[question.id]) return;
  selectedQuestion = question;
  answerTrigger = trigger;
  required('#whistle-question-title', HTMLHeadingElement).textContent =
    question.text;
  required('#whistle-question-points', HTMLParagraphElement).textContent =
    `Worth ${question.points} points`;
  required('#whistle-choices', HTMLDivElement).replaceChildren(
    ...question.choices.map((choice) => {
      const button = element(
        'button',
        teamLabel(choice.label, game),
        'primary',
      );
      button.type = 'button';
      button.addEventListener('click', () =>
        submitPrediction(question, choice.id),
      );
      return button;
    }),
  );
  dialog.showModal();
  required('#whistle-choices button', HTMLButtonElement).focus();
}
function submitPrediction(question: ReplayQuestion, choice: string): void {
  const game = activeGame;
  if (!game || selectedQuestion?.id !== question.id) return;
  const replay = replayFor(game);
  const next = answerQuestion(replay, question.id, choice);
  if (next === replay) return;
  replays.set(game.id, next);
  selectedQuestion = undefined;
  dialog.close();
  renderQuestions();
  const leaderboard = required('#whistle-open-leaderboard', HTMLButtonElement);
  leaderboard.focus({ preventScroll: true });
  announce('Prediction submitted. Awaiting the next play.');
  // A short local replay replaces the live sports feed; no provider is contacted.
  const timer = window.setTimeout(() => {
    timers.delete(timer);
    const latest = replays.get(game.id);
    if (!latest) return;
    const resolved = resolveQuestion(latest, question.id);
    replays.set(game.id, resolved);
    if (activeGame?.id === game.id) {
      if (screen === 'game') renderQuestions();
      if (screen === 'leaderboard') renderLeaderboard();
      const correct = choice === question.answer;
      announce(
        `${correct ? `Correct. You earned ${question.points} points.` : 'Incorrect. No points earned.'} ${teamLabel(question.result, game)} Your score is ${resolved.score}.`,
      );
    }
  }, 900);
  timers.set(timer, game.id);
}
function renderLeaderboard(): void {
  if (!activeGame) return;
  const ordinal = (place: number) =>
    `${place}${place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'}`;
  required('#whistle-rankings', HTMLTableSectionElement).replaceChildren(
    ...getLeaderboard(replayFor(activeGame)).map((player) => {
      const row = element('tr');
      row.dataset.current = String(player.current);
      row.append(
        element('td', ordinal(player.place)),
        element('td', player.name),
        element('td', String(player.score)),
      );
      return row;
    }),
  );
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-day]'))
  button.addEventListener('click', () => {
    const day = Number(button.dataset.day);
    for (const date of document.querySelectorAll<HTMLButtonElement>(
      '[data-day]',
    ))
      date.setAttribute('aria-pressed', String(date === button));
    for (const card of document.querySelectorAll<HTMLElement>(
      '[data-card-day]',
    ))
      card.hidden = Number(card.dataset.cardDay) !== day;
  });
for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-open-game]',
))
  button.addEventListener('click', () => {
    const game = games.find((item) => item.id === button.dataset.openGame);
    if (game) openGame(game);
  });
for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-home]',
))
  button.addEventListener('click', () => showScreen('home'));
for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-settings]',
))
  button.addEventListener('click', () => {
    returnScreen = screen;
    showScreen('settings');
  });
required('#whistle-back-settings', HTMLButtonElement).addEventListener(
  'click',
  () => showScreen(returnScreen),
);
required('#whistle-join', HTMLButtonElement).addEventListener(
  'click',
  enterGame,
);
required('#whistle-open-leaderboard', HTMLButtonElement).addEventListener(
  'click',
  () => {
    renderLeaderboard();
    showScreen('leaderboard');
  },
);
required('#whistle-back-game', HTMLButtonElement).addEventListener(
  'click',
  () => showScreen('game'),
);
required('#whistle-leave', HTMLButtonElement).addEventListener('click', () => {
  const game = activeGame;
  if (!game) return;
  for (const [timer, gameId] of timers) {
    if (gameId !== game.id) continue;
    window.clearTimeout(timer);
    timers.delete(timer);
  }
  replays.delete(game.id);
  const joinButton = document.querySelector<HTMLButtonElement>(
    `[data-open-game="${game.id}"]`,
  );
  if (joinButton) {
    joinButton.textContent = 'Join';
    joinButton.setAttribute('aria-label', `Join ${game.away} vs ${game.home}`);
  }
  const count = document.querySelector(
    `[data-game-card="${game.id}"] .player-count`,
  );
  if (count) count.textContent = '♧ 3';
  announce('You left the game.');
  activeGame = undefined;
  showScreen('home');
});
required('#whistle-close-question', HTMLButtonElement).addEventListener(
  'click',
  () => dialog.close(),
);
dialog.addEventListener('close', () => {
  selectedQuestion = undefined;
  if (answerTrigger?.isConnected && !answerTrigger.disabled)
    answerTrigger.focus({ preventScroll: true });
});
window.addEventListener(
  'message',
  (event: MessageEvent<{ type?: string; theme?: string }>) => {
    if (
      event.origin !== location.origin ||
      event.source !== window.parent ||
      !event.data ||
      typeof event.data !== 'object'
    )
      return;
    if (
      event.data.type === 'whistle:theme' &&
      (event.data.theme === 'light' || event.data.theme === 'dark')
    )
      document.documentElement.dataset.theme = event.data.theme;
  },
);
window.addEventListener('pagehide', () => {
  for (const timer of timers.keys()) window.clearTimeout(timer);
});
