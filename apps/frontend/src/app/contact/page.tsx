
'use client';

import { Button } from '@/components/ui/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Label } from '@/components/ui/index';
import { Textarea } from '@/components/ui/index';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you'd handle form submission here (e.g., send an email or API request)
        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We'll get back to you shortly.",
        });
        (e.target as HTMLFormElement).reset();
    };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Whether you have a question, feedback, or need support, feel free to reach out.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we will get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Juan Dela Cruz" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="juan.dela.cruz@example.com" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="e.g., Listing Inquiry" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message here..." required rows={5}/>
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>You can also reach us through the following channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Mail className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Email</h3>
                                <a href="mailto:support@makikibahay.com" className="text-muted-foreground hover:text-primary">support@makikibahay.com</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone className="h-6 w-6 text-primary" />
                             <div>
                                <h3 className="font-semibold">Phone</h3>
                                <p className="text-muted-foreground">(+63) 912 345 6789</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPin className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="font-semibold">Address</h3>
                                <p className="text-muted-foreground">123 Tech Avenue, Cabanatuan City, Nueva Ecija, Philippines</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}
