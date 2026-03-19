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
import { PlusCircle, Trash2, Upload, Box } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listingService } from '@/services/api/listings';
import { walkthroughService, type WalkthroughConfig } from '@/services/api/walkthroughs';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
});

const WalkthroughBuilder = dynamic(() => import('@/components/WalkthroughBuilder'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg" />
});

const roomSchema = z.object({
  type: z.string().min(1, 'Room type is required'),
  price: z.coerce.number().min(1, 'Price is required'),
  inclusions: z.string().min(1, 'Inclusions are required'),
  is_available: z.boolean().default(true),
  model_3d_url: z.string().optional(),
});

const listingFormSchema = z.object({
  name: z.string().min(3, 'Listing name must be at least 3 characters.'),
  address: z.string().min(10, 'Please enter a full address.'),
  type: z.string().min(1, 'Property type is required'),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  rules: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one rule.",
  }),
  amenities: z.array(z.string()).optional(),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

// These will be fetched dynamically from the settings API
const defaultRulesOptions = ['No curfew', 'Visitors allowed until 10 PM', 'No smoking', 'No pets', 'Parking available', 'Quiet hours after 10 PM', 'Students only', 'Cooking not allowed'];

const defaultPropertyTypeOptions = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Condo', label: 'Condo' },
  { value: 'Studio Type', label: 'Studio Type' },
  { value: 'Bed Spacer', label: 'Bed Spacer' },
  { value: 'Boarding House', label: 'Boarding House' },
  { value: 'Up and Down', label: 'Up and Down' },
];

