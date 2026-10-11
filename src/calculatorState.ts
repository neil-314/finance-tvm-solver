import { defaults, fields, keys, solve, type Inputs, type Variable } from './finance.ts'

export type CalculatorState = {
  values: Inputs
  entry: string
  fresh: boolean
  mode: 'store' | 'compute' | 'recall'
  message: string
  error: boolean
  history: string[]
  result: Variable | null
}
export function initialCalculator(values = defaults): CalculatorState {
  return {
    values: { ...values },
    entry: '0',
    fresh: true,
    mode: 'store',
    message: 'Type a number, then press a TVM key to store it.',
    error: false,
    history: [],
    result: null,
  }
}

const displayNumber = (value: number) => String(Number(value.toPrecision(12)))

export function press(state: CalculatorState, key: string): CalculatorState {
  const next = { ...state, history: [...state.history, key].slice(-18), error: false }
  if (key === 'CLR TVM')
    return {
      ...initialCalculator({
        ...defaults,
        py: state.values.py,
        cy: state.values.cy,
        due: state.values.due,
      }),
      history: next.history,
      message: 'N, I/Y, PV, PMT and FV cleared. P/Y, C/Y and timing are unchanged.',
    }
  if (key === 'CE')
    return {
      ...next,
      entry: '0',
      fresh: true,
      mode: 'store',
      message: 'Entry cleared. Stored TVM values are unchanged.',
    }
  if (key === 'CPT' || key === 'RCL')
    return {
      ...next,
      mode: key === 'CPT' ? 'compute' : 'recall',
      message:
        key === 'CPT'
          ? 'Now press the unknown TVM key.'
          : 'Now press a TVM key to recall its stored value.',
    }
  if (key === '+/−')
    return {
      ...next,
      entry: state.entry.startsWith('-') ? state.entry.slice(1) : '-' + state.entry,
      fresh: false,
      mode: 'store',
    }
  if (key === '⌫')
    return { ...next, entry: state.entry.slice(0, -1) || '0', fresh: false, mode: 'store' }
  if (/^[0-9.]$/.test(key)) {
    const entry = state.fresh ? (key === '.' ? '0.' : key) : state.entry + key
    if ((entry.match(/\./g) || []).length > 1 || entry.length > 20) return state
    return { ...next, entry, fresh: false, mode: 'store' }
  }
  if (!keys.includes(key as Variable)) return state
  const variable = key as Variable
  try {
    if (state.mode === 'recall')
      return {
        ...next,
        entry: displayNumber(state.values[fields[variable]]),
        fresh: true,
        mode: 'store',
        message: `Recalled ${variable}. Stored values are unchanged.`,
      }
    if (state.mode === 'compute') {
      const result = solve(variable, state.values)
      return {
        ...next,
        values: { ...state.values, [fields[variable]]: result },
        entry: displayNumber(result),
        fresh: true,
        mode: 'store',
        result: variable,
        message: `Computed ${variable}. See the worked explanation below. Display rounded; memory keeps full precision.`,
      }
    }
    const number = Number(state.entry)
    if (!state.entry.trim() || !Number.isFinite(number))
      throw new Error('Enter a valid finite number first.')
    return {
      ...next,
      values: { ...state.values, [fields[variable]]: number },
      fresh: true,
      mode: 'store',
      result: null,
      message: `Stored ${state.entry} in ${variable}.`,
    }
  } catch (error) {
    return { ...next, mode: 'store', result: null, message: (error as Error).message, error: true }
  }
}

export function settings(state: CalculatorState, changes: Partial<Inputs>): CalculatorState {
  return {
    ...state,
    values: { ...state.values, ...changes },
    result: null,
    error: false,
    message: 'Settings updated. Recompute to see the effect.',
  }
}
