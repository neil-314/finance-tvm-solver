export type Variable = 'PV' | 'FV' | 'PMT' | 'RATE' | 'NPER'
export type Inputs = { pv:number; fv:number; pmt:number; rate:number; periods:number; compounds:number; due:boolean }
const valueAt = (x: Inputs, rate = x.rate / 100 / x.compounds, periods = x.periods * x.compounds) => {
  const growth = Math.pow(1 + rate, periods)
  const annuity = rate === 0 ? periods : ((growth - 1) / rate) * (x.due ? 1 + rate : 1)
  return x.pv * growth + x.pmt * annuity
}
export function solve(target:Variable, x:Inputs) {
  const r=x.rate/100/x.compounds, n=x.periods*x.compounds, g=Math.pow(1+r,n), due=x.due?1+r:1
  if(target==='FV') return valueAt(x)
  if(target==='PV') return (x.fv-x.pmt*(r===0?n:(g-1)/r)*due)/g
  if(target==='PMT') return (x.fv-x.pv*g)/((r===0?n:(g-1)/r)*due)
  if(target==='NPER') {
    let lo=.001, hi=200
    for(let i=0;i<100;i++){const mid=(lo+hi)/2; if(valueAt({...x,periods:mid})<x.fv) lo=mid; else hi=mid}
    return (lo+hi)/2
  }
  let lo=-99, hi=100
  for(let i=0;i<120;i++){const mid=(lo+hi)/2; if(valueAt({...x,rate:mid})<x.fv) lo=mid; else hi=mid}
  return (lo+hi)/2
}
export const formulas:Record<Variable,string>={FV:'FV = PV(1 + r)ⁿ + PMT × [((1 + r)ⁿ − 1) / r] × d',PV:'PV = [FV − PMT × annuity factor] / (1 + r)ⁿ',PMT:'PMT = [FV − PV(1 + r)ⁿ] / annuity factor',RATE:'Solve r iteratively where PV(1 + r)ⁿ + PMT × annuity factor = FV',NPER:'Solve n iteratively where PV(1 + r)ⁿ + PMT × annuity factor = FV'}
