
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, BedDouble, Award, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { featuredListings } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptStep, setPromptStep] = useState<'auth' | 'survey'>('auth');
  const { user, surveyData } = useAuth();

  useEffect(() => {
    // Show the prompt shortly after the page loads
    const timer = setTimeout(() => {
      // Show prompt only if user is not logged in, or if they are logged in but have no survey data.
      if (!user) {
        setPromptStep('auth');
        setShowPrompt(true);
      } else if (user && !surveyData) {
        setPromptStep('survey');
        setShowPrompt(true);
      }
      // If user is logged in and has survey data, don't show the prompt.
    }, 5000);
    return () => clearTimeout(timer);
  }, [user, surveyData]);

  const handleAuthChoice = () => {
    // This will be called after login/signup, so we can move to the survey step
    setPromptStep('survey');
  }

  return (
    <div className="flex flex-col items-center">
       <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-[425px]">
            {promptStep === 'auth' && !user && (
                <>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Welcome!</DialogTitle>
                        <DialogDescription>
                            Sign in or create an account to get personalized recommendations.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-4">
                        <Link href="/login" passHref>
                            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAuthChoice}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Log In
                            </Button>
                        </Link>
                        <Link href="/signup" passHref>
                            <Button variant="outline" className="w-full" onClick={handleAuthChoice}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </>
            )}
             {promptStep === 'survey' && (
                <>
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Find Your Perfect Match</DialogTitle>
                        <DialogDescription>
                            Get personalized recommendations by taking a quick survey, or browse all properties at your own pace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 flex flex-col gap-4">
                        <Link href="/survey" passHref>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowPrompt(false)}>
                                <Award className="mr-2 h-4 w-4" />
                                Take the Survey
                            </Button>
                        </Link>
                        <Link href="/browse" passHref>
                            <Button variant="outline" className="w-full" onClick={() => setShowPrompt(false)}>
                                <Search className="mr-2 h-4 w-4" />
                                Browse All Properties
                            </Button>
                        </Link>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>

      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground font-headline">
            Find Your Home in Cabanatuan City
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Discover and book the perfect boarding house that fits your lifestyle and budget.
          </p>
          <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 bg-background p-3 rounded-lg shadow-lg">
            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by area, landmark, or school..."
                className="pl-10 w-full"
              />
            </div>
            <Link href="/browse" passHref>
              <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Search className="mr-2 h-4 w-4" />
                Find a Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center font-headline">Featured Properties</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Handpicked selections for students and professionals.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Link href={`/listings/${listing.id}`}>
                    <div className="relative h-56 w-full">
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="apartment exterior"
                      />
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-headline hover:text-primary transition-colors">
                     <Link href={`/listings/${listing.id}`}>{listing.name}</Link>
                  </CardTitle>
                  <div className="mt-2 flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{listing.address}</span>
                  </div>
                  <div className="mt-2 flex items-center text-muted-foreground text-sm">
                    <BedDouble className="h-4 w-4 mr-2" />
                    <span>{listing.total_rooms} rooms available</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-secondary/50 flex justify-between items-center">
                  <p className="text-lg font-bold text-primary">
                    ₱{listing.price_min.toLocaleString()} - ₱{listing.price_max.toLocaleString()}
                  </p>
                  <Link href={`/listings/${listing.id}`} passHref>
                    <Button variant="link" className="text-accent hover:text-accent/90">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
