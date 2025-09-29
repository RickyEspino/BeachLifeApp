"use client";

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client in the browser and when env vars are present.
// This avoids Next.js prerender/build errors where env vars may not be available
// and prevents `supabaseKey is required` errors during server-side module evaluation.
let _supabase: SupabaseClient | null = null;
if (typeof window !== 'undefined' && url && anonKey) {
	_supabase = createClient(url, anonKey);
}

function makeStub(): unknown {
	const thrower = () => {
		throw new Error('Supabase client not initialized. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set and that this code runs in the browser.');
	};
	const stub = new Proxy({}, { get: () => thrower }) as unknown;
	return stub;
}

// Export typed Supabase client. If the real client is not available we cast the stub at runtime.
export const supabase: SupabaseClient = (_supabase ?? makeStub()) as unknown as SupabaseClient;
