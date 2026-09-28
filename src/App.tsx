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
