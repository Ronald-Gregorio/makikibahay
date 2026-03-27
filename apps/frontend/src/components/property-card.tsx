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

  const listingId = (listing as any)._id || listing.id;
  const isFavorite = favorites.includes(listingId);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'You need to be logged in to save favorites.',
      });
      return;
    }
    toggleFavorite(listingId);
    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: `${listing.listingName || listing.name} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
    })
  };

  const reviews = listing.reviews || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
      : 'New';

  const price = listing.monthlyRent || listing.priceMin || 0;
  const availableRooms = listing.availableRooms ?? 0;
  const totalRooms = listing.bedrooms || '1';

  const photoUrl = (listing.photos && listing.photos.length > 0) 
    ? listing.photos[0] 
    : 'https://placehold.co/400x300.png?text=No+Photo';

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="p-0 relative group">
        <Link href={`/listings/${listingId}`}>
          <div className="aspect-video relative overflow-hidden bg-muted">
            <Image
              src={photoUrl || 'https://placehold.co/400x300.png?text=No+Photo'}
              alt={listing.listingName || listing.name || 'Property'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1 z-10 shadow-sm bg-white/90">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span className="font-bold">{averageRating}</span>
          </Badge>
        </Link>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'absolute top-2 right-2 rounded-full h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm z-10 transition-colors',
            { 'text-red-500': isFavorite, 'text-gray-500': !isFavorite }
          )}
          onClick={handleFavoriteClick}
        >
          <Heart className={cn('h-4 w-4', { 'fill-current text-red-500': isFavorite })} />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline hover:text-primary transition-colors line-clamp-1">
          <Link href={`/listings/${listingId}`}>{listing.listingName || listing.name}</Link>
        </CardTitle>
        <div className="mt-2 flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{listing.fullAddress || listing.address}</span>
        </div>
        <div className="mt-2 flex items-center text-muted-foreground text-sm">
          <BedDouble className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            {availableRooms} {listing.propertyType === 'Bed Spacer' ? 'beds' : 'rooms'} available
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-secondary/50 flex justify-between items-center">
        <p className="text-lg font-bold text-primary-foreground">
          <span className="text-sm font-normal">₱</span>
          {price.toLocaleString()}/mo
        </p>
        <Link href={`/listings/${listingId}`} passHref>
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
