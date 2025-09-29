"use client";

import MapView from "../../components/MapView";

export default function Page() {
	return (
		<div className="map-full">{/* full-map helper accounts for bottom nav and safe area */}
			<MapView />
		</div>
	);
}