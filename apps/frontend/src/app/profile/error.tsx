'use client';

import { useEffect } from 'react';

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('User Profile Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Profile Error</h2>
            <p className="text-slate-500 text-sm mb-6">
                We encountered a problem loading your user profile details.
            </p>
            <button
                onClick={() => reset()}
                className="text-sm font-medium px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
                Reload Profile
            </button>
        </div>
    );
}
