import { useEffect, useState } from "react";
import Papa from "papaparse";

interface SchoolData {
  state: string;
  publicSchoolCount: number;
  State:string;
  StudentTeacher:string;
  GradRate:number;
  CollegeTotal:number;
}

export default function StateEducationOverview({ state }: { state: string }) {

const [data, setData] = useState<SchoolData[]>([]);
const [currentRow, setCurrentRow] = useState<SchoolData | null>(null);
const [totalStudents, setTotalStudents] = useState<number | null>(null); // renamed

useEffect(() => {
  fetch("/SchoolStats.csv")
    .then((res) => res.text())
    .then((csvText) => {
      Papa.parse<SchoolData>(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          setData(results.data);
        },
      });
    })
    .catch((err) => console.error("CSV load error:", err));
}, []);

useEffect(() => {
  console.log("Data loaded:", data);
  if (data.length > 0) {
    const match = data.find((row) => {
      if (!row.State || typeof row.State !== "string") return false;
      return row.State.toUpperCase() === state.toUpperCase();
    });

    setCurrentRow(match || null);

    if (match) {
      // Adjust index range based on your CSV — here we assume student counts are from columns 4 to 27
      const total = Object.values(match)
        .slice(4, 28)
        .reduce((sum, val) => {
          const num = parseFloat(val?.toString().replace(/,/g, "") || "0");
          return sum + (isNaN(num) ? 0 : num);
        }, 0);

      setTotalStudents(total);
      console.log("Total Students Calculated:", total);
    } else {
      setTotalStudents(null);
    }
  }
}, [state, data]);


  return (
    <section className="bg-white p-6 rounded shadow text-black max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">📚 Education Overview: {state}</h2>

      {/* Snapshot Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-100 rounded shadow-sm">
            <h3 className="text-lg font-semibold"># of Public Schools</h3>
            {currentRow ? (
                <p>📚{currentRow.publicSchoolCount.toLocaleString()}</p>
            ) : (
                <p>Loading or data not found for this state.</p>
            )}
        </div>
        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">K–12 Enrollment</h3>
          <p>{totalStudents}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Higher Ed Enrollment</h3>
          {currentRow ? (
                <p>📚{currentRow.CollegeTotal.toLocaleString()}</p>
            ) : (
                <p>Loading or data not found for this state.</p>
            )}
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">High School Grad Rate</h3>
          {currentRow ? (
                <p>📚{currentRow.GradRate.toLocaleString()}</p>
            ) : (
                <p>Loading or data not found for this state.</p>
            )}
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">College Grad Rate</h3>
          <p className="text-2xl">Loading...</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Teacher-Student Ratio</h3>
          {currentRow ? (
                <p>📚{currentRow.StudentTeacher.toLocaleString()}</p>
            ) : (
                <p>Loading or data not found for this state.</p>
            )}
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Spend per Student</h3>
          <p className="text-2xl">Loading...</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Reading/Math Proficiency</h3>
          <p className="text-2xl">Loading...</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Public vs. Private</h3>
          <p className="text-2xl">Loading...</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Population w/ Degrees</h3>
          <p className="text-2xl">Loading...</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Dropout Rate</h3>
          <p className="text-2xl">Loading...</p>
        </div>

        <div className="p-4 bg-gray-100 rounded shadow-sm">
          <h3 className="text-lg font-semibold">Special Ed Enrollment</h3>
          <p className="text-2xl">Loading...</p>
        </div>
      </div>
    </section>
  );
}

