"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex items-center justify-center p-6 bg-[#fdf8fb] font-sans">
        <div className="max-w-md w-full rounded-2xl bg-white border border-[#e8dff5] shadow-lg p-6 space-y-4 text-center">
          <h1 className="text-xl font-bold text-gray-800">Something went wrong</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            The app hit an unexpected error. If you installed it on your home screen,
            remove the shortcut, open the site in Chrome, then install again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-xl bg-[#a892d4] hover:bg-[#9680c8] text-white font-medium py-2.5 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
