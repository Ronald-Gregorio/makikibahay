
'use client';

import { useState, Suspense, useEffect } from 'react';
import { listings } from '@/lib/mock-data';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, BedDouble, Ruler, CheckCircle, Star, MessageSquare, Phone, ExternalLink, Cuboid, Pencil, Send, ShieldAlert } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Review } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function ReportDialog({ reportedEntityName, reportedEntityType }: { reportedEntityName: string, reportedEntityType: 'listing' | 'owner' }) {
    const { toast } = useToast();

    const handleSubmitReport = () => {
        toast({
            title: "Report Submitted",
            description: "Are you sure to report this person, make sure that the report description is correct, this report will be under review, check notification to get updates on the report status",
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Report {reportedEntityType === 'listing' ? 'a Listing' : 'an Owner'}</DialogTitle>
                <DialogDescription>
                    Report "{reportedEntityName}" for review by our administrators.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select>
                        <SelectTrigger id="report-type">
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="misleading">Misleading Information</SelectItem>
                            <SelectItem value="scam">Potential Scam</SelectItem>
                            <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                            <SelectItem value="harassment">Harassment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea id="report-description" placeholder="Please provide a detailed description of the issue." />
                </div>
            </div>
             <DialogDescription className="text-xs text-amber-500">
                Are you sure to report this person, make sure that the report description is correct, this report will be under review, check notification to get updates on the report status.
            </DialogDescription>
            <Button onClick={handleSubmitReport}>Submit Report</Button>
        </DialogContent>
    )
}

function ReviewForm({ listingId, onReviewSubmit }: { listingId: number, onReviewSubmit: (newReview: Review) => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a review.' });
      return;
    }
    if (rating === 0 || comment.trim() === '') {
        toast({ variant: 'destructive', title: 'Error', description: 'Please provide a rating and a comment.' });
        return;
    }
    // In a real app, this would be an API call.
    const newReview: Review = {
        review_id: Math.random(), // temp id
        listing_id: listingId,
        user_id: parseInt(user.id, 10),
        rating,
        comment,
        created_at: new Date().toISOString(),
        user: { name: user.name, avatar: 'https://placehold.co/40x40.png' }
    };
    onReviewSubmit(newReview);
    setRating(0);
    setComment('');
    toast({ title: 'Success', description: 'Your review has been submitted!' });
  };

  if (!user) {
    return <p className="text-muted-foreground">Please log in to leave a review.</p>;
  }

  return (
    <Card className="mt-6 p-6">
        <CardTitle className="text-xl font-headline mb-4">Write a Review</CardTitle>
        <div className="flex items-center gap-2 mb-4">
            <span className="text-muted-foreground">Your Rating:</span>
            <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    return (
                        <Star
                            key={i}
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                                starValue <= (hoverRating || rating)
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
        <Textarea 
            placeholder="Share your experience..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
        />
        <Button className="mt-4" onClick={handleSubmit}>Submit Review</Button>
    </Card>
  );
}


function ListingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const listingId = parseInt(params.id as string, 10);
  
  // Local state to manage reviews for this page to see updates immediately
  const [currentListing, setCurrentListing] = useState(() => listings.find((l) => l.id === listingId));
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
      return (
          <div className="container mx-auto px-4 md:px-6 py-12 text-center">
              Loading or redirecting...
          </div>
      );
  }


  if (!currentListing) {
    notFound();
  }
  
  const handleReviewSubmit = (newReview: Review) => {
    // This is a temporary way to update the UI.
    // In a real app, you'd refetch data or update a global state.
    const updatedReviews = [...currentListing.reviews, newReview];
    const updatedListing = { ...currentListing, reviews: updatedReviews };
    setCurrentListing(updatedListing);
    
    // Also update the global mock data (this won't persist across reloads)
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if(listingIndex !== -1) {
        listings[listingIndex].reviews.push(newReview);
    }
  };

  const handleShowPhone = () => {
     if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to view contact details.' });
      return;
    }
    setShowPhoneNumber(true);
  }
  
  const averageRating = currentListing.reviews.length > 0
    ? (currentListing.reviews.reduce((acc, review) => acc + review.rating, 0) / currentListing.reviews.length).toFixed(1)
    : 'New';

  return (
    <Dialog>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {currentListing.photos.map((photo) => (
                      <CarouselItem key={photo.photo_id}>
                        <div className="aspect-video relative">
                          <Image
                            src={photo.url}
                            alt={`${currentListing.name} photo`}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint="apartment interior"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="ml-16" />
                  <CarouselNext className="mr-16" />
                </Carousel>
              </CardContent>
            </Card>
            
            <div className="mt-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold font-headline">{currentListing.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                            <MapPin className="h-5 w-5" />
                            <span>{currentListing.address}</span>
                        </div>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="text-muted-foreground">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Report this listing
                            </Button>
                        </DialogTrigger>
                        <ReportDialog reportedEntityName={currentListing.name} reportedEntityType="listing" />
                    </Dialog>
                </div>

              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="flex items-center gap-1 text-lg py-1 px-3">
                    <Star className="w-5 h-5 text-primary" />
                    <span>{averageRating} ({currentListing.reviews.length} reviews)</span>
                </Badge>
                <Badge variant="outline" className="text-lg py-1 px-3">{currentListing.available_rooms} rooms available</Badge>
              </div>
            </div>
            
            <Separator className="my-8" />

            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">Rooms and Pricing</h2>
              <Card>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Room Type</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Inclusions</TableHead>
                              <TableHead>Availability</TableHead>
                              <TableHead className="text-right">3D View</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {currentListing.rooms.map(room => (
                            <DialogTrigger asChild key={room.room_id}>
                              <TableRow className="cursor-pointer">
                                  <TableCell className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-muted-foreground"/>{room.type}</TableCell>
                                  <TableCell className="font-semibold">₱{room.price.toLocaleString()}</TableCell>
                                  <TableCell>{room.inclusions.join(', ')}</TableCell>
                                  <TableCell>
                                      <Badge variant={room.is_available ? "default" : "destructive"} className={room.is_available ? "bg-green-500 text-white" : ""}>
                                          {room.is_available ? 'Available' : 'Occupied'}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                      {room.model_3d_url && (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" disabled={!room.is_available} onClick={(e) => e.stopPropagation()}>
                                              <Cuboid className="h-4 w-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-3xl h-3/4">
                                            <DialogHeader>
                                              <DialogTitle>3D Room View</DialogTitle>
                                              <DialogDescription>
                                                Explore the room in 3D.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="h-full w-full flex items-center justify-center bg-secondary rounded-lg">
                                                  <p className="text-muted-foreground">3D Model Placeholder</p>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                  </TableCell>
                              </TableRow>
                            </DialogTrigger>
                          ))}
                      </TableBody>
                  </Table>
              </Card>
            </div>
            
            <Separator className="my-8" />

            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">House Rules</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentListing.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-8" />

            <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Interactive Google Map Placeholder</p>
                      </div>
                      <Button variant="link" className="w-full mt-2 text-accent">
                          <ExternalLink className="mr-2 h-4 w-4"/>
                          Show on Google Maps
                      </Button>
                  </CardContent>
            </Card>

            <Separator className="my-8" />
            
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Reviews</h2>
                <div className="space-y-6">
                    {currentListing.reviews.length > 0 ? (
                      currentListing.reviews.map(review => (
                        <Card key={review.review_id} className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={review.user.avatar} alt={review.user.name} data-ai-hint="person" />
                                    <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{review.user.name}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}/>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                                    <p className="mt-2">{review.comment}</p>
                                </div>
                            </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No reviews yet. Be the first one!</p>
                    )}
                </div>
                <ReviewForm listingId={currentListing.id} onReviewSubmit={handleReviewSubmit} />
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
             <DialogTrigger asChild>
                <Card className="sticky top-24 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="font-headline">Contact Owner</CardTitle>
                         <Dialog>
                            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Report
                                </Button>
                            </DialogTrigger>
                            <ReportDialog reportedEntityName={currentListing.owner_name} reportedEntityType="owner" />
                        </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground pointer-events-none">
                      <MessageSquare className="mr-2 h-4 w-4" /> Message Owner
                    </Button>

                    <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); handleShowPhone(); }} disabled={showPhoneNumber}>
                      {showPhoneNumber ? (
                          currentListing.owner_phone
                      ) : (
                          <>
                              <Phone className="mr-2 h-4 w-4" /> Show Phone Number
                          </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
             </DialogTrigger>
          </div>
        </div>
      </div>
       <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {currentListing.owner_name}</DialogTitle>
            <DialogDescription>
            This is a placeholder for a chat interface. In a real app, your messages would be sent directly to the owner.
          </DialogDescription>
        </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col space-y-2 h-64 overflow-y-auto p-4 bg-secondary rounded-md">
              {/* Placeholder messages */}
              <div className="flex justify-start"><Badge>Hi, is this still available?</Badge></div>
              <div className="flex justify-end"><Badge variant="default" className="bg-primary text-primary-foreground">Yes, it is!</Badge></div>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Type your message..." />
              <Button size="icon"><Send className="h-4 w-4"/></Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
