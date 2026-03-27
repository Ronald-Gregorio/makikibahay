'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Button,
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Input,
  Textarea,
  Checkbox,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Combobox,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/index';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listingService } from '@/services/api/listings';
import api from '@/lib/api';

const roomSchema = z.object({
  _id: z.string().optional(),
  type: z.string().min(1, 'Room type is required'),
  price: z.coerce.number().min(1, 'Price is required'),
  inclusions: z.string().min(1, 'Inclusions are required'),
  is_available: z.boolean().default(true),
});

const listingFormSchema = z.object({
  name: z.string().min(3, 'Listing name must be at least 3 characters.'),
  address: z.string().min(10, 'Please enter a full address.'),
  type: z.string().min(1, 'Property type is required'),
  status: z.enum(['Active', 'Unpublished', 'Pending']),
  rules: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  rooms: z.array(roomSchema).min(1, 'Please add at least one room type.'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

export default function AdminEditListingPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [propertyTypeOptions] = useState([
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
      name: '',
      address: '',
      type: '',
      status: 'Pending',
      rules: [],
      amenities: [],
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
        const data = await api.get<any>(`/admin/listings/${id}`);
        form.reset({
          name: data.name,
          address: data.address,
          type: data.type,
          status: data.status || 'Pending',
          rules: data.rules || [],
          amenities: data.amenities || [],
          rooms: data.rooms?.map((r: any) => ({
            _id: r._id,
            type: r.type,
            price: r.price,
            inclusions: Array.isArray(r.inclusions) ? r.inclusions.join(', ') : r.inclusions,
            is_available: r.isAvailable ?? true
          })) || []
        });
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load listing details.' });
        router.push('/admin/listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, form, router, toast]);

  const onSubmit = async (values: ListingFormValues) => {
    try {
      await api.put(`/admin/listings/${id}`, {
        ...values,
        // Calculate min/max for the backend
        priceMin: Math.min(...values.rooms.map(r => r.price)),
        priceMax: Math.max(...values.rooms.map(r => r.price)),
        totalRooms: values.rooms.length,
        availableRooms: values.rooms.filter(r => r.is_available).length,
      });
      toast({ title: 'Success', description: 'Listing updated successfully.' });
      router.push('/admin/listings');
    } catch (err) {
      console.error('Failed to update listing:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update listing.' });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading listing data...</div>;

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Listing</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>Update general information about the property.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <FormControl>
                        <Combobox 
                          options={propertyTypeOptions} 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="max-w-[200px]">
                    <FormLabel>Listing Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Unpublished">Unpublished</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters & Attributes</CardTitle>
              <CardDescription>Update amenities and rules to match search filters.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="rules"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Rules & Specialties</FormLabel>
                    <div className="grid grid-cols-1 gap-2 border p-4 rounded-lg bg-slate-50">
                      {[
                        'Student Only', 'Worker Only', 'Income Restricted', 'Short-Term',
                        'Cat Friendly', 'Dog Friendly', 'Any Pet Friendly', 'Small Dogs Only',
                        'No curfew', 'Visitors allowed until 10 PM', 'No smoking', 'No pets', 'Parking available', 'Quiet hours after 10 PM', 'Cooking not allowed'
                      ].map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="rules"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">{item}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Amenities & Features</FormLabel>
                    <div className="grid grid-cols-1 gap-2 border p-4 rounded-lg bg-slate-50">
                      {[
                        'Air Conditioning', 'WiFi', 'Washer', 'Dryer', 'Utilities Included', 'Dishwasher', 'Parking', 'Garage', 'Laundry Facilities', 'Kitchen', 'Appliances Included',
                        'Near School', 'Near University', 'Near Workplace', 'Near Karenderia', 'Near Restaurants', 'Near Laundry Shop', 'Near Hospital', 'Near Cafe'
                      ].map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">{item}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Room Management</CardTitle>
                <CardDescription>Edit existing rooms or add new ones.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ type: '', price: 0, inclusions: '', is_available: true })}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Room
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Input {...field} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <Input type="number" {...field} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.inclusions`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inclusions</FormLabel>
                          <Input {...field} placeholder="Separate with commas" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.is_available`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="cursor-pointer">Available for rent</FormLabel>
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/listings')}>Cancel</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
