"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BusinessIndustry from "@/app/components/Business";
import JobsEmployment from "@/app/components/Employment";
import IncomeTaxCalculator from "@/app/components/IncomeTaxCalculator";


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
  const [activeTab, setActiveTab] = useState("💰 Taxes");

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



