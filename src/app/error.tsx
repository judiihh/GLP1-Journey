"use client";

import { useEffect } from "react";

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
          The app hit an unexpected error. If you installed it on your home screen,
          try closing it completely and opening it again. If it keeps happening,
          remove the home screen shortcut and reinstall from Chrome.
        </p>
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl bg-lavender-400 hover:bg-lavender-500 text-white font-medium py-2.5 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
