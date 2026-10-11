import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialCalculator, press, settings } from '../src/calculatorState.ts'

test('typed digits do not change memory until a variable is pressed', () => {
  let state = initialCalculator()
  for (const key of ['1', '0', '0', '0', '+/−']) state = press(state, key)
  assert.equal(state.values.pv, 0)
  state = press(state, 'PV')
  assert.equal(state.values.pv, -1000)
  state = press(state, 'CE')
  assert.equal(state.values.pv, -1000)
  assert.equal(press(press(state, 'RCL'), 'PV').entry, '-1000')
})
test('real key sequence stores four known values and computes a fifth', () => {
  let state = initialCalculator()
  for (const key of [
    '3',
    'N',
    '5',
    'I/Y',
    '1',
    '0',
    '0',
    '0',
    '+/−',
    'PV',
    '0',
    'PMT',
    'CPT',
    'FV',
  ])
    state = press(state, key)
  assert.equal(state.result, 'FV')
  assert.ok(Math.abs(state.values.fv - 1157.625) < 1e-8)
  assert.equal(state.error, false)
})
test('CLR TVM retains frequencies and timing, while reset all uses defaults', () => {
  let state = settings(initialCalculator(), { py: 12, cy: 2, due: true, pv: 20000, n: 60 })
  state = press(state, 'CLR TVM')
  assert.equal(state.values.pv, 0)
  assert.equal(state.values.n, 0)
  assert.deepEqual([state.values.py, state.values.cy, state.values.due], [12, 2, true])
  assert.deepEqual([initialCalculator().values.py, initialCalculator().values.due], [1, false])
})
test('errors leave memory intact and a fresh solve can recover', () => {
  let state = press(press(initialCalculator(), 'CPT'), 'FV')
  assert.equal(state.error, true)
  state = press(press(state, '3'), 'N')
  assert.equal(press(press(state, 'CPT'), 'FV').error, false)
  state = press({ ...state, entry: 'abc', fresh: false }, 'PV')
  assert.equal(state.error, true)
  assert.equal(state.values.pv, 0)
})
