export type Variable = 'PV' | 'FV' | 'PMT' | 'RATE' | 'NPER'
export type Inputs = { pv:number; fv:number; pmt:number; rate:number; periods:number; compounds:number; due:boolean }
const valueAt = (x: Inputs, rate = x.rate / 100 / x.compounds, periods = x.periods * x.compounds) => {
  const growth = Math.pow(1 + rate, periods)
  const annuity = rate === 0 ? periods : ((growth - 1) / rate) * (x.due ? 1 + rate : 1)
  return x.pv * growth + x.pmt * annuity
}
export function solve(target:Variable, x:Inputs) {
  const r=x.rate/100/x.compounds, n=x.periods*x.compounds, g=Math.pow(1+r,n), due=x.due?1+r:1
