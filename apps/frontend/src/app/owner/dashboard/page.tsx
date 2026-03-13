'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Building, Key, DollarSign, MessageSquare, Wrench, FileText, BarChart2, Camera, Video, Vr, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService } from '@/services/api/dashboard';
import { listingService } from '@/services/api/listings';
import type { Listing } from '@/lib/types';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/index';

const CONFIG_TABS = ['Property Profiles', 'Location & Mapping', 'Unit Taxonomy', 'Pricing & Availability', 'Media Assets'];

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConfigTab, setActiveConfigTab] = useState('Property Profiles');

    useEffect(() => {
        if (!user || user.role !== 'owner') { router.push('/login'); return; }
        dashboardService.getOwnerListings()
            .then(data => setMyListings(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user, router]);

    if (!user || user.role !== 'owner' || loading) {
        return <div className="flex items-center justify-center h-64 text-gray-text">Loading dashboard…</div>;
    }

    const totalRooms = myListings.reduce((a: number, l: any) => a + (l.totalRooms || 0), 0);
    const availableRooms = myListings.reduce((a: number, l: any) => a + (l.availableRooms || 0), 0);
    const vacancyRate = totalRooms > 0 ? ((availableRooms / totalRooms) * 100).toFixed(1) : '0.0';

    const handleDelete = async (id: string | number) => {
        try {
            await listingService.delete(id);
            setMyListings(prev => prev.filter((l: any) => (l._id || l.id) !== id));
            toast({ title: 'Listing deleted.' });
        } catch {
            toast({ variant: 'destructive', title: 'Failed to delete listing.' });
        }
    };

    return (
        <div className="bg-gray-light min-h-screen">

            {/* ── Dashboard Header ── */}
            <div className="bg-white border-b border-gray-border px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-bold text-text-dark">Welcome back, {user.name}!</h1>
                        <p className="text-gray-text text-sm mt-0.5">Here's what's happening with your properties today.</p>
                    </div>
                    <Link
                        href="/owner/listings/create"
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-green hover:bg-primary-green-hover text-white font-semibold rounded transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" /> Add Property
                    </Link>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

                {/* ── Portfolio Overview Metrics ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <MetricCard
                        icon={<Building className="h-6 w-6" />}
                        iconColor="bg-blue-50 text-blue-primary"
                        label="Active Listings"
                        value={myListings.length.toString()}
                        trend="+2 this month"
                        trendPositive
                    />
                    <MetricCard
                        icon={<Key className="h-6 w-6" />}
                        iconColor="bg-orange-50 text-orange-primary"
                        label="Vacancy Rate"
                        value={`${vacancyRate}%`}
                        trend={`${availableRooms} rooms available`}
                        trendPositive={false}
                    />
                    <MetricCard
                        icon={<DollarSign className="h-6 w-6" />}
                        iconColor="bg-green-50 text-primary-green"
                        label="Rooms Occupied"
                        value={`${totalRooms - availableRooms}`}
                        trend={`${totalRooms > 0 ? (((totalRooms - availableRooms) / totalRooms) * 100).toFixed(0) : 0}% occupancy`}
                        trendPositive
                    />
                    <MetricCard
                        icon={<MessageSquare className="h-6 w-6" />}
                        iconColor="bg-purple-50 text-purple-600"
                        label="Inquiries"
                        value="5"
                        trend="this month"
                        trendPositive
                    />
                </div>

                {/* ── Action Items + Market Snapshot ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Action Items */}
                    <div className="lg:col-span-2 bg-white border border-gray-border rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-text-dark">Action Items</h2>
                            <Link href="/inbox" className="text-sm text-primary-green hover:underline font-medium">View All</Link>
                        </div>
                        <div className="space-y-3">
                            <TaskItem
                                icon={<Wrench className="h-5 w-5" />}
                                title="Open Maintenance Requests"
                                desc="Emergency Water Leak - Unit 4B"
                                urgent
                            />
                            <TaskItem
                                icon={<FileText className="h-5 w-5" />}
                                title="Pending Applications"
                                desc="3 new applications awaiting review"
                            />
                            <TaskItem
                                icon={<MessageSquare className="h-5 w-5" />}
                                title="Unread Messages"
                                desc="5 new inquiries from potential tenants"
                            />
                            <TaskItem
                                icon={<BarChart2 className="h-5 w-5" />}
                                title="Feedbacks"
                                desc="2 new resident reviews submitted"
                            />
                        </div>
                    </div>

                    {/* Market Snapshot */}
                    <div className="bg-white border border-gray-border rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-text-dark">Market Snapshot</h2>
                        </div>
                        <p className="text-xs text-gray-text mb-4">Rent Comparable Report — Cabanatuan City</p>

                        {[
                            { label: 'Avg. Studio Market Rent', market: '₱3,500', yours: '₱3,800', positive: true },
                            { label: 'Avg. 1 Bed Market Rent', market: '₱5,000', yours: '₱4,800', positive: false },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between pb-4 mb-4 border-b border-gray-border last:border-0 last:mb-0 last:pb-0">
                                <div>
                                    <span className="text-xs text-gray-text block">{row.label}</span>
                                    <span className="text-lg font-bold text-text-dark">{row.market}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-text block">Your Avg.</span>
                                    <span className={`text-lg font-bold ${row.positive ? 'text-primary-green' : 'text-orange-primary'}`}>{row.yours}</span>
                                </div>
                            </div>
                        ))}

                        {/* Bar chart */}
                        <div className="flex items-end justify-between h-24 border-b border-gray-border pb-2 mb-2 mt-4 gap-1.5">
                            {[60, 75, 65, 85, 90, 100].map((h, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t transition-colors ${i === 5 ? 'bg-primary-green' : 'bg-gray-border hover:bg-primary-green'}`}
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-text text-center">6-Month Neighborhood Rent Trend</p>
                    </div>
                </div>

                {/* ── My Listings Table ── */}
                <div className="bg-white border border-gray-border rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between p-6 border-b border-gray-border">
                        <h2 className="text-lg font-bold text-text-dark">My Listings</h2>
                        <Link href="/owner/listings/create" className="text-sm text-primary-green hover:underline font-medium flex items-center gap-1">
                            <PlusCircle className="h-4 w-4" /> Add New
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-light text-gray-text text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3">Listing</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Rooms</th>
                                    <th className="px-6 py-3">Price Range</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myListings.map((listing: any) => {
                                    const lId = listing._id || listing.id;
                                    const photo = listing.photos?.[0] || 'https://placehold.co/64x64.png';
                                    return (
                                        <tr key={lId} className="border-t border-gray-border hover:bg-gray-light/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden">
                                                        <Image src={photo} alt={listing.name} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <Link href={`/listings/${lId}`} className="font-semibold text-text-dark hover:text-primary-green hover:underline">
                                                            {listing.name}
                                                        </Link>
                                                        <p className="text-xs text-gray-text mt-0.5">{listing.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-primary-green rounded-full">Active</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-text">
                                                {listing.availableRooms ?? 0} / {listing.totalRooms ?? 0}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-dark">
                                                ₱{(listing.priceMin || 0).toLocaleString()} – ₱{(listing.priceMax || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/owner/listings/edit/${lId}`} className="p-1.5 text-gray-text hover:text-primary-green transition-colors">
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="p-1.5 text-gray-text hover:text-red-alert transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(lId)} className="bg-red-alert hover:bg-red-600 text-white">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {myListings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-text">
                                            No listings yet. <Link href="/owner/listings/create" className="text-primary-green hover:underline">Create your first listing →</Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Property & Unit Configuration ── */}
                <div className="bg-white border border-gray-border rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                    <div className="p-6 border-b border-gray-border">
                        <h2 className="text-lg font-bold text-text-dark">Property & Unit Configuration</h2>
                    </div>

                    {/* Config Tabs */}
                    <div className="flex gap-0 border-b border-gray-border overflow-x-auto">
                        {CONFIG_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveConfigTab(tab)}
                                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap relative transition-colors ${activeConfigTab === tab
                                        ? 'text-primary-green'
                                        : 'text-gray-text hover:text-text-dark'
                                    }`}
                            >
                                {tab}
                                {activeConfigTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-green" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeConfigTab === 'Property Profiles' && (
                            <div className="max-w-2xl space-y-4">
                                <h3 className="font-semibold text-text-dark mb-4">Building Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Property Name" defaultValue={myListings[0]?.name || ''} />
                                    <FormField label="Property Type" type="select" options={['Boarding House', 'Apartment', 'Condo', 'Studio']} />
                                    <FormField label="Year Built" type="number" defaultValue="2020" />
                                    <FormField label="Total Units" type="number" defaultValue={String(myListings[0] ? (myListings[0] as any).totalRooms || 0 : 0)} />
                                </div>
                                <button className="px-5 py-2.5 bg-primary-green text-white rounded font-medium hover:bg-primary-green-hover transition-colors">
                                    Save Profile Details
                                </button>
                            </div>
                        )}

                        {activeConfigTab === 'Location & Mapping' && (
                            <div className="max-w-2xl space-y-4">
                                <h3 className="font-semibold text-text-dark mb-4">Location & Mapping</h3>
                                <FormField label="Address" defaultValue={myListings[0]?.address || ''} />
                                <div className="h-40 bg-gray-light rounded-lg flex items-center justify-center text-gray-text border border-gray-border">
                                    Map Preview
                                </div>
                                <button className="px-5 py-2.5 border border-gray-border text-text-dark rounded font-medium hover:bg-gray-light transition-colors">
                                    Update Geographic Configuration
                                </button>
                            </div>
                        )}

                        {activeConfigTab === 'Unit Taxonomy' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-text-dark">Floor Plans & Room Types</h3>
                                    <div className="flex gap-2">
                                        <button className="text-sm px-3 py-1.5 border border-gray-border rounded hover:bg-gray-light transition-colors">+ Add Boarding Room</button>
                                        <button className="text-sm px-3 py-1.5 border border-gray-border rounded hover:bg-gray-light transition-colors">+ Add Floor Plan</button>
                                    </div>
                                </div>
                                <div className="border border-gray-border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-light text-gray-text text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Room Type</th>
                                                <th className="px-4 py-3 text-left">Beds/Baths</th>
                                                <th className="px-4 py-3 text-left">Price</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(myListings[0] as any)?.rooms?.map((r: any, i: number) => (
                                                <tr key={r._id || i} className="border-t border-gray-border">
                                                    <td className="px-4 py-3 font-medium text-text-dark">{r.type || `Room ${i + 1}`}</td>
                                                    <td className="px-4 py-3 text-gray-text">Shared Bath</td>
                                                    <td className="px-4 py-3 text-text-dark">₱{r.price?.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.isAvailable ? 'bg-green-50 text-primary-green' : 'bg-red-50 text-red-alert'}`}>
                                                            {r.isAvailable ? 'Available' : 'Occupied'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button className="text-primary-green text-sm hover:underline">Edit</button>
                                                    </td>
                                                </tr>
                                            )) || (
                                                    <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-text">No rooms configured.</td></tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeConfigTab === 'Pricing & Availability' && (
                            <div className="max-w-2xl space-y-4">
                                <h3 className="font-semibold text-text-dark mb-4">Pricing & Availability</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Base Price (₱)" type="number" defaultValue={String((myListings[0] as any)?.priceMin || 0)} />
                                    <FormField label="Maximum Price (₱)" type="number" defaultValue={String((myListings[0] as any)?.priceMax || 0)} />
                                    <FormField label="Move-In Date" type="date" />
                                    <FormField label="Lease Terms" type="select" options={['Month-to-Month', '6 Months', '12 Months']} />
                                </div>
                                <FormField label="Availability Status" type="select" options={['Available Now', 'Available Soon', 'No Vacancies']} />
                                <button className="px-5 py-2.5 bg-primary-green text-white rounded font-medium hover:bg-primary-green-hover transition-colors">
                                    Save Pricing Strategy
                                </button>
                            </div>
                        )}

                        {activeConfigTab === 'Media Assets' && (
                            <div>
                                <h3 className="font-semibold text-text-dark mb-4">Media & Marketing Assets</h3>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="border-2 border-dashed border-gray-border rounded-lg p-8 text-center cursor-pointer hover:border-primary-green hover:bg-[rgba(33,141,61,0.02)] transition-colors">
                                        <Camera className="h-8 w-8 text-gray-text mx-auto mb-2" />
                                        <p className="text-sm font-medium text-text-dark">Add Photos</p>
                                    </div>
                                    <div className="border-2 border-dashed border-gray-border rounded-lg p-8 text-center cursor-pointer hover:border-primary-green hover:bg-[rgba(33,141,61,0.02)] transition-colors">
                                        <Video className="h-8 w-8 text-gray-text mx-auto mb-2" />
                                        <p className="text-sm font-medium text-text-dark">Add Videos</p>
                                    </div>
                                    <div className="border-2 border-dashed border-blue-primary bg-blue-50 rounded-lg p-8 text-center cursor-pointer hover:opacity-80 transition-opacity">
                                        <span className="text-4xl block mb-2">🥽</span>
                                        <p className="text-sm font-medium text-blue-primary">Upload 3D Virtual Tour</p>
                                    </div>
                                </div>

                                {/* Gallery preview */}
                                {(myListings[0] as any)?.photos?.length > 0 && (
                                    <>
                                        <h4 className="text-sm font-bold text-gray-text mb-3">Active Marketing Gallery</h4>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {(myListings[0] as any).photos.slice(0, 5).map((p: string, i: number) => (
                                                <div key={i} className="relative w-36 h-24 flex-shrink-0 rounded overflow-hidden">
                                                    <Image src={p} alt={`Gallery ${i}`} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function MetricCard({ icon, iconColor, label, value, trend, trendPositive }: {
    icon: React.ReactNode; iconColor: string; label: string;
    value: string; trend: string; trendPositive: boolean;
}) {
    return (
        <div className="bg-white border border-gray-border rounded-lg p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-text">{label}</p>
                <p className="text-2xl font-bold text-text-dark">{value}</p>
                <p className={`text-xs font-medium mt-0.5 ${trendPositive ? 'text-primary-green' : 'text-orange-primary'}`}>
                    {trend}
                </p>
            </div>
        </div>
    );
}

function TaskItem({ icon, title, desc, urgent }: { icon: React.ReactNode; title: string; desc: string; urgent?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-4 border border-gray-border rounded-lg bg-[#fafafa] hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-all ${urgent ? 'border-l-4 border-l-red-alert' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gray-light flex items-center justify-center text-gray-text flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-text-dark">{title}</h4>
                <p className="text-xs text-gray-text mt-0.5 truncate">{desc}</p>
            </div>
            <button className="text-xs px-3 py-1.5 border border-gray-border rounded hover:bg-gray-light transition-colors whitespace-nowrap">
                Review
            </button>
        </div>
    );
}

function FormField({ label, type = 'text', defaultValue = '', options = [] }: {
    label: string; type?: string; defaultValue?: string; options?: string[];
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-text-dark mb-1.5">{label}</label>
            {type === 'select' ? (
                <select className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green transition">
                    {options.map(o => <option key={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    type={type} defaultValue={defaultValue}
                    className="w-full px-3 py-2.5 border border-gray-border rounded text-sm outline-none focus:border-primary-green focus:shadow-[0_0_0_2px_rgba(33,141,61,0.2)] transition"
                />
            )}
        </div>
    );
}
