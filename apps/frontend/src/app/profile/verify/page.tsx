'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    Button,
    Input,
    Label,
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/index';
import { useToast } from '@/hooks/use-toast';
import { verificationService } from '@/services/api/verification';
import { CheckCircle2, XCircle, Clock, Upload, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [idCard, setIdCard] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);
    const [proof, setProof] = useState<File | null>(null);

    if (!user) {
        return <div className="p-8 text-center">Please log in to verify your identity.</div>;
    }

    const status = user.verificationStatus || 'unverified';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!idCard) {
            toast({ variant: "destructive", title: "Missing ID", description: "Please upload your ID card." });
            return;
        }

        if (user.role === 'owner' && (!selfie || !proof)) {
            toast({ variant: "destructive", title: "Missing Documents", description: "Owners must upload a selfie and proof of ownership." });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('idCard', idCard);
            if (selfie) formData.append('selfie', selfie);
            if (proof) formData.append('proof', proof);

            await verificationService.submit(formData);
            
            // Proactively update user status locally if possible, or wait for refresh
            if (updateUser) {
                updateUser({ ...user, verificationStatus: 'pending' });
            }

            toast({ title: "Submitted", description: "Your verification documents have been submitted for review." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Submission Failed", description: error.message || "Failed to submit documents." });
        } finally {
            setLoading(false);
        }
    };

    const renderStatus = () => {
        switch (status) {
            case 'pending':
                return (
                    <Alert className="bg-blue-50 border-blue-200">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <AlertTitle className="text-blue-800">Verification Pending</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            We are currently reviewing your documents. This usually takes 24-48 hours.
                        </AlertDescription>
                    </Alert>
                );
            case 'verified':
                return (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-800">Account Verified</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Your identity has been successfully verified. You now have full access to platform features.
                        </AlertDescription>
                    </Alert>
                );
            case 'rejected':
                return (
                    <Alert className="bg-red-50 border-red-200">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <AlertTitle className="text-red-800">Verification Rejected</AlertTitle>
                        <AlertDescription className="text-red-700">
                            Unfortunately, your verification was rejected. Please review our requirements and try again.
                        </AlertDescription>
                    </Alert>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Link href="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline">Identity Verification</CardTitle>
                    </div>
                    <CardDescription>
                        To ensure the safety of our community, we require all {user.role === 'owner' ? 'owners' : 'users'} to verify their identity.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {renderStatus()}

                    {(status === 'unverified' || status === 'rejected') && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="idCard">Government Issued ID</Label>
                                    <Input 
                                        id="idCard" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">Upload a clear photo of your driver's license, passport, or national ID.</p>
                                </div>

                                {user.role === 'owner' && (
                                    <>
                                        <div className="grid w-full items-center gap-1.5">
                                            <Label htmlFor="selfie">Selfie with ID</Label>
                                            <Input 
                                                id="selfie" 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">Take a selfie while holding your ID card next to your face.</p>
                                        </div>

                                        <div className="grid w-full items-center gap-1.5">
                                            <Label htmlFor="proof">Proof of Ownership / Lease</Label>
                                            <Input 
                                                id="proof" 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => setProof(e.target.files?.[0] || null)}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">Upload a copy of your utility bill, lease agreement, or land title.</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Verification'}
                                {!loading && <Upload className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    )}

                    {status === 'pending' && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="mx-auto h-12 w-12 mb-4 opacity-20" />
                            <p>Thank you for submitting your documents. We'll notify you once the review is complete.</p>
                        </div>
                    )}

                    {status === 'verified' && (
                        <div className="text-center py-8">
                            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="h-10 w-10 text-primary" />
                            </div>
                            <p className="text-lg font-semibold text-foreground">Verified Member</p>
                            <p className="text-muted-foreground">Your account is in good standing.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
