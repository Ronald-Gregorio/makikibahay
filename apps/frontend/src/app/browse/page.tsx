'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, BedDouble, Heart, Mail, Phone, SlidersHorizontal, BookmarkPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { savedSearchService } from '@/services/api/savedSearches';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-light animate-pulse rounded-lg" />,
});

import { useToast } from '@/hooks/use-toast';

import type { Listing } from '@/lib/types';

interface FilterState {
  priceMin: number;
  priceMax: number;
  propertyTypes: string[];
  beds: string;
  baths: string;
  specialtyProperty: string[];
  petPolicy: string[];
  moveInDate: string;
  popularAmenities: string[];
  communityAmenities: string[];
  sqFtMin: string;
  sqFtMax: string;
  rating: number;
  has3DView: boolean;
}

const propertyTypes = [
  { id: 'Apartment', label: 'Apartment' },
  { id: 'Condo', label: 'Condo' },
  { id: 'Studio Type', label: 'Studio Type' },
  { id: 'Bed Spacer', label: 'Bed Spacer' },
  { id: 'Boarding House', label: 'Boarding House' },
  { id: 'Up and Down', label: 'Up and Down' },
];

const specialtyOptions = [
  { id: 'Student Only', label: 'Student Only' },
  { id: 'Worker Only', label: 'Worker Only' },
  { id: 'Income Restricted', label: 'Income Restricted' },
  { id: 'Short-Term', label: 'Short-Term' },
];

const petPolicyOptions = [
  { id: 'Cat Friendly', label: 'Cat Friendly' },
  { id: 'Dog Friendly', label: 'Dog Friendly' },
  { id: 'Any Pet Friendly', label: 'Any Pet Friendly' },
  { id: 'Small Dogs Only', label: 'Small Dogs Only' },
];

const popularAmenities = [
  { id: 'AC', label: 'Air Conditioning' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'washer', label: 'Washer' },
  { id: 'dryer', label: 'Dryer' },
  { id: 'utilities-included', label: 'Utilities Included' },
  { id: 'dishwasher', label: 'Dishwasher' },
  { id: 'parking', label: 'Parking' },
  { id: 'garage', label: 'Garage' },
  { id: 'laundry', label: 'Laundry Facilities' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'appliances', label: 'Appliances Included' },
];

const communityAmenities = [
  { id: 'school', label: 'Near School' },
  { id: 'university', label: 'Near University' },
  { id: 'workplace', label: 'Near Workplace' },
  { id: 'karenderia', label: 'Near Karenderia' },
  { id: 'restaurant', label: 'Near Restaurants' },
  { id: 'laundry-shop', label: 'Near Laundry Shop' },
  { id: 'hospital', label: 'Near Hospital' },
  { id: 'cafe', label: 'Near Cafe' },
];

const bedOptions = ['Any', 'Studio', '1', '2', '3', '4+'];
const bathOptions = ['Any', '1', '2', '3+'];

