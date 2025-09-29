/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // award 1000 points on first visit (try Supabase, fallback to localStorage)
    (async () => {
      const key = 'beachlife_points';
      try {
  const { data: userData } = await (supabase as any).auth.getUser();
  const user = userData?.user;
        if (user?.id) {
          // fetch existing profile
          const sel = await (supabase as any).from('profiles').select('points').eq('id', user.id).maybeSingle();
          if (sel.error) throw sel.error;
          const profile = sel.data as { points?: number } | null;
          const existingPoints = (profile && profile.points) || 0;
          const newPoints = existingPoints < 1000 ? existingPoints + 1000 : existingPoints;
          // upsert profile with points
          const { error: upsertErr } = await (supabase as any).from('profiles').upsert({ id: user.id, points: newPoints });
          if (upsertErr) throw upsertErr;
          localStorage.setItem(key, String(newPoints));
        } else {
          // no user, fallback to local
          const existing = Number(localStorage.getItem(key) || '0');
          if (existing < 1000) localStorage.setItem(key, String(existing + 1000));
        }
      } catch {
        const existing = Number(localStorage.getItem(key) || '0');
        if (existing < 1000) localStorage.setItem(key, String(existing + 1000));
      }

      // full screen confetti
      confetti({ particleCount: 300, spread: 160, origin: { y: 0.6 } });

      const t = setTimeout(() => router.push('/onboarding'), 3000);
      return () => clearTimeout(t);
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to BeachLife!</h1>
        <p className="mt-4">You received 1000 points for signing up 🎉</p>
      </div>
    </div>
  );
}
