"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { supabase } from '../../../../../lib/supabaseClient';

export default function MerchantClaimPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);

  useEffect(() => {
    let mounted = true;
    async function fetchClaim() {
      const sb = supabase as any;
      const { data, error } = await sb.from('claims').select().eq('id', id).single();
      if (error || !data) {
        alert('Claim not found');
        router.push('/merchant/register');
        return;
      }
      const now = new Date();
      const expires = new Date((data as any).expires_at);
      if (expires.getTime() <= now.getTime()) {
        alert('Claim expired');
        router.push('/merchant/register');
        return;
      }
      // create a one-time URL for users to scan
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const claimUrl = `${origin}/claim/${id}`;
      const qr = await QRCode.toDataURL(claimUrl);
      if (mounted) setQrDataUrl(qr);

      // countdown
      const msLeft = expires.getTime() - now.getTime();
      setSecondsLeft(Math.max(0, Math.ceil(msLeft / 1000)));
      const interval = setInterval(() => {
        const newLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 1000));
        setSecondsLeft(newLeft);
        if (newLeft <= 0) {
          clearInterval(interval);
          router.push('/merchant/register');
        }
      }, 250);
    }
    fetchClaim();
    return () => { mounted = false; };
  }, [id, router]);

  if (!qrDataUrl) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">Scan to claim</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="QR code" className="w-64 h-64 bg-white p-2 rounded" />
      <div className="mt-4 text-sm text-gray-600">Expires in {secondsLeft}s</div>
      <div className="mt-6">
        <a className="text-blue-600 underline" href={`/merchant/register`}>Back to register</a>
      </div>
    </div>
  );
}
