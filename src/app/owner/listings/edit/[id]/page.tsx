'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Upload, EyeOff, Eye, Cuboid } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listings } from '@/lib/mock-data';
import Image from 'next/image';
import type { ListingPhoto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
  rules: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one rule.",
  }),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const rulesOptions = ['No curfew', 'Visitors allowed until 10 PM', 'No smoking', 'No pets', 'Parking available', 'Quiet hours after 10 PM', 'Students only', 'Cooking not allowed'];

function EditListingContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const listingId = parseInt(params.id as string, 10);
  const existingListing = listings.find(l => l.id === listingId);

  // State to manage photos
  const [photos, setPhotos] = useState<ListingPhoto[]>(existingListing?.photos || []);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: '',
      address: '',
      rules: [],
      rooms: [],
    },
  });

  useEffect(() => {
    if (existingListing) {
      form.reset({
        name: existingListing.name,
        address: existingListing.address,
        rules: existingListing.rules,
        rooms: existingListing.rooms.map(r => ({
          type: r.type,
          price: r.price,
          inclusions: r.inclusions.join(', '),
          is_available: r.is_available,
          model_3d_url: r.model_3d_url,
        })),
      });
      setPhotos(existingListing.photos);
    }
  }, [existingListing, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rooms',
  });
  
  if (!existingListing) {
    notFound();
  }
  
  // Allow edit if user is an admin OR the owner of the listing.
  if (user && user.role !== 'admin' && existingListing.owner_id !== parseInt(user.id, 10)) {
     return (
       <div className="container mx-auto px-4 md:px-6 py-12 text-center">
         <h1 className="text-2xl font-bold">Unauthorized</h1>
         <p className="text-muted-foreground">You are not authorized to edit this listing.</p>
       </div>
     )
  }

  function onSubmit(data: ListingFormValues) {
    // In a real app, this would be an API call to update the listing
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if (listingIndex !== -1) {
        const updatedListing = {
            ...listings[listingIndex],
            name: data.name,
            address: data.address,
            rules: data.rules,
            photos: photos, // Use the state for photos
            total_rooms: data.rooms.length,
            available_rooms: data.rooms.filter(r => r.is_available).length,
            price_min: Math.min(...data.rooms.map(r => r.price)),
            price_max: Math.max(...data.rooms.map(r => r.price)),
            updated_at: new Date().toISOString(),
            rooms: data.rooms.map((room) => ({
                // Keep existing room IDs if possible, or generate new ones
                ...listings[listingIndex].rooms.find(r => r.type === room.type)!,
                type: room.type,
                price: room.price,
                inclusions: room.inclusions.split(',').map(s => s.trim()),
                is_available: room.is_available,
                model_3d_url: room.model_3d_url,
            })),
        };
        listings[listingIndex] = updatedListing;
    }

    toast({
      title: 'Listing Updated!',
      description: `${data.name} has been successfully updated.`,
    });
    router.push(user?.role === 'admin' ? '/admin/listings' : '/owner/dashboard');
  }

  const handleDeletePhoto = (photoId: number) => {
      setPhotos(photos.filter(p => p.photo_id !== photoId));
      toast({ title: 'Photo removed', description: 'The photo will be deleted upon saving.' });
  }

  const toggleHidePhoto = (photoId: number) => {
      setPhotos(photos.map(p => p.photo_id === photoId ? { ...p, is_hidden: !p.is_hidden } : p));
      const photo = photos.find(p => p.photo_id === photoId);
      toast({ title: photo?.is_hidden ? 'Photo un-hidden' : 'Photo hidden', description: `The photo's visibility will be updated upon saving.` });
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Edit Listing</CardTitle>
          <CardDescription>Update the details for your property.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Room Details */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Room Details</h3>
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name={`rooms.${index}.type`} render={({ field }) => (<FormItem><FormLabel>Room Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`rooms.${index}.price`} render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`rooms.${index}.inclusions`} render={({ field }) => (<FormItem><FormLabel>Inclusions</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <Separator className="my-4" />
                     <div>
                        <h4 className="font-medium text-sm mb-2">3D Model</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                             <FormField
                                control={form.control}
                                name={`rooms.${index}.model_3d_url`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Model URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter URL for the .glb or .gltf file" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="aspect-square bg-secondary rounded-lg flex flex-col items-center justify-center text-center p-4">
                                <Cuboid className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">3D Model Preview</p>
                                <p className="text-xs text-muted-foreground/80">A preview of the 3D model will appear here.</p>
                            </div>
                        </div>
                     </div>
                    <div className="flex items-center justify-between mt-4">
                      <FormField control={form.control} name={`rooms.${index}.is_available`} render={({ field }) => (<FormItem className="flex items-center space-x-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Mark as Available</FormLabel></FormItem>)} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ type: '', price: 0, inclusions: '', is_available: true, model_3d_url: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Another Room</Button>
              </div>

              {/* House Rules */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">House Rules</h3>
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
                                render={({ field }) => (
                                    <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item)}
                                                onCheckedChange={(checked) => (checked ? field.onChange([...field.value, item]) : field.onChange(field.value?.filter((value) => value !== item)))}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item}</FormLabel>
                                    </FormItem>
                                )}
                                />
                            ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

               {/* Photos */}
               <div className="space-y-6">
                <h3 className="font-semibold text-lg">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map(photo => (
                    <Card key={photo.photo_id} className="group relative aspect-square overflow-hidden">
                      <Image 
                        src={photo.url}
                        alt="Listing photo"
                        fill
                        className={cn("object-cover transition-transform group-hover:scale-105", photo.is_hidden && "opacity-50")}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="ghost" size="icon" onClick={() => toggleHidePhoto(photo.photo_id)}>
                            {photo.is_hidden ? <Eye className="h-5 w-5 text-white"/> : <EyeOff className="h-5 w-5 text-white"/>}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeletePhoto(photo.photo_id)}>
                            <Trash2 className="h-5 w-5 text-white"/>
                          </Button>
                      </div>
                       {photo.is_hidden && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <EyeOff className="h-8 w-8 text-white" />
                            </div>
                        )}
                    </Card>
                  ))}
                   <button type="button" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg text-center hover:bg-muted/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Upload Photo</span>
                  </button>
                </div>
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditListingContent />
    </Suspense>
  )
}
