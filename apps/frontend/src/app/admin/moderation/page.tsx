
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import { Button } from "@/components/ui/index";
import { Check, Star, X, Search, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { dashboardService } from "@/services/api/dashboard";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/index";
import { Review } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/index";
import { Checkbox } from "@/components/ui/index";

type ReviewWithListing = Review & { listingName: string; listingId: string; status: 'pending' | 'approved' | 'rejected' };

export default function ContentModerationPage() {
    const [reviews, setReviews] = useState<ReviewWithListing[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<ReviewWithListing[]>([]);
    const [selectedReviewIds, setSelectedReviewIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        dashboardService.getAdminReviews()
            .then(data => {
                // Ensure they have the UI status flag 
                setReviews(data.map(r => ({ ...r, status: 'pending' })));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = reviews;

        if (searchQuery) {
            result = result.filter(review =>
                review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (ratingFilter !== 'all') {
            result = result.filter(review => review.rating.toString() === ratingFilter);
        }

        // In this mock, we only show 'pending' reviews by default
        setFilteredReviews(result.filter(r => r.status === 'pending'));

    }, [searchQuery, ratingFilter, reviews]);

    const handleModerate = (reviewId: number, action: 'approved' | 'rejected') => {
        setReviews(prev => prev.map(r => r.review_id === reviewId ? { ...r, status: action } : r));
        toast({
            title: `Review ${action}`,
            description: `The review has been ${action}.`
        });
        setSelectedReviewIds([]);
    }

    const handleBulkModerate = (action: 'approved' | 'rejected') => {
        setReviews(prev => prev.map(r => selectedReviewIds.includes(r.review_id) ? { ...r, status: action } : r));
        toast({ title: "Bulk Action", description: `${selectedReviewIds.length} reviews have been ${action}.` });
        setSelectedReviewIds([]);
    }

    const handleBulkDelete = () => {
        // This is a soft delete for the view, in a real app it would be a DB call
        setReviews(prev => prev.filter(r => !selectedReviewIds.includes(r.review_id)));
        toast({ variant: 'destructive', title: "Bulk Delete", description: `${selectedReviewIds.length} reviews have been deleted.` });
        setSelectedReviewIds([]);
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedReviewIds(filteredReviews.map(r => r.review_id));
        } else {
            setSelectedReviewIds([]);
        }
    };

    const handleSelectRow = (reviewId: number, checked: boolean) => {
        if (checked) {
            setSelectedReviewIds(prev => [...prev, reviewId]);
        } else {
            setSelectedReviewIds(prev => prev.filter(id => id !== reviewId));
        }
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Content Moderation</h1>
                <p className="text-muted-foreground mt-2">
                    Review user-submitted content.
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
                            placeholder="Search by user or comment..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by rating..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                    </Select>
                    {selectedReviewIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Actions ({selectedReviewIds.length})
                                    <MoreHorizontal className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleBulkModerate('approved')}>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    Approve Selected
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkModerate('rejected')}>
                                    <X className="mr-2 h-4 w-4 text-destructive" />
                                    Reject Selected
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
                    <CardTitle>Pending Reviews</CardTitle>
                    <CardDescription>{filteredReviews.length} reviews to moderate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedReviewIds.length > 0 && filteredReviews.length > 0 && selectedReviewIds.length === filteredReviews.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Listing</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            )}
                            {filteredReviews.map(review => (
                                <ReviewRow
                                    key={review.review_id}
                                    review={review}
                                    onModerate={handleModerate}
                                    isSelected={selectedReviewIds.includes(review.review_id)}
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

function ReviewRow({ review, onModerate, isSelected, onSelectRow }: { review: ReviewWithListing, onModerate: (reviewId: number, action: 'approved' | 'rejected') => void, isSelected: boolean, onSelectRow: (reviewId: number, checked: boolean) => void }) {
    return (
        <Dialog>
            <TableRow data-state={isSelected ? "selected" : undefined}>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectRow(review.review_id, !!checked)}
                        aria-label={`Select review by ${review.user.name}`}
                    />
                </TableCell>
                <DialogTrigger asChild>
                    <TableCell className="cursor-pointer">{review.user.name}</TableCell>
                </DialogTrigger>
                <TableCell>
                    <Link href={`/listings/${review.listingId}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>{review.listingName}</Link>
                </TableCell>
                <DialogTrigger asChild>
                    <TableCell className="cursor-pointer">
                        <p className="truncate max-w-xs">{review.comment}</p>
                    </TableCell>
                </DialogTrigger>
                <TableCell>
                    <Badge className="flex items-center gap-1 w-fit">
                        <span>{review.rating}</span>
                        <Star className="h-3 w-3" />
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={() => onModerate(review.review_id, 'approved')}><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onModerate(review.review_id, 'rejected')}><X className="h-4 w-4" /></Button>
                    </div>
                </TableCell>
            </TableRow>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Review Details</DialogTitle>
                    <DialogDescription>Review submitted on {new Date(review.created_at).toLocaleDateString()}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={review.user.avatar} alt={review.user.name} data-ai-hint="person" />
                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{review.user.name}</p>
                            <p className="text-sm text-muted-foreground">Review for <Link href={`/listings/${review.listingId}`} className="underline hover:text-primary">{review.listingName}</Link></p>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                            ))}
                        </div>
                    </div>
                    <Card className="bg-muted/50 p-4">
                        <p className="text-foreground">{review.comment}</p>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => onModerate(review.review_id, 'rejected')}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onModerate(review.review_id, 'approved')}>
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
