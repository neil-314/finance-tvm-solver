/** Cash received is positive; cash paid is negative, from one perspective. */
export type Variable = 'N' | 'I/Y' | 'PV' | 'PMT' | 'FV'
export type Inputs = {
  n: number
  rate: number
  pv: number
  pmt: number
  fv: number
  py: number
  cy: number
  due: boolean
}
export const keys: Variable[] = ['N', 'I/Y', 'PV', 'PMT', 'FV']
export const fields = { N: 'n', 'I/Y': 'rate', PV: 'pv', PMT: 'pmt', FV: 'fv' } as const
export const defaults: Inputs = { n: 0, rate: 0, pv: 0, pmt: 0, fv: 0, py: 1, cy: 1, due: false }

function validate(x: Inputs, target: Variable) {
  for (const key of keys) {
    if (key !== target && !Number.isFinite(x[fields[key]]))
      throw new Error(`${key} must be a finite number.`)
  }
  if (![x.py, x.cy].every((v) => Number.isInteger(v) && v >= 1 && v <= 365))
    throw new Error('P/Y and C/Y must be whole numbers from 1 to 365.')
  if (target !== 'N' && (x.n <= 0 || x.n > 100000))
    throw new Error('N must be greater than 0 and at most 100,000 payment periods.')
  if (target !== 'I/Y' && x.rate <= -100 * x.cy)
    throw new Error('The interest rate must keep each compounding factor above zero.')
}

export function periodicRate(x: Inputs) {
  return Math.expm1((Math.log1p(x.rate / 100 / x.cy) * x.cy) / x.py)
}

export function factors(x: Inputs) {
  const r = periodicRate(x)
  const growth = Math.exp(x.n * Math.log1p(r))
  const annuity = (r === 0 ? x.n : Math.expm1(x.n * Math.log1p(r)) / r) * (x.due ? 1 + r : 1)
  if (![r, growth, annuity].every(Number.isFinite) || growth === 0)
    throw new Error('These values exceed the numerical range. Try a smaller rate or fewer periods.')
  return { r, growth, annuity }
}

/** Discounted equation avoids overflow at large trial rates during bisection. */
export function presentResidual(x: Inputs) {
  const r = periodicRate(x),
    discount = Math.exp(-x.n * Math.log1p(r))
  const annuity = (r === 0 ? x.n : -Math.expm1(-x.n * Math.log1p(r)) / r) * (x.due ? 1 + r : 1)
  return x.pv + x.pmt * annuity + x.fv * discount
}

function solveRate(x: Inputs) {
  // Non-conventional cash flows can have multiple rates. Do not return an arbitrary one.
  const signs = [x.pv, x.pmt, x.fv].filter((v) => v !== 0).map(Math.sign)
  const changes = signs.slice(1).filter((sign, i) => sign !== signs[i]).length
  if (changes !== 1)
    throw new Error(
      'To solve I/Y, use cash flows with one change of sign. Multiple or indeterminate rates are outside this trainer.',
    )
  let lo = 0,
    hi = 10000
  let lowValue = presentResidual({ ...x, rate: lo })
  const highValue = presentResidual({ ...x, rate: hi })
  if (Math.abs(lowValue) < 1e-12) {
    if (Math.abs(presentResidual({ ...x, rate: 1 })) < 1e-12)
      throw new Error('These flows cancel without determining an interest rate.')
    return 0
  }
  if (!Number.isFinite(highValue) || Math.sign(lowValue) === Math.sign(highValue))
    throw new Error(
      'No rate found from 0% to 10,000% nominal annual interest. Check signs and values; negative-rate solving is not supported.',
    )
  for (let i = 0; i < 160; i++) {
    const mid = (lo + hi) / 2,
      value = presentResidual({ ...x, rate: mid })
    if (value === 0) return mid
    if (Math.sign(value) === Math.sign(lowValue)) {
      lo = mid
      lowValue = value
    } else hi = mid
  }
  return (lo + hi) / 2
}

export function solve(target: Variable, x: Inputs): number {
  validate(x, target)
  let result: number
  if (target === 'I/Y') result = solveRate(x)
  else if (target === 'N') {
    const r = periodicRate(x),
      p = x.pmt * (x.due ? 1 + r : 1)
    if (r === 0) {
      if (p === 0) throw new Error('With no interest and no payments, time cannot be determined.')
      result = -(x.pv + x.fv) / p
    } else {
      const ratio = (p - x.fv * r) / (x.pv * r + p)
      if (!Number.isFinite(ratio) || ratio <= 0)
        throw new Error(
          'No finite positive N exists. Payments may be too small or signs may be inconsistent.',
        )
      result = Math.log(ratio) / Math.log1p(r)
    }
    if (result <= 0 || result > 100000)
      throw new Error('No supported positive N was found. Check signs, payment and goal.')
  } else {
    const { growth, annuity } = factors(x)
    if (target === 'FV') result = -(x.pv * growth + x.pmt * annuity)
    else if (target === 'PV') result = -(x.fv + x.pmt * annuity) / growth
    else {
      if (annuity === 0) throw new Error('The payment factor is zero; PMT cannot be calculated.')
      result = -(x.fv + x.pv * growth) / annuity
    }
  }
  if (!Number.isFinite(result))
    throw new Error('No finite answer. Check inputs and cash-flow signs.')
  return Object.is(result, -0) ? 0 : result
}

export function completed(target: Variable, x: Inputs): Inputs {
  return { ...x, [fields[target]]: solve(target, x) }
}
export function format(value: number, target: Variable) {
  if (!Number.isFinite(value)) return '—'
  if (target === 'N')
    return `${value.toLocaleString('en-CA', { maximumFractionDigits: 4 })} periods`
  if (target === 'I/Y') return `${value.toLocaleString('en-CA', { maximumFractionDigits: 6 })}%`
  return value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
}
export const formulas: Record<Variable, string> = {
  FV: 'FV = −(PV × G + PMT × A)',
  PV: 'PV = −(FV + PMT × A) ÷ G',
  PMT: 'PMT = −(FV + PV × G) ÷ A',
  N: 'N = ln[(PMT × d − FV × r) ÷ (PV × r + PMT × d)] ÷ ln(1 + r)',
  'I/Y': 'Find I/Y such that PV + PMT × (A ÷ G) + FV ÷ G = 0',
}
