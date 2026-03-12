'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/index';
import { Badge } from '@/components/ui/index';
import { Search, Filter, MapPin, BedDouble } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />,
});

interface Listing {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  priceMin?: number;
  priceMax?: number;
  photos?: string[];
  availableRooms?: number;
  rules?: string[];
  location?: { coordinates?: [number, number] };
}

interface FilterState {
  priceMin: number;
  priceMax: number;
  accommodationTypes: string[];
  amenities: string[];
  proximityMinutes: number;
}

const accommodationTypes = [
  { id: 'solo', label: 'Solo' },
  { id: 'shared', label: 'Shared' },
  { id: 'studio', label: 'Studio' },
  { id: 'bed-space', label: 'Bed Space' },
];

const amenityOptions = [
  { id: 'AC', label: 'Air Conditioning' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'parking', label: 'Parking' },
];

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0,
    priceMax: 20000,
    accommodationTypes: [],
    amenities: [],
    proximityMinutes: 10,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams();
      if (filters.priceMin > 0) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax < 20000) params.append('priceMax', filters.priceMax.toString());
      filters.accommodationTypes.forEach((t) => params.append('type', t));
      filters.amenities.forEach((a) => params.append('amenities', a));
      params.append('proximityMinutes', filters.proximityMinutes.toString());
      params.append('limit', '20');

      const res = await fetch(`${apiUrl}/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    handleSearch();
  }, []);

  const toggleArrayFilter = (key: 'accommodationTypes' | 'amenities', value: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const clearFilters = () => {
    setFilters({ priceMin: 0, priceMax: 20000, accommodationTypes: [], amenities: [], proximityMinutes: 10 });
  };

  const mapMarkers = listings
    .filter((l) => l.location?.coordinates)
    .map((l) => ({
      position: [l.location!.coordinates![1], l.location!.coordinates![0]] as [number, number],
      title: l.name,
    }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <Button variant="outline" className="w-full" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters sidebar — purely native HTML inputs, no Radix */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80 flex-shrink-0`}>
            <div className="bg-card border border-border rounded-lg p-6 space-y-6 sticky top-8">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" /> Filters
              </h3>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range (₱/month)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Min: ₱{filters.priceMin.toLocaleString()}</label>
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={filters.priceMin}
                      onChange={(e) => setFilters((p) => ({ ...p, priceMin: Number(e.target.value) }))}
                      className="w-full mt-1 accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Max: ₱{filters.priceMax.toLocaleString()}</label>
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={filters.priceMax}
                      onChange={(e) => setFilters((p) => ({ ...p, priceMax: Number(e.target.value) }))}
                      className="w-full mt-1 accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Accommodation Type */}
              <div>
                <h4 className="font-medium mb-3">Accommodation Type</h4>
                <div className="space-y-2">
                  {accommodationTypes.map((type) => (
                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.accommodationTypes.includes(type.id)}
                        onChange={() => toggleArrayFilter('accommodationTypes', type.id)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-medium mb-3">Amenities</h4>
                <div className="space-y-2">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity.id)}
                        onChange={() => toggleArrayFilter('amenities', amenity.id)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-sm">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Walking Distance */}
              <div>
                <h4 className="font-medium mb-3">Walking Distance from Campus</h4>
                <div className="space-y-2">
                  {[5, 10, 15].map((min) => (
                    <label key={min} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="proximity"
                        checked={filters.proximityMinutes === min}
                        onChange={() => setFilters((p) => ({ ...p, proximityMinutes: min }))}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">{min} min walk</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>Clear</Button>
                <Button className="flex-1" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />Search
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">
            {/* Listings grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {loading ? 'Searching…' : `${listings.length} Properties Found`}
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                      <div className="h-48 bg-muted" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map((listing) => {
                    const id = listing._id || listing.id;
                    return (
                      <div key={id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-48">
                          <img
                            src={listing.photos?.[0] || '/placeholder-property.jpg'}
                            alt={listing.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-primary text-primary-foreground">
                              ₱{(listing.priceMin || 0).toLocaleString()}
                              {listing.priceMax && listing.priceMax !== listing.priceMin
                                ? ` – ₱${listing.priceMax.toLocaleString()}`
                                : ''}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-semibold text-base mb-2 line-clamp-1">{listing.name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1 flex-1">
                            <div className="flex items-start gap-1">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{listing.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BedDouble className="h-4 w-4 flex-shrink-0" />
                              <span>{listing.availableRooms ?? 0} rooms available</span>
                            </div>
                          </div>
                          {(listing.rules || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {listing.rules!.slice(0, 3).map((r, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                              ))}
                            </div>
                          )}
                          <Button size="sm" className="w-full mt-4" asChild>
                            <a href={`/listings/${id}`}>View Details</a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Map panel — vanilla Leaflet, no react-leaflet contexts */}
            <div className="hidden lg:block lg:w-[420px] flex-shrink-0 sticky top-8 h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-md">
              <Map
                center={[15.4865, 120.9734]}
                zoom={13}
                markers={mapMarkers}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
