import {
  completed,
  factors,
  fields,
  format,
  formulas,
  keys,
  type Inputs,
  type Variable,
} from './finance'

export function Registers({ values, target }: { values: Inputs; target?: Variable }) {
  return (
    <dl className="registers">
      {keys.map((key) => (
        <div key={key}>
          <dt>
            {key}
            {key === target && <span>unknown</span>}
          </dt>
          <dd>{key === target ? '?' : format(values[fields[key]], key)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Timeline({ values }: { values: Inputs }) {
  const n = values.n
  const marks =
    n <= 4 && Number.isInteger(n)
      ? Array.from({ length: n + 1 }, (_, i) => i)
      : [0, Math.min(1, n), Math.max(0, n - 1), n]
  const periods = [...new Set(marks)].sort((a, b) => a - b)
  return (
    <section className="timeline" aria-label="Cash-flow timeline">
      <h3>Follow the cash flows</h3>
      <p className="muted">
        One perspective throughout: + received, − paid.{' '}
        {values.due ? 'BGN payments run from 0 to N−1.' : 'END payments run from 1 to N.'}
      </p>
      <div className="timeline-track">
        {periods.map((t) => (
          <div className="timeline-point" key={t}>
            <b>
              {t === n ? 'N = ' : 't = '}
              {Number(t.toFixed(4))}
            </b>
            <i aria-hidden="true" />
            <div>
              {t === 0 && <span>PV {format(values.pv, 'PV')}</span>}
              {values.pmt !== 0 && (values.due ? t < n : t > 0) && (
                <span>PMT {format(values.pmt, 'PMT')}</span>
              )}
              {t === n && <span>FV {format(values.fv, 'FV')}</span>}
            </div>
          </div>
        ))}
      </div>
      {n > 4 && (
        <p className="fine">
          Selected periods shown; equal payments repeat in every payment period between them.
        </p>
      )}
      {!Number.isInteger(n) && (
        <p className="fine">
          Fractional N uses the mathematical annuity extension. A schedule with whole payments needs
          separate rounding and a final-payment calculation.
        </p>
      )}
    </section>
  )
}

export default function Explanation({ values, target }: { values: Inputs; target: Variable }) {
  let x = values,
    computed = { r: 0, growth: 0, annuity: 0 },
    message = ''
  try {
    x = completed(target, values)
    computed = factors(x)
  } catch (error) {
    message = (error as Error).message
  }
  if (message)
    return (
      <p role="alert" className="feedback error">
        {message}
      </p>
    )
  const { r, growth, annuity } = computed
  const d = x.due ? 1 + r : 1
  const num = (value: number) => value.toLocaleString('en-CA', { maximumFractionDigits: 6 })
  const substitution =
    target === 'FV'
      ? `−(${num(x.pv)} × ${num(growth)} + ${num(x.pmt)} × ${num(annuity)})`
      : target === 'PV'
        ? `−(${num(x.fv)} + ${num(x.pmt)} × ${num(annuity)}) ÷ ${num(growth)}`
        : target === 'PMT'
          ? `−(${num(x.fv)} + ${num(x.pv)} × ${num(growth)}) ÷ ${num(annuity)}`
          : target === 'N'
            ? r === 0
              ? `−(${num(x.pv)} + ${num(x.fv)}) ÷ ${num(x.pmt)}`
              : `ln[(${num(x.pmt)} × ${num(d)} − ${num(x.fv)} × ${num(r)}) ÷ (${num(x.pv)} × ${num(r)} + ${num(x.pmt)} × ${num(d)})] ÷ ln(1 + ${num(r)})`
            : 'Bracket the nominal annual rate and bisect until the discounted cash-flow equation balances.'
  return (
    <section className="worked">
      <div className="answer-heading">
        <div>
          <p className="eyebrow">Worked solution · {target}</p>
          <h3>{format(x[fields[target]], target)}</h3>
        </div>
        <span>
          {x.due ? 'BGN' : 'END'} · P/Y {x.py} · C/Y {x.cy}
        </span>
      </div>
      <Registers values={values} target={target} />
      <ol className="solution-steps">
        <li>
          <b>Match the time units.</b>
          <p>
            N = {num(x.n)} payment periods; {num(x.n)} ÷ {x.py} = {num(x.n / x.py)} years. I/Y ={' '}
            {num(x.rate)}% nominal annually.
          </p>
          <code>
            r = (1 + {num(x.rate)} ÷ 100 ÷ {x.cy})^({x.cy} ÷ {x.py}) − 1 = {num(r)}
          </code>
          <p className="fine">
            That is {num(r * 100)}% per payment period, entered in the formula as a decimal.
          </p>
        </li>
        <li>
          <b>Build the growth and payment factors.</b>
          <code>G = (1 + r)ᴺ = {num(growth)}</code>
          <code>
            {r === 0 ? `A = N × d = ${num(annuity)}` : `A = [(G − 1) ÷ r] × d = ${num(annuity)}`}
          </code>
          <p>
            d = {num(d)} ({x.due ? '1 + r for BGN' : '1 for END'}). Factors shown rounded;
            calculations keep full precision.
          </p>
        </li>
        <li>
          <b>Balance the cash flows and solve.</b>
          <code>PV × G + PMT × A + FV = 0</code>
          <code>{target === 'N' && r === 0 ? 'N = −(PV + FV) ÷ PMT' : formulas[target]}</code>
          <code>{substitution}</code>
          <p>
            <strong>
              {target} = {format(x[fields[target]], target)}
            </strong>
          </p>
        </li>
      </ol>
      {['PV', 'PMT', 'FV'].includes(target) && (
        <p className="note">
          The {x[fields[target]] < 0 ? 'negative' : 'positive'} answer means cash{' '}
          {x[fields[target]] < 0 ? 'leaves' : 'comes to'} the chosen person. Keep that perspective
          for every entry.
        </p>
      )}
      <Timeline values={x} />
    </section>
  )
}
