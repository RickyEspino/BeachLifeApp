"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type PointLike = { x: number; y: number };

type Feature = {
  geometry: { coordinates: number[] };
  properties: Record<string, unknown>;
};

type ClusterSource = {
  getClusterExpansionZoom: (clusterId: number, callback: (err: Error | null, zoom: number) => void) => void;
};

type MinimalMap = {
  addControl: (c: unknown) => void;
  remove: () => void;
  on: (type: string, arg1?: unknown, fn?: unknown) => void;
  addSource: (name: string, src: unknown) => void;
  addLayer: (layer: unknown) => void;
  queryRenderedFeatures: (point: PointLike | [number, number], opts?: { layers?: string[] }) => Feature[];
  getSource: (name: string) => unknown;
  easeTo: (opts: { center?: [number, number]; zoom?: number } | unknown) => void;
  flyTo: (opts: { center?: [number, number]; zoom?: number } | unknown) => void;
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MinimalMap | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    const defaultCenter: [number, number] = [-122.431297, 37.773972];

    // create the real Maplibre map and keep a minimal typed reference for our usage
    const realMap = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: defaultCenter,
      zoom: 12,
    });

    // store a minimal view of the map to avoid leaking full third-party types everywhere
    mapRef.current = realMap as unknown as MinimalMap;

  // add controls using the real map instance (maplibregl types expect the concrete object)
  realMap.addControl(new maplibregl.NavigationControl() as unknown);

    const samplePoints = {
      type: "FeatureCollection",
      features: Array.from({ length: 50 }).map((_, i) => {
        const offsetX = (Math.random() - 0.5) * 0.2;
        const offsetY = (Math.random() - 0.5) * 0.2;
        return {
          type: "Feature",
          properties: { id: i },
          geometry: { type: "Point", coordinates: [defaultCenter[0] + offsetX, defaultCenter[1] + offsetY] },
        };
      }),
    };

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      mapRef.current.addSource("points", {
        type: "geojson",
        data: samplePoints,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      mapRef.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "points",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#51bbd6",
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
      });

      mapRef.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "points",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 12 },
      });

      mapRef.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "points",
        filter: ["!has", "point_count"],
        paint: {
          "circle-color": "#f28cb1",
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

  mapRef.current.on("click", "clusters", (e: { point: PointLike }) => {
        const features = mapRef.current!.queryRenderedFeatures(e.point as PointLike, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id as number | undefined;
        if (typeof clusterId === "number") {
          const src = mapRef.current!.getSource("points") as unknown;
          const clusterSrc = src as ClusterSource | undefined;
          if (clusterSrc && typeof clusterSrc.getClusterExpansionZoom === "function") {
            clusterSrc.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              const coords = features[0].geometry.coordinates as [number, number];
              mapRef.current!.easeTo({ center: coords, zoom });
            });
          }
        }
      });

      mapRef.current.on("click", "unclustered-point", (e: { features?: Feature[] }) => {
        const coords = (e.features && e.features[0].geometry.coordinates) as [number, number] | undefined;
        const id = (e.features && e.features[0].properties && (e.features[0].properties.id as number | undefined)) as number | undefined;
        if (coords) {
          // use the real Map instance for popup.addTo since typings expect the concrete map
          new maplibregl.Popup().setLngLat(coords).setHTML(`<div class=\"p-2\">Point #${id ?? "?"}</div>`).addTo(realMap as unknown as import("maplibre-gl").Map);
        }
      });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          (realMap as unknown as MinimalMap).flyTo({ center: [longitude, latitude], zoom: 13 });
          new maplibregl.Marker({ color: "#000" }).setLngLat([longitude, latitude]).addTo(realMap as unknown as import("maplibre-gl").Map);
        },
        () => {
          // ignore
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    mapRef.current.on("movestart", () => document.body.classList.add("hide-bottom-nav"));
    mapRef.current.on("moveend", () => setTimeout(() => document.body.classList.remove("hide-bottom-nav"), 200));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      document.body.classList.remove("hide-bottom-nav");
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}
