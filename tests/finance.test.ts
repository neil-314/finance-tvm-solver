import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  defaults,
  completed,
  periodicRate,
  presentResidual,
  solve,
  type Inputs,
} from '../src/finance.ts'
import { questions } from '../src/learning.ts'
const x = (values: Partial<Inputs>) => ({ ...defaults, ...values })
function near(actual: number, expected: number, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`)
}

test('lump sum uses opposite PV/FV signs and compound interest', () => {
  near(solve('FV', x({ n: 3, rate: 5, pv: -1000 })), 1157.625)
  near(solve('PV', x({ n: 3, rate: 5, fv: 1157.625 })), -1000)
})
test('ordinary monthly loan payment and remaining balance', () => {
  const loan = x({ n: 36, rate: 6, pv: 12000, py: 12, cy: 12 })
  const pmt = solve('PMT', loan)
  near(pmt, -365.0632494187, 1e-7)
  near(solve('FV', { ...loan, pmt }), 0, 1e-7)
})
test('BGN payment series is shifted exactly one period earlier', () => {
  const a = x({ n: 12, rate: 6, pmt: -500, py: 12, cy: 12 })
  near(solve('PV', { ...a, due: true }), solve('PV', a) * 1.005)
  near(solve('FV', { ...a, due: true }), solve('FV', a) * 1.005)
})
test('different compounding and payment frequencies use equivalent rate', () => {
  const a = x({ n: 12, rate: 6, pv: -1000, py: 12, cy: 2 })
  near(periodicRate(a), Math.pow(1.03, 1 / 6) - 1)
  near(solve('FV', a), 1060.9)
  assert.ok(Math.abs(periodicRate(a) - 0.005) > 0.00001)
})
test('zero rate works for all linear unknowns and for I/Y', () => {
  near(solve('FV', x({ n: 12, pmt: -200 })), 2400)
  near(solve('PV', x({ n: 12, fv: 2400 })), -2400)
  near(solve('PMT', x({ n: 12, fv: 2400 })), -200)
  near(solve('N', x({ pmt: -200, fv: 2400 })), 12)
  near(solve('I/Y', x({ n: 12, pmt: -200, fv: 2400 })), 0)
})
test('N is periods, can be fractional, and is not silently clamped', () => {
  near(solve('N', x({ rate: 7, pv: -1000, fv: 2000 })), 10.2447683511, 1e-9)
  near(solve('N', x({ pv: 1000, pmt: -1 })), 1000)
  assert.throws(() => solve('N', x({ rate: 12, pv: 1000, pmt: -1, py: 12, cy: 12 })), /No finite/)
  assert.throws(() => solve('N', x({ pv: -1000, fv: 2000 })), /cannot be determined/)
})
test('I/Y solves conventional loans and investments, including rates above 100%', () => {
  near(solve('I/Y', x({ n: 2, pv: -1000, fv: 1210 })), 10)
  near(solve('I/Y', x({ n: 1, pv: -100, fv: 400 })), 300)
  const loan = x({ n: 60, rate: 6, pv: 20000, py: 12, cy: 2 })
  near(solve('I/Y', { ...loan, pmt: solve('PMT', loan) }), 6)
})
test('same-sign, multiple-sign-change, negative-rate and indeterminate rate problems report errors', () => {
  assert.throws(() => solve('I/Y', x({ n: 3, pv: 1000, fv: 1200 })), /change of sign/)
  assert.throws(() => solve('I/Y', x({ n: 3, pv: -1000, pmt: 400, fv: -100 })), /change of sign/)
  assert.throws(() => solve('I/Y', x({ n: 3, pv: -1000, fv: 900 })), /negative-rate/)
  assert.throws(() => solve('I/Y', x({ n: 1, pmt: -100, fv: 100 })), /cancel/)
})
test('invalid inputs and overflow are rejected without NaN answers', () => {
  for (const bad of [
    { n: 0 },
    { n: -1 },
    { py: 0 },
    { cy: 1.5 },
    { rate: -100 },
    { pv: NaN },
    { n: 100000, rate: 10000 },
  ]) {
    assert.throws(() => solve('FV', x({ n: 10, pv: -1000, ...bad })))
  }
  assert.ok(Number.isFinite(solve('FV', x({ n: 100, rate: 1e-10, pmt: -1 }))))
})
test('negative known rates above the domain limit are valid for direct solves', () => {
  near(solve('FV', x({ n: 1, rate: -5, pv: -1000 })), 950)
})
test('every educational fixture balances, and all five unknowns are covered', () => {
  assert.equal(new Set(questions.map((q) => q.target)).size, 5)
  for (const q of questions) {
    const solved = completed(q.target, q.inputs)
    near(presentResidual(solved), 0, 1e-7)
    for (const target of ['PV', 'PMT', 'FV'] as const)
      assert.ok(Number.isFinite(solve(target, solved)))
  }
})
