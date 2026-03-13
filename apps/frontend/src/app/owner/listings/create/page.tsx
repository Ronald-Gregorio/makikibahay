'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/index';
import { Progress } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Textarea } from '@/components/ui/index';
import { Checkbox } from '@/components/ui/index';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/index';
import { ArrowRight, ArrowLeft, PlusCircle, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listingService } from '@/services/api/listings';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
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
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  rules: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one rule.",
  }),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const totalSteps = 4;
const rulesOptions = ['No curfew', 'Visitors allowed until 10 PM', 'No smoking', 'No pets', 'Parking available', 'Quiet hours after 10 PM', 'Students only', 'Cooking not allowed'];

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: '',
      address: '',
      rules: [],
      rooms: [{ type: '', price: 0, inclusions: '', is_available: true, model_3d_url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });

  const progress = (step / totalSteps) * 100;

  const nextStep = async () => {
    let fieldsToValidate: (keyof ListingFormValues)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'address'];
    if (step === 2) fieldsToValidate = ['rooms'];
    if (step === 3) fieldsToValidate = ['rules'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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
      const amenities = Array.from(new Set(data.rooms.flatMap(r => r.inclusions.split(',').map(s => s.trim()))));

      const payload = {
        ownerId: user.id, // Ensure ownerId is sent
        name: data.name,
        address: data.address,
        location: {
          type: 'Point',
          coordinates: [data.location?.lng || 120.9734, data.location?.lat || 15.4865] // [lng, lat]
        },
        totalRooms: data.rooms.length,
        availableRooms: availableRooms,
        priceMin: priceMin,
        priceMax: priceMax,
        rules: data.rules,
        amenities: amenities,
        rooms: data.rooms.map(room => ({
          type: room.type,
          size_sqm: 15, // Backend accepts 15 as placeholder
          price: room.price,
          inclusions: room.inclusions.split(',').map(s => s.trim()),
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-2xl">Create a New Listing</CardTitle>
          <CardDescription>Follow the steps to add your property to Makikibahay.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="font-semibold text-lg">Step 1: Basic Information</h3>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sunnydale Apartments" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <div className="flex gap-2 items-start">
                            <Textarea className="flex-1" placeholder="123 Main St, Barangay, Cabanatuan City, Nueva Ecija" {...field} />
                            <Button type="button" variant="secondary" onClick={handleGeocodeAddress} disabled={isGeocoding}>
                              {isGeocoding ? "Searching..." : "Find on Map"}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pin Location on Map</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LocationPickerMap
                              initialCenter={[field.value?.lat || 15.4865, field.value?.lng || 120.9734]}
                              onLocationSelect={(lat, lng, address) => {
                                field.onChange({ lat, lng });
                                if (address) {
                                  form.setValue('address', address);
                                }
                              }}
                            />
                            <p className="text-xs text-muted-foreground mt-2">Drag the marker or click on the map to set the exact location of your property.</p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="font-semibold text-lg">Step 2: Room Details</h3>
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Solo Room" {...field} />
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
                              <FormLabel>Price (Monthly)</FormLabel>
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
                              <FormLabel>Inclusions</FormLabel>
                              <FormControl>
                                <Input placeholder="Bed, Fan, Wi-Fi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.is_available`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Mark as Available
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => append({ type: '', price: 0, inclusions: '', is_available: true, model_3d_url: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Room
                  </Button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="font-semibold text-lg">Step 3: House Rules</h3>
                  <FormField
                    control={form.control}
                    name="rules"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {rulesOptions.map((item) => (
                            <FormField
                              key={item}
                              control={form.control}
                              name="rules"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
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
                </div>
              )}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="font-semibold text-lg">Step 4: Upload Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photoUrl, idx) => (
                      <Card key={idx} className="group relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={photoUrl}
                          alt="Listing photo"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePhoto(idx)}>
                            <Trash2 className="h-5 w-5 text-white" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <div className="relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Drag and drop or click to upload"
                      />
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">{isPhotoUploading ? "Processing..." : "Upload Photo"}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Listing
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