const defaultAmenityOptions = [
  { value: 'Air Conditioning', label: 'Air Conditioning' },
  { value: 'WiFi', label: 'WiFi' },
  { value: 'Washer', label: 'Washer' },
  { value: 'Dryer', label: 'Dryer' },
  { value: 'Utilities Included', label: 'Utilities Included' },
  { value: 'Parking', label: 'Parking' },
  { value: 'Garage', label: 'Garage' },
  { value: 'Laundry Facilities', label: 'Laundry Facilities' },
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Appliances Included', label: 'Appliances Included' },
];

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<{value: string, label: string}[]>(defaultPropertyTypeOptions);
  const [amenityOptions, setAmenityOptions] = useState<{value: string, label: string}[]>(defaultAmenityOptions);
  const [rulesOptions, setRulesOptions] = useState<string[]>(defaultRulesOptions);
  const [existingWalkthrough, setExistingWalkthrough] = useState<WalkthroughConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'tour'>('details');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const settings = await api.get<any>('/settings');
        if (settings.propertyTypes) {
          setPropertyTypeOptions(settings.propertyTypes.map((t: string) => ({ value: t, label: t })));
        }
        if (settings.amenities) {
          setAmenityOptions(settings.amenities.map((a: string) => ({ value: a, label: a })));
        }
        if (settings.houseRules) {
          setRulesOptions(settings.houseRules);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic options:', err);
      }
    };
    fetchOptions();
  }, []);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: '',
      address: '',
      type: '',
      rules: [],
      amenities: [],
      rooms: [{ type: '', price: 0, inclusions: '', is_available: true, model_3d_url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listing = await listingService.getById(params.id);
        if (listing) {
          const defaultRooms = listing.rooms?.length ? listing.rooms.map((r: any) => ({
              type: r.type,
              price: r.price,
              inclusions: Array.isArray(r.inclusions) ? r.inclusions.join(', ') : r.inclusions || '',
              is_available: r.is_available ?? true,
              model_3d_url: r.model_3d_url || ''
          })) : [{ type: 'Solo Room', price: 0, inclusions: '', is_available: true, model_3d_url: '' }];

          form.reset({
            name: listing.name || '',
            address: listing.address || '',
            location: {
              lat: listing.lat || 15.4865,
              lng: listing.lng || 120.9734
            },
            type: (listing as any).type || 'Entire Property',
            rules: Array.isArray(listing.rules) ? listing.rules : [],
            amenities: listing.amenities || [],
            rooms: defaultRooms
          });
          if (listing.photos) setPhotos(listing.photos.map((p: any) => p.url));
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load listing details', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWalkthrough = async () => {
      const wt = await walkthroughService.getWalkthrough(params.id);
      setExistingWalkthrough(wt);
    };

    if (params.id) {
      fetchListing();
      fetchWalkthrough();
    }
  }, [params.id, form, toast]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsPhotoUploading(true);
      const files = Array.from(e.target.files);

      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);

          // Use the new postForm method in our api client
          const response = await api.postForm<{ url: string }>('/upload', formData);
          return response.url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        setPhotos(prev => [...prev, ...uploadedUrls]);
        toast({ title: 'Upload Successful', description: `${files.length} photo(s) uploaded.` });
      } catch (err: any) {
        console.error('Upload Error:', err);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: err.message || 'Could not upload images to server.'
        });
      } finally {
        setIsPhotoUploading(false);
      }
    }
  };

  const handleDeletePhoto = (indexToRemove: number) => {
    setPhotos(photos.filter((_, i) => i !== indexToRemove));
  }

  const handleGeocodeAddress = async () => {
    const address = form.getValues('address');
    if (!address) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        form.setValue('location', { lat: parseFloat(lat), lng: parseFloat(lon) });
        toast({ title: 'Location Found', description: 'Map has been updated based on the address.' });
      } else {
        toast({ variant: 'destructive', title: 'Location Not Found', description: 'Could not find the address on the map. Try to be more specific.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Geocoding Failed', description: 'An error occurred while finding the address.' });
    } finally {
      setIsGeocoding(false);
    }
  };

  async function onSubmit(data: ListingFormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a listing.' });
      return;
    }

    try {
      const priceMin = Math.min(...data.rooms.map(r => r.price));
      const priceMax = Math.max(...data.rooms.map(r => r.price));
      const availableRooms = data.rooms.filter(r => r.is_available).length;
      
      // Combine property-wide amenities and room-specific inclusions securely
      const roomInclusions = data.rooms.flatMap(r => (typeof r.inclusions === 'string' && r.inclusions.trim().length > 0) ? r.inclusions.split(',').map(s => s.trim()) : []);
      const allAmenities = Array.from(new Set([...(data.amenities || []), ...roomInclusions]));

      const payload = {
        ownerId: user.id,
        name: data.name,
        address: data.address,
        type: data.type,
        location: {
          type: 'Point',
          coordinates: [data.location?.lng || 120.9734, data.location?.lat || 15.4865]
        },
        totalRooms: data.rooms.length,
        availableRooms: availableRooms,
        priceMin: priceMin,
        priceMax: priceMax,
        rules: data.rules,
        amenities: allAmenities,
        rooms: data.rooms.map(room => ({
          type: room.type,
          size_sqm: 15,
          price: room.price,
          inclusions: (typeof room.inclusions === 'string' && room.inclusions.trim().length > 0) ? room.inclusions.split(',').map(s => s.trim()) : [],
          is_available: room.is_available,
          model_3d_url: room.model_3d_url,
        })) as any,
        photos: photos as any,
      };

      await listingService.create(payload);

      toast({
        title: 'Listing Created!',
        description: `${data.name} has been successfully added to your properties.`,
      });
      router.push('/owner/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Failed to create listing via API.',
      });
    }
  }

  if (isLoading) return <div className="p-8 text-center text-gray-text font-semibold">Loading listing details...</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-4xl shadow-lg border-gray-border">
        <CardHeader className="border-b border-gray-border pb-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-3xl text-text-dark">Edit Listing</CardTitle>
              <CardDescription className="text-gray-text mt-1 text-lg">Update the details for your property.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push('/owner/listings')}>
              Cancel
            </Button>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-5 border border-gray-border rounded-lg p-1 bg-gray-50 self-start">
            {(['details', 'photos', 'tour'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white shadow text-primary-green'
                    : 'text-gray-text hover:text-text-dark'
                }`}
              >
                {tab === 'tour' ? '3D Virtual Tour' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-12 py-8">
              {/* Tab: Details */}
              <div className={activeTab !== 'details' ? 'hidden' : ''}>
              
              {/* Section 1: Basic Information */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-border">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">1</div>
                  <h3 className="font-bold text-xl text-text-dark">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-dark font-semibold">Listing Name</FormLabel>
                        <FormControl>
                          <Input className="focus:border-primary-green focus:ring-primary-green/20" placeholder="e.g., Sunnydale Apartments" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-dark font-semibold">Property Type</FormLabel>
                        <FormControl>
                          <Combobox 
                            options={propertyTypeOptions} 
                            value={field.value} 
                            onChange={field.onChange}
                            placeholder="Select property type..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-text-dark font-semibold">Full Address</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-start">
                            <Textarea className="flex-1 focus:border-primary-green focus:ring-primary-green/20 min-h-[100px]" placeholder="123 Main St, Barangay, Cabanatuan City, Nueva Ecija" {...field} />
                            <Button type="button" variant="secondary" onClick={handleGeocodeAddress} disabled={isGeocoding} className="h-auto py-3">
                              {isGeocoding ? "Searching..." : "Find on Map"}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-dark font-semibold">Map Location</FormLabel>
                      <FormControl>
                        <div className="relative border border-gray-border rounded-lg overflow-hidden">
                          <LocationPickerMap
                            initialCenter={[field.value?.lat || 15.4865, field.value?.lng || 120.9734]}
                            onLocationSelect={(lat, lng, address) => {
                              field.onChange({ lat, lng });
                              if (address) {
                                form.setValue('address', address);
                              }
                            }}
                          />
                          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-md shadow-md border border-gray-border z-[1000]">
                            <p className="text-xs text-gray-text flex items-center gap-2 italic">
                              <span className="h-2 w-2 rounded-full bg-primary-green animate-pulse" />
                              Drag the marker or click on the map to set the exact location.
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Section 2: Room Details */}
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-border">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">2</div>
                    <h3 className="font-bold text-xl text-text-dark">Room Details</h3>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ type: '', price: 0, inclusions: '', is_available: true, model_3d_url: '' })} className="hover:border-primary-green hover:text-primary-green">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Room Type
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="relative p-6 border-gray-border hover:border-gray-300 transition-colors shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-text">Room Type</FormLabel>
                              <FormControl>
                                <Combobox 
                                  options={[
                                    { value: 'Solo Room', label: 'Solo Room' },
                                    { value: 'Bedspacer', label: 'Bedspacer' },
                                    { value: 'Studio Unit', label: 'Studio Unit' },
                                    { value: 'Entire Apartment', label: 'Entire Apartment' },
                                    { value: 'Family Room', label: 'Family Room' },
                                  ]}
                                  value={field.value} 
                                  onChange={field.onChange}
                                  placeholder="Select room type..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-text">Monthly Price (₱)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g., 3500" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.inclusions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-text">Inclusions (Tagging)</FormLabel>
                              <FormControl>
                                <Input placeholder="Bed, Fan, Wi-Fi" {...field} />
                              </FormControl>
                              <p className="text-[10px] text-muted-foreground mt-1 text-gray-text">Separate with commas</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-light">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.is_available`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary-green data-[state=checked]:border-primary-green" />
                              </FormControl>
                              <FormLabel className="font-semibold text-text-dark cursor-pointer">
                                Mark as Available
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-alert hover:bg-red-alert/10">
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Section 3: House Rules & Amenities */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-border">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">3</div>
                  <h3 className="font-bold text-xl text-text-dark">House Rules & Amenities</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="rules"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base font-bold text-text-dark">House Rules</FormLabel>
                          <p className="text-sm text-gray-text">Select all that apply to your property.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {rulesOptions.map((item) => (
                            <FormField
                              key={item}
                              control={form.control}
                              name="rules"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item}
                                    className="flex flex-row items-center space-x-3 space-y-0 p-3 border border-gray-border rounded-lg hover:bg-gray-light/30 transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item
                                                )
                                              )
                                        }}
                                        className="h-5 w-5 border-gray-border data-[state=checked]:bg-primary-green data-[state=checked]:border-primary-green"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                                      {item}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base font-bold text-text-dark">Property Amenities</FormLabel>
                          <p className="text-sm text-gray-text">What facilities do you offer?</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {amenityOptions.map((item) => (
                            <FormField
                              key={item.value}
                              control={form.control}
                              name="amenities"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.value}
                                    className="flex flex-row items-center space-x-3 space-y-0 p-3 border border-gray-border rounded-lg hover:bg-gray-light/30 transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), item.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.value
                                                )
                                              )
                                        }}
                                        className="h-5 w-5 border-gray-border data-[state=checked]:bg-primary-green data-[state=checked]:border-primary-green"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
              {/* Section 4: Photos */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-border">
                  <div className="h-8 w-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">4</div>
                  <h3 className="font-bold text-xl text-text-dark">Upload Photos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                  {photos.map((photoUrl, idx) => (
                    <Card key={idx} className="group relative aspect-square overflow-hidden bg-muted border-gray-border shadow-sm ring-primary-green/20 hover:ring-2 transition-all">
                      <img src={photoUrl} alt="Listing photo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleDeletePhoto(idx)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <div className="relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-primary-green/30 bg-primary-green/5 rounded-lg text-center hover:bg-primary-green/10 hover:border-primary-green/50 transition-all cursor-pointer overflow-hidden group">
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      <Upload className="h-10 w-10 text-primary-green mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-primary-green uppercase tracking-tighter">{isPhotoUploading ? 'Uploading...' : 'Add Photo'}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>{/* end details tab */}

            {/* Tab: Photos (standalone) – already shown inside details, this tab shows nothing extra */}

            {/* Tab: 3D Virtual Tour */}
            <div className={activeTab !== 'tour' ? 'hidden' : ''}>
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-border">
                  <Box className="h-5 w-5 text-primary-green" />
                  <h3 className="font-bold text-xl text-text-dark">3D Virtual Tour Builder</h3>
                </div>
                <p className="text-sm text-gray-text">
                  Upload 360° equirectangular images, navigate between scenes, link them with hotspots, then save your tour. It will be visible to tenants on the listing page.
                </p>
                <WalkthroughBuilder
                  listingId={params.id}
                  initialConfig={existingWalkthrough}
                  onSaved={wt => setExistingWalkthrough(wt)}
                />
              </section>
            </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center py-10 border-t border-gray-border bg-gray-light/10">
              <p className="text-sm text-gray-text italic">
                All fields are required unless otherwise noted.
              </p>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/owner/dashboard')} className="px-8 h-12">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPhotoUploading || isLoading} className="bg-primary-green hover:bg-primary-green-hover text-white px-10 h-12 font-bold text-lg shadow-md hover:shadow-lg transition-all">
                  Save Changes
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
