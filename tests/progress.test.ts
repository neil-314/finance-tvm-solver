import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addAttempt, emptyProgress } from '../src/progress.ts'

test('completion is unique, revealed solutions are excluded, and history is bounded', () => {
  let p = emptyProgress()
  const attempt = {
    question: 'growth',
    at: new Date().toISOString(),
    correct: true,
    hints: 1,
    revealed: false,
  }
  for (let i = 0; i < 120; i++) p = addAttempt(p, attempt)
  assert.deepEqual(p.solved, ['growth'])
  assert.equal(p.attempts.length, 100)
  p = addAttempt(p, { ...attempt, question: 'loan', revealed: true })
  p = addAttempt(p, { ...attempt, question: 'discount', correct: false })
  assert.deepEqual(p.solved, ['growth'])
})
