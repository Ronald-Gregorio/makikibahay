'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listingService } from '@/services/api/listings';
import type { Listing } from '@/lib/types';
import { PlusCircle, Pencil, Trash2, Eye, Home, BedDouble, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

export default function OwnerListingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listingService.getOwnerListings();
      setListings(data);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load your listings.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) fetchListings();
  }, [user, fetchListings]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await listingService.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
      toast({ title: 'Listing Deleted', description: `"${name}" has been removed.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete listing.' });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold text-text-dark">My Listings</h1>
          <p className="text-gray-text mt-1">{listings.length} propert{listings.length === 1 ? 'y' : 'ies'} managed</p>
        </div>
        <Link
          href="/owner/listings/create"
          className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green-hover text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="h-5 w-5" />
          Add Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-border rounded-xl">
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-dark mb-2">No listings yet</h2>
          <p className="text-gray-text mb-6">Get started by creating your first property listing.</p>
          <Link
            href="/owner/listings/create"
            className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <PlusCircle className="h-5 w-5" /> Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {listings.map(listing => (
            <div
              key={listing.id}
              className="bg-white border border-gray-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex"
            >
              {/* Cover photo */}
              <div className="w-48 h-auto flex-shrink-0 bg-gray-100 relative hidden md:block">
                {listing.photos?.[0] ? (
                  <img
                    src={typeof listing.photos[0] === 'string' ? listing.photos[0] : (listing.photos[0] as any).url}
                    alt={listing.listingName || listing.name || 'Property'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-lg text-text-dark leading-tight">{listing.listingName || listing.name}</h2>
                    <p className="text-sm text-gray-text mt-0.5 line-clamp-1">{listing.fullAddress || listing.address}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${getStatusBadgeClass(listing.status ?? 'active')}`}>
                    {listing.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-sm text-gray-text">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4 text-primary-green" />
                    {listing.total_rooms || listing.totalRooms || 0} room{(listing.total_rooms || listing.totalRooms) !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {(listing.available_rooms ?? listing.availableRooms ?? 0) > 0
                      ? <ToggleRight className="h-4 w-4 text-green-500" />
                      : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                    {listing.available_rooms ?? listing.availableRooms ?? 0} available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary-green" />
                    ₱{(listing.monthlyRent || listing.priceMin || 0).toLocaleString()}/mo
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-gray-border rounded-lg hover:bg-gray-50 transition-colors text-text-dark"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Link>
                  <Link
                    href={`/owner/listings/${listing.id}/edit`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-primary-green/30 text-primary-green rounded-lg hover:bg-primary-green/5 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id, listing.listingName || listing.name || 'Listing')}
                    disabled={deletingId === listing.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === listing.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
