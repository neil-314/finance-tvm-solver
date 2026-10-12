import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeProperties } from '../src/analyticsPayload.ts'

test('telemetry allowlist removes answers, amounts, personal data and automatic URLs', () => {
  assert.deepEqual(
    safeProperties({
      distinct_id: 'anonymous',
      question: 'growth',
      correct: true,
      hints: 1,
      solution_revealed: false,
      utm_source: 'classmates',
      is_test: true,
      answer: '1157.63',
      pv: -1000,
      email: 'example@example.com',
      $current_url: 'https://example.com/?private=1',
      $referrer: 'https://private.example/',
      $initial_current_url: 'https://example.com/?private=1',
      $ip: '127.0.0.1',
    }),
    {
      distinct_id: 'anonymous',
      question: 'growth',
      correct: true,
      hints: 1,
      solution_revealed: false,
      utm_source: 'classmates',
      is_test: true,
    },
  )
})
