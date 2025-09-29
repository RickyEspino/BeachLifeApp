"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing'|'done'|'error'>('processing');

  useEffect(() => {
    async function finalize() {
      try {
        // Supabase provides a helper to parse the session from URL for magic links.
        // Newer supabase-js versions expose `getSessionFromUrl` on auth; if unavailable
        // we fall back to onAuthStateChange or a redirect to /login.
        // @ts-expect-error - supabase-js may not have getSessionFromUrl on older/newer versions
        if (typeof supabase?.auth?.getSessionFromUrl === 'function') {
          // This will set the session in the client if the URL contains the access token.
          // @ts-expect-error - method exists on some supabase versions
          const res = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (res?.data?.session) {
            setStatus('done');
            router.replace('/now');
            return;
          }
        }

        // Fallback: wait briefly for auth state to update then check user
        await new Promise((r) => setTimeout(r, 800));
  const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setStatus('done');
          router.replace('/now');
        } else {
          setStatus('error');
          router.replace('/login');
        }
      } catch (err) {
        console.error('Callback finalize error', err);
        setStatus('error');
        router.replace('/login');
      }
    }
    finalize();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'processing' && <div>Finalizing sign-in…</div>}
      {status === 'done' && <div>Signed in — redirecting…</div>}
      {status === 'error' && <div>Failed to sign in. Redirecting to login…</div>}
    </div>
  );
}
