
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/index';
import { Progress } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { RadioGroup, RadioGroupItem } from '@/components/ui/index';
import { Checkbox } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { SurveyData } from '@/lib/types';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-slate-100 animate-pulse rounded-lg" />
});


const totalSteps = 6;

const accommodationTypeOptions = ['Up and Down', 'Solo Room', 'Studio Type', 'Bed Spacer'];
const rulesOptions = [
  { id: 'no_curfew', label: 'No Curfew' },
  { id: 'pets_allowed', label: 'Pets Allowed' },
  { id: 'aircon', label: 'Airconditioned' },
  { id: 'appliances', label: 'Appliances Allowed' },
  { id: 'wifi', label: 'Wi-Fi Included' },
  { id: 'parking', label: 'Parking Space' },
  { id: 'kitchen', label: 'Kitchen Access' },
  { id: 'laundry', label: 'Laundry Service' },
];

export default function SurveyPage() {
  const router = useRouter();
  const { user, saveSurveyData } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'student' | 'worker'>('student');
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([2000, 8000]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<[number, number]>([15.4865, 120.9734]);
  const [walkingDistance, setWalkingDistance] = useState<'5' | '10' | '15'>('10');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAccommodationTypeChange = (checked: boolean, type: string) => {
    if (checked) {
      setAccommodationTypes((prev) => [...prev, type]);
    } else {
      setAccommodationTypes((prev) => prev.filter((t) => t !== type));
    }
  };

  const handleAmenityChange = (checked: boolean, amenityLabel: string) => {
    if (checked) {
      setAmenities((prev) => [...prev, amenityLabel]);
    } else {
      setAmenities((prev) => prev.filter((label) => label !== amenityLabel));
    }
  };

  const handleGeocode = async () => {
    if (!location) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setLocationCoords([parseFloat(lat), parseFloat(lon)]);
        toast({ title: 'Location Found', description: 'Map updated to your search.' });
      } else {
        toast({ variant: 'destructive', title: 'Not Found', description: 'Could not find that location.' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please Log In',
        description: 'You must be logged in to save your preferences and see recommendations.'
      });
      router.push('/login');
      return;
    }

    const surveyData: SurveyData = {
      userType,
      accommodationType: accommodationTypes,
      priceRange,
      amenities,
      location,
      walkingDistance
    };

    saveSurveyData(surveyData);

    toast({
      title: 'Preferences Saved!',
      description: 'We are now finding the best matches for you.'
    });

    router.push('/browse');
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-2xl bg-card">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-2xl">Tell Us Your Preferences</CardTitle>
          <CardDescription>Complete this survey to get personalized recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-lg">Are you a student or a worker?</h3>
              <RadioGroup value={userType} onValueChange={(v: 'student' | 'worker') => setUserType(v)} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="worker" id="worker" />
                  <Label htmlFor="worker">Worker / Professional</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-lg">What type of accommodation are you looking for?</h3>
              <div className="grid grid-cols-2 gap-4">
                {accommodationTypeOptions.map((type) => {
                  const typeId = type.toLowerCase().replace(/ /g, '_');
                  return (
                    <div key={typeId} className="flex items-center space-x-2">
                      <Checkbox id={typeId} onCheckedChange={(checked) => handleAccommodationTypeChange(!!checked, type)} checked={accommodationTypes.includes(type)} />
                      <Label htmlFor={typeId} className="font-normal">{type}</Label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-lg">What's your monthly budget?</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="min-price">Min Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="e.g., 2000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value, 10) || 0, priceRange[1]])}
                    className="w-full"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="max-price">Max Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="e.g., 8000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10) || 0])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-lg">Which amenities or rules are important to you?</h3>
              <div className="grid grid-cols-2 gap-4">
                {rulesOptions.map((rule) => (
                  <div key={rule.id} className="flex items-center space-x-2">
                    <Checkbox id={rule.id} onCheckedChange={(checked) => handleAmenityChange(!!checked, rule.label)} checked={amenities.includes(rule.label)} />
                    <Label htmlFor={rule.id} className="font-normal">{rule.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-lg">Where is your "home base"?</h3>
              <p className="text-muted-foreground">Pin a location on the map (like your school or workplace) to find nearby places.</p>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input 
                    placeholder="Search for a location (e.g. SM Cabanatuan)..." 
                    className="pl-10" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
                  />
                </div>
                <Button variant="outline" onClick={handleGeocode} disabled={isGeocoding}>
                  {isGeocoding ? '...' : 'Search'}
                </Button>
              </div>
              <div className="mt-4 aspect-video bg-secondary rounded-lg flex items-center justify-center overflow-hidden relative z-0">
                <LocationPickerMap 
                  initialCenter={locationCoords} 
                  initialZoom={15} 
                  onLocationSelect={(lat, lng, address) => {
                    setLocationCoords([lat, lng]);
                    if (address) setLocation(address);
                  }} 
                />
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h3 className="font-semibold text-lg">How far are you willing to walk?</h3>
              <RadioGroup value={walkingDistance} onValueChange={(v: '5' | '10' | '15') => setWalkingDistance(v)} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="5min" />
                  <Label htmlFor="5min">5 minutes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10" id="10min" />
                  <Label htmlFor="10min">10 minutes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15" id="15min" />
                  <Label htmlFor="15min">15 minutes</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <Link href="/browse" passHref>
              <Button variant="link" className="text-white">Skip & Browse</Button>
            </Link>
            {step < totalSteps ? (
              <Button onClick={nextStep} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Find Recommendations
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
