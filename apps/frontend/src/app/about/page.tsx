
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Briefcase, Home, Users, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">About Makikibahay</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Your trusted partner in finding the perfect boarding house in Cabanatuan City.
          </p>
        </header>

        <Card className="mb-12 shadow-lg">
            <CardContent className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                    <h2 className="text-3xl font-bold font-headline">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Finding a place to live in a new city can be overwhelming. Makikibahay was born from a simple idea: to make the search for a boarding house in Cabanatuan City as easy and stress-free as possible. We aim to connect students and professionals with safe, comfortable, and affordable housing options.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        We believe everyone deserves a place they can call home, even if it's just for a semester or a new job. Our platform is designed to provide detailed listings, honest reviews, and direct communication with property owners to ensure you find the perfect fit.
                    </p>
                    </div>
                    <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                        <img src="https://picsum.photos/seed/about/600/400" alt="Cabanatuan City" className="w-full h-full object-cover" data-ai-hint="cityscape philippines" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Who We Serve</h2>
            <p className="mt-2 text-muted-foreground">We cater to the diverse needs of our community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="font-headline mt-4">For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Find safe and affordable boarding houses near your university. Filter by budget, amenities, and walking distance to make your student life easier.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Briefcase className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="font-headline mt-4">For Professionals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Discover comfortable and convenient living spaces close to your workplace. Enjoy a hassle-free search for your new home in the city.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold font-headline">Our Commitment</h2>
            <div className="mt-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                    <CheckCircle className="h-10 w-10 text-green-500"/>
                    <h3 className="mt-2 font-semibold">Verified Listings</h3>
                    <p className="text-sm text-muted-foreground mt-1">We strive to ensure our listings are accurate and up-to-date.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <CheckCircle className="h-10 w-10 text-green-500"/>
                    <h3 className="mt-2 font-semibold">User-centric Design</h3>
                    <p className="text-sm text-muted-foreground mt-1">An intuitive platform built for a seamless user experience.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <CheckCircle className="h-10 w-10 text-green-500"/>
                    <h3 className="mt-2 font-semibold">Community Focused</h3>
                    <p className="text-sm text-muted-foreground mt-1">Building a trusted community of renters and owners in Cabanatuan.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
