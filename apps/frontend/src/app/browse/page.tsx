'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@makikibahay/ui';
import { Input } from '@makikibahay/ui';
import { Badge } from '@makikibahay/ui';
import { Slider } from '@makikibahay/ui';
import { Checkbox } from '@makikibahay/ui';
import { Search, Filter, MapPin, BedDouble, Wifi } from 'lucide-react';
import ListingCard from './ListingCard';

interface FilterState {
  priceMin: number;
  priceMax: number;
  accommodationTypes: string[];
  amenities: string[];
  proximityMinutes: 5 | 10 | 15;
}

interface Listing {
  id: string;
  name: string;
  address: string;
  price_min: number;
  price_max: number;
  total_rooms: number;
  available_rooms: number;
  amenities: string[];
  cover_photo?: string;
}

const accommodationTypes = [
  { id: 'solo', label: 'Solo' },
  { id: 'shared', label: 'Shared' },
  { id: 'studio', label: 'Studio' },
  { id: 'bed-space', label: 'Bed Space' }
];

const amenities = [
  { id: 'AC', label: 'Air Conditioning' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'parking', label: 'Parking' }
];

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0,
    priceMax: 20000,
    accommodationTypes: [],
    amenities: [],
    proximityMinutes: 10
  });
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.priceMin > 0) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax < 20000) params.append('priceMax', filters.priceMax.toString());
      if (filters.accommodationTypes.length > 0) {
        filters.accommodationTypes.forEach(type => params.append('type', type));
      }
      if (filters.amenities.length > 0) {
        filters.amenities.forEach(amenity => params.append('amenities', amenity));
      }
      params.append('proximityMinutes', filters.proximityMinutes.toString());
      params.append('limit', '20');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: 20000,
      accommodationTypes: [],
      amenities: [],
      proximityMinutes: 10
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80`}>
            <div className="bg-surface border border border-border rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              
              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-primary-text mb-2">Min: ₱{filters.priceMin.toLocaleString()}</label>
                    <Slider
                      value={[filters.priceMin]}
                      onValueChange={([value]) => handleFilterChange('priceMin', value)}
                      max={20000}
                      step={500}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-primary-text mb-2">Max: ₱{filters.priceMax.toLocaleString()}</label>
                    <Slider
                      value={[filters.priceMax]}
                      onValueChange={([value]) => handleFilterChange('priceMax', value)}
                      max={20000}
                      step={500}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Accommodation Types */}
              <div>
                <h4 className="font-medium mb-3">Accommodation Type</h4>
                <div className="space-y-2">
                  {accommodationTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={filters.accommodationTypes.includes(type.id)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...filters.accommodationTypes, type.id]
                            : filters.accommodationTypes.filter(t => t !== type.id);
                          handleFilterChange('accommodationTypes', newTypes);
                        }}
                      />
                      <label htmlFor={type.id} className="text-sm text-primary-text">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-medium mb-3">Amenities</h4>
                <div className="space-y-2">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={filters.amenities.includes(amenity.id)}
                        onCheckedChange={(checked) => {
                          const newAmenities = checked
                            ? [...filters.amenities, amenity.id]
                            : filters.amenities.filter(a => a !== amenity.id);
                          handleFilterChange('amenities', newAmenities);
                        }}
                      />
                      <label htmlFor={amenity.id} className="text-sm text-primary-text">
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proximity */}
              <div>
                <h4 className="font-medium mb-3">Walking Distance</h4>
                <div className="space-y-2">
                  {[5, 10, 15].map((minutes) => (
                    <div key={minutes} className="flex items-center space-x-2">
                      <Checkbox
                        id={`proximity-${minutes}`}
                        checked={filters.proximityMinutes === minutes}
                        onCheckedChange={() => handleFilterChange('proximityMinutes', minutes)}
                      />
                      <label htmlFor={`proximity-${minutes}`} className="text-sm text-primary-text">
                        {minutes} minutes walk
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Clear Filters
                </Button>
                <Button onClick={handleSearch} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {loading ? 'Searching...' : `${listings.length} Properties Found`}
              </h2>
              <div className="text-sm text-muted-foreground">
                Showing properties in Cabanatuan City
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-surface border border border-border rounded-lg p-6 animate-pulse">
                    <div className="h-56 bg-surface-hover rounded"></div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-surface border border border-border rounded-lg overflow-hidden">
                    <div className="relative h-56 w-full">
                      <img
                        src={listing.cover_photo || '/placeholder-property.jpg'}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                          ₱{listing.price_min.toLocaleString()} - ₱{listing.price_max.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 hover:text-accent transition-colors">
                        {listing.name}
                      </h3>
                      <div className="space-y-2 text-sm text-primary-text">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{listing.address}</span>
                        </div>
                        <div className="flex items-center">
                          <BedDouble className="h-4 w-4 mr-2" />
                          <span>{listing.available_rooms} rooms available</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {listing.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-4">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}