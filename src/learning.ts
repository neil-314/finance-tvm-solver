import { defaults, type Inputs, type Variable } from './finance.ts'

export type Question = {
  id: string
  title: string
  topic: string
  prompt: string
  target: Variable
  inputs: Inputs
  hints: string[]
  takeaway: string
}
const values = (x: Partial<Inputs>): Inputs => ({ ...defaults, ...x })
export const questions: Question[] = [
  {
    id: 'growth',
    title: 'One deposit, three years',
    topic: 'Single cash flow',
    prompt:
      'You invest $1,000 today at 5% nominal annual interest, compounded annually. You make no further deposits. How much will you receive after 3 years?',
    target: 'FV',
    inputs: values({ n: 3, rate: 5, pv: -1000 }),
    hints: [
      'Choose the investor’s perspective: today’s deposit leaves your pocket.',
      'PV = −1,000, PMT = 0, N = 3, I/Y = 5, P/Y = C/Y = 1.',
      'FV = −PV × (1.05)³.',
    ],
    takeaway: 'Interest earns interest. The result exceeds $1,150, which would be simple interest.',
  },
  {
    id: 'discount',
    title: 'A future tuition payment',
    topic: 'Present value',
    prompt:
      'You need to receive $5,000 in 4 years. Savings earn 4% nominal annual interest, compounded annually. With no further payments, what signed amount must you invest today?',
    target: 'PV',
    inputs: values({ n: 4, rate: 4, fv: 5000 }),
    hints: [
      'The future receipt is positive. Today’s investment is negative.',
      'FV = 5,000, PMT = 0, N = 4, I/Y = 4; P/Y = C/Y = 1.',
      'PV = −5,000 ÷ (1.04)⁴.',
    ],
    takeaway:
      'Discounting moves a future cash flow back to today. Today’s investment is smaller in magnitude than the future receipt.',
  },
  {
    id: 'saving',
    title: 'A monthly savings habit',
    topic: 'Ordinary annuity',
    prompt:
      'Starting with no savings, deposit $200 at the end of each month for 2 years. The nominal annual rate is 6%, compounded monthly. Find the positive amount received at the end.',
    target: 'FV',
    inputs: values({ n: 24, rate: 6, pmt: -200, py: 12, cy: 12 }),
    hints: [
      'Deposits are outflows: PMT is negative. Use END.',
      'N = 2 × 12 = 24; I/Y = 6; P/Y = C/Y = 12; PV = 0.',
      'The monthly rate is 0.06 ÷ 12 = 0.005. Multiply $200 by the 24-payment annuity factor.',
    ],
    takeaway:
      'N counts payments, not years. Enter the annual rate in I/Y; P/Y and C/Y handle the conversion.',
  },
  {
    id: 'loan',
    title: 'Repay a student loan',
    topic: 'Loan payment',
    prompt:
      'You receive a $12,000 loan at 6% nominal annual interest, compounded monthly. Repay it with 36 equal month-end payments and no balance remaining. Find the signed monthly payment.',
    target: 'PMT',
    inputs: values({ n: 36, rate: 6, pv: 12000, py: 12, cy: 12 }),
    hints: [
      'The loan received today is positive; repayments are negative.',
      'PV = 12,000, FV = 0, N = 36, I/Y = 6, P/Y = C/Y = 12, END.',
      'PMT = −PV × r ÷ [1 − (1 + r)⁻ᴺ], with r = 0.005.',
    ],
    takeaway: 'FV = 0 means fully repaid. A negative PMT is expected, not an error.',
  },
  {
    id: 'due',
    title: 'Pay rent at the beginning',
    topic: 'Annuity due',
    prompt:
      'Pay $500 at the beginning of each month for 12 months. Use a 6% nominal annual discount rate, compounded monthly. What positive lump sum today is equivalent to those outflows?',
    target: 'PV',
    inputs: values({ n: 12, rate: 6, pmt: -500, py: 12, cy: 12, due: true }),
    hints: [
      'The first payment is today: use BGN.',
      'PMT = −500, FV = 0, N = 12, I/Y = 6; P/Y = C/Y = 12.',
      'BGN uses the END annuity factor multiplied by 1.005.',
    ],
    takeaway:
      'Beginning payments happen one period earlier. Their present value exceeds the same END payments.',
  },
  {
    id: 'frequency',
    title: 'Two different frequencies',
    topic: 'P/Y versus C/Y',
    prompt:
      'Borrow $20,000 at 6% nominal annual interest, compounded semiannually. Repay it with 60 equal month-end payments, leaving no balance. Find the signed monthly payment.',
    target: 'PMT',
    inputs: values({ n: 60, rate: 6, pv: 20000, py: 12, cy: 2 }),
    hints: [
      'Monthly payments and semiannual compounding use different settings.',
      'P/Y = 12, C/Y = 2, N = 60, I/Y = 6, PV = 20,000, FV = 0, END.',
      'Monthly rate = (1 + 0.06 ÷ 2)^(2 ÷ 12) − 1, not 0.06 ÷ 12.',
    ],
    takeaway:
      'P/Y counts payment periods per year. C/Y describes the quoted nominal interest rate’s compounding frequency.',
  },
  {
    id: 'time',
    title: 'How long to double?',
    topic: 'Solve for N',
    prompt:
      'Invest $1,000 to receive $2,000 at 7% nominal annual interest, compounded annually, with no further deposits. How many annual periods does it take? Give the mathematical result without rounding up.',
    target: 'N',
    inputs: values({ rate: 7, pv: -1000, fv: 2000 }),
    hints: [
      'PV, FV, PMT and I/Y are known. N is unknown.',
      'PV = −1,000, FV = 2,000, PMT = 0, I/Y = 7, P/Y = C/Y = 1.',
      'N = ln(2) ÷ ln(1.07).',
    ],
    takeaway:
      'The mathematical result is fractional. If a question requires whole annual periods instead, round up.',
  },
  {
    id: 'rate',
    title: 'Find the annual return',
    topic: 'Solve for I/Y',
    prompt:
      'Invest $1,000 today and receive $1,210 exactly 2 years later, with no payments. Assuming annual compounding, find the nominal annual interest rate as a percentage.',
    target: 'I/Y',
    inputs: values({ n: 2, pv: -1000, fv: 1210 }),
    hints: [
      'The 21% total increase covers two years; it is not the annual rate.',
      'PV = −1,000, FV = 1,210, PMT = 0, N = 2, P/Y = C/Y = 1.',
      'I/Y = [(1,210 ÷ 1,000)^(1 ÷ 2) − 1] × 100.',
    ],
    takeaway: 'The annual rate is 10%, not 10.5%. Year two earns interest on year one’s interest.',
  },
  {
    id: 'zero',
    title: 'Save with no interest',
    topic: 'Zero-rate case',
    prompt:
      'Starting at zero, you want to receive $2,400 after 12 monthly deposits at 0% interest. Find the signed deposit required at each month-end.',
    target: 'PMT',
    inputs: values({ n: 12, fv: 2400, py: 12, cy: 12 }),
    hints: [
      'At 0%, only the deposits contribute to the goal.',
      'PV = 0, FV = 2,400, N = 12, I/Y = 0, P/Y = C/Y = 12.',
      'PMT = −2,400 ÷ 12. Use the zero-rate formula instead of dividing by r.',
    ],
    takeaway:
      'At zero interest, the annuity factor is N. The formula needs an explicit zero-rate case.',
  },
]

