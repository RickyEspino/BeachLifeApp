"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Page() {
	const router = useRouter();
	const [installAvailable, setInstallAvailable] = useState(false);
	const [installing, setInstalling] = useState(false);

		useEffect(() => {
			// Detect if the deferred install prompt has been captured by InstallPrompt
			// which stores it on window.__beachlife_before_install_event
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (typeof window !== 'undefined' && window.__beachlife_before_install_event) {
				setInstallAvailable(true);
			}
		}, []);

	async function onInstallClick() {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const be = typeof window !== 'undefined' ? window.__beachlife_before_install_event : null;
			if (!be) {
				// If the browser didn't expose an automatic install prompt, show manual
				// instructions on the installing page so users can add the app to home.
				return router.push('/installing');
			}

		try {
			setInstalling(true);
			await be.prompt();
			await be.userChoice;
		} catch (err) {
			// ignore
			} finally {
				// Show the installing page while the user completes the OS-level install.
				// Once the app is installed and opened from the device, the manifest
				// `start_url` will land the installed app at /login.
				router.push('/installing');
			}
	}

	return (
		<section className="mx-auto max-w-xl">
			<h1 className="text-2xl font-bold">Welcome to BeachLife</h1>
			<p className="mt-2 text-gray-600">Discover deals, nearby events, and earn points.</p>

			<div className="mt-6 glass-card elevated">
				<h2 className="text-lg font-semibold">Get started</h2>
				<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Install the app for quicker access and a better experience.</p>

				<div className="mt-4">
								<button
									onClick={onInstallClick}
									className="px-4 py-2 rounded-md bg-cyan-500 text-white"
									disabled={installing}
								>
									{installing ? 'Installing...' : 'Install BeachLife'}
								</button>
											{!installAvailable && (
												<div className="mt-2 text-sm text-gray-500">If automatic install is not available in your browser, tap the button for manual install instructions.</div>
											)}
				</div>
			</div>
		</section>
	);
}
