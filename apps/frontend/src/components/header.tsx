'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/index';
import {
  Menu, Home, LogOut, User, Heart, LayoutDashboard,
  Bell, Inbox, BarChart, X, Search, BookmarkCheck,
  PlusCircle, HelpCircle, Languages, ChartPie, Vault,
  Key, UsersRound, ShieldCheck, Settings, Building,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/index';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hasNotifications = true;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'owner': return '/owner/dashboard';
      default: return '/profile';
    }
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="site-header sticky top-0 z-50 w-full bg-white border-b border-gray-border">
        <div className="header-container max-w-[1400px] mx-auto px-5 h-[70px] flex items-center justify-between">

          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="btn-icon p-2 text-text-dark hover:text-primary-green transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col pt-10">
                <SheetHeader className="px-5 pb-4 border-b border-gray-border text-left">
                  <SheetTitle className="text-lg font-bold text-text-dark">Site Directory</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto py-2">
                  <div className="px-5 py-2 text-xs font-bold text-gray-text uppercase tracking-wider">Public Pages</div>
                  <SideLink href="/" icon={<Home className="h-4 w-4" />} label="Home" onClick={() => setMenuOpen(false)} />
                  <SideLink href="/browse" icon={<Search className="h-4 w-4" />} label="Browse" onClick={() => setMenuOpen(false)} />

                  {(user?.role === 'user' || !user) && (
                    <>
                      <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">My Account</div>
                      <SideLink href="/saved-searches" icon={<BookmarkCheck className="h-4 w-4" />} label="Saved Searches" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/favorites" icon={<Heart className="h-4 w-4" />} label="Favorites" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/profile" icon={<User className="h-4 w-4" />} label="My Profile" onClick={() => setMenuOpen(false)} />
                    </>
                  )}

                  {user?.role === 'user' && (
                    <>
                      <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">Renter Tools</div>
                      <SideLink href="/inbox" icon={<Inbox className="h-4 w-4" />} label="Inbox" onClick={() => setMenuOpen(false)} />
                      <SideLink href="#" icon={<HelpCircle className="h-4 w-4" />} label="Help Center" onClick={() => setMenuOpen(false)} />
                    </>
                  )}

                  {(!user || user.role === 'user') && (
                    <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider italic text-primary-green">Are you an Owner?</div>
                  )}

                  {user?.role === 'owner' && (
                    <>
                      <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">Property Managers</div>
                      <SideLink href="/owner/listings/create" icon={<PlusCircle className="h-4 w-4" />} label="Create Listing" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/owner/dashboard" icon={<Building className="h-4 w-4" />} label="Owner Dashboard" onClick={() => setMenuOpen(false)} />
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider text-red-alert">Admin Panel</div>
                      <SideLink href="/admin/dashboard" icon={<ChartPie className="h-4 w-4" />} label="Platform Analytics" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/admin/users" icon={<UsersRound className="h-4 w-4" />} label="User Management" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/admin/listings" icon={<Home className="h-4 w-4" />} label="Listing Management" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Global Settings" onClick={() => setMenuOpen(false)} />
                      <SideLink href="/admin/system-logs" icon={<Settings className="h-4 w-4" />} label="System Logs" onClick={() => setMenuOpen(false)} />
                    </>
                  )}
                </nav>
                {user?.role === 'owner' && (
                  <div className="p-5 border-t border-gray-border">
                    <Link
                      href="/owner/listings/create"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center bg-primary-green hover:bg-primary-green-hover text-white font-semibold py-3 rounded transition-colors"
                    >
                      + Create Listing
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 text-primary-green no-underline flex-shrink-0">
              <Home className="h-7 w-7" />
              <span className="text-2xl font-black tracking-tight text-primary-green hidden sm:inline">Makikibahay</span>
            </Link>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-text" />
              <input
                type="text"
                placeholder="Search addresses, landmarks, or schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-light/50 border border-gray-border rounded-full text-sm focus:outline-none focus:border-primary-green focus:bg-white transition-all"
              />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-text-dark">
            {user?.role === 'admin' ? (
              <Link href="/admin/dashboard" className="hover:text-primary-green transition-colors">Dashboard</Link>
            ) : (
              <Link href="/browse" className="hover:text-primary-green transition-colors">Browse</Link>
            )}
            {user?.role === 'user' && (
              <>
                <Link href="/saved-searches" className="hover:text-primary-green transition-colors">Saved Searches</Link>
                <Link href="/favorites" className="hover:text-primary-green transition-colors">Favorites</Link>
              </>
            )}
            {user?.role === 'owner' && (
              <>
                <Link href="/owner/dashboard" className="hover:text-primary-green transition-colors">Dashboard</Link>
                <Link href="/owner/metrics" className="hover:text-primary-green transition-colors">Metrics</Link>
              </>
            )}
          </nav>

          {/* Right: CTAs + Auth */}
          <div className="flex items-center gap-3">
            {/* Add a Property — for renters and guests */}
            {/* Navigation CTAs */}

            {user ? (
              <>
                {/* Notification Bell Removed */}
                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} />
                        <AvatarFallback className="bg-dark-green text-white font-bold">
                          {user.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-text">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(user.role === 'owner' || user.role === 'admin') && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={getDashboardLink()}>
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/owner/listings/create">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Listing
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.role === 'owner' && (
                      <DropdownMenuItem asChild>
                        <Link href="/owner/metrics">
                          <BarChart className="mr-2 h-4 w-4" /> Metrics
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/inbox"><Inbox className="mr-2 h-4 w-4" /> Inbox</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                    </DropdownMenuItem>
                    {user.role === 'user' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites"><Heart className="mr-2 h-4 w-4" /> Favorites</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/saved-searches"><BookmarkCheck className="mr-2 h-4 w-4" /> Saved Searches</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-alert cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="text-text-dark border border-gray-border hover:bg-gray-light font-medium"
                >
                  <Link href="/login">Login / Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

/** Reusable sidebar nav link */
function SideLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-gray-text hover:bg-[rgba(33,141,61,0.05)] hover:text-primary-green transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
