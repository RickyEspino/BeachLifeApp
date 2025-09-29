/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';

export default function Page() {
	const [points, setPoints] = useState<number | null>(null);
	const [profile, setProfile] = useState<{ username?: string; avatar_url?: string } | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const { data: userData } = await supabase.auth.getUser();
				const user = userData?.user;
				if (user?.id) {
					const sb = supabase;
					if (!sb) return;
					const sel = await (sb as any).from('profiles').select('username, avatar_url, points').eq('id', user.id).maybeSingle();
								if (!sel.error && sel.data) {
									const d = sel.data as { username?: string; avatar_url?: string; points?: number };
									setProfile({ username: d.username, avatar_url: d.avatar_url });
									setPoints(d.points ?? 0);
									localStorage.setItem('beachlife_profile', JSON.stringify({ username: d.username, avatarUrl: d.avatar_url }));
									localStorage.setItem('beachlife_points', String(d.points ?? 0));
						return;
					}
				}
						} catch {
				// ignore and fallback
			}

			// fallback to localStorage
			const localProfile = localStorage.getItem('beachlife_profile');
			if (localProfile) setProfile(JSON.parse(localProfile));
			const localPoints = Number(localStorage.getItem('beachlife_points') || '0');
			setPoints(localPoints);
		})();
	}, []);

	return (
		<section className="mx-auto max-w-xl">
			<h1 className="text-2xl font-bold">Me</h1>
			<p className="mt-2 text-gray-600">Deals, nearby action, and today’s points.</p>

			<div className="mt-6 flex items-center gap-4">
				{profile?.avatar_url ? (
					<div className="w-16 h-16 rounded-full overflow-hidden">
						{/* next/image requires absolute or static imports; allowing remote URL */}
						<Image src={profile.avatar_url} alt="avatar" width={64} height={64} />
					</div>
				) : (
					<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">🙂</div>
				)}

				<div>
					<div className="font-semibold">{profile?.username || 'Guest'}</div>
					<div className="text-sm text-gray-600">Points: {points ?? '—'}</div>
				</div>
			</div>
		</section>
	);
}