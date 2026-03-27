'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Badge } from '@/components/ui/index';
import { MapPin, BedDouble, Wifi, Car } from 'lucide-react';
import type { Listing } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-56 w-full bg-surface">
          <img
            src={(listing.photos && listing.photos.length > 0) ? listing.photos[0] : '/placeholder-property.jpg'}
            alt={listing.listingName || listing.name || 'Property'}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-accent text-accent-foreground font-bold">
              ₱{(listing.monthlyRent || listing.priceMin || 0).toLocaleString()}/mo
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-2 hover:text-accent transition-colors line-clamp-1">
          {listing.listingName || listing.name}
        </CardTitle>
        <div className="space-y-2 text-sm text-primary-text">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{listing.fullAddress || listing.address}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BedDouble className="h-4 w-4 mr-2" />
              <span>{listing.availableRooms ?? 0} {listing.propertyType === 'Bed Spacer' ? 'beds' : 'rooms'} available</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(listing.amenities || []).slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
        {user && (
          <div className="pt-4 flex gap-2">
            <Button size="sm" className="w-full">
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
