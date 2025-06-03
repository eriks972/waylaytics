"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import * as d3 from "d3";
import { useParams } from "next/navigation";
import BusinessIndustry from "@/app/components/Business";
import JobsEmployment from "@/app/components/Employment";
import IncomeTaxCalculator from "@/app/components/IncomeTaxCalculator";
import { useRouter } from 'next/navigation'; // Import the router

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

export default function StateDetailPage() {
  const params = useParams();
  const state = decodeURIComponent(params.stateName as string);
  const router = useRouter(); // Initialize the router

  // const supportedStates = ["New York", "Texas", "California"];
  // if (!supportedStates.includes(state)) {
  //   notFound();
  // }

  const [industrySummary, setIndustrySummary] = useState<{ industry: string; emp: number }[]>([]);
  const [totalEstablishments, setTotalEstablishments] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("💰 Taxes");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [industryBreakdown, setIndustryBreakdown] = useState<CBPRow[]>([]);
   const [selectedState, setSelectedState] = useState<string | null>(null);

  // useEffect(() => {
  //   d3.csv("/NewYork1.csv").then((data) => {
  //     const filtered = data.filter(
  //       (row: any) => row["Geographic Area Name (NAME)"] && row["Geographic Area Name (NAME)"].includes(state)
  //     );

  //     const seen = new Set();
  //     const uniqueIndustryRows: any[] = [];
  //     let totalEstab = 0;

  //     for (const row of filtered) {
  //       const industry = row["2017 NAICS code (NAICS2017)"] || "Unknown";
  //       if (!seen.has(industry)) {
  //         seen.add(industry);
  //         uniqueIndustryRows.push(row);
  //       }
  //       const estab = parseInt(row["Number of establishments (ESTAB)"].replace(/,/g, "")) || 0;
  //       totalEstab += estab;
  //     }

  //     const summary = uniqueIndustryRows
  //       .map((row) => {
  //         const industry = row["2017 NAICS code (NAICS2017)"];
  //         const emp = parseInt(row["Number of employees (EMP)"].replace(/,/g, "")) || 0;
  //         return { industry, emp };
  //       })
  //       .sort((a, b) => b.emp - a.emp)

  //     setIndustrySummary(summary);
  //     setTotalEstablishments(totalEstab);
  //   });
  // }, [state]);

  // useEffect(() => {
  //   if (!selectedIndustry) return;

  //   d3.csv("/NewYork1.csv").then((data) => {
  //     const breakdown = data
  //       .filter(
  //         (row: any) =>
  //           row["2017 NAICS code (NAICS2017)"] === selectedIndustry &&
  //           row["Geographic Area Name (NAME)"].includes(state)
  //       )
  //       .map((row: any) => ({
  //         NAME: row["Geographic Area Name (NAME)"] || "",
  //         NAICS2017: row["2017 NAICS code (NAICS2017)"] || "",
  //         EMP: row["Number of employees (EMP)"] || "",
  //         ESTAB: row["Number of establishments (ESTAB)"] || "",
  //         EMPSZES_LABEL: row["Meaning of Employment size of establishments code (EMPSZES_LABEL)"] || "",
  //         LFO_LABEL: row["Meaning of Legal form of organization code (LFO_LABEL)"] || "",
  //       }));
  //     setIndustryBreakdown(breakdown);
  //   });
  // }, [selectedIndustry, state]);
  const renderTabContent = () => {
    
    switch (activeTab) {
      case "💰 Taxes":
        return <IncomeTaxCalculator state={state} />;
      case "🏥 Healthcare":
        return <div className="bg-white rounded shadow p-4 text-white">🏥 Healthcare content goes here.</div>;
      case "🚓 Crime":
        return <div className="bg-white rounded shadow p-4 text-white">🚓 Crime content goes here.</div>;
      case "🏢 Business & Industry":
        return <BusinessIndustry state={state} />;
      case "👷 Jobs & Employment":
        return <JobsEmployment state={state} />;
      case "📊 Charts":
        return (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-2 text-white">Charts</h2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">{state} Overview</h1>
      <div className="mb-6 flex flex-wrap gap-4">
        {["💰 Taxes", "🏥 Healthcare", "🚓 Crime", "🏢 Business & Industry", "👷 Jobs & Employment", "📊 Charts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {renderTabContent()}
    </main>
  );
}



