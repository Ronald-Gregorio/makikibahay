

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@makikibahay/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@makikibahay/ui";
import { Badge } from "@makikibahay/ui";
import { Button } from "@makikibahay/ui";
import { Edit, Trash2, BedDouble, CheckCircle, Pencil, Cuboid, Pin, File, Database, Search, MoreHorizontal, EyeOff, BookMarked } from "lucide-react";
import Link from "next/link";
import { listings as initialListingsData } from "@/lib/mock-data";
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
} from "@makikibahay/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@makikibahay/ui";
import Image from "next/image";
import { Listing, Room } from "@/lib/types";
import { Separator } from "@makikibahay/ui";
import { ScrollArea } from "@makikibahay/ui";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@makikibahay/ui";
import { Input } from "@makikibahay/ui";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@makikibahay/ui";
import { Checkbox } from "@makikibahay/ui";
import { useToast } from "@/hooks/use-toast";

export default function ListingsManagementPage() {
    const [listings, setListings] = useState<Listing[]>(initialListingsData);
    const [filteredListings, setFilteredListings] = useState<Listing[]>(initialListingsData);
    const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { toast } = useToast();

     useEffect(() => {
        let result = listings;
        
        // Filter by search query (name or address)
        if (searchQuery) {
            result = result.filter(listing => 
                listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by status (mock implementation)
        if (statusFilter !== 'all') {
            // For now, all listings are 'Active'. This is a placeholder.
            if (statusFilter === 'Active') {
                result = result.filter(listing => true); 
            } else {
                result = [];
            }
        }

        setFilteredListings(result);

    }, [searchQuery, statusFilter, listings]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedListingIds(filteredListings.map(l => l.id.toString()));
        } else {
            setSelectedListingIds([]);
        }
    };

    const handleSelectRow = (listingId: string, checked: boolean) => {
        if (checked) {
            setSelectedListingIds(prev => [...prev, listingId]);
        } else {
            setSelectedListingIds(prev => prev.filter(id => id !== listingId));
        }
    };

    const handleBulkUnpublish = () => {
        // Mock implementation
        toast({ title: "Bulk Action", description: `${selectedListingIds.length} listings have been unpublished.`});
        setSelectedListingIds([]);
    }

    const handleBulkDelete = () => {
        setListings(prev => prev.filter(l => !selectedListingIds.includes(l.id.toString())));
        toast({ variant: 'destructive', title: "Bulk Action", description: `${selectedListingIds.length} listings have been deleted.`});
        setSelectedListingIds([]);
    }

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Listings Management</h1>
                <p className="text-muted-foreground mt-2">
                    A list of all properties on the platform.
                </p>
            </header>

            <Card className="mb-6">
                 <CardHeader>
                    <CardTitle>Filters & Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                     <div className="relative w-full flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or address..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Unpublished">Unpublished</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    {selectedListingIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Actions ({selectedListingIds.length})
                                    <MoreHorizontal className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleBulkUnpublish}>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Unpublish Selected
                                </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => {}}>
                                    <BookMarked className="mr-2 h-4 w-4" />
                                    Feature Selected
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={handleBulkDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Listings</CardTitle>
                    <CardDescription>{filteredListings.length} of {listings.length} listings shown.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                     <Checkbox 
                                        checked={selectedListingIds.length > 0 && selectedListingIds.length === filteredListings.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all"
                                     />
                                </TableHead>
                                <TableHead>Listing</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredListings.map(listing => (
                                <ListingRow 
                                    key={listing.id} 
                                    listing={listing} 
                                    isSelected={selectedListingIds.includes(listing.id.toString())}
                                    onSelectRow={handleSelectRow}
                                />
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </>
    );
}

function ThreeDModelView({ room }: { room: Room }) {
    if (!room.model_3d_url) {
        return (
            <div className="text-center text-muted-foreground py-10">
                No 3D model available for this room.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <div className="aspect-square bg-secondary rounded-lg flex flex-col items-center justify-center text-center p-4">
                <Cuboid className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">3D Model Placeholder</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Model Details</CardTitle>
                    <CardDescription>Information about the 3D asset.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                     <div className="flex items-center gap-3">
                        <Pin className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Checkpoints</p>
                            <p className="text-muted-foreground">5 (mock data)</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">File Type</p>
                            <p className="text-muted-foreground">.glb (mock data)</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">File Size</p>
                            <p className="text-muted-foreground">25.3 MB (mock data)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ListingRow({ listing, isSelected, onSelectRow }: { listing: Listing, isSelected: boolean, onSelectRow: (listingId: string, checked: boolean) => void }) {
    const roomsWith3d = listing.rooms.filter(room => room.model_3d_url);
    const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(
        roomsWith3d[0]?.room_id.toString()
    );
    
    const selectedRoom = roomsWith3d.find(room => room.room_id.toString() === selectedRoomId);

    return (
        <Dialog>
            <TableRow data-state={isSelected ? "selected" : undefined}>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectRow(listing.id.toString(), !!checked)}
                        aria-label={`Select listing ${listing.name}`}
                    />
                </TableCell>
                <DialogTrigger asChild>
                    <TableCell className="cursor-pointer">
                        <div className="flex items-center gap-4">
                            <Image src={listing.photos[0].url} alt={listing.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="apartment room" />
                            <div>
                                <div className="font-semibold hover:underline">{listing.name}</div>
                                <p className="text-sm text-muted-foreground">{listing.address}</p>
                            </div>
                        </div>
                    </TableCell>
                </DialogTrigger>
                <TableCell>{listing.owner_name}</TableCell>
                <TableCell>
                    <Badge>Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                                        This action cannot be undone. This will unpublish the listing.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Unpublish</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
            </TableRow>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">{listing.name}</DialogTitle>
                    <DialogDescription>{listing.address}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full">
                    <div className="grid gap-6 py-4 pr-6">
                        <div>
                            <h4 className="font-semibold mb-2">Photos</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {listing.photos.map((photo) => (
                                <div key={photo.photo_id} className="aspect-square relative">
                                    <Image
                                        src={photo.url}
                                        alt={`${listing.name} photo`}
                                        fill
                                        objectFit="cover"
                                        className="rounded-md"
                                        data-ai-hint="apartment interior"
                                    />
                                </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Rooms and Pricing</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Room Type</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Inclusions</TableHead>
                                        <TableHead>Availability</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listing.rooms.map(room => (
                                        <TableRow key={room.room_id}>
                                            <TableCell className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-muted-foreground"/>{room.type}</TableCell>
                                            <TableCell className="font-semibold">₱{room.price.toLocaleString()}</TableCell>
                                            <TableCell>{room.inclusions.join(', ')}</TableCell>
                                            <TableCell>
                                                <Badge variant={room.is_available ? "default" : "destructive"} className={room.is_available ? "bg-green-500 text-white" : ""}>
                                                    {room.is_available ? 'Available' : 'Occupied'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Separator />
                        
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">3D Models</h4>
                                {roomsWith3d.length > 0 && (
                                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roomsWith3d.map(room => (
                                                <SelectItem key={room.room_id} value={room.room_id.toString()}>
                                                    {room.type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            {selectedRoom ? (
                                <ThreeDModelView room={selectedRoom} />
                            ) : (
                                <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                    No 3D models available for this listing.
                                </div>
                            )}
                        </div>
                        
                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">House Rules</h4>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {listing.rules.map((rule, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>{rule}</span>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="pr-6">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button asChild>
                        <Link href={`/owner/listings/edit/${listing.id}`}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Listing
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
