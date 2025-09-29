"use client";

import { useEffect } from 'react';

export default function InstallingPage() {
  useEffect(() => {
    // This page instructs the user to wait for the installation to complete.
    // Nothing else is needed here – when the PWA is opened later, the manifest
    // `start_url` will point to `/login` to continue the flow.
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Installing BeachLife</h1>
        <p className="text-gray-600 mb-6">The app is being added to your device. Please wait for the installation to finish, then open the installed app from your home screen or app launcher.</p>
        <p className="text-sm text-gray-500">If you close this page, open the installed app from your device and it will take you to the login screen.</p>
      </div>
    </div>
  );
}
