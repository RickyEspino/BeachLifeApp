/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import { supabase, isSupabaseClientReady } from '../../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!isSupabaseClientReady) {
      setLoading(false);
      return alert('Supabase client not ready. Please retry in a normal browser session (check your environment).');
    }
    const sb = supabase as any;
    const { error } = await sb.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert('Magic link sent — check your email.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleMagicLink} className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        <label className="block mb-2">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" type="email" required />
        <button className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}
