'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Camera, Video, Share2, Heart, MapPin, BedDouble, Bath, Maximize2, Phone, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import api from '@/lib/api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { listingService } from '@/services/api/listings';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-light animate-pulse rounded-lg" />,
});

const MarzipanoViewer = dynamic(() => import('@/components/MarzipanoViewer'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full flex items-center justify-center bg-gray-light text-gray-text rounded-lg">Loading 3D Tour...</div>,
});

interface User { _id: string; name: string; avatar?: string; }
interface Room { _id: string; type?: string; price: number; inclusions: string[]; isAvailable: boolean; }
interface Review { _id: string; rating: number; comment: string; userId: User; createdAt: string; }
interface LocalListing {
  _id: string; name: string; address: string;
  location?: { type: string; coordinates: [number, number] };
  description?: string; priceMin: number; priceMax: number;
  totalRooms: number; availableRooms: number;
  amenities: string[]; rules: string[]; photos: string[];
  ownerId: User; rooms: Room[]; reviews: Review[];
}

const PAGE_NAV = ['Pricing', 'About', 'Amenities', 'Fees & Policies', 'Location', 'Reviews'];

function ListingDetailContent() {
  const params = useParams();
  const listingId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<LocalListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [activeSection, setActiveSection] = useState('Pricing');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });

  useEffect(() => {
    listingService.getById(listingId).then((data: any) => {
      setListing(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [listingId]);

  if (loading) return (
    <div className="max-w-[1400px] mx-auto px-5 py-10 animate-pulse space-y-4">
      <div className="h-[400px] bg-gray-light rounded-lg" />
      <div className="h-8 bg-gray-light rounded w-1/2" />
      <div className="h-4 bg-gray-light rounded w-1/3" />
    </div>
  );

  if (!listing) return (
    <div className="max-w-[1400px] mx-auto px-5 py-20 text-center">
      <h2 className="text-2xl font-bold text-text-dark">Listing not found</h2>
    </div>
  );

  const avgRating = listing.reviews.length > 0
    ? listing.reviews.reduce((a, r) => a + r.rating, 0) / listing.reviews.length
    : 0;

  const ratingsCount: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  listing.reviews.forEach(r => { ratingsCount[Math.round(r.rating)] = (ratingsCount[Math.round(r.rating)] || 0) + 1; });

  const handleReviewSubmit = async () => {
    if (!user || rating === 0) return;
    try {
      const newReview = await api.post<Review>(`/reviews/${listingId}`, { rating, comment, userId: user.id });
      setListing(prev => prev ? { ...prev, reviews: [{ ...newReview, userId: { _id: user.id, name: user.name || 'User' } }, ...prev.reviews] } : null);
      setRating(0); setComment('');
      toast({ title: 'Review submitted!' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to submit review.' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Message Sent!', description: 'The property owner will get back to you shortly.' });
    setContactForm({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  return (
    <div className="bg-white">
      <div className="max-w-[1400px] mx-auto px-5 py-5">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-text mb-4">
          <a href="/" className="hover:text-primary-green">Home</a>
          <span className="mx-2">›</span>
          <a href="/browse" className="hover:text-primary-green">Browse</a>
          <span className="mx-2">›</span>
          <span className="text-text-dark font-medium">{listing.name}</span>
        </nav>

        {/* ── Gallery ── */}
        <section className="relative mb-0">
          {/* Action buttons overlay */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:shadow-md transition-shadow">
              <Share2 className="h-4 w-4 text-text-dark" />
            </button>
            <button
              onClick={() => setFavorited(f => !f)}
              className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:shadow-md transition-shadow"
            >
              <Heart className={`h-4 w-4 ${favorited ? 'fill-red-alert text-red-alert' : 'text-text-dark'}`} />
            </button>
          </div>

          {/* Media tags overlay */}
          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <span className="bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer">
              <Camera className="h-3.5 w-3.5" /> {listing.photos.length} Photos
            </span>
            <span className="bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer">
              <Video className="h-3.5 w-3.5" /> Video
            </span>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden h-[400px]">
            <div className="col-span-2 relative">
              <Image
                src={listing.photos[0] || 'https://placehold.co/800x500.png'}
                alt={listing.name} fill className="object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {[1, 2].map(i => (
                <div key={i} className="relative overflow-hidden">
                  <Image
                    src={listing.photos[i] || 'https://placehold.co/400x250.png'}
                    alt={`View ${i + 1}`} fill className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sticky Page Nav ── */}
        <nav className="sticky top-[70px] z-30 bg-white border-b border-gray-border mb-0 -mx-5 px-5">
          <div className="max-w-[1400px] flex gap-1 overflow-x-auto">
            {PAGE_NAV.map(section => (
              <button
                key={section}
                onClick={() => scrollTo(section)}
                className={`px-4 py-4 text-sm font-medium whitespace-nowrap relative transition-colors ${activeSection === section
                    ? 'text-primary-green'
                    : 'text-gray-text hover:text-text-dark'
                  }`}
              >
                {section}
                {activeSection === section && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-green rounded-t" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Two Column Layout ── */}
        <div className="flex gap-8 pt-6">

          {/* ── Left Column ── */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Property Header Info */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-text-dark">{listing.name}</h1>
                {listing.reviews.length > 0 && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-5 w-5 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-border'}`} />
                    ))}
                    <span className="text-sm text-gray-text ml-1">({listing.reviews.length} Reviews)</span>
                  </div>
                )}
              </div>
              <p className="text-gray-text mt-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {listing.address}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 p-4 bg-gray-light rounded-lg">
                {[
                  { label: 'Monthly Rent', value: `₱${listing.priceMin.toLocaleString()} – ₱${listing.priceMax.toLocaleString()}` },
                  { label: 'Available Rooms', value: `${listing.availableRooms} of ${listing.totalRooms}` },
                ].map(stat => (
                  <div key={stat.label}>
                    <span className="text-xs text-gray-text block">{stat.label}</span>
                    <span className="text-lg font-bold text-text-dark">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Floor Plans */}
            <section id="pricing">
              <h2 className="text-2xl font-bold text-text-dark mb-5">Pricing & Floor Plans</h2>
              <div className="space-y-3">
                {listing.rooms.length > 0 ? listing.rooms.map((room, i) => (
                  <div key={room._id} className="flex items-center justify-between p-4 border border-gray-border rounded-lg hover:shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-shadow">
                    <div>
                      <h3 className="font-semibold text-text-dark">{room.type || `Room ${i + 1}`}</h3>
                      <p className="text-sm text-gray-text">{room.inclusions.join(' · ')}</p>
                      <p className="text-lg font-bold text-primary-green mt-1">₱{room.price.toLocaleString()}/mo</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${room.isAvailable ?? (room as any).is_available ? 'bg-green-50 text-primary-green' : 'bg-red-50 text-red-alert'}`}>
                        {room.isAvailable ?? (room as any).is_available ? 'Available Now' : 'Occupied'}
                      </span>
                      {(room.isAvailable ?? (room as any).is_available) && (
                        <button className="block mt-2 text-sm font-medium px-4 py-1.5 border border-gray-border rounded hover:bg-gray-light transition-colors">
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-text">Contact the owner for pricing details.</p>
                )}
              </div>
            </section>

            {/* About */}
            <section id="about">
              <h2 className="text-2xl font-bold text-text-dark mb-4">About {listing.name}</h2>
              <p className="text-text-dark leading-relaxed">{listing.description || 'No description provided.'}</p>

              {/* Property Highlights */}
              {listing.rules.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-text-dark mt-6 mb-3">Property Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.rules.map((rule, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-medium text-text-dark bg-gray-light px-3 py-2.5 rounded-lg">
                        <span className="text-primary-green">✦</span> {rule}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Amenities */}
            <section id="amenities">
              <h2 className="text-2xl font-bold text-text-dark mb-5">Property Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit Features */}
                <AmenityCard
                  icon="🏠" title="Unit Features"
                  items={listing.amenities.slice(0, Math.ceil(listing.amenities.length / 2))}
                />
                {/* Community (remaining) */}
                <AmenityCard
                  icon="🏢" title="Community Amenities"
                  items={listing.amenities.slice(Math.ceil(listing.amenities.length / 2))}
                />
              </div>
            </section>

            {/* 3D Virtual Tour */}
            <section id="views">
              <h2 className="text-2xl font-bold text-text-dark mb-5">3D Virtual Tour</h2>
              <MarzipanoViewer 
                scenes={listing.rooms.filter(r => (r as any).model_3d_url).length > 0 ? listing.rooms.filter(r => (r as any).model_3d_url).map((r, i) => ({
                    id: r._id,
                    name: r.type || `Room ${i + 1}`,
                    imageUrl: (r as any).model_3d_url,
                    hotspots: []
                })) : [
                  {
                    id: 'living-room',
                    name: 'Living Room',
                    imageUrl: 'https://www.marzipano.net/media/equirect/angra.jpg',
                    hotspots: [{ pitch: 0.1, yaw: -0.4, label: 'Kitchen', sceneId: 'kitchen' }]
                  }
                ]} 
              />
            </section>

            {/* Fees & Policies */}
            <section id="fees-policies">
              <h2 className="text-2xl font-bold text-text-dark mb-5">Fees and Policies</h2>
              <div className="border border-gray-border rounded-lg p-5 space-y-3">
                {[
                  { label: 'Security Deposit', value: '1 Month\'s Rent' },
                  { label: 'Advance Payment', value: '1 Month\'s Rent' },
                  { label: 'Application Review', value: '3–5 Business Days' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-gray-border last:border-0">
                    <span className="text-gray-text">{row.label}</span>
                    <span className="font-medium text-text-dark">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Location */}
            <section id="location">
              <h2 className="text-2xl font-bold text-text-dark mb-5">Neighborhood & Location</h2>
              {listing.location ? (
                <Map
                  center={[listing.location.coordinates[1], listing.location.coordinates[0]]}
                  zoom={15}
                  markers={[{ position: [listing.location.coordinates[1], listing.location.coordinates[0]], title: listing.name }]}
                  className="h-[280px] w-full rounded-lg mb-5"
                />
              ) : (
                <div className="h-[200px] bg-gray-light rounded-lg flex items-center justify-center text-gray-text mb-5">
                  Map location not available
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: '🎓', title: 'Schools & Universities', items: ['See map above for nearby recommendations.'] },
                  { icon: '🚌', title: 'Transportation', items: (listing as any).transportation && (listing as any).transportation.length > 0 ? (listing as any).transportation : ['Contact owner for transport options'] },
                  { icon: '🏪', title: 'Points of Interest', items: ['See map above for nearby POIs.'] },
                  { icon: '📊', title: 'Avg Prices in Area', items: [`Studio: ₱${listing.priceMin.toLocaleString()}/mo`, `Room: ₱${listing.priceMax.toLocaleString()}/mo`] },
                ].map(info => (
                  <div key={info.title}>
                    <h3 className="font-semibold text-text-dark mb-2">{info.icon} {info.title}</h3>
                    <ul className="space-y-2">
                      {info.items.map((item: string, i: number) => (
                        <li key={i} className="flex justify-between text-sm text-gray-text border-b border-gray-border pb-1.5">
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section id="reviews">
              <h2 className="text-2xl font-bold text-text-dark mb-5">Ratings & Reviews</h2>
              {listing.reviews.length > 0 ? (
                <>
                  {/* Scorecard */}
                  <div className="flex gap-8 p-5 bg-gray-light rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-text-dark">{avgRating.toFixed(1)}</div>
                      <div className="flex justify-center my-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-border'}`} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-text">From {listing.reviews.length} Reviews</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingsCount[star] || 0;
                        const pct = listing.reviews.length > 0 ? (count / listing.reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-4 text-right text-gray-text">{star}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-border rounded-full overflow-hidden">
                              <div className="h-full bg-primary-green rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-gray-text w-8">{Math.round(pct)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="space-y-4">
                    {listing.reviews.map(review => (
                      <div key={review._id} className="p-4 border border-gray-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold text-text-dark">{review.userId?.name}</span>
                            <span className="ml-2 text-xs text-primary-green">✓ Verified</span>
                            <div className="flex mt-1">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-border'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-text">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-dark leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-text">No reviews yet. Be the first to review!</p>
              )}

              {/* Write review */}
              {user && (
                <div className="mt-6 p-5 border border-gray-border rounded-lg">
                  <h3 className="font-bold text-text-dark mb-4">Write a Review</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-text">Your Rating:</span>
                    <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`h-6 w-6 cursor-pointer transition-colors ${s <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-border'}`}
                          onMouseEnter={() => setHoverRating(s)}
                          onClick={() => setRating(s)}
                        />
                      ))}
                    </div>
                  </div>
                  <Textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="mb-4 border-gray-border"
                  />
                  <button
                    onClick={handleReviewSubmit}
                    className="px-6 py-2.5 bg-primary-green hover:bg-primary-green-hover text-white font-medium rounded transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </section>

          </div>{/* /left column */}

          {/* ── Right Column (Sticky Contact) ── */}
          <div className="hidden lg:block w-[360px] flex-shrink-0">
            <div className="sticky top-[140px] border border-gray-border rounded-lg overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
              {/* Contact Header */}
              <div className="p-5 border-b border-gray-border">
                <h3 className="text-2xl font-bold text-text-dark">{listing.name}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-text">
                  <Phone className="h-4 w-4" /> Contact via form below
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-text">
                  <Calendar className="h-4 w-4" /> Open Today: 8:00 AM – 6:00 PM
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="p-4 flex gap-2.5 border-b border-gray-border">
                <a href={`/inbox?to=${listing.ownerId?._id || ''}&subject=${encodeURIComponent('Interested in ' + listing.name)}`} className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-primary-green hover:bg-primary-green-hover text-white font-medium rounded transition-colors text-sm">
                  <Mail className="h-4 w-4" /> Message
                </a>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-primary-green text-primary-green font-medium rounded hover:bg-[rgba(33,141,61,0.05)] transition-colors text-sm">
                  <Calendar className="h-4 w-4" /> Request Tour
                </button>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleContactSubmit} className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="First Name" required value={contactForm.firstName}
                    onChange={e => setContactForm(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green transition"
                  />
                  <input
                    placeholder="Last Name" required value={contactForm.lastName}
                    onChange={e => setContactForm(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green transition"
                  />
                </div>
                <input
                  type="email" placeholder="Email Address" required value={contactForm.email}
                  onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green transition"
                />
                <input
                  type="tel" placeholder="Phone Number" value={contactForm.phone}
                  onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green transition"
                />
                <textarea
                  placeholder="I am interested in learning more..." rows={4} value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green transition resize-none"
                />
                <label className="flex items-start gap-2 text-xs text-gray-text cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 accent-primary-green" />
                  <span>I agree to the Terms & Conditions and Privacy Policy.</span>
                </label>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded transition-colors"
                >
                  Contact Property
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AmenityCard({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="border border-gray-border rounded-lg p-4">
      <h4 className="font-semibold text-text-dark mb-3">{icon} {title}</h4>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-text flex items-start gap-2">
              <span className="text-primary-green mt-0.5">✓</span> {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-text">Not specified.</p>
      )}
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-text">Loading...</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
