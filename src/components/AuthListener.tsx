/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
  const { data: sub } = sb.auth.onAuthStateChange(async (event: string) => {
      if (event === 'SIGNED_IN') {
        // if there's pending merchant data saved before sign-in, process it
        const pending = localStorage.getItem('pending_merchant');
        // if there's a pending claim saved before sign-in, process it (merchant creating a claim)
        const pendingClaim = localStorage.getItem('pending_claim');
          try {
          const { data: userData } = await sb.auth.getUser();
          const user = userData?.user;
          if (pending && user?.id) {
            const payload = JSON.parse(pending);
            // upsert profile with merchant role
            await sb.from('profiles').upsert({ id: user.id, role: 'merchant', username: payload.businessName });
            // insert merchant record
            await sb.from('merchants').insert({ id: user.id, business_name: payload.businessName, address: payload.address, category: payload.category, lat: payload.lat, lng: payload.lng });
            localStorage.removeItem('pending_merchant');
            router.push('/merchant/dashboard');
            return;
          }

          if (pendingClaim && user?.id) {
              try {
              const payload = JSON.parse(pendingClaim);
              const { amountCents, points, expires_at } = payload;
              // call RPC to create claim server-side
              const rpcRes = await sb.rpc('create_claim', { merchant: user.id, amount_cents: amountCents, points, expires_at });
              const rpcTyped = rpcRes as unknown as { data?: unknown; error?: unknown };
              const rpcData = rpcTyped.data ?? null;
              const rpcErr = rpcTyped.error ?? null;
              let claimId: string | null = null;
              if (rpcData && typeof rpcData === 'object') {
                const rpcDataRecord = rpcData as Record<string, unknown> | Array<Record<string, unknown>>;
                if (!Array.isArray(rpcDataRecord) && typeof (rpcDataRecord as Record<string, unknown>)['id'] === 'string') {
                  claimId = (rpcDataRecord as Record<string, unknown>)['id'] as string;
                } else if (Array.isArray(rpcDataRecord) && rpcDataRecord.length > 0 && typeof rpcDataRecord[0]['id'] === 'string') {
                  claimId = rpcDataRecord[0]['id'] as string;
                }
              }
              if (!rpcErr && claimId) {
                localStorage.removeItem('pending_claim');
                router.push(`/merchant/claim/${claimId}`);
                return;
              }
            } catch (e) {
              console.error('failed to process pending claim', e);
            }
          }
        } catch {
          // fall back to welcome
        }
        // default behavior: route new sign-ins to welcome
        router.push('/welcome');
      }
    });
    return () => {
      sub?.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
