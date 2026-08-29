# Finance TVM Solver

An interactive, educational time-value-of-money website. I built this project to learn how TVM calculations work—not just to produce answers—and to make the same concepts easier for other students to explore.

## Try it online

**[Open the educational solver](https://neil-314.github.io/finance-tvm-solver/)**

## What it teaches

The site introduces the five core TVM variables:

- **PV (present value):** money available or borrowed today
- **FV (future value):** money at the end of the timeline
- **PMT (payment):** a repeating deposit, withdrawal, or repayment
- **RATE:** the annual interest or return
- **NPER:** the number of years

Choose the unknown variable, enter the four values you know, and the page updates the result, formula, substituted steps, and cash-flow timeline. Mortgage, investment, and retirement examples are included for quick experimentation.

Cash flows use a standard sign convention: money received is positive, while money contributed or repaid is negative. Results are for learning and demonstration only, not financial advice.

## Features

- Guided three-step introduction for first-time users
- Monthly and annual compounding
- Ordinary annuity and annuity-due payment timing
- Mortgage, investment, and retirement examples
- Visible formula, substitution steps, and cash-flow timeline
- Calculation logic separated into `src/finance.ts`
- Responsive layout and accessible form labels

## Run locally

```bash
npm install
npm run dev
```

To create and check a production build:

```bash
npm run build
npm run lint
```

The `main` branch deploys automatically to GitHub Pages through GitHub Actions.
