import {
  answerQuestion,
  createReplay,
  games,
  getLeaderboard,
  expireQuestion,
  questionSecondsRemaining,
  nextNotificationQuestion,
  replayQuestions,
  resolveQuestion,
  teamLabel,
  teamImage,
  triggerQuestion,
  type Sport,
  type Replay,
  type ReplayGame,
  type ReplayQuestion,
} from './model';

type Screen = 'home' | 'game' | 'leaderboard' | 'settings';
function required<T extends Element>(
  selector: string,
  constructor: { new (): T },
): T {
  const node = document.querySelector(selector);
  if (!(node instanceof constructor))
    throw new Error(`Whistle element missing: ${selector}`);
  return node;
}
const questionList = required('#whistle-questions', HTMLDivElement);
const notification = required('#whistle-notification', HTMLElement);
const notificationChoices = required(
  '#whistle-notification-choices',
  HTMLDivElement,
);
const notificationExpanded = required(
  '#whistle-notification-expanded',
  HTMLDivElement,
);
const notificationPreview = required(
  '#whistle-open-notification',
  HTMLButtonElement,
);
const countdownSeconds = required(
  '#whistle-countdown-seconds',
  HTMLSpanElement,
);
const countdownRing = required('#whistle-countdown-ring', SVGCircleElement);
const replays = new Map<string, Replay>();
const questionDueAt = new Map<string, number>();
const questionGapMs = 1000;
const firstQuestionDelayMs = 1000;
const timers = new Map<number, string>();
let screen: Screen = 'home';
let returnScreen: Screen = 'home';
let activeGame: ReplayGame | undefined;
let answerTrigger: HTMLButtonElement | undefined;
let notificationTimer: number | undefined;
let selectedSport: Sport = 'basketball';
let selectedDay = 14;

