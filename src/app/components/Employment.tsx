"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";

export default function JobsEmployment({ state }: { state: string }) {
  const [totalEstablishments, setTotalEstablishments] = useState<number | null>(null);

  useEffect(() => {
    d3.csv("/Business_1.csv").then((data) => {
      const filtered = data.filter(
        (row) =>
          row["Geographic Area Name (NAME)"] &&
          row["Geographic Area Name (NAME)"].includes(state)
      );

      const seen = new Set<string>();
      const uniqueIndustryRows: typeof filtered = [];
      let totalEstab = 0;

      for (const row of filtered) {
        const industry = row["2017 NAICS code (NAICS2017)"] || "Unknown";
        if (!seen.has(industry)) {
          seen.add(industry);
          uniqueIndustryRows.push(row);
        }
        const estab = parseInt(row["Number of establishments (ESTAB)"].replace(/,/g, "")) || 0;
        totalEstab += estab;
      }

      setTotalEstablishments(totalEstab);
    });
  }, [state]);

  return (
    <div className="bg-white rounded shadow p-4 text-black">
      👷 Jobs & Employment
      <p className="mt-2 text-sm text-black">
        Total Establishments: {totalEstablishments?.toLocaleString() ?? "Loading..."}
      </p>
    </div>
  );
}


  