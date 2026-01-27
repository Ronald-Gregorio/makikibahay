'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Button } from '@makikibahay/ui';
import { Badge } from '@makikibahay/ui';
import { Input } from '@makikibahay/ui';
import { Heart, MapPin, Phone, Mail, Star, Users, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { Room, Message } from '@makikibahay/types';
import type { Listing } from '@makikibahay/types';

interface Review {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface ListingWithDetails {
  id: string;
  name: string;
  address: string;
  price_min: number;
  price_max: number;
  total_rooms: number;
  available_rooms: number;
  amenities: string[];
  cover_photo?: string;
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
  rooms: Room[];
  reviews: Review[];
  isFavorited: boolean;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
    const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [messageText, setMessageText] = useState('');
      const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/listings/${params.id}`)
        .then(res => res.json())
        .then(data => {
          const isFav = data.favorites?.includes(session?.user?.id) || false;
          setListing(data);
          setIsFavorited(isFav);
        })
        .catch(error => console.error('Error fetching listing:', error));
    }
  }, [params.id, session]);

  const handleFavorite = async () => {
    if (!session) return;
    
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      await fetch(`/api/favorites/${params.id}`, { method });
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!session || !reviewText.trim()) return;
    
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user?.id,
          listingId: params.id,
          rating,
          comment: reviewText
        })
      });
      
      setReviewText('');
      setRating(5);
      
      // Refresh listing to get new review
      const response = await fetch(`/api/listings/${params.id}`);
      const updatedListing = await response.json();
      setListing(updatedListing);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!session || !messageText.trim() || !listing) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          receiverId: listing.owner.id,
          listingId: listing.id
        })
      });
      
      setMessageText('');
      // In a real app, you'd update the messages list here
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-foreground"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Browse
          </Button>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-surface border border border-border rounded-lg p-6 mb-6">
                <div className="relative h-96 w-full bg-surface rounded-lg overflow-hidden">
                  {listing.cover_photo ? (
                    <img
                      src={listing.cover_photo}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                      <span className="text-muted-foreground">No photo available</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 bg-accent hover:bg-accent/90"
                    onClick={handleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{listing.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-accent" />
                      <span className="text-lg">{listing.address}</span>
                    </div>
                    <div className="ml-auto text-right">
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        ₱{listing.price_min.toLocaleString()} - ₱{listing.price_max.toLocaleString()}/month
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Availability</h4>
                      <p>{listing.available_rooms} of {listing.total_rooms} rooms available</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Owner</h4>
                      <div className="flex items-center gap-3">
                        {listing.owner.avatar && (
                          <img
                            src={listing.owner.avatar}
                            alt={listing.owner.name}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <h5 className="font-semibold">{listing.owner.name}</h5>
                          <p className="text-sm text-muted-foreground">{listing.owner.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="flex gap-2 flex-wrap">
                      {listing.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Owner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-accent" />
                    <span>{listing.owner.email}</span>
                  </div>
                  
                  <Button
                    onClick={() => setShowChat(true)}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Message Owner
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:w-96">
              {/* Reviews Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews ({listing.reviews?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {listing.reviews && listing.reviews.length > 0 ? (
                    listing.reviews.map((review: Review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                          {review.userId.avatar && (
                            <img
                              src={review.userId.avatar}
                              alt={review.userId.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <h5 className="font-semibold">{review.userId.name}</h5>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'fill-accent' : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">No reviews yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Leave a Review */}
              {session && (
                <Card>
                  <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer ${
                              rating >= star ? 'fill-accent' : 'text-muted-foreground'
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        className="w-full p-3 border border-border rounded-lg bg-surface text-primary-text resize-none"
                        rows={4}
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      onClick={handleSubmitReview}
                      className="w-full"
                      disabled={!reviewText.trim() || rating === 0}
                    >
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}