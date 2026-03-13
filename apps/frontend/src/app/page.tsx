'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, BedDouble } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { listingService } from '@/services/api/listings';
import type { Listing } from '@/lib/types';

const SEARCH_TABS = ['Rent', 'Buy'] as const;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'Rent' | 'Buy'>('Rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    listingService.getFeatured()
      .then(data => setFeaturedListings(data))
      .catch(console.error);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    window.location.href = `/browse?${params.toString()}`;
  };

  return (
    <div className="flex flex-col">

      {/* ── Hero Section ── */}
      <section
        className="relative h-[500px] flex items-center justify-center px-5"
        style={{
          backgroundImage: "linear-gradient(135deg, #11421f 0%, #218d3d 60%, #1e7a3b 100%)",
        }}
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 w-full max-w-[800px] text-center">
          <h1 className="text-[48px] md:text-[52px] font-black text-white mb-8 leading-tight"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Find Your Home in Cabanatuan City
          </h1>

          {/* Search card */}
          <div className="bg-white rounded-lg p-4 shadow-[0_10px_15px_rgba(0,0,0,0.15)]">
            {/* Rent/Buy Tabs - Removed Buy as requested */}
            <div className="flex gap-6 mb-4 border-b border-gray-border">
              <button
                className="pb-2.5 px-1 text-[15px] font-medium relative text-primary-green transition-colors"
              >
                Rent
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-green rounded-t" />
              </button>
            </div>

            {/* Search input */}
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-text" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter City, Neighborhood, or Address"
                  className="w-full pl-11 pr-4 py-4 border border-gray-border rounded text-base font-[Roboto] outline-none focus:border-primary-green focus:shadow-[0_0_0_2px_rgba(33,141,61,0.2)] transition"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 bg-primary-green hover:bg-primary-green-hover text-white font-bold text-base rounded transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section className="max-w-[1400px] mx-auto w-full px-5 my-16">
        <div className="mb-8">
          <h2 className="text-[28px] font-bold text-text-dark">Featured Rentals</h2>
          <p className="mt-1 text-gray-text">Handpicked selections for students and professionals.</p>
        </div>

        {featuredListings.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Skeleton placeholders */}
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-border rounded-lg overflow-hidden animate-pulse">
                <div className="h-[220px] bg-gray-light" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-light rounded w-3/4" />
                  <div className="h-4 bg-gray-light rounded w-1/2" />
                  <div className="h-4 bg-gray-light rounded w-2/3" />
                  <div className="flex gap-3 mt-4">
                    <div className="h-10 bg-gray-light rounded flex-1" />
                    <div className="h-10 bg-gray-light rounded flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing: any) => {
              const listingId = listing._id || listing.id;
              return (
                <FeaturedCard
                  key={listingId}
                  id={listingId}
                  name={listing.name}
                  address={listing.address}
                  priceMin={listing.priceMin || 0}
                  priceMax={listing.priceMax || 0}
                  rooms={listing.totalRooms || 0}
                  photo={listing.photos?.[0]}
                />
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/browse"
            className="inline-block border border-gray-border rounded px-8 py-3 font-medium text-text-dark hover:bg-gray-light transition-colors"
          >
            View All Properties
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-light py-16">
        <div className="max-w-[1400px] mx-auto px-5 text-center">
          <h2 className="text-[28px] font-bold text-text-dark mb-2">How Makikibahay Works</h2>
          <p className="text-gray-text text-lg mb-12">Find and book your perfect room in three easy steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: '🔍', title: 'Search', desc: 'Browse hundreds of verified boarding houses, condos, and apartments near you.', href: '/browse' },
              { icon: '📩', title: 'Connect', desc: 'Message owners directly, ask questions, and schedule a viewing.', href: '/signup' },
              { icon: '🏠', title: 'Move In', desc: 'Book your room and move in on your schedule.', href: '/signup' },
            ].map(step => (
              <Link
                key={step.title}
                href={step.href}
                className="bg-white rounded-lg p-8 shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-200">{step.icon}</div>
                <h3 className="text-[22px] font-bold text-text-dark mb-3 lg:group-hover:text-primary-green transition-colors">{step.title}</h3>
                <p className="text-gray-text leading-relaxed">{step.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/** Featured listing card */
function FeaturedCard({
  id, name, address, priceMin, priceMax, rooms, photo,
}: {
  id: string; name: string; address: string;
  priceMin: number; priceMax: number; rooms: number; photo?: string;
}) {
  return (
    <article className="border border-gray-border rounded-lg overflow-hidden flex flex-col hover:shadow-[0_10px_15px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/listings/${id}`}>
        <div className="relative h-[220px] w-full overflow-hidden bg-gray-light">
          <Image
            src={photo || 'https://placehold.co/600x400.png'}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {/* Price */}
        <div className="text-[22px] font-bold text-text-dark mb-1">
          ₱{priceMin.toLocaleString()}
          {priceMax && priceMax !== priceMin ? ` – ₱${priceMax.toLocaleString()}` : ''}
        </div>

        {/* Rooms */}
        <div className="flex items-center gap-1.5 text-[15px] text-gray-text mb-2.5">
          <BedDouble className="h-4 w-4" />
          <span>{rooms} rooms available</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-base font-medium text-text-dark mb-5 flex-1">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-text" />
          <span className="line-clamp-2">{address}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <Link
            href={`/inbox?listing=${id}`}
            className="flex-1 text-center py-3 font-bold border border-primary-green text-primary-green rounded hover:bg-[rgba(33,141,61,0.05)] transition-colors text-sm"
          >
            Email
          </Link>
          <Link
            href={`/listings/${id}`}
            className="flex-1 text-center py-3 font-bold border border-gray-border text-text-dark rounded hover:bg-gray-light transition-colors text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
