'use client';

import { useEffect } from 'react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Console Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-lg">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Admin Dashboard Error</h2>
            <p className="text-red-600 dark:text-red-500 mb-6 text-center text-sm max-w-lg">
                The admin panel encountered an unexpected issue. This does not affect public listings or user profiles.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Reload Dashboard
                </button>
                <a
                    href="/"
                    className="px-4 py-2 border border-red-200 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
