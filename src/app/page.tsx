"use client";

import { useState, useEffect } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology, GeometryObject } from "topojson-specification"; // Removed Objects
import { GeoPermissibleObjects } from "d3-geo";
import { Feature, FeatureCollection, Geometry } from "geojson"; // Removed GeoJsonProperties
import { useRouter } from 'next/navigation';
import { Analytics } from "@vercel/analytics/next"
Analytics
// 1. Define the specific TopoJSON structure for states
interface USStatesTopology extends Topology {
  objects: {
    states: GeometryObject; // Assuming your TopoJSON has an object named 'states'
  };
}

// 2. Define the specific TopoJSON structure for counties
interface USCountiesTopology extends Topology {
  objects: {
    counties: GeometryObject; // Assuming your TopoJSON has an object named 'counties'
  };
}

// 3. Define the properties expected for both states and counties features
interface GeoFeatureProperties {
  name: string;
  // Add any other common properties if they exist in your TopoJSON files
}

// 4. Extend the GeoJSON Feature to include a mandatory 'id' as string and specific properties
interface MapFeature extends Feature<Geometry, GeoFeatureProperties> {
  id: string; // Ensure id is always a string for consistent handling
}

export default function HomePage() {
  const [usData, setUsData] = useState<FeatureCollection<Geometry, GeoFeatureProperties> | null>(null);
  const [countyData, setCountyData] = useState<FeatureCollection<Geometry, GeoFeatureProperties> | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedStateFips, setSelectedStateFips] = useState<string | null>(null);
  const [selectedStateFeature, setSelectedStateFeature] = useState<MapFeature | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<MapFeature | null>(null);
  const router = useRouter();

  const svgWidth = 1000;
  const svgHeight = 600;

  // --- Load US States Data ---
  useEffect(() => {
    d3.json<USStatesTopology>("/us-states-topo.json") // Explicitly type the expected JSON
      .then((topology) => {
        if (!topology) {
          console.error("Error: US states topology data is null or undefined.");
          return;
        }
        const geoData = feature(
          topology, // `topology` is now correctly typed
          topology.objects.states // Access `objects.states` without `any`
        ) as FeatureCollection<Geometry, GeoFeatureProperties>; // Assert the final GeoJSON type

        const typedFeatures: MapFeature[] = geoData.features.map(f => ({
          ...f,
          id: f.id ? String(f.id) : "", // Ensure ID is a string
          properties: f.properties as GeoFeatureProperties, // Assert properties type
        }));
        setUsData({ type: "FeatureCollection", features: typedFeatures });
      })
      .catch(error => console.error("Error loading US states data:", error));
  }, []); // Empty dependency array means this runs once on mount

  // --- Load Counties Data for Selected State ---
  useEffect(() => {
    if (!selectedStateFips) {
      setCountyData(null);
      setSelectedCounty(null);
      return;
    }

    d3.json<USCountiesTopology>("/us-counties-topo.json") // Explicitly type the expected JSON
      .then((topology) => {
        if (!topology) {
          console.error("Error: US counties topology data is null or undefined.");
          return;
        }

        const allCounties = feature(
          topology, // `topology` is now correctly typed
          topology.objects.counties // Access `objects.counties` without `any`
        ) as FeatureCollection<Geometry, GeoFeatureProperties>; // Assert the final GeoJSON type

        const stateCounties: MapFeature[] = allCounties.features
          .filter((f) => f.id && String(f.id).startsWith(selectedStateFips))
          .map(f => ({
            ...f,
            id: f.id ? String(f.id) : "", // Ensure ID is a string
            properties: f.properties as GeoFeatureProperties, // Assert properties type
          }));

        setCountyData({ type: "FeatureCollection", features: stateCounties });
        setSelectedCounty(null);
      })
      .catch(error => console.error("Error loading US counties data:", error));
  }, [selectedStateFips]); // Reruns when selectedStateFips changes

  // --- D3 Map Rendering Logic ---
  useEffect(() => {
    if (!usData) return; // Wait until US state data is loaded

    const svg = d3.select<SVGSVGElement, unknown>("#usMap");
    svg.selectAll("*").remove(); // Clear previous rendering

    const projection = d3.geoAlbersUsa();
    const pathGenerator = d3.geoPath().projection(projection);

    let dataToRender: FeatureCollection<Geometry, GeoFeatureProperties> | null = null;

    if (countyData && selectedStateFeature) {
      dataToRender = countyData;
      // Fit the projection to the selected state's bounding box when showing counties
      projection.fitSize([svgWidth, svgHeight], selectedStateFeature as GeoPermissibleObjects);
    } else {
      dataToRender = usData;
      // Default projection for the entire US map
      projection.scale(1000).translate([svgWidth / 2, svgHeight / 2]);
    }

    if (!dataToRender) return; // Should not happen if usData is loaded, but good for safety

    svg
      .append("g")
      .selectAll<SVGPathElement, MapFeature>("path")
      .data(dataToRender.features as MapFeature[]) // Cast to MapFeature[] for `id` and `properties`
      .enter()
      .append("path")
      .attr("d", (d: MapFeature) => pathGenerator(d)!) // `!` asserts non-null
      .attr("fill", (d: MapFeature) => {
        if (countyData) {
          return selectedCounty?.id === d.id ? "#90ee90" : "#fcd34d"; // Highlight selected county
        } else {
          return "#a3cef1"; // Default state fill color
        }
      })
      .attr("stroke", "#666")
      .attr("stroke-width", countyData ? 0.5 : 1) // Thinner stroke for counties
      .style("cursor", "pointer")
      .on("click", (event: MouseEvent, d: MapFeature) => {
        if (d.id && !countyData) {
          // If viewing states, select a state
          setSelectedState(d.properties.name);
          setSelectedStateFips(d.id.substring(0, 2)); // FIPS code for state
          setSelectedStateFeature(d);
          console.log("Selected State:", d.properties.name, "FIPS:", d.id.substring(0, 2));
        } else if (countyData) {
          // If viewing counties, select a county
          setSelectedCounty(d);
          console.log("Selected County:", d.properties.name, "ID:", d.id);
        }
      })
      .append("title") // Tooltip for names
      .text((d: MapFeature) => d.properties.name);
  }, [usData, countyData, selectedStateFeature, selectedCounty, svgHeight, svgWidth]); // Dependencies for re-rendering map

  // --- Navigation and Reset Handlers ---
  const handleNavigateToStatePage = () => {
    if (selectedState) {
      router.push(`/state/${encodeURIComponent(selectedState)}`);
      console.log("Navigating to:", `/state/${encodeURIComponent(selectedState)}`);
    }
  };

  const resetMap = () => {
    setCountyData(null);
    setSelectedState(null);
    setSelectedStateFips(null);
    setSelectedStateFeature(null);
    setSelectedCounty(null);
  };

  return (
    <main className="flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold mb-4">Waylaytics</h1>
      <p className="text-lg mb-6">Find where you belong — explore taxes, laws, healthcare, and more.</p>

      <input
        className="mb-6 px-4 py-2 border border-gray-300 rounded w-full max-w-md"
        type="text"
        placeholder="Search by city, state, or zip..."
      />

      <svg id="usMap" width={svgWidth} height={svgHeight}></svg>

      {selectedState && (
        <div className="mt-4 text-center">
          <p className="text-xl">Showing counties for: {selectedState}</p>
          {selectedCounty && <p className="text-lg mt-2">Selected County: {selectedCounty.properties.name}</p>}
          <button
            onClick={handleNavigateToStatePage}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Go to {selectedState} Page
          </button>
          <button onClick={resetMap} className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Back to US Map
          </button>
        </div>
      )}
    </main>
  );
}






