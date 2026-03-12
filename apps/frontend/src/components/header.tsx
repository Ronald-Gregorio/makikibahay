'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/index';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/index';
import { Menu, Home, LogOut, User, Heart, LayoutDashboard, Bell, Inbox, BarChart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/index';

export function AppHeader() {
  const { user, logout } = useAuth();
  const hasNotifications = true; // Placeholder for real notification logic

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'owner':
        return '/owner/dashboard';
      default:
        return '/profile';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Makikibahay</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {user?.role === 'admin' ? (
              <Link href="/admin/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
            ) : (
              <Link href="/browse" className="transition-colors hover:text-primary">
                Browse
              </Link>
            )}
            {user?.role !== 'owner' && (
              <Link href="/survey" className="transition-colors hover:text-primary">
                Take Survey
              </Link>
            )}
            {user?.role === 'user' && (
              <Link href="/favorites" className="transition-colors hover:text-primary">
                Favorites
              </Link>
            )}
            {user?.role === 'owner' && (
              <>
                <Link href="/owner/dashboard" className="transition-colors hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/owner/metrics" className="transition-colors hover:text-primary">
                  Metrics
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                  <Home className="h-6 w-6 text-primary" />
                  <span className="font-bold">Makikibahay</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  <Link href="/browse">Browse</Link>
                  {user?.role !== 'owner' && <Link href="/survey">Take Survey</Link>}
                  {user ? (
                    <>
                      {user.role !== 'user' && (
                        <Link href={getDashboardLink()} className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'owner' && (
                        <Link href="/owner/metrics" className="flex items-center gap-2">
                          <BarChart className="h-4 w-4" />
                          <span>Metrics</span>
                        </Link>
                      )}
                      <Link href="/inbox" className="flex items-center gap-2">
                        <Inbox className="h-4 w-4" />
                        <span>Inbox</span>
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                      </Link>
                      {user.role === 'user' && (
                        <Link href="/favorites" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          <span>Favorites</span>
                        </Link>
                      )}
                      <button onClick={logout} className="flex items-center gap-2 text-left w-full">
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">Log In</Link>
                      <Link href="/signup">Sign Up</Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {hasNotifications && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                        )}
                        <span className="sr-only">Notifications</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex-col items-start gap-1" asChild>
                        <Link href="/inbox">
                          <p className="font-medium">New message from Sunny Day</p>
                          <p className="text-xs text-muted-foreground">"Yes, the solo room is still available..."</p>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex-col items-start gap-1" asChild>
                        <Link href="/inbox">
                          <p className="font-medium">Slot confirmation</p>
                          <p className="text-xs text-muted-foreground">Your slot at Maple Tree Dormitory is confirmed.</p>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/inbox" className="w-full justify-center">
                          <Button variant="link" className="w-full">
                            View all notifications
                          </Button>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person" />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'owner' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={getDashboardLink()}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/owner/metrics">
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>Metrics</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardLink()}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/inbox">
                        <Inbox className="mr-2 h-4 w-4" />
                        <span>Inbox</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'user' && (
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favorites</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
