'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Button,
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Label,
  Input,
  Textarea,
  Checkbox,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Combobox
} from '@/components/ui/index';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listingService } from '@/services/api/listings';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
});

const roomSchema = z.object({
  type: z.string().min(1, 'Room type is required'),
  price: z.coerce.number().min(1, 'Price is required'),
  inclusions: z.string().min(1, 'Inclusions are required'),
  isAvailable: z.boolean().default(true),
  dimensions: z.string().optional(),
  maxOccupancy: z.coerce.number().optional(),
  isPrivateToilet: z.boolean().default(false),
  model3dUrl: z.string().optional(),
});

const listingFormSchema = z.object({
  // 1. Core Property Info
  listingName: z.string().min(3, 'Listing name must be at least 3 characters.'),
  propertyType: z.enum(['Apartment', 'Condo', 'Studio Type', 'Bed Spacer', 'Boarding House', 'Up and Down']),
  description: z.string().min(10, 'Description is required.'),
  
  // 2. Media & Virtual Viewing
  video: z.string().url('Invalid video URL').or(z.literal('')).optional(),
  virtualTour360: z.string().url('Invalid 3D tour URL').or(z.literal('')).optional(),
  floorPlans: z.array(z.string()).optional(),

  // 3. Location & Neighborhood
  fullAddress: z.string().min(10, 'Please enter a full address.'),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  neighborhoodNear: z.array(z.string()).optional(),
  transportationOptions: z.array(z.string()).optional(),

  // 4. Room, Unit Details & Pricing
  roomType: z.string().min(1, 'Room type is required'),
  availableRooms: z.coerce.number().min(0),
  bedrooms: z.enum(['Studio', '1', '2', '3', '4+']),
  bathrooms: z.enum(['1', '2', '3+']),
  squareFeet: z.coerce.number().min(1),
  monthlyRent: z.coerce.number().min(1),
  moveInDate: z.string().min(1, 'Move in date is required'),

  // 5. Fees & Policies
  securityDeposit: z.coerce.number().default(0),
  advancePayment: z.coerce.number().default(0),
  applicationReviewFee: z.coerce.number().default(0),
  specialtyProperty: z.enum(['Student Only', 'Worker Only', 'Income Restricted', 'Short-Term', 'None']),

  // 6. Pet Policy
  petPolicy: z.enum(['Cat Friendly', 'Dog Friendly', 'Any Pet Friendly', 'Small Dogs Only', 'No Pets']),

  // 7. House Rules
  hasCurfew: z.boolean().default(false),
  visitorsAllowed: z.boolean().default(true),
  smokingAllowed: z.boolean().default(false),
  cookingAllowed: z.boolean().default(true),
  quietHours: z.string().optional(),

  // 8. Amenities
  airConditioning: z.boolean().default(false),
  wifi: z.boolean().default(false),
  washer: z.boolean().default(false),
  dryer: z.boolean().default(false),
  utilitiesIncluded: z.boolean().default(false),
  dishwasher: z.boolean().default(false),
  parkingType: z.enum(['None', 'Outside', 'Garage']),
  laundryFacilities: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  appliancesIncluded: z.boolean().default(false),

  // Additional rooms
  rooms: z.array(roomSchema).optional(),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<{value: string, label: string}[]>([
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Condo', label: 'Condo' },
    { value: 'Studio Type', label: 'Studio Type' },
    { value: 'Bed Spacer', label: 'Bed Spacer' },
    { value: 'Boarding House', label: 'Boarding House' },
    { value: 'Up and Down', label: 'Up and Down' },
  ]);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      listingName: '',
      propertyType: 'Apartment',
      description: '',
      fullAddress: '',
      location: { lat: 15.4865, lng: 120.9734 },
      monthlyRent: 0,
      availableRooms: 1,
      bedrooms: '1',
      bathrooms: '1',
      squareFeet: 20,
      moveInDate: new Date().toISOString().split('T')[0],
      securityDeposit: 0,
      advancePayment: 0,
      applicationReviewFee: 0,
      specialtyProperty: 'None',
      petPolicy: 'No Pets',
      hasCurfew: false,
      visitorsAllowed: true,
      smokingAllowed: false,
      cookingAllowed: true,
      airConditioning: false,
      wifi: false,
      washer: false,
      dryer: false,
      utilitiesIncluded: false,
      dishwasher: false,
      parkingType: 'None',
      laundryFacilities: false,
      kitchen: false,
      appliancesIncluded: false,
      rooms: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listing = await listingService.getById(params.id);
        if (listing) {
          form.reset({
            listingName: listing.listingName || listing.name || '',
            propertyType: (listing.propertyType || (listing as any).type || 'Apartment') as any,
            description: listing.description || '',
            fullAddress: listing.fullAddress || listing.address || '',
            location: {
              lat: listing.lat || 15.4865,
              lng: listing.lng || 120.9734
            },
            video: listing.video || '',
            virtualTour360: listing.virtualTour360 || '',
            floorPlans: listing.floorPlans || [],
            neighborhoodNear: listing.neighborhoodNear || [],
            transportationOptions: listing.transportationOptions || [],
            roomType: listing.roomType || 'Standard Room',
            availableRooms: listing.availableRooms || 0,
            bedrooms: (listing.bedrooms || '1') as any,
            bathrooms: (listing.bathrooms || '1') as any,
            squareFeet: listing.squareFeet || 0,
            monthlyRent: listing.monthlyRent || listing.priceMin || 0,
            moveInDate: listing.moveInDate ? new Date(listing.moveInDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            securityDeposit: listing.securityDeposit || 0,
            advancePayment: listing.advancePayment || 0,
            applicationReviewFee: listing.applicationReviewFee || 0,
            specialtyProperty: (listing.specialtyProperty || 'None') as any,
            petPolicy: (listing.petPolicy || 'No Pets') as any,
            hasCurfew: listing.hasCurfew || false,
            visitorsAllowed: listing.visitorsAllowed !== false,
            smokingAllowed: listing.smokingAllowed || false,
            cookingAllowed: listing.cookingAllowed !== false,
            quietHours: listing.quietHours || '',
            airConditioning: listing.airConditioning || false,
            wifi: listing.wifi || false,
            washer: listing.washer || false,
            dryer: listing.dryer || false,
            utilitiesIncluded: listing.utilitiesIncluded || false,
            dishwasher: listing.dishwasher || false,
            parkingType: (listing.parkingType || 'None') as any,
            laundryFacilities: listing.laundryFacilities || false,
            kitchen: listing.kitchen || false,
            appliancesIncluded: listing.appliancesIncluded || false,
            rooms: (listing.rooms || []).map((r: any) => ({
              type: r.type,
              price: r.price,
              inclusions: Array.isArray(r.inclusions) ? r.inclusions.join(', ') : (r.inclusions || ''),
              isAvailable: r.is_available ?? true,
              model3dUrl: r.model_3d_url || '',
              dimensions: r.size_sqm ? `${r.size_sqm} sqm` : '',
            })),
          });
          if (listing.photos) {
             setPhotos(listing.photos.map((p: any) => typeof p === 'string' ? p : (p.url || p)));
          }
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load listing', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [params.id, form, toast]);

  const [isMain3DUploading, setIsMain3MainDUploading] = useState(false);

  const handleMain3DPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsMain3MainDUploading(true);
      const file = e.target.files[0];
      try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.postForm<{ url: string }>('/upload', formData);
        form.setValue('virtualTour360', response.url);
        toast({ title: '360° Photo Uploaded', description: 'Property virtual tour photo updated.' });
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
      } finally {
        setIsMain3MainDUploading(false);
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsPhotoUploading(true);
      const files = Array.from(e.target.files);
      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          const response = await api.postForm<{ url: string }>('/upload', formData);
          return response.url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        setPhotos(prev => [...prev, ...uploadedUrls]);
        toast({ title: 'Upload Successful', description: `${files.length} photo(s) uploaded.` });
      } catch (err: any) {
        toast({ title: 'Upload Failed', variant: 'destructive', description: err.message });
      } finally {
        setIsPhotoUploading(false);
      }
    }
  };

  const handleDeletePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleGeocodeAddress = async () => {
    const address = form.getValues('fullAddress');
    if (!address) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        form.setValue('location', { lat: parseFloat(lat), lng: parseFloat(lon) });
        toast({ title: 'Location Updated', description: 'Map updated.' });
      }
    } catch (err) {
      toast({ title: 'Geocoding Failed', variant: 'destructive' });
    } finally {
      setIsGeocoding(false);
    }
  };

  async function onSubmit(data: ListingFormValues) {
    if (!user) return;
    try {
      const payload = {
        ...data,
        ownerId: user.id,
        mapLoc: {
          type: 'Point',
          coordinates: [data.location?.lng || 120.9734, data.location?.lat || 15.4865]
        },
        photos: photos,
      };
      if ((payload as any).location) delete (payload as any).location;
      await listingService.update(params.id, payload as any);
      toast({ title: 'Listing Updated!', description: 'Changes saved successfully.' });
      router.push('/owner/dashboard');
    } catch (err) {
      toast({ title: 'Update Failed', variant: 'destructive' });
    }
  }

  if (isLoading) return <div className="p-12 text-center font-bold text-gray-text">Loading Listing...</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-4xl shadow-lg border-gray-border">
        <CardHeader className="border-b pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-headline">Edit Listing</CardTitle>
            <CardDescription className="text-lg">Update property details in the Unified Model.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => router.push('/owner/dashboard')}>Cancel</Button>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-12 py-8">
              
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">1</div>
                  <h3 className="font-bold text-xl">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="listingName" render={({ field }) => (
                    <FormItem><FormLabel>Listing Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="propertyType" render={({ field }) => (
                    <FormItem><FormLabel>Property Type</FormLabel><FormControl><Combobox options={propertyTypeOptions} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fullAddress" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                       <FormLabel>Full Address</FormLabel>
                       <div className="flex gap-2">
                         <Textarea className="flex-1 min-h-[60px]" {...field} />
                         <Button type="button" variant="secondary" onClick={handleGeocodeAddress} disabled={isGeocoding}>{isGeocoding ? '...' : 'Map'}</Button>
                       </div>
                       <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Location</FormLabel>
                    <div className="border rounded-lg overflow-hidden h-[300px]">
                      <LocationPickerMap 
                        initialCenter={[field.value?.lat || 15.4865, field.value?.lng || 120.9734]} 
                        onLocationSelect={(lat, lng, address) => {
                          field.onChange({ lat, lng });
                          if (address) form.setValue('fullAddress', address);
                        }}
                      />
                    </div>
                  </FormItem>
                )} />
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">2</div>
                  <h3 className="font-bold text-xl">Unit Details & Pricing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-primary-green/5 border rounded-lg">
                  <FormField control={form.control} name="roomType" render={({ field }) => (<FormItem><FormLabel>Room Type</FormLabel><Input {...field} /></FormItem>)} />
                  <FormField control={form.control} name="monthlyRent" render={({ field }) => (<FormItem><FormLabel>Monthly Rent (₱)</FormLabel><Input type="number" {...field} /></FormItem>)} />
                  <FormField control={form.control} name="availableRooms" render={({ field }) => (<FormItem><FormLabel>Available Units</FormLabel><Input type="number" {...field} /></FormItem>)} />
                  <FormField control={form.control} name="bedrooms" render={({ field }) => (<FormItem><FormLabel>Bedrooms</FormLabel><Combobox options={['Studio', '1', '2', '3', '4+'].map(v => ({value:v, label:v}))} value={field.value} onChange={field.onChange} /></FormItem>)} />
                  <FormField control={form.control} name="bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><Combobox options={['1', '2', '3+'].map(v => ({value:v, label:v}))} value={field.value} onChange={field.onChange} /></FormItem>)} />
                  <FormField control={form.control} name="squareFeet" render={({ field }) => (<FormItem><FormLabel>Area (sqft)</FormLabel><Input type="number" {...field} /></FormItem>)} />
                  <FormField control={form.control} name="moveInDate" render={({ field }) => (<FormItem><FormLabel>Move-in Date</FormLabel><Input type="date" {...field} /></FormItem>)} />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">3</div>
                  <h3 className="font-bold text-xl">Rules & Amenities</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="font-bold">House Rules</Label>
                    <div className="space-y-2">
                       <FormField control={form.control} name="hasCurfew" render={({ field }) => (<FormItem className="flex items-center gap-2"><Checkbox checked={field.value} onCheckedChange={field.onChange} /><Label>Has Curfew</Label></FormItem>)} />
                       <FormField control={form.control} name="visitorsAllowed" render={({ field }) => (<FormItem className="flex items-center gap-2"><Checkbox checked={field.value} onCheckedChange={field.onChange} /><Label>Visitors Allowed</Label></FormItem>)} />
                       <FormField control={form.control} name="smokingAllowed" render={({ field }) => (<FormItem className="flex items-center gap-2"><Checkbox checked={field.value} onCheckedChange={field.onChange} /><Label>Smoking Allowed</Label></FormItem>)} />
                       <FormField control={form.control} name="cookingAllowed" render={({ field }) => (<FormItem className="flex items-center gap-2"><Checkbox checked={field.value} onCheckedChange={field.onChange} /><Label>Cooking Allowed</Label></FormItem>)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="font-bold">Policies</Label>
                    <FormField control={form.control} name="petPolicy" render={({ field }) => (<FormItem><FormLabel>Pets</FormLabel><Combobox options={['Cat Friendly', 'Dog Friendly', 'Any Pet Friendly', 'Small Dogs Only', 'No Pets'].map(v => ({value:v, label:v}))} value={field.value} onChange={field.onChange} /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="securityDeposit" render={({ field }) => (<FormItem><FormLabel>Deposit (₱)</FormLabel><Input type="number" {...field} /></FormItem>)} />
                      <FormField control={form.control} name="advancePayment" render={({ field }) => (<FormItem><FormLabel>Advance (Mo)</FormLabel><Input type="number" {...field} /></FormItem>)} />
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                   <Label className="font-bold mb-4 block">Amenities</Label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                       {name:'airConditioning', label:'AC'}, {name:'wifi', label:'WiFi'},
                       {name:'washer', label:'Washer'}, {name:'dryer', label:'Dryer'},
                       {name:'utilitiesIncluded', label:'Bills Included'}, {name:'kitchen', label:'Kitchen'},
                       {name:'laundryFacilities', label:'Laundry Facilities'}, {name:'appliancesIncluded', label:'Appliances'}
                     ].map(a => (
                       <FormField key={a.name} control={form.control} name={a.name as any} render={({ field }) => (
                         <FormItem className="flex items-center gap-2 border p-2 rounded"><Checkbox checked={field.value} onCheckedChange={field.onChange} /><Label className="text-xs">{a.label}</Label></FormItem>
                       )} />
                     ))}
                   </div>
                </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">4</div>
                  <h3 className="font-bold text-xl">Media & Tours</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((url, idx) => (
                    <Card key={idx} className="relative aspect-square overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => handleDeletePhoto(idx)}><Trash2 className="h-4 w-4" /></Button>
                    </Card>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-primary-green/30 bg-primary-green/5 rounded-lg cursor-pointer hover:bg-primary-green/10 transition-all">
                    <Upload className="h-8 w-8 text-primary-green mb-1" />
                    <span className="text-[10px] font-bold text-primary-green">Add Photo</span>
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div className="space-y-4 pt-4">
                  <FormField control={form.control} name="video" render={({ field }) => (<FormItem><FormLabel>Video URL</FormLabel><Input {...field} /></FormItem>)} />
                  <FormField control={form.control} name="virtualTour360" render={({ field }) => (
                    <FormItem>
                      <FormLabel>360° Tour URL (Kuula/Matterport/360° Photo)</FormLabel>
                      <div className="flex gap-2">
                        <Input {...field} className="flex-1" />
                        <label className="flex items-center justify-center px-4 py-2 border border-primary-green text-primary-green rounded cursor-pointer hover:bg-primary-green/5 transition-all text-sm font-bold truncate max-w-[150px]">
                          {isMain3DUploading ? "..." : (
                            <>
                              <Upload className="h-4 w-4 mr-2" /> Upload 360°
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={handleMain3DPhotoUpload} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-text mt-1 italic">Note: Upload an equirectangular panorama image to use our built-in 3D viewer.</p>
                    </FormItem>
                  )} />
                </div>
              </section>
            </CardContent>
            <CardFooter className="flex justify-between items-center py-10 border-t bg-gray-50">
               <Button type="button" variant="outline" onClick={() => router.push('/owner/dashboard')}>Cancel</Button>
               <Button type="submit" disabled={isPhotoUploading} className="bg-primary-green hover:bg-primary-green-hover text-white px-12 h-12 font-bold shadow-md">Save Changes</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
