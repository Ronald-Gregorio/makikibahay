'use client';

import { useState, useEffect, useMemo } from 'react';
import { listings } from '@/lib/mock-data';
import { PropertyCard } from '@/components/property-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Footprints } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import type { Listing } from '@/lib/types';

const allAmenities = [
  { id: 'ac', label: 'Airconditioned' },
  { id: 'wifi', label: 'Wi-Fi Included' },
  { id: 'pets_allowed', label: 'Pets Allowed' },
  { id: 'parking', label: 'Parking Space' },
  { id: 'kitchen', label: 'Kitchen Access' },
  { id: 'laundry', label: 'Laundry Service' },
  { id: 'no_curfew', label: 'No Curfew' },
  { id: 'appliances', label: 'Appliances Allowed' },
];

const accommodationTypes = ['Up and Down', 'Solo Room', 'Studio Type', 'Bed Spacer'];


export default function BrowsePage() {
  const { surveyData } = useAuth();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [walkingDistance, setWalkingDistance] = useState<string>('');
  
  const [filteredListings, setFilteredListings] = useState<Listing[]>(listings);

  // Apply survey data to filters on initial load
  useEffect(() => {
    if (surveyData) {
      const [min, max] = surveyData.priceRange;
      setMinPrice(min);
      setMaxPrice(max);
      setSelectedAmenities(surveyData.amenities || []);
      setSelectedAccommodations(surveyData.accommodationType || []);
      setWalkingDistance(surveyData.walkingDistance || '');
    }
  }, [surveyData]);
  
  // Memoize filtered results to avoid re-calculating on every render
  useMemo(() => {
    let result = listings;

    // Filter by search query
    if (searchQuery) {
      result = result.filter(listing =>
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by price
    result = result.filter(listing => {
        const min = minPrice === '' ? 0 : minPrice;
        const max = maxPrice === '' ? Infinity : maxPrice;
        // Check if the listing's price range overlaps with the filter's price range
        return listing.price_min <= max && listing.price_max >= min;
    });

    // Filter by accommodation type
    if (selectedAccommodations.length > 0) {
        result = result.filter(listing =>
            listing.rooms.some(room => selectedAccommodations.includes(room.type))
        );
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
        result = result.filter(listing =>
            selectedAmenities.every(amenity => 
                // This is a simplified check. A real app might check against a dedicated amenities list per listing.
                // Here, we check if rules or room inclusions mention the amenity.
                listing.rules.some(rule => rule.toLowerCase().includes(amenity.toLowerCase().split(' ')[0])) ||
                listing.rooms.some(room => room.inclusions.some(inc => inc.toLowerCase().includes(amenity.toLowerCase().split(' ')[0])))
            )
        );
    }

    // Note: Walking distance filter is not implemented as it requires location data and distance calculation.
    
    setFilteredListings(result);

  }, [searchQuery, minPrice, maxPrice, selectedAccommodations, selectedAmenities]);

  const handleAccommodationChange = (checked: boolean, type: string) => {
    setSelectedAccommodations(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleAmenityChange = (checked: boolean, amenityLabel: string) => {
    setSelectedAmenities(prev =>
      checked ? [...prev, amenityLabel] : prev.filter(a => a !== amenityLabel)
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Browse Properties</h1>
        <p className="text-muted-foreground mt-2">Find the perfect boarding house that matches your needs.</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by name, address..." 
              className="pl-10 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Search button can be used to trigger filtering manually if desired, but here it's automatic */}
          <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { /* Manual trigger if needed */ }}>
            Search
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-semibold">Price Range</Label>
                <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="min-price">Min Price</Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="e.g., 1000"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="max-price">Max Price</Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="e.g., 10000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                    </div>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Accommodation Type</Label>
                <div className="space-y-2 mt-2">
                  {accommodationTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type.toLowerCase().replace(/ /g, '_')} 
                        onCheckedChange={(checked) => handleAccommodationChange(!!checked, type)}
                        checked={selectedAccommodations.includes(type)}
                      />
                      <Label htmlFor={type.toLowerCase().replace(/ /g, '_')} className="font-normal">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Amenities</Label>
                <div className="space-y-2 mt-2">
                  {allAmenities.map(amenity => (
                     <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={amenity.id} 
                            onCheckedChange={(checked) => handleAmenityChange(!!checked, amenity.label)}
                            checked={selectedAmenities.includes(amenity.label)}
                        />
                        <Label htmlFor={amenity.id} className="font-normal">{amenity.label}</Label>
                     </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="distance" className="font-semibold flex items-center gap-2">
                    <Footprints className="h-5 w-5" />
                    Walking Distance
                </Label>
                 <Select value={walkingDistance} onValueChange={setWalkingDistance}>
                    <SelectTrigger id="distance" className="w-full mt-2">
                        <SelectValue placeholder="From your pinned location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                </Select>
              </div>

            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                    <h2 className="mt-4 text-2xl font-semibold">No Properties Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        Try adjusting your filters to find more results.
                    </p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
