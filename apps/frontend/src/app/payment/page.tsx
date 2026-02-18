import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@makikibahay/ui";
import { AlertTriangle } from "lucide-react";

export default function PaymentPage() {
    return (
        <div className="container mx-auto py-20 px-4 flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-yellow-100 p-4 rounded-full mb-4 w-fit">
                        <AlertTriangle className="h-10 w-10 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl">Payment System Under Development</CardTitle>
                    <CardDescription>
                        We are currently working on integrating a secure payment gateway.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Online payments are not yet available. Please contact the property owner directly for payment arrangements.
                    </p>
                    <div className="p-4 bg-muted rounded-lg text-sm">
                        <strong>Note for Developers:</strong> This is a placeholder page. Payment API integrations (Stripe/Paystack) have been disabled.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
