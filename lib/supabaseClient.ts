'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client in the browser and when env vars are present.
// This avoids Next.js prerender/build errors where env vars may not be available
// and prevents `supabaseKey is required` errors during server-side module evaluation.
let _supabase: ReturnType<typeof createClient> | null = null;
if (typeof window !== 'undefined' && url && anonKey) {
	_supabase = createClient(url, anonKey);
}

function makeStub() {
	const thrower = () => { throw new Error('Supabase client not initialized. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set and that this code runs in the browser.'); };
	const stubAny: any = new Proxy({}, {
		get() { return thrower; }
	});
	return stubAny;
}

// Export as `any` so consumers can call methods without TS nullable checks during build.
// At runtime, if the real client isn't available (e.g., during prerender), the stub will throw a helpful error.
export const supabase: any = _supabase ?? makeStub();
