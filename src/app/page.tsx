"use client";

import { useState, useEffect } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { GeoPermissibleObjects } from "d3-geo";
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { useRouter } from 'next/navigation';

interface MapFeature extends Feature<Geometry, { name: string }> {
  id: string;
}

export default function HomePage() {
  const [usData, setUsData] = useState<FeatureCollection<Geometry, { name: string }> | null>(null);
  const [countyData, setCountyData] = useState<FeatureCollection<Geometry, { name: string }> | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedStateFips, setSelectedStateFips] = useState<string | null>(null);
  const [selectedStateFeature, setSelectedStateFeature] = useState<MapFeature | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<MapFeature | null>(null);
  const router = useRouter();

  const svgWidth = 1000;
  const svgHeight = 600;

  useEffect(() => {
    d3.json("/us-states-topo.json").then((topology: unknown) => {
      const geoData = feature(
        topology as Topology,
        (topology as any).objects.states
      ) as unknown as FeatureCollection<Geometry, { name: string }>;
      const typedFeatures = geoData.features.map(f => ({
        ...f,
        id: f.id ? String(f.id) : "",
        properties: f.properties as { name: string },
      })) as MapFeature[];
      setUsData({ type: "FeatureCollection", features: typedFeatures });
    }).catch(error => console.error("Error loading US states data:", error));
  }, []);

  useEffect(() => {
    if (!selectedStateFips) {
      setCountyData(null);
      setSelectedCounty(null);
      return;
    }

    d3.json("/us-counties-topo.json").then((topology: unknown) => {
      const allCounties = feature(
        topology as Topology,
        (topology as any).objects.counties
      ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
      const stateCounties = allCounties.features
        .filter((f) => f.id && String(f.id).startsWith(selectedStateFips))
        .map(f => ({
          ...f,
          id: f.id ? String(f.id) : "",
          properties: f.properties as { name: string },
        })) as MapFeature[];

      setCountyData({ type: "FeatureCollection", features: stateCounties });
      setSelectedCounty(null);
    }).catch(error => console.error("Error loading US counties data:", error));
  }, [selectedStateFips]);

  useEffect(() => {
    if (!usData) return;

    const svg = d3.select<SVGSVGElement, unknown>("#usMap");
    svg.selectAll("*").remove();

    const projection = d3.geoAlbersUsa();
    const pathGenerator = d3.geoPath().projection(projection);

    let dataToRender: FeatureCollection<Geometry, { name: string }> | null = null;

    if (countyData && selectedStateFeature) {
      dataToRender = countyData;
      projection.fitSize([svgWidth, svgHeight], selectedStateFeature as GeoPermissibleObjects);
    } else {
      dataToRender = usData;
      projection.scale(1000).translate([svgWidth / 2, svgHeight / 2]);
    }

    if (!dataToRender) return;

    svg
      .append("g")
      .selectAll<SVGPathElement, MapFeature>("path")
      .data(dataToRender.features as MapFeature[])
      .enter()
      .append("path")
      .attr("d", (d: MapFeature) => pathGenerator(d)!)
      .attr("fill", (d: MapFeature) => {
        if (countyData) {
          return selectedCounty?.id === d.id ? "#90ee90" : "#fcd34d";
        } else {
          return "#a3cef1";
        }
      })
      .attr("stroke", "#666")
      .attr("stroke-width", countyData ? 0.5 : 1)
      .style("cursor", "pointer")
      .on("click", (event: MouseEvent, d: MapFeature) => {
        if (d.id && !countyData) {
          setSelectedState(d.properties.name);
          setSelectedStateFips(d.id.substring(0, 2));
          setSelectedStateFeature(d);
          console.log("Selected State:", d.properties.name, "FIPS:", d.id.substring(0, 2));
        } else if (countyData) {
          setSelectedCounty(d);
          console.log("Selected County:", d.properties.name, "ID:", d.id);
        }
      })
      .append("title")
      .text((d: MapFeature) => d.properties.name);
  }, [usData, countyData, selectedStateFeature, selectedCounty]);

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
    const svg = d3.select<SVGSVGElement, unknown>("#usMap");
    const projection = d3.geoAlbersUsa().scale(1000).translate([svgWidth / 2, svgHeight / 2]);
    const pathGenerator = d3.geoPath().projection(projection);
    svg.selectAll<SVGPathElement, MapFeature>("path").attr("d", (d: MapFeature) => pathGenerator(d)!);
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
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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







