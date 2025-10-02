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

interface MapViewProps {
  pins?: { id: string; name: string; lat: number; lng: number }[];
  loadingPins?: boolean;
  error?: string | null;
}

export default function MapView({ pins = [], loadingPins = false, error = null }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MinimalMap | null>(null);
  const lastUserCoords = useRef<[number, number] | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    // Myrtle Beach, SC (lng, lat)
    const defaultCenter: [number, number] = [-78.8856, 33.6891];

    // simple satellite style using ESRI World Imagery raster tiles (no token required)
    const satelliteStyle = {
      version: 8,
      sources: {
        sat: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "sat-layer",
          type: "raster",
          source: "sat",
        },
      ],
    } as const;

    // create the real Maplibre map and keep a minimal typed reference for our usage
    // cast via unknown to avoid ESLint complaining about explicit 'any' while still allowing
    // the inline style object; this is a minimal, focused assertion.
    const realMap = new maplibregl.Map({
      container: mapContainer.current,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style: satelliteStyle as unknown as any,
      center: defaultCenter,
      zoom: 12,
    });

    // store a minimal view of the map to avoid leaking full third-party types everywhere
    mapRef.current = realMap as unknown as MinimalMap;

  // add controls using the real map instance (maplibregl types expect the concrete object)
  realMap.addControl(new maplibregl.NavigationControl() as unknown);

    const featureCollection = {
      type: "FeatureCollection",
      features: pins.map((p) => ({
        type: "Feature",
        properties: { id: p.id, title: p.name },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
    };

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      mapRef.current.addSource("points", {
        type: "geojson",
        data: featureCollection,
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
        const props = e.features && e.features[0].properties as Record<string, unknown> | undefined;
        const id = props?.id as string | number | undefined;
        const title = props?.title as string | undefined;
        if (coords) {
          new maplibregl.Popup()
            .setLngLat(coords)
            .setHTML(`<div class=\"p-2\"><div class=\"font-semibold\">${title ?? 'Location'}</div><div class=\"text-xs\">ID: ${id ?? '?'}</div></div>`)
            .addTo(realMap as unknown as import("maplibre-gl").Map);
        }
      });
    });

    // User location source + layer (pulsing dot) will be added after first successful position
    let watchId: number | null = null;
    if (navigator.geolocation) {
      const addOrUpdateUserLocation = (lng: number, lat: number) => {
        lastUserCoords.current = [lng, lat];
        type MutableMap = { getSource?: (id: string) => unknown; addSource?: (id: string, src: unknown) => void; addLayer?: (layer: unknown) => void };
        const m = realMap as unknown as MutableMap; // narrowed structural type
        const feature = {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} },
          ],
        };
        const src = typeof m.getSource === 'function' ? (m.getSource('user-location') as unknown) : null;
        if (src && (src as { setData?: (d: unknown) => void }).setData) {
          try { (src as { setData?: (d: unknown) => void }).setData?.(feature); } catch { /* ignore */ }
          return;
        }
        if (typeof m.addSource === 'function') {
          try {
            m.addSource('user-location', { type: 'geojson', data: feature });
            if (typeof m.addLayer === 'function') m.addLayer({
              id: 'user-location-glow',
              type: 'circle',
              source: 'user-location',
              paint: {
                'circle-radius': 14,
                'circle-color': '#3b82f6',
                'circle-opacity': 0.25,
              },
            });
            if (typeof m.addLayer === 'function') m.addLayer({
              id: 'user-location-dot',
              type: 'circle',
              source: 'user-location',
              paint: {
                'circle-radius': 6,
                'circle-color': '#2563eb',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff',
              },
            });
          } catch {
            setTimeout(() => addOrUpdateUserLocation(lng, lat), 200);
          }
        }
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          (realMap as unknown as MinimalMap).flyTo({ center: [longitude, latitude], zoom: 14 });
          addOrUpdateUserLocation(longitude, latitude);
        },
        () => { /* ignore */ },
        { enableHighAccuracy: true, timeout: 7000 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
            addOrUpdateUserLocation(longitude, latitude);
        },
        () => { /* ignore */ },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    mapRef.current.on("movestart", () => document.body.classList.add("hide-bottom-nav"));
    mapRef.current.on("moveend", () => setTimeout(() => document.body.classList.remove("hide-bottom-nav"), 200));

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      mapRef.current?.remove();
      mapRef.current = null;
      document.body.classList.remove("hide-bottom-nav");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for map init
  }, []);

  // Update source data when pins change
  useEffect(() => {
    if (!mapRef.current) return;
    const sourceUnknown = mapRef.current.getSource && mapRef.current.getSource('points');
    const realSource = sourceUnknown as { setData?: (d: unknown) => void } | null;
    if (!realSource || typeof realSource.setData !== 'function') return;
    const newCollection = {
      type: 'FeatureCollection',
      features: (pins || []).map(p => ({
        type: 'Feature',
        properties: { id: p.id, title: p.name },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      })),
    };
    try {
      realSource.setData(newCollection);
    } catch {
      // ignore
    }
  }, [pins]);

  return (
    <div ref={mapContainer} className="w-full h-full relative">
      {(loadingPins || error) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-xs px-3 py-1 rounded shadow pointer-events-none">
          {loadingPins ? 'Loading locations…' : error}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          type Easeable = { easeTo?: (opts: unknown) => void };
          const m = mapRef.current as unknown as Easeable;
          if (!m || !lastUserCoords.current) return;
          m.easeTo?.({ center: lastUserCoords.current, zoom: 15 });
        }}
        className="absolute z-10 bottom-4 right-4 bg-white/90 backdrop-blur text-xs px-3 py-2 rounded shadow hover:bg-white active:scale-95 transition"
      >My Location</button>
    </div>
  );
}
