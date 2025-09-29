"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { supabase } from '../../../../lib/supabaseClient';

export default function ClaimPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [status, setStatus] = useState<'loading'|'needs-signin'|'awarding'|'done'|'error'>('loading');

  useEffect(() => {
    async function processClaim() {
      try {
        const { data: claimData, error: claimErr } = await supabase.from('claims').select().eq('id', id).single();
        if (claimErr || !claimData) {
          setStatus('error');
          return;
        }
        if (claimData.claimed) {
          setStatus('error');
          return;
        }
        const now = new Date();
        if (new Date(claimData.expires_at).getTime() <= now.getTime()) {
          setStatus('error');
          return;
        }
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          // prompt sign in by sending magic link to a prompt - simplified: route to /login with ?claim=
          router.push(`/login?claim=${id}`);
          setStatus('needs-signin');
          return;
        }
        setStatus('awarding');
        // award points to profile
        const pointsToAdd = claimData.points ?? 0;
        // increment safely on server; here use upsert fallback
        await supabase.from('profiles').upsert({ id: user.id }).select();
        try {
          await supabase.rpc('increment_points', { uid: user.id, delta: pointsToAdd });
        } catch {
          // fallback: read current and update
          const { data: p } = await supabase.from('profiles').select('points').eq('id', user.id).single();
          const current = (p as { points?: number } | null)?.points ?? 0;
          await supabase.from('profiles').update({ points: current + pointsToAdd }).eq('id', user.id);
        }

        // mark claim as claimed
        await supabase.from('claims').update({ claimed: true, claimed_by: user.id }).eq('id', id);

        // show confetti
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
        setStatus('done');
        setTimeout(() => router.push('/now'), 2000);
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    }
    processClaim();
    return () => { /* cleanup */ };
  }, [id, router]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Processing...</div>;
  if (status === 'needs-signin') return <div className="min-h-screen flex items-center justify-center">Please sign in to claim points...</div>;
  if (status === 'error') return <div className="min-h-screen flex items-center justify-center">Claim invalid or expired.</div>;
  if (status === 'awarding') return <div className="min-h-screen flex items-center justify-center">Awarding points...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center"> 
      <div className="text-center">
        <h1 className="text-2xl font-bold">Points awarded!</h1>
        <p className="mt-4">You earned points — redirecting...</p>
      </div>
    </div>
  );
}
