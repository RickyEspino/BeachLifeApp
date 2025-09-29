"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Page() {
	const router = useRouter();
		// Intro page — no install button here. The InstallPrompt component will show
		// an automatic install banner when the browser fires `beforeinstallprompt`.

	return (
		<section className="mx-auto max-w-xl">
			<h1 className="text-2xl font-bold">Welcome to BeachLife</h1>
			<p className="mt-2 text-gray-600">Discover deals, nearby events, and earn points.</p>

			<div className="mt-6 glass-card elevated">
				<h2 className="text-lg font-semibold">Get started</h2>
				<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Install the app for quicker access and a better experience.</p>

						<div className="mt-4">
							<a href="/login" className="px-4 py-2 rounded-md bg-cyan-500 text-white inline-block">Get started</a>
						</div>
			</div>
		</section>
	);
}
