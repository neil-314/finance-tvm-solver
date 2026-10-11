import { useState } from 'react'
import Calculator, { KeySequence } from './Calculator'
import Explanation from './Explanation'
import { solve } from './finance'
import { lessons, questions, type Question } from './learning'
import './App.css'

type Page = 'learn' | 'practice' | 'calculator'

function Lesson({
  index,
  onNext,
  onPractice,
  onCalculator,
}: {
  index: number
  onNext: () => void
  onPractice: (q: Question) => void
  onCalculator: (q: Question) => void
}) {
  const [choice, setChoice] = useState<number | null>(null)
  const lesson = lessons[index],
    question = questions.find((q) => q.id === lesson.question)!
  return (
    <article className="lesson-content">
      <p className="eyebrow">{lesson.tag}</p>
      <h2>{lesson.title}</h2>
      <p className="lesson-body">{lesson.body}</p>
      <div className="rule">{lesson.rule}</div>
      <div className="concept-check">
        <h3>Quick check</h3>
        <p>{lesson.check}</p>
        <div className="button-row">
          {lesson.options.map((option, i) => (
            <button aria-pressed={choice === i} onClick={() => setChoice(i)} key={option}>
              {option}
            </button>
          ))}
        </div>
        {choice !== null && (
          <p
            role="status"
            className={`feedback ${choice === lesson.correct ? 'success' : 'error'}`}
          >
            {choice === lesson.correct ? 'Correct. ' : 'Not quite. '}
            {lesson.feedback}
          </p>
        )}
      </div>
      <section className="lesson-example">
        <p className="eyebrow">Apply it</p>
        <h3>{question.title}</h3>
        <p>{question.prompt}</p>
        <div className="button-row">
          <button className="primary" onClick={() => onPractice(question)}>
            Try this question →
          </button>
          <button onClick={() => onCalculator(question)}>Open in calculator trainer</button>
        </div>
      </section>
      {index < lessons.length - 1 && (
        <button className="text-button next-lesson" onClick={onNext}>
          Next lesson: {lessons[index + 1].title} →
        </button>
      )}
    </article>
  )
}

