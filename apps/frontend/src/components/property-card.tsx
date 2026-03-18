'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { MapPin, BedDouble, Star, Heart } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { Badge } from '@/components/ui/index';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PropertyCardProps {
  listing: Listing;
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const { user, favorites, toggleFavorite } = useAuth();
  const { toast } = useToast();

  const isFavorite = favorites.includes(listing.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to listing page
    e.stopPropagation();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'You need to be logged in to save favorites.',
      });
      return;
    }
    toggleFavorite(listing.id);
    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: `${listing.name} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
    })
  };

  const averageRating =
    listing.reviews.length > 0
      ? (listing.reviews.reduce((acc, review) => acc + review.rating, 0) / listing.reviews.length).toFixed(1)
      : 'New';

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/listings/${listing.id}`}>
          <div className="aspect-video relative">
            <Image
              src={listing.photos?.[0]?.url || 'https://placehold.co/400x300.png?text=No+Photo'}
              alt={listing.name}
              layout="fill"
              objectFit="cover"
              className="hover:scale-105 transition-transform duration-300"
              data-ai-hint="apartment room"
            />
            <Button
              size="icon"
              className={cn(
                'absolute top-2 right-2 rounded-full h-8 w-8 bg-black/50 hover:bg-black/75',
                { 'text-red-500 hover:text-red-400': isFavorite }
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('h-5 w-5', { 'fill-current': isFavorite })} />
            </Button>
          </div>
          <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1">
            <Star className="w-4 h-4 text-primary" />
            <span>{averageRating}</span>
          </Badge>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline hover:text-primary transition-colors">
          <Link href={`/listings/${listing.id}`}>{listing.name}</Link>
        </CardTitle>
        <div className="mt-2 flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{listing.address}</span>
        </div>
        <div className="mt-2 flex items-center text-muted-foreground text-sm">
          <BedDouble className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            {listing.available_rooms} of {listing.total_rooms} rooms available
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-secondary/50 flex justify-between items-center">
        <p className="text-lg font-bold text-primary-foreground">
          <span className="text-sm font-normal">₱</span>
          {listing.price_min.toLocaleString()} - {listing.price_max.toLocaleString()}
        </p>
        <Link href={`/listings/${listing.id}`} passHref>
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
