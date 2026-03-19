'use client';

import { useAuth } from '@/hooks/use-auth';
import { PropertyCard } from '@/components/property-card';
import { HeartCrack, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/index';
import { useEffect, useState } from 'react';
import { userService } from '@/services/api/users';
import type { Listing } from '@/lib/types';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      userService.getFavorites()
        .then(data => setFavoriteListings(data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-3xl font-bold font-headline mt-4">Please Log In</h1>
        <p className="text-muted-foreground mt-2">You need to be logged in to view your favorites.</p>
        <Button asChild className="mt-6">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Your Favorites</h1>
        <p className="text-muted-foreground mt-2">
          Here are the properties you've saved.
        </p>
      </header>
      {favoriteListings?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteListings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 mt-8 bg-gray-light/30 border border-gray-border rounded-xl text-center">
          <div className="h-24 w-24 bg-red-alert/10 rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="h-10 w-10 text-red-alert" />
          </div>
          <h2 className="text-2xl font-bold text-text-dark mb-3">No Saved Properties</h2>
          <p className="text-gray-text max-w-md mb-8">
            You haven't saved any properties yet. Keep track of boarding houses you love by clicking the heart icon on any listing.
          </p>
          <Button asChild size="lg" className="bg-primary-green hover:bg-primary-green-hover text-white">
            <Link href="/browse">
              Start Browsing Now
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