const defaultFilters: FilterState = {
  priceMin: 0,
  priceMax: 20000,
  propertyTypes: [],
  beds: 'Any',
  baths: 'Any',
  specialtyProperty: [],
  petPolicy: [],
  moveInDate: '',
  popularAmenities: [],
  communityAmenities: [],
  sqFtMin: '',
  sqFtMax: '',
  rating: 0,
  has3DView: false,
};

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [locationQuery, setLocationQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.4865, 120.9734]);
  const [mapZoom, setMapZoom] = useState(13);
  
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const { toast } = useToast();

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams();
      
      // Map filters to Unified Data Model query params
      if (filters.priceMin > 0) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax < 20000) params.append('monthlyRentMax', filters.priceMax.toString());
      
      filters.propertyTypes.forEach(t => params.append('propertyType', t));
      
      // Handle boolean amenities
      if (filters.popularAmenities.includes('AC')) params.append('airConditioning', 'true');
      if (filters.popularAmenities.includes('wifi')) params.append('wifi', 'true');
      if (filters.popularAmenities.includes('washer')) params.append('washer', 'true');
      if (filters.popularAmenities.includes('dryer')) params.append('dryer', 'true');
      if (filters.popularAmenities.includes('utilities-included')) params.append('utilitiesIncluded', 'true');
      if (filters.popularAmenities.includes('parking')) params.append('parking', 'Outside');
      if (filters.popularAmenities.includes('garage')) params.append('parkingType', 'Garage');
      if (filters.popularAmenities.includes('laundry')) params.append('laundryFacilities', 'true');
      if (filters.popularAmenities.includes('kitchen')) params.append('kitchen', 'true');

      filters.specialtyProperty.forEach(s => params.append('specialtyProperty', s));
      filters.petPolicy.forEach(p => params.append('petPolicy', p));
      
      if (filters.beds !== 'Any') params.append('bedrooms', filters.beds);
      if (filters.baths !== 'Any') params.append('bathrooms', filters.baths);
      if (filters.has3DView) params.append('hasEnhancedViewing', 'true');
      
      params.append('sort', sortOrder);
      params.append('limit', '20');

      const res = await fetch(`${apiUrl}/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Since backend might still return some legacy structure, normalize if needed
        const rawListings = data.listings || data.data || data || [];
        setListings(rawListings);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOrder]);

  useEffect(() => { 
    if (q) {
      setLocationQuery(q);
      handleGeocode(q);
    }
  }, [q]);

  useEffect(() => {
    handleSearch(); 
  }, [filters, sortOrder, handleSearch]);

  const handleGeocode = async (address: string) => {
    if (!address) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(15);
      } else {
        toast({
          variant: 'destructive',
          title: 'Location Not Found',
          description: `Could not find "${address}" on the map.`
        });
      }
    } catch (error) {
       console.error('Geocoding error:', error);
    }
  };

  const toggleArr = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const mapMarkers = listings
    .filter(l => l.lat && l.lng)
    .map(l => ({
      position: [l.lat, l.lng] as [number, number],
      title: l.listingName || l.name || 'Property',
    }));

  return (
    <div className="min-h-screen bg-white">

      {/* ── Filter Bar ── */}
      <div className="bg-white border-b border-gray-border shadow-[0_1px_3px_rgba(0,0,0,0.12)] sticky top-[70px] z-40">
        <div className="max-w-[1400px] mx-auto px-5 py-2.5 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-border rounded text-sm font-medium text-text-dark bg-white hover:bg-gray-light transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Location Search Input */}
          <div className="flex-1 min-w-[200px] max-w-md relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-text" />
             <input 
                type="text" 
                placeholder="Search location..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeocode(locationQuery)}
                className="w-full pl-10 pr-4 py-2 border border-gray-border rounded-full text-sm outline-none focus:border-primary-green transition-all"
             />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-text">
              {loading ? 'Searching…' : `${listings.length} Properties Found`}
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-sm border border-gray-border rounded px-2 py-1 outline-none bg-white focus:border-primary-green"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-6">
        <div className="flex gap-6">

          {/* ── Filter Sidebar ── */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <div className="bg-white border border-gray-border rounded-lg p-6 space-y-6 sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto">
              <h3 className="text-lg font-semibold text-text-dark flex items-center gap-2">
                <Filter className="h-5 w-5" /> Filters
              </h3>

              {/* Price Range */}
              <FilterSection title="Price Range (₱/month)">
                <div className="flex gap-2">
                  <input
                    type="number" placeholder="Min" value={filters.priceMin || ''}
                    onChange={e => setFilters(p => ({ ...p, priceMin: Number(e.target.value) }))}
                    className="filter-input w-full px-3 py-2 border border-gray-border rounded text-sm outline-none focus:border-primary-green"
                  />
                  <input
                    type="number" placeholder="Max" value={filters.priceMax === 20000 ? '' : filters.priceMax}
                    onChange={e => setFilters(p => ({ ...p, priceMax: Number(e.target.value) || 20000 }))}
                    className="filter-input w-full px-3 py-2 border border-gray-border rounded text-sm outline-none focus:border-primary-green"
                  />
                </div>
              </FilterSection>

              {/* Property Type */}
              <FilterSection title="Property Type">
                <div className="space-y-2">
                  {propertyTypes.map(t => (
                    <CheckOption
                      key={t.id} id={t.id} label={t.label}
                      checked={filters.propertyTypes.includes(t.id)}
                      onChange={() => toggleArr('propertyTypes', t.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Beds */}
              <FilterSection title="Bedrooms">
                <div className="flex flex-wrap gap-2">
                  {bedOptions.map(b => (
                    <button
                      key={b}
                      onClick={() => setFilters(p => ({ ...p, beds: b }))}
                      className={`px-3 py-1.5 text-sm rounded border transition-colors ${filters.beds === b
                          ? 'border-primary-green bg-primary-green text-white'
                          : 'border-gray-border text-text-dark hover:bg-gray-light'
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Baths */}
              <FilterSection title="Bathrooms">
                <div className="flex flex-wrap gap-2">
                  {bathOptions.map(b => (
                    <button
                      key={b}
                      onClick={() => setFilters(p => ({ ...p, baths: b }))}
                      className={`px-3 py-1.5 text-sm rounded border transition-colors ${filters.baths === b
                          ? 'border-primary-green bg-primary-green text-white'
                          : 'border-gray-border text-text-dark hover:bg-gray-light'
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Specialty */}
              <FilterSection title="Specialty Property">
                <div className="space-y-2">
                  {specialtyOptions.map(s => (
                    <CheckOption
                      key={s.id} id={s.id} label={s.label}
                      checked={filters.specialtyProperty.includes(s.id)}
                      onChange={() => toggleArr('specialtyProperty', s.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Pet Policy */}
              <FilterSection title="Pet Policy">
                <div className="space-y-2">
                  {petPolicyOptions.map(p => (
                    <CheckOption
                      key={p.id} id={p.id} label={p.label}
                      checked={filters.petPolicy.includes(p.id)}
                      onChange={() => toggleArr('petPolicy', p.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Move-In Date */}
              <FilterSection title="Move-In Date">
                <input
                  type="date"
                  value={filters.moveInDate}
                  onChange={e => setFilters(p => ({ ...p, moveInDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-border rounded text-sm outline-none focus:border-primary-green"
                />
              </FilterSection>

              {/* Popular Amenities */}
              <FilterSection title="Popular Amenities">
                <div className="space-y-2">
                  {popularAmenities.map(a => (
                    <CheckOption
                      key={a.id} id={a.id} label={a.label}
                      checked={filters.popularAmenities.includes(a.id)}
                      onChange={() => toggleArr('popularAmenities', a.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Community Amenities */}
              <FilterSection title="Community Amenities (Near)">
                <div className="space-y-2">
                  {communityAmenities.map(a => (
                    <CheckOption
                      key={a.id} id={a.id} label={a.label}
                      checked={filters.communityAmenities.includes(a.id)}
                      onChange={() => toggleArr('communityAmenities', a.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Square Feet */}
              <FilterSection title="Square Feet">
                <div className="flex gap-2">
                  <input
                    type="number" placeholder="Min sq ft" value={filters.sqFtMin}
                    onChange={e => setFilters(p => ({ ...p, sqFtMin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-border rounded text-sm outline-none focus:border-primary-green"
                  />
                  <input
                    type="number" placeholder="Max sq ft" value={filters.sqFtMax}
                    onChange={e => setFilters(p => ({ ...p, sqFtMax: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-border rounded text-sm outline-none focus:border-primary-green"
                  />
                </div>
              </FilterSection>

              {/* Rating */}
              <FilterSection title="Minimum Rating">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFilters(p => ({ ...p, rating: p.rating === star ? 0 : star }))}
                      className={`text-2xl transition-colors ${star <= filters.rating ? 'text-yellow-400' : 'text-gray-border'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* 3D View Filter */}
              <FilterSection title="Enhanced Viewing">
                 <CheckOption 
                    id="has3DView" 
                    label="Has 3D/360° View" 
                    checked={filters.has3DView} 
                    onChange={() => setFilters(p => ({ ...p, has3DView: !p.has3DView }))}
                 />
              </FilterSection>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="flex-1 py-2.5 border border-gray-border rounded text-sm font-medium text-text-dark hover:bg-gray-light transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleSearch}
                    className="flex-1 py-2.5 bg-primary-green hover:bg-primary-green-hover text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Search className="h-4 w-4" /> Search
                  </button>
                </div>
                
                {user && (
                    <button
                        onClick={async () => {
                            try {
                                const name = prompt('Enter a name for this search:', `Search ${new Date().toLocaleDateString()}`);
                                if (!name) return;
                                await savedSearchService.saveSearch(name, filters);
                                toast({ title: 'Search Saved', description: `"${name}" has been added to your saved searches.` });
                            } catch (err) {
                                toast({ variant: 'destructive', title: 'Error', description: 'Failed to save search.' });
                            }
                        }}
                        className="w-full py-2.5 border border-primary-green text-primary-green hover:bg-green-50 rounded text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                        <BookmarkPlus className="h-4 w-4" /> Save This Search
                    </button>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">
            {/* Listings */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex border border-gray-border rounded-lg overflow-hidden animate-pulse h-[180px]">
                      <div className="w-[250px] bg-gray-light flex-shrink-0" />
                      <div className="p-5 flex-1 space-y-3">
                        <div className="h-5 bg-gray-light rounded w-3/4" />
                        <div className="h-4 bg-gray-light rounded w-1/2" />
                        <div className="h-4 bg-gray-light rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20">
                  <MapPin className="mx-auto h-12 w-12 text-gray-text mb-4" />
                  <h3 className="text-xl font-semibold text-text-dark mb-2">No properties found</h3>
                  <p className="text-gray-text">Try adjusting your filters or search area.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {listings.map(listing => {
                    const id = listing._id || listing.id;
                    return (
                      <BrowseCard key={id} listing={listing} id={id!} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="hidden lg:block lg:w-[400px] flex-shrink-0 sticky top-[120px] h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
              <Map
                center={mapCenter}
                zoom={mapZoom}
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

/** Apartments.com style horizontal listing card */
function BrowseCard({ listing, id }: { listing: Listing; id: string }) {
  const { user, favorites, toggleFavorite } = useAuth();
  const { toast } = useToast();
  const isFavorite = favorites.includes(id);

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
    toggleFavorite(id);
    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      description: `${listing.listingName || listing.name} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
    });
  };

  return (
    <article className="flex border border-gray-border rounded-lg overflow-hidden bg-white hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-shadow">
      {/* Image */}
      <div className="relative w-[250px] flex-shrink-0">
        <img
          src={listing.photos?.[0] || 'https://placehold.co/400x280.png'}
          alt={listing.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 text-2xl transition-colors ${isFavorite ? 'text-red-alert' : 'text-gray-border hover:text-red-alert'}`}
          aria-label="Save to favorites"
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <Link href={`/listings/${id}`}>
              <h3 className="text-[20px] font-bold text-text-dark hover:text-primary-green transition-colors line-clamp-1">
                {listing.listingName || listing.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-text mt-0.5 line-clamp-1">{listing.fullAddress || listing.address}</p>
          </div>
        </div>

        {/* Price & Stats */}
        <div className="mb-3">
          <div className="text-[22px] font-bold text-primary-green">
            ₱{(listing.monthlyRent || listing.priceMin || 0).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-text-dark mt-0.5">
            <BedDouble className="h-4 w-4" />
            <span>{listing.availableRooms ?? 0} {listing.propertyType === 'Bed Spacer' ? 'beds' : 'rooms'} available</span>
          </div>
        </div>

        {/* Amenity tags */}
        {(listing.amenities || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.amenities!.slice(0, 4).map((a, i) => (
              <span key={i} className="bg-gray-light text-gray-text text-xs font-medium px-3 py-1 rounded-xl">
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2.5">
          <a
            href={`/inbox?to=${listing.ownerId}&subject=${encodeURIComponent('Interested in ' + (listing.listingName || listing.name))}`}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 border border-primary-green text-primary-green rounded font-bold text-sm hover:bg-[rgba(33,141,61,0.05)] transition-colors"
          >
            <Mail className="h-4 w-4" /> Email
          </a>
          <Link
            href={`/listings/${id}`}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 border border-gray-border text-text-dark rounded font-bold text-sm hover:bg-gray-light transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Filter section wrapper */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-text-dark mb-3">{title}</h4>
      {children}
    </div>
  );
}

/** Checkbox option */
function CheckOption({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        id={id} type="checkbox" checked={checked} onChange={onChange}
        className="h-4 w-4 rounded accent-primary-green"
      />
      <span className="text-sm text-text-dark">{label}</span>
    </label>
  );
}
