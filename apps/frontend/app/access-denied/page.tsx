'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mb-5">
        <div className="text-white text-xl text-center">
          The TPO Portal now features a secure access control system. Instead of public access, the portal is now restricted via unique, trackable links provided to authorized users only.
        </div>
      </div>
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          This link has expired or is invalid. Please contact the Training and Placement Officer (TPO) for assistance.
        </p>

        <Link
          href="/contact"
          className="inline-block w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Contact TPO
        </Link>

        {/* <div className="mt-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-300 underline underline-offset-4">Return to Home</Link>
        </div> */}
      </div>
    </div>
  );
}
