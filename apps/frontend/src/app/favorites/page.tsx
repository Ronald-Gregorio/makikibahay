'use client';

import { useAuth } from '@/hooks/use-auth';
import { listings } from '@/lib/mock-data';
import { PropertyCard } from '@/components/property-card';
import { HeartCrack, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { user, favorites } = useAuth();
  const favoriteListings = listings.filter((listing) => favorites.includes(listing.id));

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center">
        <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-3xl font-bold font-headline mt-4">Please Log In</h1>
        <p className="text-muted-foreground mt-2">You need to be logged in to view your favorites.</p>
        <Button asChild className="mt-6">
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4"/>
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
      {favoriteListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteListings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-semibold">No Favorites Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Click the heart icon on a listing to save it here.
          </p>
        </div>
      )}
    </div>
  );
}
