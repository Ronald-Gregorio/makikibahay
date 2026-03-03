'use client';

import { useEffect } from 'react';

export default function OwnerError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Owner Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Owner Dashboard Error</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center text-sm max-w-lg">
                We could not load your management tools at this moment.
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded hover:opacity-90 transition"
            >
                Refresh Tools
            </button>
        </div>
    );
}
