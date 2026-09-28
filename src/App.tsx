import { useMemo, useState } from "react";
import { formulas, solve, type Inputs, type Variable } from "./finance";
import "./App.css";
import "./education.css";

const presets = {
  Mortgage: { pv: 400000, fv: 0, pmt: -2530, rate: 5.2, periods: 25, compounds: 12, due: false },
  Investment: { pv: 10000, fv: 0, pmt: 500, rate: 7, periods: 10, compounds: 12, due: false },
