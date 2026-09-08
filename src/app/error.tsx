"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-gradient-to-br from-cream-50 via-rose-50/25 to-lavender-50/35">
      <div className="max-w-md w-full rounded-2xl bg-white/90 border border-lavender-100 shadow-soft p-6 space-y-4 text-center">
        <h1 className="font-display text-xl font-bold text-gray-800">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          The app hit an unexpected error on this device. Your data is still saved —
          try opening the Report page for your doctor visit, or sign in again below.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-xl bg-lavender-400 hover:bg-lavender-500 text-white font-medium py-2.5 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/report"
            className="w-full rounded-xl bg-white border border-lavender-200 text-lavender-700 font-medium py-2.5 transition-colors block"
          >
            Open doctor report
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl bg-white border border-lavender-200 text-gray-600 font-medium py-2.5 transition-colors block"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