export const lessons = [
  {
    title: 'Draw the story first',
    tag: '01 · Cash flows',
    question: 'growth',
    body: 'Pick one perspective and keep it throughout the question. Invest $1,000 and money leaves you today: PV = −1,000. Receive the investment later and FV is positive. Signs describe direction, not whether an amount is good or bad.',
    rule: 'Receive money → positive. Pay or invest money → negative.',
    check: 'You receive a loan today. From your perspective, what sign is PV?',
    options: ['Positive', 'Negative'],
    correct: 0,
    feedback: 'Positive: you receive the loan. The payments you make later are negative.',
  },
  {
    title: 'Count periods, not years',
    tag: '02 · N and I/Y',
    question: 'saving',
    body: 'For two years of monthly payments, N = 2 × 12 = 24. I/Y is the nominal annual percentage: enter 6 for 6%, not 0.06 or 0.5. P/Y and C/Y determine the rate per payment period.',
    rule: 'N = years × P/Y. I/Y = the quoted nominal annual percentage.',
    check: 'Three years of monthly payments means N is…',
    options: ['3', '36', '12'],
    correct: 1,
    feedback: '36 payment periods: 3 years × 12 payments per year.',
  },
  {
    title: 'Separate payment and compounding frequency',
    tag: '03 · P/Y and C/Y',
    question: 'frequency',
    body: 'P/Y is payment periods per year; C/Y is compounds per year. They often match, but do not have to. For monthly payments with semiannual compounding, use P/Y = 12 and C/Y = 2.',
    rule: 'r = (1 + I/Y ÷ 100 ÷ C/Y)^(C/Y ÷ P/Y) − 1',
    check: 'Monthly payments and semiannual compounding: what is C/Y?',
    options: ['12', '2', '6'],
    correct: 1,
    feedback: '2: semiannual means two compounding periods per year. P/Y remains 12.',
  },
  {
    title: 'Ask when the first payment happens',
    tag: '04 · END and BGN',
    question: 'due',
    body: 'END places payments at periods 1 through N: the first payment is one period from now. BGN places payments at 0 through N−1: the first payment is today. Move the same series one period earlier and its value is multiplied by (1 + r).',
    rule: 'END = ordinary annuity. BGN = annuity due.',
    check: 'A deposit is made immediately, then each month. Which mode?',
    options: ['END', 'BGN'],
    correct: 1,
    feedback: 'BGN: the first recurring payment is at time 0.',
  },
  {
    title: 'Store four values, compute the fifth',
    tag: '05 · Calculator habits',
    question: 'loan',
    body: 'Clear the TVM registers before a new question. Check P/Y, C/Y and END/BGN separately: clearing TVM does not reset them. Enter zero for an unused payment or final balance. Store a number with its variable key, then press CPT and the unknown key.',
    rule: 'Clear → check settings → store known values → CPT → unknown.',
    check: 'After CLR TVM, what happens to a previous BGN setting?',
    options: ['It stays BGN', 'It becomes END'],
    correct: 0,
    feedback: 'It stays BGN. Clear the five TVM values and check timing separately.',
  },
]
