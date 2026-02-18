'use client';

import { useState, Suspense, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@makikibahay/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Badge } from '@makikibahay/ui';
import { Button } from '@makikibahay/ui';
import { Separator } from '@makikibahay/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@makikibahay/ui';
import { MapPin, BedDouble, Cuboid, CheckCircle, Star, MessageSquare, Phone, ExternalLink, Send, ShieldAlert } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@makikibahay/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@makikibahay/ui';
import { useSession } from 'next-auth/react';
import { Textarea } from '@makikibahay/ui';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@makikibahay/ui';
import { Label } from '@makikibahay/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@makikibahay/ui';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
});

// Interface definitions based on Backend Response
interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Room {
  _id: string;
  type?: string;
  price: number;
  inclusions: string[];
  isAvailable: boolean;
  model3dUrl?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId: User;
  createdAt: string;
}

interface Listing {
  _id: string;
  name: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  description?: string;
  priceMin: number;
  priceMax: number;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  rules: string[];
  photos: string[];
  ownerId: User;
  rooms: Room[];
  reviews: Review[];
  // Mapped fields for UI convenience
  coverPhoto?: string;
}


function ReportDialog({ reportedEntityName, reportedEntityType }: { reportedEntityName: string, reportedEntityType: 'listing' | 'owner' }) {
  const { toast } = useToast();
  // Implementation for API call would go here
  const handleSubmitReport = () => {
    toast({
      title: "Report Submitted",
      description: "Report submitted for review.",
    });
  }

  return (
    <DialogContent>
      {/* Same dialog content */}
      <DialogHeader>
        <DialogTitle>Report {reportedEntityType === 'listing' ? 'a Listing' : 'an Owner'}</DialogTitle>
      </DialogHeader>
      <Button onClick={handleSubmitReport}>Submit Report</Button>
    </DialogContent>
  )
}

function ReviewForm({ listingId, onReviewSubmit }: { listingId: string, onReviewSubmit: (newReview: Review) => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Login required.' });
      return;
    }
    if (rating === 0) return;

    try {
      const newReview = await api.post<Review>(`/reviews/${listingId}`, {
        rating,
        comment,
        userId: user.id
      });

      const reviewWithUser = {
        ...newReview,
        userId: { _id: user.id, name: user.name || 'User', avatar: user.image || '' }
      };

      onReviewSubmit(reviewWithUser);
      setRating(0);
      setComment('');
      toast({ title: 'Success', description: 'Review submitted!' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit review.' });
    }
  };

  if (!user) return <p>Please log in to review.</p>;

  return (
    <Card className="mt-6 p-6">
      <CardTitle className="mb-4">Write a Review</CardTitle>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground">Your Rating:</span>
        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            return (
              <Star
                key={i}
                className={`h-6 w-6 cursor-pointer transition-colors ${starValue <= (hoverRating || rating)
                  ? 'text-primary fill-primary'
                  : 'text-muted-foreground/50'
                  }`}
                onMouseEnter={() => setHoverRating(starValue)}
                onClick={() => setRating(starValue)}
              />
            );
          })}
        </div>
      </div>
      <Textarea value={comment} onChange={e => setComment(e.target.value)} />
      <Button onClick={handleSubmit} className="mt-4">Submit</Button>
    </Card>
  );
}

function ListingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { data: session, status } = useSession();
  const user = session?.user;
  const loadingAuth = status === 'loading';
  const { toast } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await api.get<Listing>(`/listings/${listingId}`);
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);


  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!listing) return <div className="p-8 text-center">Listing not found</div>;

  const handleReviewSubmit = (newReview: Review) => {
    setListing(prev => prev ? { ...prev, reviews: [newReview, ...prev.reviews] } : null);
  };

  // Calculate average
  const averageRating = listing.reviews.length > 0
    ? (listing.reviews.reduce((acc, r) => acc + r.rating, 0) / listing.reviews.length).toFixed(1)
    : 'New';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Keeping simpler structure for brevity, adapting original UI to new data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">{listing.name}</h1>
          <p className="text-muted-foreground mb-4">{listing.address}</p>

          {/* Photos Carousel */}
          {listing.photos && listing.photos.length > 0 && (
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 mb-6">
              <Image src={listing.photos[0]} alt={listing.name} fill className="object-cover" />
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <Badge variant="secondary"><Star className="w-4 h-4 mr-1" /> {averageRating}</Badge>
            <Badge variant="outline">{listing.availableRooms} rooms available</Badge>
          </div>

          <Separator className="my-6" />

          {/* Map Section */}
          <h2 className="text-xl font-bold mb-4">Location</h2>
          <div className="mb-6">
            {listing.location ? (
              <Map
                center={[listing.location.coordinates[1], listing.location.coordinates[0]]}
                zoom={15}
                markers={[
                  {
                    position: [listing.location.coordinates[1], listing.location.coordinates[0]],
                    title: listing.name
                  }
                ]}
              />
            ) : (
              <div className="h-[400px] w-full bg-slate-100 rounded-lg flex items-center justify-center text-muted-foreground">
                Map location not available
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <h2 className="text-xl font-bold mb-4">Rooms</h2>
          <div className="space-y-4">
            {listing.rooms.map(room => (
              <div key={room._id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <p className="font-semibold">Room</p>
                  <p className="text-sm text-muted-foreground">{room.inclusions.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₱{room.price}</p>
                  <Badge variant={room.isAvailable ? 'default' : 'destructive'}>{room.isAvailable ? 'Available' : 'Occupied'}</Badge>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <div className="space-y-4">
            {listing.reviews.map(review => (
              <Card key={review._id} className="p-4">
                <div className="flex justify-between">
                  <p className="font-semibold">{review.userId?.name}</p>
                  <div className="flex"><Star className="w-4 h-4 text-yellow-500" /> {review.rating}</div>
                </div>
                <p className="mt-2">{review.comment}</p>
              </Card>
            ))}
          </div>

          <ReviewForm listingId={listing._id} onReviewSubmit={handleReviewSubmit} />
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Contact Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={listing.ownerId?.avatar} />
                  <AvatarFallback>{listing.ownerId?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{listing.ownerId?.name}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>
              <Button className="w-full">Message Owner</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
