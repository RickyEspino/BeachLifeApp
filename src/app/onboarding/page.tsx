/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return alert('Enter a username');
    setUploading(true);
    try {
      const sb = supabase as any;
      // upload avatar if provided
      let avatarUrl = '';
      if (avatarFile) {
        const fileName = `${Date.now()}_${avatarFile.name}`;
        const { data, error: uploadErr } = await sb.storage.from('avatars').upload(fileName, avatarFile, { cacheControl: '3600', upsert: false });
        if (uploadErr) throw uploadErr;
        const publicData = sb.storage.from('avatars').getPublicUrl(data.path);
        avatarUrl = publicData?.publicUrl ?? publicData?.data?.publicUrl ?? '';
      }

      const { data: userData } = await sb.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error('Not signed in');

      // upsert profile with username and avatar
      const { error: upsertErr } = await sb.from('profiles').upsert({ id: user.id, username, avatar_url: avatarUrl });
      if (upsertErr) throw upsertErr;

      // award 500 onboarding points
      const sel = await sb.from('profiles').select('points').eq('id', user.id).maybeSingle();
      const existing = (sel.data as any)?.points ?? 0;
      const { error: pointsErr } = await sb.from('profiles').upsert({ id: user.id, points: existing + 500 });
      if (pointsErr) throw pointsErr;

      localStorage.setItem('beachlife_profile', JSON.stringify({ username, avatarUrl }));
      localStorage.setItem('beachlife_points', String(existing + 500));

      router.push('/now');
    } catch (err) {
      console.error(err);
      alert('Failed to complete onboarding');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Complete Onboarding</h1>
        <label className="block mb-2">Choose a username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded mb-4" required />

        <label className="block mb-2">Avatar (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="w-full mb-4" />

        <button className="w-full bg-blue-600 text-white p-2 rounded" disabled={uploading}>{uploading ? 'Saving...' : 'Finish'}</button>
      </form>
    </div>
  );
}
