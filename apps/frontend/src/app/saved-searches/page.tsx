'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Trash2, Search, ArrowRight } from 'lucide-react';

interface SavedSearch {
    id: string;
    name: string;
    filters: Record<string, string>;
    resultsCount: number;
    savedAt: string;
}

const MOCK_SAVED: SavedSearch[] = [
    {
        id: '1',
        name: 'Affordable Solo Rooms in Nueva Ecija',
        filters: { priceMax: '₱5,000', propertyType: 'Boarding House', amenities: 'WiFi, AC' },
        resultsCount: 14,
        savedAt: '2026-03-10',
    },
    {
        id: '2',
        name: 'Studio Units near Wesleyan University',
        filters: { priceMax: '₱8,000', propertyType: 'Studio Type', community: 'Near University' },
        resultsCount: 7,
        savedAt: '2026-03-08',
    },
    {
        id: '3',
        name: 'Pet-Friendly Apartments',
        filters: { petPolicy: 'Any Pet Friendly', priceMax: '₱10,000' },
        resultsCount: 3,
        savedAt: '2026-03-05',
    },
];

export default function SavedSearchesPage() {
    const [searches, setSearches] = useState<SavedSearch[]>(MOCK_SAVED);

    const remove = (id: string) => setSearches(prev => prev.filter(s => s.id !== id));

    return (
        <div className="min-h-screen bg-gray-light">
            <div className="max-w-[1400px] mx-auto px-5 py-10">
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-[28px] font-bold text-text-dark flex items-center gap-2">
                        <BookmarkCheck className="h-7 w-7 text-primary-green" />
                        Saved Searches
                    </h1>
                    <p className="text-gray-text mt-1">Resume past searches or run them again to see new listings.</p>
                </div>

                {searches.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-border rounded-lg">
                        <Search className="mx-auto h-12 w-12 text-gray-text mb-4" />
                        <h2 className="text-xl font-semibold text-text-dark mb-2">No Saved Searches</h2>
                        <p className="text-gray-text mb-6">Try filtering results on the browse page and saving your search.</p>
                        <Link
                            href="/browse"
                            className="inline-block px-6 py-2.5 bg-primary-green hover:bg-primary-green-hover text-white font-medium rounded transition-colors"
                        >
                            Go to Browse
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {searches.map(s => (
                            <div
                                key={s.id}
                                className="bg-white border border-gray-border rounded-lg p-6 flex items-start justify-between gap-4 hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-shadow"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-text-dark">{s.name}</h3>

                                    {/* Filter chips */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Object.entries(s.filters).map(([key, val]) => (
                                            <span
                                                key={key}
                                                className="bg-gray-light text-gray-text text-xs font-medium px-3 py-1 rounded-full"
                                            >
                                                {val}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-text">
                                        <span className="font-semibold text-primary-green">{s.resultsCount} results</span>
                                        <span>Saved on {new Date(s.savedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href="/browse"
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-green hover:bg-primary-green-hover text-white text-sm font-medium rounded transition-colors"
                                    >
                                        <Search className="h-3.5 w-3.5" /> Run Search <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                    <button
                                        onClick={() => remove(s.id)}
                                        className="p-2 text-gray-text hover:text-red-alert transition-colors"
                                        aria-label="Delete saved search"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