function hideNotification(): void {
  const restoreFocus = notification.contains(document.activeElement);
  notification.hidden = true;
  notificationExpanded.hidden = true;
  notification.dataset.expanded = 'false';
  notificationPreview.setAttribute('aria-expanded', 'false');
  if (
    restoreFocus &&
    answerTrigger?.isConnected &&
    !answerTrigger.disabled &&
    answerTrigger.getClientRects().length
  ) {
    answerTrigger.focus({ preventScroll: true });
  } else if (restoreFocus) {
    const target = document.querySelector(`#whistle-${screen} h1`);
    if (target instanceof HTMLHeadingElement) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
}
function clearNotification(): void {
  window.clearTimeout(notificationTimer);
  notificationTimer = undefined;
  hideNotification();
}
function showQuestionNotification(
  game: ReplayGame,
  question: ReplayQuestion,
): void {
  notificationExpanded.hidden = true;
  notification.dataset.expanded = 'false';
  notificationPreview.setAttribute('aria-expanded', 'false');
  required('#whistle-notification-preview', HTMLSpanElement).textContent =
    question.text;
  required('#whistle-notification-title', HTMLHeadingElement).textContent =
    question.text;
  notificationChoices.replaceChildren(
    ...question.choices.map((choice) => {
      const button = element(
        'button',
        teamLabel(choice.label, game),
        'primary',
      );
      button.type = 'button';
      button.addEventListener('click', () => {
        if (activeGame?.id === game.id) submitPrediction(question, choice.id);
      });
      return button;
    }),
  );
  notification.hidden = false;
  updateCountdown();
  announce(
    `Whistle notification. ${question.text} Open the notification to answer.`,
  );
}
function scheduleQuestionNotification(
  delay = firstQuestionDelayMs,
  resume = false,
): void {
  window.clearTimeout(notificationTimer);
  const game = activeGame;
  if (!game || !replays.has(game.id)) return;
  const dueAt =
    (resume ? questionDueAt.get(game.id) : undefined) ?? Date.now() + delay;
  questionDueAt.set(game.id, dueAt);
  notificationTimer = window.setTimeout(
    () => {
      notificationTimer = undefined;
      if (activeGame?.id !== game.id || !replays.has(game.id)) return;
      // Keep a focused notification or open answer sheet stable for keyboard users.
      if (notification.contains(document.activeElement)) {
        scheduleQuestionNotification(1200);
        return;
      }
      questionDueAt.delete(game.id);
      const replay = triggerQuestion(replayFor(game));
      replays.set(game.id, replay);
      if (screen === 'game') renderQuestions();
      const question = nextNotificationQuestion(replay);
      if (!question) {
        hideNotification();
        return;
      }
      showQuestionNotification(game, question);
    },
    Math.max(0, dueAt - Date.now()),
  );
}

function updateCountdown(): void {
  for (const [gameId, replay] of replays) {
    const question = nextNotificationQuestion(replay);
    if (!question) continue;
    const seconds = questionSecondsRemaining(replay, question.id);
    if (seconds === 0) {
      replays.set(gameId, expireQuestion(replay, question.id));
      questionDueAt.set(gameId, Date.now() + questionGapMs);
      if (activeGame?.id === gameId) {
        if (screen === 'game') renderQuestions();
        hideNotification();
        announce('Question closed. The answer window has ended.');
        scheduleQuestionNotification(questionGapMs);
      }
    } else if (activeGame?.id === gameId) {
      countdownSeconds.textContent = String(seconds);
      const remaining = Math.max(
        0,
        (replay.expiresAt[question.id] ?? 0) - Date.now(),
      );
      countdownRing.style.strokeDashoffset = String(
        1 - Math.min(1, remaining / 30_000),
      );
    }
  }
}
const countdownTimer = window.setInterval(updateCountdown, 250);

function announce(message: string): void {
  required('#whistle-announcement', HTMLParagraphElement).textContent = message;
}
function showScreen(next: Screen): void {
  if (next === 'game') renderQuestions();
  if (next === 'leaderboard') renderLeaderboard();
  screen = next;
  for (const name of ['home', 'game', 'leaderboard', 'settings'] as const)
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
function replayFor(game: ReplayGame): Replay {
  return replays.get(game.id) ?? createReplay(game.id);
}
function openGame(game: ReplayGame): void {
  clearNotification();
  activeGame = game;
  enterGame();
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
  const count = document.querySelector(`[data-player-count="${game.id}"]`);
  if (count) {
    count.textContent = String(game.players + 1);
    count.parentElement?.setAttribute(
      'aria-label',
      `${game.players + 1} players`,
    );
  }
  required('#whistle-game-players', HTMLSpanElement).textContent = String(
    game.players + 1,
  );
  const matchup = required('#whistle-game-title', HTMLHeadingElement);
  const away = element('img');
  away.src = teamImage(game.away, game);
  away.alt = game.away;
  away.width = 44;
  away.height = 44;
  const home = element('img');
  home.src = teamImage(game.home, game);
  home.alt = game.home;
  home.width = 44;
  home.height = 44;
  matchup.replaceChildren(away, element('span', 'VS'), home);
  required('#whistle-game-prize', HTMLSpanElement).textContent = String(
    game.prize.toLocaleString('en-US'),
  );
  showScreen('game');
  const resolving = Object.values(replayFor(game).predictions).some(
    (prediction) => prediction?.state === 'closed',
  );
  if (!resolving) scheduleQuestionNotification(firstQuestionDelayMs, true);
}
function renderQuestions(): void {
  const game = activeGame;
  if (!game) return;
  const replay = replayFor(game);
  required('#whistle-score', HTMLElement).textContent = String(replay.score);
  const nodes = replayQuestions(replay).map((question) => {
    const prediction = replay.predictions[question.id];
    const expired = replay.expiredQuestionIds.includes(question.id);
    const resolved = prediction?.state === 'resolved';
    const correct = resolved && prediction.choice === question.answer;
    const state = resolved
      ? correct
        ? 'correct'
        : 'incorrect'
      : expired
        ? 'expired'
        : prediction
          ? 'closed'
          : 'open';
    const button = element('button', '', 'question');
    button.type = 'button';
    button.dataset.state = state;
    button.dataset.questionId = question.id;
    button.disabled = Boolean(prediction) || expired;
    const symbol = element(
      'span',
      resolved ? (correct ? '✓' : '×') : expired ? '×' : prediction ? '◷' : '◴',
      'question-symbol',
    );
    symbol.setAttribute('aria-hidden', 'true');
    const body = element('span', '', 'question-body');
    body.append(element('span', question.text));
    if (expired)
      body.append(
        element('span', 'Question closed · No answer', 'question-result'),
      );
    else if (prediction) {
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
  if (
    !game ||
    replayFor(game).predictions[question.id] ||
    questionSecondsRemaining(replayFor(game), question.id) === 0
  ) {
    updateCountdown();
    return;
  }
  showQuestionNotification(game, question);
  answerTrigger = trigger;
  notificationExpanded.hidden = false;
  notification.dataset.expanded = 'true';
  notificationPreview.setAttribute('aria-expanded', 'true');
  required('#whistle-notification-choices button', HTMLButtonElement).focus();
}

function submitPrediction(question: ReplayQuestion, choice: string): void {
  const game = activeGame;
  if (!game) return;
  const replay = replayFor(game);
  const next = answerQuestion(replay, question.id, choice);
  if (next === replay) {
    updateCountdown();
    return;
  }
  replays.set(game.id, next);
  clearNotification();
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
    questionDueAt.set(game.id, Date.now() + questionGapMs);
    if (activeGame?.id === game.id) {
      if (screen === 'game') renderQuestions();
      if (screen === 'leaderboard') renderLeaderboard();
      announce(
        `Prediction resolved. ${teamLabel(question.result, game)} Your score is ${resolved.score}.`,
      );
      scheduleQuestionNotification(questionGapMs);
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
function filterSchedule(): void {
  for (const card of document.querySelectorAll<HTMLElement>('[data-card-day]'))
    card.hidden =
      Number(card.dataset.cardDay) !== selectedDay ||
      card.dataset.cardSport !== selectedSport;
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-day]'))
  button.addEventListener('click', () => {
    selectedDay = Number(button.dataset.day);
    for (const date of document.querySelectorAll<HTMLButtonElement>(
      '[data-day]',
    ))
      date.setAttribute('aria-pressed', String(date === button));
    filterSchedule();
  });
for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-sport]',
))
  button.addEventListener('click', () => {
    const sport = button.dataset.sport;
    if (sport !== 'basketball' && sport !== 'football') return;
    selectedSport = sport;
    for (const tab of document.querySelectorAll<HTMLButtonElement>(
      '[data-sport]',
    ))
      tab.setAttribute('aria-pressed', String(tab === button));
    filterSchedule();
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
  button.addEventListener('click', () => {
    clearNotification();
    activeGame = undefined;
    showScreen('home');
  });
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
notificationPreview.addEventListener('click', () => {
  const game = activeGame;
  const question = game ? nextNotificationQuestion(replayFor(game)) : undefined;
  if (question) openQuestion(question, notificationPreview);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !notification.hidden) hideNotification();
});
required('#whistle-dismiss-notification', HTMLButtonElement).addEventListener(
  'click',
  hideNotification,
);
type ThemePreference = 'light' | 'dark' | 'system';
let themePreference: ThemePreference = 'system';
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function updateAppearance(): void {
  const label =
    themePreference === 'light'
      ? 'Light'
      : themePreference === 'dark'
        ? 'Dark'
        : 'Auto';
  required('#whistle-theme-label', HTMLSpanElement).textContent = label;
  required('#whistle-appearance', HTMLButtonElement).setAttribute(
    'aria-label',
    `Appearance: ${label}`,
  );
  for (const icon of document.querySelectorAll<HTMLElement>(
    '[data-appearance-icon]',
  ))
    icon.hidden =
      icon.dataset.appearanceIcon !== document.documentElement.dataset.theme;
}
function applyAppearance(): void {
  const theme =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemTheme.matches)
      ? 'dark'
      : 'light';
  document.documentElement.dataset.theme = theme;
  updateAppearance();
  window.parent.postMessage(
    { type: 'whistle:appearance', theme },
    location.origin,
  );
}
required('#whistle-appearance', HTMLButtonElement).addEventListener(
  'click',
  () => {
    themePreference =
      themePreference === 'light'
        ? 'dark'
        : themePreference === 'dark'
          ? 'system'
          : 'light';
    applyAppearance();
  },
);
systemTheme.addEventListener('change', () => {
  if (themePreference === 'system') applyAppearance();
});
applyAppearance();
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
    ) {
      applyAppearance();
    }
  },
);
window.addEventListener('pagehide', () => {
  for (const timer of timers.keys()) window.clearTimeout(timer);
  window.clearTimeout(notificationTimer);
  window.clearInterval(countdownTimer);
});
