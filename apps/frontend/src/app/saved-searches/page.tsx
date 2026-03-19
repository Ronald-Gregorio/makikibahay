'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Trash2, Search, ArrowRight, Loader2 } from 'lucide-react';
import { savedSearchService } from '@/services/api/savedSearches';
import { useToast } from '@/hooks/use-toast';

interface SavedSearch {
    id: string;
    _id?: string;
    name: string;
    filters: Record<string, string>;
    resultsCount: number;
    savedAt?: string;
    createdAt?: string;
}

export default function SavedSearchesPage() {
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSearches = async () => {
            try {
                const data = await savedSearchService.getSavedSearches();
                setSearches(data);
            } catch (err) {
                console.error('Failed to load saved searches', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSearches();
    }, []);

    const remove = async (id: string) => {
        try {
            await savedSearchService.deleteSavedSearch(id);
            setSearches(prev => prev.filter(s => s.id !== id && s._id !== id));
            toast({ title: 'Search Deleted', description: 'The saved search was removed.' });
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the saved search.' });
        }
    };

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

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
                    </div>
                ) : searches.length === 0 ? (
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
                                        {Object.entries(s.filters || {}).map(([key, val]) => {
                                            if (typeof val !== 'string' && typeof val !== 'number') return null;
                                            return (
                                              <span
                                                  key={key}
                                                  className="bg-gray-light text-gray-text text-xs font-medium px-3 py-1 rounded-full capitalize"
                                              >
                                                  {key}: {val}
                                              </span>
                                            )
                                        })}
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-text">
                                        <span className="font-semibold text-primary-green">{s.resultsCount ?? 0} results</span>
                                        <span>Saved on {new Date(s.savedAt || s.createdAt || new Date()).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                                        onClick={() => remove(s.id || s._id as string)}
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
