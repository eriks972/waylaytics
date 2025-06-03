// components/BusinessIndustry.tsx
"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";

interface CBPRow {
  NAME: string;
  NAICS2017: string;
  EMP: string;
  ESTAB: string;
  EMPSZES_LABEL: string;
  LFO_LABEL: string;
}


const NAICS_LABELS: Record<string, string> = {
    "00": "All Industries",
    "11": "Agriculture, Forestry, Fishing and Hunting",
    "21": "Mining, Quarrying, and Oil and Gas Extraction",
    "22": "Utilities",
    "23": "Construction",
    "31-33": "Manufacturing",
    "42": "Wholesale Trade",
    "44-45": "Retail Trade",
    "48-49": "Transportation and Warehousing",
    "51": "Information",
    "52": "Finance and Insurance",
    "53": "Real Estate and Rental and Leasing",
    "54": "Professional, Scientific, and Technical Services",
    "55": "Management of Companies and Enterprises",
    "56": "Administrative and Support and Waste Management and Remediation Services",
    "61": "Educational Services",
    "62": "Health Care and Social Assistance",
    "71": "Arts, Entertainment, and Recreation",
    "72": "Accommodation and Food Services",
    "81": "Other Services (except Public Administration)",
    "92": "Public Administration",
    "99": "Unclassified",
    // Add more as needed
  };

export default function BusinessIndustry({ state }: { state: string }) {
  const [industrySummary, setIndustrySummary] = useState<{ industry: string; emp: number }[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [industryBreakdown, setIndustryBreakdown] = useState<CBPRow[]>([]);

  useEffect(() => {
    d3.csv("/Business_1.csv").then((data) => {
      const filtered = data.filter((row: any) =>
        row["Geographic Area Name (NAME)"]?.includes(state)
      );

      const seen = new Set();
      const uniqueRows: any[] = [];
      for (const row of filtered) {
        const industry = row["2017 NAICS code (NAICS2017)"] || "Unknown";
        if (!seen.has(industry)) {
          seen.add(industry);
          uniqueRows.push(row);
        }
      }

      const summary = uniqueRows
        .map((row) => ({
          industry: row["2017 NAICS code (NAICS2017)"],
          emp: parseInt(row["Number of employees (EMP)"].replace(/,/g, "") || "0"),
        }))
        .sort((a, b) => b.emp - a.emp);

      setIndustrySummary(summary);
    });
  }, [state]);

  useEffect(() => {
    if (!selectedIndustry) return;

    d3.csv("/Business_1.csv").then((data) => {
      const breakdown = data
        .filter(
          (row: any) =>
            row["2017 NAICS code (NAICS2017)"] === selectedIndustry &&
            row["Geographic Area Name (NAME)"].includes(state)
        )
        .map((row: any) => ({
          NAME: row["Geographic Area Name (NAME)"],
          NAICS2017: row["2017 NAICS code (NAICS2017)"],
          EMP: row["Number of employees (EMP)"],
          ESTAB: row["Number of establishments (ESTAB)"],
          EMPSZES_LABEL: row["Meaning of Employment size of establishments code (EMPSZES_LABEL)"],
          LFO_LABEL: row["Meaning of Legal form of organization code (LFO_LABEL)"],
        }));

      setIndustryBreakdown(breakdown);
    });
  }, [selectedIndustry, state]);

  return (
    <div className="bg-white rounded shadow p-4 text-black">
      <h2 className="text-lg font-semibold mb-4">🏢 Business & Industry</h2>
      <table className="min-w-full text-sm border border-gray-500">
        <thead>
          <tr className="bg-gray-700 text-black">
            <th className="px-4 py-2 border">Industry</th>
            <th className="px-4 py-2 border">Employees</th>
          </tr>
        </thead>
        <tbody>
          {industrySummary.map((item) => (
            <tr
              key={item.industry}
              className="hover:bg-gray-800 cursor-pointer"
              onClick={() => setSelectedIndustry(item.industry)}
            >
              <td className="px-4 py-2 border">{NAICS_LABELS[item.industry] || `Industry ${item.industry}`}</td>
              <td className="px-4 py-2 border">{item.emp.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedIndustry && (
        <div className="mt-6 p-4 bg-gray-800 rounded text-white">
          <h3 className="text-lg font-bold mb-2">
            Details for {NAICS_LABELS[selectedIndustry] || `Industry ${selectedIndustry}`}
          </h3>
          <table className="min-w-full text-sm border border-gray-500">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2 border">Size</th>
                <th className="px-4 py-2 border">Legal Form</th>
                <th className="px-4 py-2 border">Establishments</th>
                <th className="px-4 py-2 border">Employees</th>
              </tr>
            </thead>
            <tbody>
              {industryBreakdown.map((row, i) => (
                <tr key={i} className="border-t border-gray-600">
                  <td className="px-4 py-2 border">{row.EMPSZES_LABEL}</td>
                  <td className="px-4 py-2 border">{row.LFO_LABEL}</td>
                  <td className="px-4 py-2 border">{row.ESTAB}</td>
                  <td className="px-4 py-2 border">{row.EMP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
