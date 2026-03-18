
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { useToast } from '@/hooks/use-toast';
import { User, Edit, Pencil, UserCheck, Wallet, SlidersHorizontal, MapPin, Footprints, Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/index';
import { Separator } from '@/components/ui/index';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/index';
import { Checkbox } from '@/components/ui/index';
import type { SurveyData } from '@/lib/types';
import { userService } from '@/services/api/users';

const accommodationTypesOptions = ['Up and Down', 'Solo Room', 'Studio Type', 'Bed Spacer'];
const amenitiesOptions = [
  'Airconditioned', 'Wi-Fi Included', 'Pets Allowed', 'Parking Space', 'Kitchen Access', 'Laundry Service', 'No Curfew', 'Appliances Allowed'
];


export default function ProfilePage() {
  const { user, updateUser, surveyData, saveSurveyData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [myReviews, setMyReviews] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  // State for editable preferences
  const [userType, setUserType] = useState(surveyData?.userType || 'student');
  const [priceRange, setPriceRange] = useState<[number, number]>(surveyData?.priceRange || [0, 0]);
  const [amenities, setAmenities] = useState(surveyData?.amenities || []);
  const [walkingDistance, setWalkingDistance] = useState(surveyData?.walkingDistance || '10');
  const [location, setLocation] = useState(surveyData?.location || '');
  const [accommodationTypes, setAccommodationTypes] = useState(surveyData?.accommodationType || []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      userService.getMyReviews()
        .then(data => setMyReviews(data))
        .catch(console.error);
    }
    if (surveyData) {
      setUserType(surveyData.userType);
      setPriceRange(surveyData.priceRange);
      setAmenities(surveyData.amenities);
      setWalkingDistance(surveyData.walkingDistance);
      setLocation(surveyData.location);
      setAccommodationTypes(surveyData.accommodationType);
    }
  }, [user, surveyData, isEditing]);

  if (!user) {
    // Redirect to login if not authenticated
    useEffect(() => {
      router.push('/login');
    }, [router]);
    return (
      <div className="flex justify-center items-center h-full">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const handleSave = () => {
    if (updateUser) {
      updateUser({ name });
      const newSurveyData: SurveyData = {
        userType,
        accommodationType: accommodationTypes,
        priceRange,
        amenities,
        location,
        walkingDistance
      }
      saveSurveyData(newSurveyData);
      toast({ title: "Profile Updated", description: "Your information and preferences have been updated." });
      setIsEditing(false);
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update profile." });
    }
  };

  const handleAccommodationTypeChange = (checked: boolean, type: string) => {
    setAccommodationTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleAmenityChange = (checked: boolean, amenityLabel: string) => {
    setAmenities(prev =>
      checked ? [...prev, amenityLabel] : prev.filter(a => a !== amenityLabel)
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset fields to original values from user/surveyData
    if (user) setName(user.name);
    if (surveyData) {
      setUserType(surveyData.userType);
      setPriceRange(surveyData.priceRange);
      setAmenities(surveyData.amenities);
      setWalkingDistance(surveyData.walkingDistance);
      setLocation(surveyData.location);
      setAccommodationTypes(surveyData.accommodationType);
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://placehold.co/96x96.png" alt={user.name} data-ai-hint="person" />
                <AvatarFallback className="text-3xl">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-2">
                <CardTitle className="text-3xl font-headline flex items-center gap-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  ) : (
                    user.name
                  )}
                </CardTitle>
                <CardDescription className="mt-1">{user.email}</CardDescription>
                <div className="mt-2">
                  {user.verificationStatus === 'verified' ? (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Link href="/profile/verify">
                      <Badge variant="outline" className={`cursor-pointer hover:bg-muted ${user.verificationStatus === 'pending' ? 'text-blue-600 border-blue-200' : user.verificationStatus === 'rejected' ? 'text-red-600 border-red-200' : ''}`}>
                        {user.verificationStatus === 'pending' ? 'Verification Pending' : user.verificationStatus === 'rejected' ? 'Verification Rejected' : 'Get Verified'}
                      </Badge>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {!isEditing && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Pencil className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {isEditing ? (
            <div className="space-y-8">
              <Separator />
              <div>
                <h3 className="text-xl font-headline mb-4">Edit Your Preferences</h3>
                <div className="space-y-6">
                  {/* User Type */}
                  <div className="space-y-2">
                    <Label className="font-semibold">I am a</Label>
                    <RadioGroup value={userType} onValueChange={(v: any) => setUserType(v)} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="student" id="student" /><Label htmlFor="student">Student</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="worker" id="worker" /><Label htmlFor="worker">Worker</Label></div>
                    </RadioGroup>
                  </div>
                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="font-semibold">My Budget (Monthly)</Label>
                    <div className="flex gap-4">
                      <Input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} placeholder="Min" />
                      <Input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} placeholder="Max" />
                    </div>
                  </div>
                  {/* Accommodation Type */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Accommodation Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {accommodationTypesOptions.map(type => {
                        const typeId = type.toLowerCase().replace(/ /g, '_');
                        return (
                          <div key={typeId} className="flex items-center space-x-2">
                            <Checkbox id={`edit-${typeId}`} onCheckedChange={(checked) => handleAccommodationTypeChange(!!checked, type)} checked={accommodationTypes.includes(type)} />
                            <Label htmlFor={`edit-${typeId}`} className="font-normal">{type}</Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Amenities */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Amenities</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesOptions.map(amenity => {
                        const amenityId = amenity.toLowerCase().replace(/ /g, '_');
                        return (
                          <div key={amenityId} className="flex items-center space-x-2">
                            <Checkbox id={`edit-${amenityId}`} onCheckedChange={(checked) => handleAmenityChange(!!checked, amenity)} checked={amenities.includes(amenity)} />
                            <Label htmlFor={`edit-${amenityId}`} className="font-normal">{amenity}</Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Walking Distance */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Willing to walk up to</Label>
                    <RadioGroup value={walkingDistance} onValueChange={(v: any) => setWalkingDistance(v)} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="5" id="edit-5" /><Label htmlFor="edit-5">5 mins</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="10" id="edit-10" /><Label htmlFor="edit-10">10 mins</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="15" id="edit-15" /><Label htmlFor="edit-15">15 mins</Label></div>
                    </RadioGroup>
                  </div>
                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="font-semibold" htmlFor="location">My Home Base (School/Work)</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Araullo University" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-headline mb-4">Your Preferences</h3>
                {surveyData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-muted-foreground" />
                      <div>You are a <Badge variant="secondary">{surveyData.userType}</Badge></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div>Budget: <Badge variant="secondary">₱{surveyData.priceRange[0]} - ₱{surveyData.priceRange[1]}</Badge></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <SlidersHorizontal className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {surveyData.amenities.map(amenity => <Badge key={amenity} variant="outline">{amenity}</Badge>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Footprints className="h-5 w-5 text-muted-foreground" />
                      <div>Willing to walk: <Badge variant="secondary">{surveyData.walkingDistance} minutes</Badge></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>Your home base: <span className="font-medium">{surveyData.location || 'Not set'}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't taken the survey yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/survey')}>Find Recommendations</Button>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />
          <div>
            <h3 className="text-xl font-headline mb-4">My Reviews</h3>
            {myReviews.length > 0 ? (
              <div className="space-y-4">
                {myReviews.map(review => {
                  return (
                    <Card key={review.review_id || review._id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">Review for <Link href={`/listings/${review.listing_id || '#'}`} className="font-semibold underline hover:text-primary">{review.listing_name || 'this property'}</Link></p>
                          <p className="mt-2 text-foreground">{review.comment}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">You haven't written any reviews yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


