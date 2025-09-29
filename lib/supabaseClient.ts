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
	// Provide a minimal no-op client surface that returns resolved shapes instead of throwing.
	// This prevents a hard client-side exception during hydration when env vars are missing.
	const noOp = async () => ({ data: null, error: { message: 'Supabase client not initialized' } });

	const stub = {
			auth: {
				getUser: async () => ({ data: null }),
				signInWithOtp: async () => ({ error: { message: 'Supabase client not initialized' } }),
				onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
			},
			from: () => ({
			select: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
			insert: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
			update: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
			upsert: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
			maybeSingle: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
			single: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
		}),
			rpc: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
			storage: {
				from: () => ({
					upload: async () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
					getPublicUrl: () => ({ publicUrl: '' }),
				}),
			},
	} as unknown;

	return stub;
}

// Export typed Supabase client. If the real client is not available we cast the stub at runtime.
export const supabase: SupabaseClient = (_supabase ?? makeStub()) as unknown as SupabaseClient;

// Helpful runtime flag so UI can detect whether the real client was initialized.
// This is useful to show friendlier errors when running in environments where
// the public env vars are not available (for example during certain SSR or preview builds).
export const isSupabaseClientReady = Boolean(_supabase);
