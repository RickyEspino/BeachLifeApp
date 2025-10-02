"use client";

import { useEffect, useState } from "react";
import MapView from "../../components/MapView";
import { supabase, ensureReady } from "../../../lib/supabaseClient";

type MerchantPin = { id: string; name: string; lat: number; lng: number };

export default function Page() {
	const [pins, setPins] = useState<MerchantPin[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				await ensureReady();
				type RawResult = { data: unknown; error: { message: string } | null };
				const api = (supabase as unknown as { from: (t: string) => { select: (_: string) => { limit: (_: number) => Promise<RawResult> } } });
				const res = await api.from('merchants').select('id,business_name,lat,lng').limit(500);
				if (res.error) throw new Error(res.error.message);
				const raw = res.data;
				if (!cancelled && Array.isArray(raw)) {
					function isRow(v: unknown): v is { id: string; business_name: string; lat: number; lng: number } {
						if (!v || typeof v !== 'object') return false;
						const o = v as Record<string, unknown>;
						return typeof o.id === 'string' && typeof o.business_name === 'string' && typeof o.lat === 'number' && typeof o.lng === 'number';
					}
					const cleaned = raw.filter(isRow).map(r => ({ id: r.id, name: r.business_name, lat: r.lat, lng: r.lng }));
					setPins(cleaned);
				}
			} catch (e) {
				if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load pins');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => { cancelled = true; };
	}, []);

	return (
		<div className="map-full">
			<MapView pins={pins} loadingPins={loading} error={error} />
		</div>
	);
}