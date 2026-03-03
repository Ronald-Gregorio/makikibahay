'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global application error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Something went wrong!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                We apologize for the inconvenience. An unexpected error occurred in the application.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity"
            >
                Try again
            </button>
        </div>
    );
}
