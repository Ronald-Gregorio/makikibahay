'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/index';
import { LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, {user?.name}
        </span>
        <Button
          variant="outline"
          onClick={() => logout()}
          className="text-sm"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Button
        onClick={() => router.push('/login')}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Log In
      </Button>
      <Button onClick={() => router.push('/signup')} variant="outline" className="text-sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Sign Up
      </Button>
    </div>
  );
}