function Practice({
  question,
  onCalculator,
  onComplete,
  onNext,
  revealed,
  onReveal,
}: {
  question: Question
  onCalculator: (q: Question) => void
  onComplete: (id: string) => void
  onNext: () => void
  revealed: boolean
  onReveal: () => void
}) {
  const [answer, setAnswer] = useState(''),
    [hints, setHints] = useState(0)
  const [feedback, setFeedback] = useState(''),
    [correct, setCorrect] = useState(false)
  const expected = solve(question.target, question.inputs)
  const unit =
    question.target === 'N'
      ? 'payment periods'
      : question.target === 'I/Y'
        ? '% nominal annual interest (enter 10 for 10%)'
        : 'CAD, with the cash-flow sign'
  function check() {
    const value = Number(answer)
    if (!answer.trim() || !Number.isFinite(value)) {
      setCorrect(false)
      setFeedback('Enter a signed number without a currency symbol or commas.')
      return
    }
    const tolerance = question.target === 'N' ? 0.0005 : question.target === 'I/Y' ? 0.0001 : 0.015
    const right = Math.abs(value - expected) <= tolerance
    setCorrect(right)
    if (right) {
      setFeedback(
        revealed
          ? 'That matches the solution. Try another question without revealing the answer.'
          : 'Correct. Now read why it works below.',
      )
      if (!revealed) onComplete(question.id)
    } else if (Math.abs(value + expected) <= tolerance)
      setFeedback(
        'Your magnitude is right, but the sign is reversed. Is this cash received or paid from the chosen perspective?',
      )
    else if (
      question.target === 'N' &&
      Math.abs(value * question.inputs.py - expected) <= tolerance
    )
      setFeedback(
        'That looks like years. This question asks for N in payment periods: multiply years by P/Y.',
      )
    else
      setFeedback(
        'Not quite. Check the cash-flow signs, N, P/Y, C/Y and END/BGN. Use a hint to work through the setup.',
      )
  }
  return (
    <article className="practice-content">
      <p className="eyebrow">
        {question.topic} · Solve {question.target}
      </p>
      <h2>{question.title}</h2>
      <p className="question-prompt">{question.prompt}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          check()
        }}
        className="answer-form"
      >
        <label htmlFor="practice-answer">
          Your answer for {question.target}
          <span>{unit}</span>
        </label>
        <div className="button-row">
          <input
            id="practice-answer"
            inputMode="decimal"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
              setFeedback('')
              setCorrect(false)
            }}
            autoComplete="off"
            placeholder={
              question.target === 'PMT' || question.target === 'PV'
                ? 'e.g. −250 (use a minus sign)'
                : 'Enter your answer'
            }
          />
          <button className="primary" type="submit">
            Check answer
          </button>
        </div>
        <p className="fine">
          Use a keyboard minus (− shown in text means -). Round money to cents, and rates or periods
          to 4 decimal places.
        </p>
      </form>
      {feedback && (
        <p className={`feedback ${correct ? 'success' : 'error'}`} role="status">
          {feedback}
        </p>
      )}
      <div className="button-row practice-actions">
        <button disabled={hints === question.hints.length} onClick={() => setHints(hints + 1)}>
          Get a hint ({hints}/{question.hints.length})
        </button>
        <button onClick={() => onCalculator(question)}>Use calculator trainer</button>
        <button className="text-button" onClick={onReveal}>
          Show worked solution
        </button>
      </div>
      {hints > 0 && (
        <ol className="hints">
          {question.hints.slice(0, hints).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
      {(correct || revealed) && (
        <>
          <p className="takeaway">
            <b>What to notice:</b> {question.takeaway}
          </p>
          <Explanation values={question.inputs} target={question.target} />
          <details className="reference">
            <summary>Calculator keystrokes for this question</summary>
            <KeySequence question={question} />
          </details>
          <button className="primary" onClick={onNext}>
            Next question →
          </button>
        </>
      )}
      <p className="fine">
        Hints are allowed. Revealing the solution does not count as solving the question yourself.
      </p>
    </article>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('learn'),
    [lesson, setLesson] = useState(0),
    [questionId, setQuestionId] = useState(questions[0].id)
  const [example, setExample] = useState(questions[0]),
    [calculatorVersion, setCalculatorVersion] = useState(0)
  const [solved, setSolved] = useState<Set<string>>(() => new Set())
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set())
  const question = questions.find((q) => q.id === questionId)!
  function openCalculator(q: Question) {
    setExample(q)
    setCalculatorVersion((v) => v + 1)
    setPage('calculator')
    window.scrollTo(0, 0)
  }
  function openPractice(q: Question) {
    setQuestionId(q.id)
    setPage('practice')
    window.scrollTo(0, 0)
  }
  function navigate(next: Page) {
    setPage(next)
    window.scrollTo(0, 0)
  }
  return (
    <div className="app">
      <a className="skip-link" href="#content">
        Skip to lesson
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            navigate('learn')
          }}
        >
          <div>
            <strong>TVM Study Desk</strong>
            <small>Financial mathematics · learn & practise</small>
          </div>
        </a>
        <nav aria-label="Main navigation">
          {(['learn', 'practice', 'calculator'] as Page[]).map((p, index) => (
            <button
              key={p}
              aria-current={page === p ? 'page' : undefined}
              onClick={() => navigate(p)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {p === 'calculator' ? 'Calculator trainer' : p === 'learn' ? 'Learn' : 'Practice'}
            </button>
          ))}
        </nav>
      </header>
      <main id="content">
        {page === 'learn' && (
          <>
            <div className="section-intro study-intro">
              <div className="intro-copy">
                <p className="eyebrow">Finance workbook / Chapter 01</p>
                <h1>
                  Time value
                  <br /> of money.
                </h1>
                <p>
                  A dollar today and a dollar in three years are different financial choices. TVM
                  puts cash flows on a common date so you can compare loans, savings and future
                  payments.
                </p>
                <p className="fine">
                  Start with a lesson. Work a problem. Check the calculator keys.
                </p>
              </div>
              <figure className="finance-example">
                <figcaption>A small example / compound growth</figcaption>
                <div className="example-flows">
                  <div>
                    <span>Invest today</span>
                    <strong>−$1,000</strong>
                    <small>PV · cash paid</small>
                  </div>
                  <div className="example-rate">
                    5% a year
                    <br />
                    <span>3 years →</span>
                  </div>
                  <div>
                    <span>Receive later</span>
                    <strong>+$1,157.63</strong>
                    <small>FV · cash received</small>
                  </div>
                </div>
                <div className="example-years" aria-label="Three annual compounding periods">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3 years</span>
                </div>
                <p>1,000 × (1.05)³ = 1,157.625</p>
                <small>
                  Annual compounding, no extra payments. The extra $157.63 is interest, including
                  interest on interest.
                </small>
              </figure>
            </div>
            <details className="reference">
              <summary>The five variables, in plain language</summary>
              <dl className="glossary">
                <dt>PV · Present value</dt>
                <dd>The signed cash flow today: a loan received or money invested.</dd>
                <dt>FV · Future value</dt>
                <dd>
                  The signed cash flow at time N, including a final withdrawal or remaining balance.
                </dd>
                <dt>PMT · Payment</dt>
                <dd>
                  An equal repeating cash flow each payment period. Use zero if there are none.
                </dd>
                <dt>N · Number of periods</dt>
                <dd>The total number of payment periods, not the number of years.</dd>
                <dt>I/Y · Interest per year</dt>
                <dd>
                  The nominal annual percentage rate, interpreted with the C/Y setting. It is not
                  necessarily the effective annual rate.
                </dd>
              </dl>
            </details>
            <div className="study-layout">
              <aside className="study-sidebar">
                <p className="eyebrow">Five short lessons</p>
                <nav aria-label="Lessons">
                  {lessons.map((item, i) => (
                    <button
                      key={item.title}
                      aria-current={lesson === i ? 'step' : undefined}
                      onClick={() => setLesson(i)}
                    >
                      <span>0{i + 1}</span>
                      {item.title}
                    </button>
                  ))}
                </nav>
                <p className="fine">
                  New to TVM? Start with cash-flow signs. Comfortable already? Go straight to
                  Practice.
                </p>
              </aside>
              <Lesson
                key={lesson}
                index={lesson}
                onNext={() => setLesson(lesson + 1)}
                onPractice={openPractice}
                onCalculator={openCalculator}
              />
            </div>
          </>
        )}
        {page === 'practice' && (
          <>
            <div className="section-intro compact">
              <p className="eyebrow">Finance workbook / Problem set</p>
              <h1>Work the numbers.</h1>
              <p>
                Nine questions cover all five unknowns, loans, savings, payment timing and frequency
                conversion. Progress lasts for this visit; no login or tracking.
              </p>
              <p className="progress" role="status">
                {solved.size} / {questions.length} solved without revealing the answer
              </p>
            </div>
            <div className="study-layout">
              <aside className="study-sidebar">
                <nav aria-label="Practice questions">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      aria-current={q.id === questionId ? 'step' : undefined}
                      onClick={() => setQuestionId(q.id)}
                    >
                      <span>{solved.has(q.id) ? '✓' : String(i + 1).padStart(2, '0')}</span>
                      {q.title}
                    </button>
                  ))}
                </nav>
              </aside>
              <Practice
                key={question.id}
                question={question}
                revealed={revealed.has(question.id)}
                onReveal={() => setRevealed((s) => new Set([...s, question.id]))}
                onCalculator={openCalculator}
                onComplete={(id) => setSolved((s) => new Set([...s, id]))}
                onNext={() =>
                  setQuestionId(questions[(questions.indexOf(question) + 1) % questions.length].id)
                }
              />
            </div>
          </>
        )}
        <div hidden={page !== 'calculator'}>
          <Calculator key={calculatorVersion} example={example} />
        </div>
      </main>
      <footer>
        <div>
          <b>TVM Study Desk</b>
          <p>
            An independent learning project. Constant rates, equal payments, one cash-flow
            perspective.
          </p>
        </div>
        <div>
          <a href="https://github.com/neil-314/finance-tvm-solver">Source & how it works ↗</a>
          <a
            href="https://education.ti.com/html/eguides/financials/baiiplus/en/Content/M_TVMA-WS/TVMA_Variables.HTML"
            target="_blank"
            rel="noreferrer"
          >
            TI TVM reference ↗
          </a>
          <span>Educational examples · no financial advice</span>
        </div>
      </footer>
    </div>
  )
}
