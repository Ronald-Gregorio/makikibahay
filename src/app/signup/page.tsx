'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function GoogleIcon() {
    return (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.66 1.98-3.56 0-6.21-2.82-6.21-6.18s2.65-6.18 6.21-6.18c2.02 0 3.26.83 4.1 1.62l2.33-2.33C18.47.65 15.92 0 12.48 0 5.88 0 .02 5.82.02 12.27s5.86 12.27 12.46 12.27c3.45 0 6.09-1.12 8.11-3.21 2.1-2.05 2.8-5.02 2.8-7.75 0-.62-.05-1.24-.12-1.85h-10.8z"/>
      </svg>
    )
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

   const handleSignup = () => {
    const success = signup(name, email, password, role);
    if (success) {
      toast({ title: 'Signup Successful', description: 'Your account has been created.' });
      if (role === 'owner') {
        router.push('/owner/dashboard');
      } else {
        router.push('/');
      }
    } else {
      toast({ variant: 'destructive', title: 'Signup Failed', description: 'This email is already in use.' });
    }
  };
  
  const handleGoogleSignIn = () => {
    // Placeholder for Firebase Google Sign-in logic
    alert('Google Sign-In is not configured yet.');
  }

  const renderSignupForm = (currentRole: 'user' | 'owner') => (
    <CardContent className="space-y-4">
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
        <GoogleIcon />
        <span className="ml-2">Sign up with Google</span>
        </Button>
        <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
        </div>
        <div className="space-y-2">
        <Label htmlFor={`${currentRole}-name`}>Full Name</Label>
        <Input id={`${currentRole}-name`} type="text" placeholder="Juan Dela Cruz" required value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
        <div className="space-y-2">
        <Label htmlFor={`${currentRole}-email`}>Email</Label>
        <Input id={`${currentRole}-email`} type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
        <Label htmlFor={`${currentRole}-password`}>Password</Label>
        <Input id={`${currentRole}-password`} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
    </CardContent>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-112px)] bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join as a user looking for a home, or an owner listing a property.</CardDescription>
        </CardHeader>
        <Tabs defaultValue="user" onValueChange={(value) => setRole(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">I'm a User</TabsTrigger>
                <TabsTrigger value="owner">I'm an Owner</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
                {renderSignupForm('user')}
            </TabsContent>
            <TabsContent value="owner">
                {renderSignupForm('owner')}
            </TabsContent>
        </Tabs>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleSignup}>Create Account</Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
