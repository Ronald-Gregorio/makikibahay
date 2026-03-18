'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Textarea,
    Label
} from '@/components/ui/index';
import { useToast } from '@/hooks/use-toast';
import { verificationService, VerificationRequest } from '@/services/api/verification';
import { Eye, CheckCircle, XCircle, Clock, ShieldCheck, ExternalLink } from 'lucide-react';

export default function AdminVerificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/');
            return;
        }
        fetchRequests();
    }, [user, router]);

    const fetchRequests = async () => {
        try {
            const data = await verificationService.getAdminList();
            setRequests(data);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Fetch Failed", description: error.message || "Could not load verification requests." });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest) return;
        
        setIsActionLoading(true);
        try {
            await verificationService.updateStatus(selectedRequest._id, status, status === 'rejected' ? rejectionReason : undefined);
            toast({ title: `Verification ${status}`, description: `Request for ${selectedRequest.userId.name} has been ${status}.` });
            setSelectedRequest(null);
            setRejectionReason('');
            fetchRequests();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Action Failed", description: error.message || "Could not update status." });
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-headline">Verification Moderation</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Clock className="mx-auto h-12 w-12 mb-4 opacity-20" />
                            <p>No pending verification requests at this time.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{request.userId.name}</span>
                                                <span className="text-xs text-muted-foreground">{request.userId.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{request.role}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                                <Clock className="h-3 w-3" /> Pending
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                                                <Eye className="h-4 w-4 mr-2" /> Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Verification: {selectedRequest?.userId.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Government ID</Label>
                                <div className="aspect-video relative bg-muted rounded-md overflow-hidden border">
                                    {selectedRequest?.idUrl && (
                                        <img src={selectedRequest.idUrl} alt="ID Card" className="object-contain w-full h-full" />
                                    )}
                                </div>
                                <a href={selectedRequest?.idUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                    <ExternalLink className="h-3 w-3" /> View Full Image
                                </a>
                            </div>

                            {selectedRequest?.role === 'owner' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Selfie with ID</Label>
                                        <div className="aspect-video relative bg-muted rounded-md overflow-hidden border">
                                            {selectedRequest?.selfieUrl && (
                                                <img src={selectedRequest.selfieUrl} alt="Selfie" className="object-contain w-full h-full" />
                                            )}
                                        </div>
                                        <a href={selectedRequest?.selfieUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                            <ExternalLink className="h-3 w-3" /> View Full Image
                                        </a>
                                    </div>
                                    <div className="space-y-2 col-span-full">
                                        <Label>Proof of Ownership / Lease</Label>
                                        <div className="aspect-[21/9] relative bg-muted rounded-md overflow-hidden border">
                                            {selectedRequest?.proofUrl && (
                                                <img src={selectedRequest.proofUrl} alt="Proof" className="object-contain w-full h-full" />
                                            )}
                                        </div>
                                        <a href={selectedRequest?.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                            <ExternalLink className="h-3 w-3" /> View Full Image
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason (Optional for approval, required for rejection)</Label>
                            <Textarea 
                                id="reason" 
                                placeholder="Explain why the verification was rejected..." 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => handleAction('rejected',)} disabled={isActionLoading || !rejectionReason}>
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                        </Button>
                        <Button onClick={() => handleAction('approved')} disabled={isActionLoading}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
