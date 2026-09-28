import { useMemo, useState } from "react";
import { formulas, solve, type Inputs, type Variable } from "./finance";
import "./App.css";
import "./education.css";

const presets = {
  Mortgage: { pv: 400000, fv: 0, pmt: -2530, rate: 5.2, periods: 25, compounds: 12, due: false },
  Investment: { pv: 10000, fv: 0, pmt: 500, rate: 7, periods: 10, compounds: 12, due: false },
  Retirement: { pv: 25000, fv: 0, pmt: 1000, rate: 6.5, periods: 30, compounds: 12, due: true },
};
const labels: { key: keyof Inputs; label: string; prefix?: string }[] = [
  { key: "pv", label: "Present value", prefix: "$" }, { key: "fv", label: "Future value", prefix: "$" },
  { key: "pmt", label: "Payment", prefix: "$" }, { key: "rate", label: "Annual interest", prefix: "%" }, { key: "periods", label: "Years" },
];
const targetKeys = { PV: "pv", FV: "fv", PMT: "pmt", RATE: "rate", NPER: "periods" } as const;
const meanings = {
  PV: "Present value: the amount you have or borrow today.", FV: "Future value: what the money will be worth at the end.",
  PMT: "Payment: the repeating deposit or withdrawal each period.", RATE: "Rate: the annual percentage return or borrowing cost.",
  NPER: "Number of periods: how many years the money grows or the loan lasts.",
};

export default function App() {
  const [target, setTarget] = useState<Variable>("FV");
  const [inputs, setInputs] = useState<Inputs>(presets.Investment);
  const result = useMemo(() => solve(target, inputs), [target, inputs]);
  const isMoney = target !== "RATE" && target !== "NPER";
  const formatResult = (value: number) => !Number.isFinite(value) ? "Check your inputs" : isMoney ? value.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }) : `${value.toFixed(2)}${target === "RATE" ? "%" : " years"}`;
  return <main>
    <header><div className="brand"><span>N</span> NEIL'S TVM LAB</div><div className="live">● EDUCATIONAL CALCULATOR</div></header>
    <section className="hero"><p className="eyebrow">TIME VALUE OF MONEY, MADE SIMPLE</p><h1>See how money changes<br /><em>over time.</em></h1><p>This learning tool shows the answer, formula, and steps together so you can understand the math—not just get a number.</p></section>
    <section className="quick-start" aria-labelledby="quick-start-title"><div><p className="eyebrow">START HERE</p><h2 id="quick-start-title">How to use the solver</h2></div><ol><li><b>Choose what is unknown.</b><span>Select PV, FV, PMT, RATE, or NPER.</span></li><li><b>Enter what you know.</b><span>Use positive numbers for money coming in and negative numbers for money going out.</span></li><li><b>Read the explanation.</b><span>Your result, formula, and substituted steps update instantly.</span></li></ol></section>
    <section className="preset-row" aria-label="Example scenarios">{Object.entries(presets).map(([name, preset]) => <button onClick={() => setInputs(preset)} key={name}>↗ Try {name}</button>)}</section>
    <div className="grid"><section className="panel"><p className="eyebrow">01 / SOLVE FOR</p><div className="targets">{(["PV", "FV", "PMT", "RATE", "NPER"] as Variable[]).map((variable) => <button key={variable} className={variable === target ? "active" : ""} onClick={() => setTarget(variable)}>{variable}</button>)}</div><p className="meaning">{meanings[target]}</p><div className="inputs">{labels.filter((item) => item.key !== targetKeys[target]).map((item) => <label key={item.key}>{item.label}<div><span>{item.prefix}</span><input aria-label={item.label} type="number" value={inputs[item.key] as number} onChange={(event) => setInputs({ ...inputs, [item.key]: Number(event.target.value) })} /></div></label>)}</div><div className="toggles"><label>Compounding<select value={inputs.compounds} onChange={(event) => setInputs({ ...inputs, compounds: Number(event.target.value) })}><option value="1">Annual</option><option value="12">Monthly</option></select></label><label>Payment timing<select value={inputs.due ? "due" : "ordinary"} onChange={(event) => setInputs({ ...inputs, due: event.target.value === "due" })}><option value="ordinary">End of period</option><option value="due">Beginning of period</option></select></label></div></section>
    <aside className="result" aria-live="polite"><p className="eyebrow">CALCULATED {target}</p><h2>{formatResult(result)}</h2><p>Based on {inputs.periods} years at {inputs.rate}% annually</p><div className="formula"><small>FORMULA</small>{formulas[target]}</div>{Number.isFinite(result) && <ol><li>Periodic rate = {(inputs.rate / inputs.compounds).toFixed(4)}%</li><li>Total periods = {(inputs.periods * inputs.compounds).toFixed(0)}</li><li>Payment timing factor = {inputs.due ? "1 + r" : "1"}</li><li>Substitute values and solve → {formatResult(result)}</li></ol>}</aside></div>
    <section className="timeline"><div className="timeline-title"><p className="eyebrow">CASH FLOW TIMELINE</p><span>{inputs.compounds === 12 ? "MONTHLY" : "ANNUAL"} COMPOUNDING</span></div><div className="line">{[0, 1, 2, 3, 4].map((_, index) => <div className="tick" key={index}><b>{index === 4 ? inputs.periods : Math.round(inputs.periods * index / 4)}Y</b><i></i><span>{index === 0 ? `PV ${inputs.pv.toLocaleString()}` : index === 4 ? `FV ${(target === "FV" ? result : inputs.fv).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `PMT ${inputs.pmt.toLocaleString()}`}</span></div>)}</div></section>
    <section className="learn-more"><p className="eyebrow">THE BIG IDEA</p><h2>A dollar today is usually worth more than a dollar later.</h2><p>Money available today can earn a return. TVM formulas connect five variables: present value, future value, recurring payments, interest rate, and time. If you know four, this solver estimates the fifth.</p><p><b>Sign convention:</b> cash you receive is positive; cash you contribute or repay is negative. Keeping opposite cash-flow directions makes the formulas work correctly.</p></section>
    <footer>Built for learning and demonstration—not financial advice. <span>Values use Canadian dollars</span></footer>
  </main>;
}
