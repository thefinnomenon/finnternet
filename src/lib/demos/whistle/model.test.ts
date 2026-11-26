import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createReplay,
  answerQuestion,
  resolveQuestion,
  getLeaderboard,
  games,
  questions,
} from './model.ts';

test('predictions are final, reject invalid choices and award points once', () => {
  const game = games[0];
  const question = questions[0];
  assert.ok(game && question);
  const initial = createReplay(game.id);
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
  const initial = createReplay(game.id);
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
