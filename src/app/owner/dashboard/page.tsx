'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Mail, BarChart, ShieldAlert } from "lucide-react";
import { listings as initialListings } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function ReportDialog({ reportedEntityName, reportedEntityType }: { reportedEntityName: string, reportedEntityType: 'user' }) {
    const { toast } = useToast();

    const handleSubmitReport = () => {
        toast({
            title: "Report Submitted",
            description: "Are you sure to report this person, make sure that the report description is correct, this report will be under review, check notification to get updates on the report status",
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Report a User</DialogTitle>
                <DialogDescription>
                    Report "{reportedEntityName}" for review by our administrators.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select>
                        <SelectTrigger id="report-type">
                            <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="spam">Spam or Scam</SelectItem>
                            <SelectItem value="harassment">Harassment</SelectItem>
                            <SelectItem value="no-show">No-show for viewing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea id="report-description" placeholder="Please provide a detailed description of the issue." />
                </div>
            </div>
             <DialogDescription className="text-xs text-amber-500">
                Are you sure to report this person, make sure that the report description is correct, this report will be under review, check notification to get updates on the report status.
            </DialogDescription>
            <Button onClick={handleSubmitReport}>Submit Report</Button>
        </DialogContent>
    )
}

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [listings, setListings] = useState<Listing[]>(initialListings);

    useEffect(() => {
        if (!user || user.role !== 'owner') {
            router.push('/login');
        }
    }, [user, router]);
    
    if (!user || user.role !== 'owner') {
        return <div className="container mx-auto px-4 md:px-6 py-12 text-center">Loading or redirecting...</div>;
    }

    // Filter listings to show only those owned by the current user
    const myListings = listings.filter(listing => listing.owner_id === parseInt(user.id, 10));

    const handleDeleteListing = (listingId: number) => {
        // This is a mock implementation. In a real app, this would be an API call.
        const updatedListings = listings.filter(l => l.id !== listingId);
        setListings(updatedListings);
        // This won't persist across reloads as mock-data is static.
        // To make it "feel" more real for this demo, we could update a local state.
        toast({
            title: "Listing Deleted",
            description: "The property has been removed from your listings.",
        });
    };

    return (
        <Dialog>
            <div className="container mx-auto px-4 md:px-6 py-12">
                <header className="mb-8 md:flex md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-headline">Owner Dashboard</h1>
                        <p className="text-muted-foreground mt-2">
                            Welcome, {user.name}. Manage your listings and view inquiries.
                        </p>
                    </div>
                    <Link href="/owner/listings/create" passHref>
                        <Button className="mt-4 md:mt-0">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Listing
                        </Button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Listings</CardTitle>
                                <CardDescription>A list of your current properties.</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Listing</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Available Rooms</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {myListings.map(listing => (
                                            <TableRow key={listing.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <Image src={listing.photos[0].url} alt={listing.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="apartment room" />
                                                        <div>
                                                            <Link href={`/listings/${listing.id}`} className="font-semibold hover:underline">{listing.name}</Link>
                                                            <p className="text-sm text-muted-foreground">{listing.address}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge>Active</Badge>
                                                </TableCell>
                                                <TableCell>{listing.available_rooms} / {listing.total_rooms}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/owner/listings/edit/${listing.id}`} passHref>
                                                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                                        </Link>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete your
                                                                        listing and remove its data from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteListing(listing.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                            </Table>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    <span>Listing Inquiries</span>
                                </CardTitle>
                                <CardDescription>Recent messages from potential tenants.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Mock Inquiry */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Inquiry from Jane Doe</p>
                                        <p className="text-sm text-muted-foreground">re: Sunshine Residences</p>
                                    </div>
                                     <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <ShieldAlert className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                </div>
                                <Button variant="link" className="text-accent px-0 mt-2" asChild>
                                    <Link href="/inbox">View all inquiries</Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart className="h-5 w-5" />
                                    <span>Key Metrics</span>
                                </CardTitle>
                                <CardDescription>A quick overview of your performance.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p><strong>Occupancy Rate:</strong> 85%</p>
                                    <p><strong>Inquiries this month:</strong> 5</p>
                                </div>
                                <Button variant="link" className="text-accent px-0 mt-2" asChild>
                                    <Link href="/owner/metrics">View Detailed Metrics</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <ReportDialog reportedEntityName="Jane Doe" reportedEntityType="user" />
        </Dialog>
    );
}
