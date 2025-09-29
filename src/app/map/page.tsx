"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiZXNwaW5vd2VicyIsImEiOiJjbWc0OWFqcXAwMW94MmtweWFnYTI0ZXpzIn0.RSQUwJFHnIEyCjwRC1kiHQ";

export default function Page() {
	const mapContainer = useRef<HTMLDivElement | null>(null);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const mapRef = useRef<any | null>(null);

	useEffect(() => {
		if (!mapContainer.current) return;
		if (mapRef.current) return; // already initialized

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: "mapbox://styles/mapbox/streets-v11",
			center: [-122.431297, 37.773972], // San Francisco
			zoom: 12,
		});

		// add navigation control
		mapRef.current.addControl(new mapboxgl.NavigationControl());

		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	return (
		<div className="w-full h-[calc(100vh-64px)]">{/* subtract bottom nav height fallback */}
			<div ref={mapContainer} className="w-full h-full" />
		</div>
	);
}