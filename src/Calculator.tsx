import { useState } from 'react'
import { track } from './analytics'
import { initialCalculator, press, settings } from './calculatorState'
import { fields, keys } from './finance'
import { questions, type Question } from './learning'
import Explanation, { Registers } from './Explanation'

export function KeySequence({ question }: { question: Question }) {
  return (
    <div className="key-sequence">
      <p>
        <b>Setup:</b> CLR TVM, then P/Y = {question.inputs.py}, C/Y = {question.inputs.cy},{' '}
        {question.inputs.due ? 'BGN' : 'END'}.
      </p>
      {keys
        .filter((k) => k !== question.target)
        .map((k) => (
          <div key={k}>
            <kbd>{Math.abs(question.inputs[fields[k]])}</kbd>
            {question.inputs[fields[k]] < 0 && <kbd>+/−</kbd>}
            <kbd>{k}</kbd>
            <span>store {k}</span>
          </div>
        ))}
      <div>
        <kbd>CPT</kbd>
        <kbd>{question.target}</kbd>
        <span>compute the unknown</span>
      </div>
    </div>
  )
}

export default function Calculator({ example }: { example: Question }) {
  const [selected, setSelected] = useState(example.id)
  const [state, setState] = useState(() => initialCalculator())
  const question = questions.find((q) => q.id === selected)!
  const hit = (key: string) => {
    const next = press(state, key)
    setState(next)
    if (state.mode === 'compute' && keys.includes(key as (typeof keys)[number])) {
      void track('calculator_computed', { target: key, success: !next.error })
    }
  }
  return (
    <div>
      <div className="section-intro">
        <p className="eyebrow">Finance workbook / Calculator bench</p>
        <h1>Financial calculator.</h1>
        <p>
          This trainer follows the store → CPT → variable workflow used by financial calculators. It
          supports the five TVM keys; settings are exposed directly to make them easier to learn.
        </p>
      </div>
      <div className="calculator-layout">
        <section className="calculator-device" aria-label="TVM calculator">
          <div className="device-title">
            <b>TVM / TRAINER</b>
            <button className="text-button" onClick={() => setState(initialCalculator())}>
              Reset all
            </button>
          </div>
          <label className="display-label">
            Calculator entry
            <input
              aria-label="Calculator entry"
              inputMode="decimal"
              value={state.entry}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  entry: e.target.value,
                  fresh: false,
                  mode: 'store',
                  result: null,
                }))
              }
            />
          </label>
          <div className="display-status">
            {state.mode === 'compute'
              ? 'CPT · choose unknown'
              : state.mode === 'recall'
                ? 'RCL · choose variable'
                : 'Ready to store'}{' '}
            <span>{state.values.due ? 'BGN' : 'END'}</span>
          </div>
          <div className="tvm-keys">
            {keys.map((key) => (
              <button key={key} onClick={() => hit(key)}>
                {key}
              </button>
            ))}
          </div>
          <div className="function-keys">
            <button aria-pressed={state.mode === 'compute'} onClick={() => hit('CPT')}>
              CPT
            </button>
            <button aria-pressed={state.mode === 'recall'} onClick={() => hit('RCL')}>
              RCL
            </button>
            <button onClick={() => hit('CLR TVM')}>CLR TVM</button>
          </div>
          <div className="number-keys">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3', '+/−', '0', '.', 'CE', '⌫'].map(
              (key) => (
                <button
                  key={key}
                  aria-label={key === '⌫' ? 'Backspace' : key === '+/−' ? 'Change sign' : key}
                  onClick={() => hit(key)}
                >
                  {key}
                </button>
              ),
            )}
          </div>
          <div className="calculator-settings">
            <label>
              P/Y
              <input
                aria-label="Payments per year"
                type="number"
                min="1"
                max="365"
                value={Number.isNaN(state.values.py) ? '' : state.values.py}
                onChange={(e) => {
                  const value = e.target.value === '' ? NaN : Number(e.target.value)
                  setState((s) => settings(s, { py: value, cy: value }))
                }}
              />
            </label>
            <label>
              C/Y
              <input
                aria-label="Compounds per year"
                type="number"
                min="1"
                max="365"
                value={Number.isNaN(state.values.cy) ? '' : state.values.cy}
                onChange={(e) =>
                  setState((s) =>
                    settings(s, { cy: e.target.value === '' ? NaN : Number(e.target.value) }),
                  )
                }
              />
            </label>
            <label>
              Timing
              <select
                aria-label="Timing"
                value={state.values.due ? 'BGN' : 'END'}
                onChange={(e) => setState((s) => settings(s, { due: e.target.value === 'BGN' }))}
              >
                <option>END</option>
                <option>BGN</option>
              </select>
            </label>
          </div>
          <p className="device-note">
            Changing P/Y also sets C/Y. Change C/Y afterward if the frequencies differ.
          </p>
        </section>
        <section className="memory-panel">
          <p className="eyebrow">Stored TVM values</p>
          <h2>Typing is not storing.</h2>
          <p className="muted">
            Type a number, then press its variable key. Press RCL and a variable to check it. Use
            CPT and the unknown key to calculate.
          </p>
          <Registers values={state.values} />
          <p
            role={state.error ? 'alert' : 'status'}
            className={`feedback ${state.error ? 'error' : ''}`}
          >
            {state.message}
          </p>
          <p className="fine">
            <b>Recent keys:</b> {state.history.join(' → ') || 'None yet'}
          </p>
          <div className="load-example">
            <label htmlFor="calculator-example">Try a worked example</label>
            <select
              id="calculator-example"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {questions.map((q) => (
                <option value={q.id} key={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
            <p>{question.prompt}</p>
            <button
              className="primary"
              onClick={() =>
                setState({
                  ...initialCalculator(question.inputs),
                  message: `Known values loaded. Press CPT, then ${question.target}.`,
                })
              }
            >
              Load known values
            </button>
            <details>
              <summary>Show the keys to enter this manually</summary>
              <KeySequence question={question} />
            </details>
          </div>
        </section>
      </div>
      {state.result && <Explanation values={state.values} target={state.result} />}
      <details className="reference">
        <summary>Using a physical BA II Plus? Settings, differences and limits</summary>
        <p>
          On the physical calculator: use <kbd>2nd</kbd> <kbd>CLR TVM</kbd> to clear the five TVM
          registers. Use <kbd>2nd</kbd> <kbd>P/Y</kbd>, enter P/Y with <kbd>ENTER</kbd>, then{' '}
          <kbd>↓</kbd> to set C/Y. Use <kbd>2nd</kbd> <kbd>QUIT</kbd> to exit. For timing, use{' '}
          <kbd>2nd</kbd> <kbd>BGN</kbd>, then <kbd>2nd</kbd> <kbd>SET</kbd> to toggle, and quit.
        </p>
        <p>
          This is an independent teaching aid, not a complete device emulator or a Texas Instruments
          product. No arithmetic keypad operations, amortization worksheet, uneven cash flows or
          bond worksheets are implemented. N can be fractional; I/Y solving supports nonnegative
          nominal rates up to 10,000% and conventional cash flows only. Money is displayed as CAD;
          the math is currency-independent.
        </p>
        <a
          href="https://education.ti.com/en/customer-support/knowledge-base/financial-calculators/product-usage/11228"
          target="_blank"
          rel="noreferrer"
        >
          Official TI settings guide ↗
        </a>
      </details>
    </div>
  )
}
