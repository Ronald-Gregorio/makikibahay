'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ArrowLeft, PlusCircle, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { listings } from '@/lib/mock-data';

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

const totalSteps = 4;
const rulesOptions = ['No curfew', 'Visitors allowed until 10 PM', 'No smoking', 'No pets', 'Parking available', 'Quiet hours after 10 PM', 'Students only', 'Cooking not allowed'];

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

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

  function onSubmit(data: ListingFormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a listing.' });
      return;
    }

    const newListing = {
      id: listings.length + 1,
      owner_id: parseInt(user.id, 10),
      owner_name: user.name,
      owner_phone: '09123456789', // Placeholder
      name: data.name,
      address: data.address,
      lat: 15.48, // Placeholder
      lng: 120.96, // Placeholder
      total_rooms: data.rooms.length,
      available_rooms: data.rooms.filter(r => r.is_available).length,
      rules: data.rules,
      price_min: Math.min(...data.rooms.map(r => r.price)),
      price_max: Math.max(...data.rooms.map(r => r.price)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos: [{ photo_id: Math.random(), listing_id: listings.length + 1, url: 'https://placehold.co/600x400.png', is_cover: true }],
      rooms: data.rooms.map((room, index) => ({
        room_id: Math.random(),
        listing_id: listings.length + 1,
        type: room.type,
        size_sqm: 15, // Placeholder
        price: room.price,
        inclusions: room.inclusions.split(',').map(s => s.trim()),
        is_available: room.is_available,
        model_3d_url: room.model_3d_url,
      })),
      reviews: [],
    };

    listings.push(newListing);

    toast({
      title: 'Listing Created!',
      description: `${data.name} has been successfully added to your properties.`,
    });
    router.push('/owner/dashboard');
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
                          <Textarea placeholder="123 Main St, Barangay, Cabanatuan City, Nueva Ecija" {...field} />
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
                  <div className="p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Drag and drop photos here, or click to browse.</p>
                    <Button type="button" variant="outline" className="mt-4">Browse Files</Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
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
