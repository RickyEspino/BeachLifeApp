"use client";
import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function MerchantOnboardPage() {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { email, businessName, address, category, lat, lng };
      // save pending merchant data to localStorage; will be processed after sign-in
      localStorage.setItem('pending_merchant', JSON.stringify(payload));
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Magic link sent to the merchant email. After sign-in you will be routed to the merchant dashboard.');
    } catch (err) {
      console.error(err);
      let maybeMessage = 'Failed to send magic link';
      if (err && typeof err === 'object' && 'message' in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === 'string') maybeMessage = m;
      }
      alert(maybeMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Merchant onboarding</h1>

        <label className="block mb-2">Merchant email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" type="email" required />

        <label className="block mb-2">Business name</label>
        <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-2 border rounded mb-4" required />

        <label className="block mb-2">Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded mb-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Latitude</label>
            <input value={lat} onChange={(e) => setLat(e.target.value)} className="w-full p-2 border rounded mb-4" />
          </div>
          <div>
            <label className="block mb-2">Longitude</label>
            <input value={lng} onChange={(e) => setLng(e.target.value)} className="w-full p-2 border rounded mb-4" />
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>{loading ? 'Sending...' : 'Send magic link'}</button>
      </form>
    </div>
  );
}
