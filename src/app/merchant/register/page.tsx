/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

export default function MerchantRegister() {
  const router = useRouter();
  const [amountCents, setAmountCents] = useState(0); // store cents
  const [creating, setCreating] = useState(false);

  function appendDigit(d: number) {
    // max 6 digits
    const next = Math.min(999999, amountCents * 10 + d);
    setAmountCents(next);
  }

  function backspace() {
    setAmountCents(Math.floor(amountCents / 10));
  }

  function clear() {
    setAmountCents(0);
  }

  const dollars = (amountCents / 100).toFixed(2);

  async function handleCreateClaim() {
    if (amountCents <= 0) return alert('Enter an amount');
    setCreating(true);
    try {
      const sb = supabase;
      if (!sb) throw new Error('Supabase client not initialized. This action must run in the browser after environment variables are available.');
      const { data: userData } = await (sb as any).auth.getUser();
      const user = userData?.user;
      const points = Math.round(amountCents / 100);
      const expires_at = new Date(Date.now() + 60_000).toISOString();

      if (!user) {
        // not signed in: prompt for merchant email to send magic link and save pending claim
        const email = prompt('You are not signed in. Enter your merchant email to receive a magic link:');
        if (!email) {
          setCreating(false);
          return;
        }
        const payload = { amountCents, points, expires_at };
  localStorage.setItem('pending_claim', JSON.stringify(payload));
  await (sb as any).auth.signInWithOtp({ email });
        alert('Magic link sent. Sign in and return to this page to create the claim.');
        setCreating(false);
        return;
      }

        type ClaimInsert = {
          merchant_id: string;
          amount_cents: number;
          points: number;
          expires_at: string;
        };
        // Use the server-side RPC to create the claim securely
  const rpcRes = await (sb as any).rpc('create_claim', { merchant: user.id, amount_cents: amountCents, points, expires_at });
        let claimId: string | null = null;
        // rpcRes may be an object with { data } or an array/object directly; check safely
        let rpcErr: unknown = null;
        if (rpcRes !== null && typeof rpcRes === 'object') {
          const rpcObj = rpcRes as unknown as Record<string, unknown>;
          rpcErr = rpcObj.error ?? null;
          const data = rpcObj.data ?? rpcRes;
          if (data && typeof data === 'object') {
            const dataObj = data as Record<string, unknown>;
            if (typeof dataObj.id === 'string') claimId = dataObj.id;
            else if (Array.isArray(data) && data.length > 0 && typeof (data[0] as Record<string, unknown>)['id'] === 'string') claimId = (data[0] as Record<string, unknown>)['id'] as string;
          }
        }
        if (rpcErr || !claimId) throw (rpcErr as Error) ?? new Error('failed to create claim');
  // open the merchant claim page to show QR code
  router.push(`/merchant/claim/${claimId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create claim. Make sure you are signed in as the merchant.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Register Sale</h1>

      <div className="w-72 p-4 border rounded mb-4 text-center">
        <div className="text-sm text-gray-500">Amount</div>
        <div className="text-3xl font-mono mt-2">${dollars}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 w-72 mb-4">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => appendDigit(n)} className="p-4 bg-gray-100 rounded text-xl">{n}</button>
        ))}
        <button onClick={clear} className="p-4 bg-yellow-100 rounded text-xl">C</button>
        <button onClick={() => appendDigit(0)} className="p-4 bg-gray-100 rounded text-xl">0</button>
        <button onClick={backspace} className="p-4 bg-red-100 rounded text-xl">⌫</button>
      </div>

      <button onClick={handleCreateClaim} disabled={creating || amountCents <= 0} className="w-72 bg-blue-600 text-white p-3 rounded">
        {creating ? 'Creating...' : `Create claim for $${dollars}`}
      </button>
    </div>
  );
}
