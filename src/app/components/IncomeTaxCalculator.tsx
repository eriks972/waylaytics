"use client";

import { useState, useEffect } from "react";

// Define TypeScript types
type TaxBracket = {
  rate: number;
  over: number;
};

type FilingStatusInfo = {
  brackets: TaxBracket[];
  standardDeduction: number;
  personalExemption: number | null;
};

type IncomeTax = {
  single: FilingStatusInfo;
  married: FilingStatusInfo;
  dependentExemption: number;
};

type StateTaxInfo = {
  incomeTax: IncomeTax;
};

type TaxData = Record<string, StateTaxInfo>;

export default function IncomeTaxCalculator({ state }: { state: string }) {
  const [income, setIncome] = useState(0);
  const [filingStatus, setFilingStatus] = useState<"single" | "married">("single");
  const [result, setResult] = useState<string | null>(null);
  const [taxInfo, setTaxInfo] = useState<StateTaxInfo | null>(null);

  useEffect(() => {
    fetch("/IncomeTax.json")
      .then((res) => res.json())
      .then((data: TaxData) => {
        const entry = data[state];
        console.log("Loaded tax data for state:", state, entry);
        setTaxInfo(entry ?? null);
      })
      .catch((err) => {
        console.error("Failed to load tax data:", err);
        setTaxInfo(null);
      });
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filingData = taxInfo?.incomeTax?.[filingStatus];
    if (!filingData || !filingData.brackets) {
      setResult("No tax data available for this state.");
      return;
    }

    const brackets = filingData.brackets;
    const taxableIncome = Math.max(0, income - (filingData.standardDeduction ?? 0));

    let tax = 0;
    for (let i = 0; i < brackets.length; i++) {
      const current = brackets[i];
      const next = brackets[i + 1];
      const lowerBound = current.over;
      const upperBound = next ? next.over : Infinity;

      if (taxableIncome > lowerBound) {
        const taxedAmount = Math.min(taxableIncome, upperBound) - lowerBound;
        tax += taxedAmount * current.rate;
      } else {
        break;
      }
    }

    const effectiveRate = income > 0 ? (tax / income) * 100 : 0;
    setResult(`Estimated Tax: $${tax.toFixed(2)}\nEffective Rate: ${effectiveRate.toFixed(2)}%`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow text-black max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Income Tax Calculator ({state})</h2>

      <label className="block mb-2">
        Annual Income ($)
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        />
      </label>

      <label className="block mb-4">
        Filing Status
        <select
          value={filingStatus}
          onChange={(e) => setFilingStatus(e.target.value as "single" | "married")}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        >
          <option value="single">Single</option>
          <option value="married">Married Filing Jointly</option>
        </select>
      </label>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Calculate
      </button>

      {result && <pre className="mt-4 text-sm whitespace-pre-line">{result}</pre>}
    </form>
  );
}




