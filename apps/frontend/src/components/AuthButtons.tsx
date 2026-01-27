'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@makikibahay/ui';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, {session.user?.name}
        </span>
        <Button
          variant="outline"
          onClick={() => signOut()}
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
        onClick={() => signIn('google', {}, { prompt: 'select_account' })}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign In with Google
      </Button>
      <Button variant="outline" className="text-sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Sign Up
      </Button>
    </div>
  );
}