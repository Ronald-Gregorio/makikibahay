'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Building, Key, DollarSign, MessageSquare, Wrench, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService } from '@/services/api/dashboard';
import { listingService } from '@/services/api/listings';
import type { Listing } from '@/lib/types';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/index';

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConfigTab, setActiveConfigTab] = useState('Active Residents');

    useEffect(() => {
        if (!user || user.role !== 'owner') { router.push('/login'); return; }
        
        const fetchData = async () => {
            try {
                const [listingsData, metricsData, summaryData, tenantsData] = await Promise.all([
                    dashboardService.getOwnerListings(),
                    dashboardService.getOwnerMetrics(),
                    dashboardService.getOwnerSummary(),
                    dashboardService.getOwnerTenants()
                ]);
                setMyListings(listingsData);
                setMetrics(metricsData);
                setSummary(summaryData);
                setTenants(tenantsData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load dashboard data.' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, router, toast]);

    if (!user || user.role !== 'owner' || loading) {
        return <div className="flex items-center justify-center h-64 text-gray-text animate-pulse font-medium">Loading your dashboard infrastructure...</div>;
    }

    const occupancyRate = metrics?.occupancyRate || 0;
    const availableRooms = metrics?.availableRooms || 0;
    const totalRooms = metrics?.totalRooms || 0;

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
        <div className="bg-[#f8f9fa] min-h-screen">

            {/* ── Dashboard Header ── */}
            <div className="bg-white border-b border-gray-border px-6 py-6 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-dark tracking-tight">Owner Command Center</h1>
                        <p className="text-gray-text text-lg mt-1">Hello, {user.name}. Here's the performance of your property portfolio.</p>
                    </div>
                    <Link
                        href="/owner/listings/create"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        <PlusCircle className="h-5 w-5" /> Add New Property
                    </Link>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">

                {/* ── Portfolio Overview Metrics ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        icon={<Building className="h-6 w-6" />}
                        iconColor="bg-blue-50 text-blue-600"
                        label="Active Listings"
                        value={metrics?.listingsCount || myListings.length}
                        trend="Total Properties"
                        trendPositive
                    />
                    <MetricCard
                        icon={<Key className="h-6 w-6" />}
                        iconColor="bg-orange-50 text-orange-600"
                        label="Average Occupancy"
                        value={`${occupancyRate.toFixed(1)}%`}
                        trend={`${totalRooms - availableRooms} rooms filled`}
                        trendPositive={occupancyRate > 70}
                    />
                    <MetricCard
                        icon={<DollarSign className="h-6 w-6" />}
                        iconColor="bg-green-50 text-primary-green"
                        label="Available Units"
                        value={availableRooms.toString()}
                        trend="Across all properties"
                        trendPositive={false}
                    />
                    <MetricCard
                        icon={<MessageSquare className="h-6 w-6" />}
                        iconColor="bg-purple-50 text-purple-600"
                        label="Inquiries"
                        value={metrics?.inquiryCount || 0}
                        trend="New messages"
                        trendPositive
                    />
                </div>

                {/* ── Action Items ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Real Action Items */}
                    <div className="lg:col-span-2 bg-white border border-gray-border rounded-xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-text-dark">Required Actions</h2>
                            <span className="text-sm font-semibold text-primary-green bg-green-50 px-3 py-1 rounded-full">
                                {Number(metrics?.pendingApplications || 0) + Number(metrics?.openMaintenance || 0)} Total Tasks
                            </span>
                        </div>
                        <div className="space-y-4">
                            {summary?.maintenance?.length > 0 ? summary.maintenance.map((req: any) => (
                                <TaskItem
                                    key={req._id}
                                    icon={<Wrench className="h-5 w-5" />}
                                    title={req.title}
                                    desc={`Property: ${req.listingId?.name || 'Unknown'}`}
                                    urgent={req.priority === 'high' || req.priority === 'urgent'}
                                />
                            )) : (
                                <div className="py-4 text-center text-gray-text italic border border-dashed border-gray-border rounded-lg">
                                    No open maintenance requests.
                                </div>
                            )}

                            {summary?.applications?.length > 0 ? summary.applications.map((app: any) => (
                                <TaskItem
                                    key={app._id}
                                    icon={<FileText className="h-5 w-5" />}
                                    title="New Application"
                                    desc={`${app.userId?.name || 'Applicant'} for ${app.listingId?.name || 'Property'}`}
                                />
                            )) : (
                                <div className="py-4 text-center text-gray-text italic border border-dashed border-gray-border rounded-lg">
                                    No pending applications.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats / Mini Chart */}
                    <div className="bg-white border border-gray-border rounded-xl p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-text-dark mb-2">Market Insight</h2>
                            <p className="text-sm text-gray-text mb-6">Real-time status of your portfolio availability.</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-text-dark">Occupancy Rate</span>
                                        <span className="font-bold text-primary-green">{occupancyRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-light rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary-green transition-all duration-1000" 
                                            style={{ width: `${occupancyRate}%` }} 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-light/30 rounded-lg">
                                        <span className="block text-xs text-gray-text uppercase font-bold">Total Rooms</span>
                                        <span className="text-xl font-bold text-text-dark">{totalRooms}</span>
                                    </div>
                                    <div className="p-3 bg-gray-light/30 rounded-lg">
                                        <span className="block text-xs text-gray-text uppercase font-bold">Vacant</span>
                                        <span className="text-xl font-bold text-orange-600">{availableRooms}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-light">
                            <Link href="/owner/listings" className="text-primary-green font-bold text-sm flex items-center justify-center gap-2 hover:underline">
                                Manage Inventory <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── My Listings Table ── */}
                <div className="bg-white border border-gray-border rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-8 border-b border-gray-border">
                        <h2 className="text-2xl font-bold text-text-dark">My Property Inventory</h2>
                        <Link href="/owner/listings/create" className="text-primary-green hover:text-primary-green-hover font-bold flex items-center gap-2 group">
                            <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" /> Add New Listing
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#fcfdfe] text-gray-text text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="px-8 py-4">Property</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Rooms</th>
                                    <th className="px-8 py-4">Price Range</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myListings.map((listing: any) => {
                                    const lId = listing._id || listing.id;
                                    const photo = listing.photos?.[0] || 'https://placehold.co/64x64.png';
                                    return (
                                        <tr key={lId} className="border-t border-gray-border hover:bg-gray-light/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-border shadow-sm">
                                                        <Image src={photo} alt={listing.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <Link href={`/listings/${lId}`} className="text-lg font-bold text-text-dark hover:text-primary-green transition-colors">
                                                            {listing.name}
                                                        </Link>
                                                        <p className="text-sm text-gray-text mt-1">{listing.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 text-xs font-bold uppercase bg-green-50 text-primary-green rounded-full border border-green-100">Active</span>
                                            </td>
                                            <td className="px-8 py-6 font-medium text-text-dark">
                                                <span className={listing.availableRooms > 0 ? 'text-text-dark' : 'text-red-alert'}>
                                                    {listing.availableRooms ?? 0}
                                                </span>
                                                <span className="text-gray-text mx-1">/</span>
                                                <span>{listing.totalRooms ?? 0} Available</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-text-dark">₱{(listing.priceMin || 0).toLocaleString()}</div>
                                                <div className="text-xs text-gray-text tracking-tighter">— ₱{(listing.priceMax || 0).toLocaleString()}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={`/owner/listings/edit/${lId}`} className="p-2 bg-gray-light/50 text-gray-text hover:text-primary-green hover:bg-green-50 rounded-lg transition-all">
                                                        <Edit className="h-5 w-5" />
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="p-2 bg-gray-light/50 text-gray-text hover:text-red-alert hover:bg-red-50 rounded-lg transition-all">
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-2xl font-bold">Delete Permanent Listing?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-lg">This will remove "{listing.name}" from the platform forever. This action is irreversible.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="mt-6">
                                                                <AlertDialogCancel className="h-12 px-6">Keep Listing</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(lId)} className="bg-red-alert hover:bg-red-700 text-white h-12 px-8 font-bold">
                                                                    Confirm Deletion
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── My Tenants Section ── */}
                <div className="bg-white border border-gray-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-border flex justify-between items-center bg-[#fcfdfe]">
                        <div>
                            <h2 className="text-2xl font-bold text-text-dark">Tenant & Resident Management</h2>
                            <p className="text-gray-text mt-1 font-medium">Manage your active leases and background checks.</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setActiveConfigTab('Active Residents')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${activeConfigTab === 'Active Residents' ? 'bg-primary-green text-white shadow-md' : 'bg-gray-light text-gray-text hover:bg-gray-200'}`}>Active</button>
                             <button onClick={() => setActiveConfigTab('Pending Applications')} className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${activeConfigTab === 'Pending Applications' ? 'bg-primary-green text-white shadow-md' : 'bg-gray-light text-gray-text hover:bg-gray-200'}`}>Applications</button>
                        </div>
                    </div>

                    <div className="p-8">
                        {activeConfigTab === 'Active Residents' && (
                            <div className="border border-gray-border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#fcfdfe] text-gray-text text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Resident</th>
                                            <th className="px-6 py-4 text-left">Property / Unit</th>
                                            <th className="px-6 py-4 text-left">Monthly Rent</th>
                                            <th className="px-6 py-4 text-left">Lease Ends</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-light">
                                        {tenants.length > 0 ? tenants.map((t) => (
                                            <tr key={t._id} className="hover:bg-gray-light/20 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold">
                                                            {t.userId?.name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text-dark">{t.userId?.name}</div>
                                                            <div className="text-xs text-gray-text">{t.userId?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-gray-text">
                                                    <div className="font-medium text-text-dark">{t.listingId?.name}</div>
                                                    <div className="text-xs italic">{t.roomId?.type}</div>
                                                </td>
                                                <td className="px-6 py-5 font-bold text-text-dark">₱{t.monthlyRent?.toLocaleString()}</td>
                                                <td className="px-6 py-5 text-gray-text font-medium">{t.endDate ? new Date(t.endDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="text-primary-green font-bold hover:underline">View Details</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-text italic">No active residents found in your properties.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeConfigTab === 'Pending Applications' && (
                             <div className="border border-gray-border rounded-lg overflow-hidden">
                             <table className="w-full text-sm">
                                 <thead className="bg-[#fcfdfe] text-gray-text text-xs uppercase font-bold">
                                     <tr>
                                         <th className="px-6 py-4 text-left">Applicant</th>
                                         <th className="px-6 py-4 text-left">Target Listing</th>
                                         <th className="px-6 py-4 text-left">Date Submitted</th>
                                         <th className="px-6 py-4 text-right">Actions</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-light">
                                     {summary?.applications?.length > 0 ? summary.applications.map((app: any) => (
                                         <tr key={app._id} className="hover:bg-gray-light/20 transition-colors">
                                             <td className="px-6 py-5">
                                                 <div className="font-bold text-text-dark">{app.userId?.name}</div>
                                                 <div className="text-xs text-gray-text">{app.userId?.email}</div>
                                             </td>
                                             <td className="px-6 py-5 text-text-dark font-medium">{app.listingId?.name}</td>
                                             <td className="px-6 py-5 text-gray-text">{new Date(app.createdAt).toLocaleDateString()}</td>
                                             <td className="px-6 py-5 text-right">
                                                 <button className="px-4 py-1.5 bg-primary-green text-white rounded font-bold text-xs hover:bg-primary-green-hover shadow-sm">Review App</button>
                                             </td>
                                         </tr>
                                     )) : (
                                         <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-text italic">No pending applications at this time.</td></tr>
                                     )}
                                 </tbody>
                             </table>
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
    value: string | number; trend: string; trendPositive: boolean;
}) {
    return (
        <div className="bg-white border border-gray-border rounded-xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor} shadow-inner`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-gray-text uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-black text-text-dark tracking-tighter">{value}</p>
                <p className={`text-xs font-bold mt-1 ${trendPositive ? 'text-primary-green' : 'text-orange-600'}`}>
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
