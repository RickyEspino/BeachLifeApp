"use client";
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let avatarUrl = '';
    try {
      if (avatarFile) {
        // try to upload to supabase storage 'avatars' bucket
        const fileName = `avatars/${Date.now()}-${avatarFile.name}`;
        const { data, error: uploadErr } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { cacheControl: '3600', upsert: false });
        if (!uploadErr && data?.path) {
          const publicData = supabase.storage.from('avatars').getPublicUrl(data.path);
          avatarUrl = publicData.data.publicUrl;
        } else {
          // fallback: store base64 in localStorage
          const reader = await new Promise<string | null>((res) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result));
            r.onerror = () => res(null);
            r.readAsDataURL(avatarFile);
          });
          if (reader) avatarUrl = reader;
        }
      }

      // try to persist profile and points to Supabase
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user?.id) {
        const { error: upsertErr } = await supabase.from('profiles').upsert({ id: user.id, username, avatar_url: avatarUrl });
        if (upsertErr) throw upsertErr;

        // update points by fetching and incrementing
  const sel = await supabase.from('profiles').select('points').eq('id', user.id).maybeSingle();
  if (sel.error) throw sel.error;
  const profile = sel.data as { points?: number } | null;
  const existing = (profile && profile.points) || 0;
  const { error: pointsErr } = await supabase.from('profiles').upsert({ id: user.id, points: existing + 500 });
        if (pointsErr) throw pointsErr;

        localStorage.setItem('beachlife_profile', JSON.stringify({ username, avatarUrl }));
        localStorage.setItem('beachlife_points', String((existing || 0) + 500));
      } else {
        // fallback local
        const profile = { username, avatarUrl };
        localStorage.setItem('beachlife_profile', JSON.stringify(profile));
        const key = 'beachlife_points';
        const existing = Number(localStorage.getItem(key) || '0');
        localStorage.setItem(key, String(existing + 500));
      }

      router.push('/now');
    } catch (err) {
      console.error(err);
      alert('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Finish setup</h1>
        <label className="block mb-2">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded mb-4" required />

        <label className="block mb-2">Avatar (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)} className="mb-4" />

        <p className="text-sm text-gray-600 mb-4">Complete this step to earn 500 points.</p>

        <button className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Complete onboarding'}</button>
      </form>
    </div>
  );
}
