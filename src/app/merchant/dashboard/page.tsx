"use client";
import Link from 'next/link';

export default function MerchantDashboard() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
      <p className="mt-2">Welcome, merchant — your role is set to <strong>merchant</strong>.</p>
      <div className="mt-4">
        <Link className="text-blue-600 underline" href="/merchant/register">Go to Register</Link>
      </div>
    </div>
  );
}
