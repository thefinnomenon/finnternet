import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createReplay,
  answerQuestion,
  resolveQuestion,
  getLeaderboard,
  games,
  questions,
  nextNotificationQuestion,
  triggerQuestion,
  expireQuestion,
  questionSecondsRemaining,
} from './model.ts';

test('predictions are final, reject invalid choices and award points once', () => {
  const game = games[0];
  const question = questions[0];
  assert.ok(game && question);
  const initial = triggerQuestion(createReplay(game.id));
  assert.equal(answerQuestion(initial, question.id, 'invalid'), initial);
  const answered = answerQuestion(initial, question.id, question.answer);
  assert.equal(answerQuestion(answered, question.id, 'other'), answered);
  const resolved = resolveQuestion(answered, question.id);
  assert.equal(resolved.score, question.points);
  assert.equal(resolveQuestion(resolved, question.id), resolved);
});

test('unanswered and incorrect predictions earn no points', () => {
  const game = games[0];
  const question = questions[0];
  assert.ok(game && question);
  const initial = triggerQuestion(createReplay(game.id));
  assert.equal(resolveQuestion(initial, question.id), initial);
  const wrong = question.choices.find(
    (choice) => choice.id !== question.answer,
  );
  assert.ok(wrong);
  const resolved = resolveQuestion(
    answerQuestion(initial, question.id, wrong.id),
    question.id,
  );
  assert.equal(resolved.score, 0);
  assert.equal(resolved.predictions[question.id]?.state, 'resolved');
});

test('leaderboard includes the current score and shares ranks for ties', () => {
  const game = games[0];
  assert.ok(game);
  const board = getLeaderboard({ ...createReplay(game.id), score: 20 });
  const user = board.find((player) => player.name === 'Awesome User');
  assert.equal(user?.score, 20);
  assert.equal(user?.place, 1);
  assert.equal(board.filter((player) => player.place === 1).length, 2);
  assert.equal(board.at(-1)?.place, 4);
});

test('practice questions arrive one at a time and cannot be answered before triggering', () => {
  const initial = createReplay('golden-los-angeles');
  assert.equal(nextNotificationQuestion(initial), undefined);
  assert.equal(answerQuestion(initial, 'next-score', 'away'), initial);
  const triggered = triggerQuestion(initial);
  assert.deepEqual(triggered.questionIds, ['next-score']);
  assert.equal(triggerQuestion(triggered), triggered);
  const answered = answerQuestion(triggered, 'next-score', 'away');
  assert.equal(nextNotificationQuestion(answered), undefined);
  assert.equal(
    nextNotificationQuestion(triggerQuestion(answered))?.id,
    'three',
  );
});

test('questions continue into fresh rounds without reusing submitted predictions', () => {
  let replay = createReplay('golden-los-angeles');
  replay = answerQuestion(triggerQuestion(replay), 'next-score', 'away');
  replay = resolveQuestion(replay, 'next-score');
  replay = answerQuestion(triggerQuestion(replay), 'three', 'yes');
  replay = answerQuestion(triggerQuestion(replay), 'quarter', 'home');
  assert.equal(nextNotificationQuestion(replay), undefined);
  const continued = triggerQuestion(replay);
  const next = nextNotificationQuestion(continued);
  assert.equal(next?.text, 'Which team will score next?');
  assert.equal(next?.id, 'next-score:2');
  assert.notEqual(answerQuestion(continued, 'next-score:2', 'away'), continued);
});

test('football uses the original practice questions and stays separate from basketball', () => {
  const initial = triggerQuestion(createReplay('kansas-buffalo'));
  assert.equal(
    nextNotificationQuestion(initial)?.text,
    'Will the offense score on this drive?',
  );
  assert.equal(answerQuestion(initial, 'next-score', 'away'), initial);
  const answered = resolveQuestion(
    answerQuestion(initial, 'drive-score', 'yes'),
    'drive-score',
  );
  assert.equal(answered.score, 10);
  assert.equal(
    nextNotificationQuestion(triggerQuestion(answered))?.text,
    'Will the next play be a pass?',
  );
  assert.equal(
    nextNotificationQuestion(
      triggerQuestion(createReplay('golden-los-angeles')),
    )?.id,
    'next-score',
  );
});

test('the 30 second countdown closes unanswered questions and rejects late answers', () => {
  const replay = triggerQuestion(createReplay('golden-los-angeles'), 1000);
  assert.equal(questionSecondsRemaining(replay, 'next-score', 1000), 30);
  assert.equal(questionSecondsRemaining(replay, 'next-score', 30001), 1);
  assert.equal(expireQuestion(replay, 'next-score', 30000), replay);
  assert.notEqual(answerQuestion(replay, 'next-score', 'away', 30999), replay);
  assert.equal(answerQuestion(replay, 'next-score', 'away', 31000), replay);
  const expired = expireQuestion(replay, 'next-score', 31000);
  assert.equal(questionSecondsRemaining(expired, 'next-score', 90000), 0);
  assert.equal(expired.score, 0);
  assert.equal(nextNotificationQuestion(expired), undefined);
  assert.equal(expireQuestion(expired, 'next-score', 32000), expired);
  assert.equal(
    nextNotificationQuestion(triggerQuestion(expired, 35000))?.id,
    'three',
  );
});

test('both sports have six distinct matchups on every day of the fixed week', () => {
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);
  for (const sport of ['basketball', 'football']) {
    for (let day = 14; day <= 20; day++) {
      const scheduled = games.filter(
        (game) => game.sport === sport && game.day === day,
      );
      assert.equal(scheduled.length, 6, `${sport} day ${day}`);
      assert.equal(
        new Set(scheduled.flatMap((game) => [game.away, game.home])).size,
        12,
      );
      assert.ok(scheduled.every((game) => game.prize > 0 && game.players > 0));
    }
  }
});

test('continuous play retains a bounded recent history and cumulative score', () => {
  let replay = createReplay('golden-los-angeles');
  for (let index = 0; index < 60; index++) {
    replay = triggerQuestion(replay, index * 5000);
    const question = nextNotificationQuestion(replay);
    assert.ok(question);
    replay = resolveQuestion(
      answerQuestion(replay, question.id, question.answer, index * 5000 + 1000),
      question.id,
    );
  }
  assert.equal(replay.score, 700);
  assert.equal(replay.questionIds.length, 20);
  assert.equal(Object.keys(replay.predictions).length, 20);
  assert.equal(Object.keys(replay.expiresAt).length, 20);
  assert.equal(answerQuestion(replay, 'next-score', 'away', 400000), replay);
});
