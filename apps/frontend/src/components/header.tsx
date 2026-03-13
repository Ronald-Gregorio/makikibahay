'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/index';
import {
  Menu, Home, LogOut, User, Heart, LayoutDashboard,
  Bell, Inbox, BarChart, X, Search, BookmarkCheck,
  PlusCircle, HelpCircle, Languages, ChartPie, Vault,
  Key, UsersRound, ShieldCheck, Settings, Building
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/index';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/index';

export function AppHeader() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasNotifications = true;

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
            <button
              className="btn-icon p-2 text-text-dark hover:text-primary-green transition-colors"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 text-primary-green no-underline">
              <Home className="h-7 w-7" />
              <span className="text-2xl font-black tracking-tight text-primary-green">Makikibahay</span>
            </Link>
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
            {(!user || user.role === 'user') && (
              <Link
                href="/signup?role=owner"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 border border-gray-border rounded text-sm font-medium text-text-dark hover:bg-gray-light transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Add a Property
              </Link>
            )}

            {user ? (
              <>
                {/* Notification Bell */}
                {user.role !== 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-text-dark hover:text-primary-green">
                        <Bell className="h-5 w-5" />
                        {hasNotifications && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-alert" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/inbox">
                          <p className="font-medium">New message from Sunny Day</p>
                          <p className="text-xs text-gray-text">"Yes, the solo room is still available..."</p>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/inbox" className="w-full justify-center text-primary-green font-medium">
                          View all notifications
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

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
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardLink()}>
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={logout} className="text-red-alert">
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

      {/* ── Slide-out Side Menu ── */}
      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[998]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[999] shadow-xl flex flex-col transform transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-border">
          <span className="text-lg font-bold text-text-dark">Site Directory</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-gray-text hover:text-text-dark transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Public Pages */}
          <div className="px-5 py-2 text-xs font-bold text-gray-text uppercase tracking-wider">Public Pages</div>
          <SideLink href="/" icon={<Home className="h-4 w-4" />} label="Home" onClick={() => setMenuOpen(false)} />
          <SideLink href="/browse" icon={<Search className="h-4 w-4" />} label="Browse" onClick={() => setMenuOpen(false)} />

          {/* My Account */}
          <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">My Account</div>
          <SideLink href="/saved-searches" icon={<BookmarkCheck className="h-4 w-4" />} label="Saved Searches" onClick={() => setMenuOpen(false)} />
          <SideLink href="/favorites" icon={<Heart className="h-4 w-4" />} label="Favorites" onClick={() => setMenuOpen(false)} />
          <SideLink href="/profile" icon={<User className="h-4 w-4" />} label="My Profile" onClick={() => setMenuOpen(false)} />

          {/* Renter Tools */}
          <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">Renter Tools</div>
          <SideLink href="/inbox" icon={<Inbox className="h-4 w-4" />} label="Inbox" onClick={() => setMenuOpen(false)} />
          <SideLink href="#" icon={<Languages className="h-4 w-4" />} label="Language Selector" onClick={() => setMenuOpen(false)} />
          <SideLink href="#" icon={<HelpCircle className="h-4 w-4" />} label="Help Center" onClick={() => setMenuOpen(false)} />

          {/* Property Managers */}
          <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">Property Managers</div>
          <SideLink href="/signup?role=owner" icon={<PlusCircle className="h-4 w-4" />} label="Add Property" onClick={() => setMenuOpen(false)} />
          <SideLink href="/owner/dashboard" icon={<Building className="h-4 w-4" />} label="Owner Dashboard" onClick={() => setMenuOpen(false)} />

          {/* Admin & Dashboards */}
          <div className="px-5 py-2 mt-2 text-xs font-bold text-gray-text uppercase tracking-wider">Admin & Dashboards</div>
          <SideLink href="/admin/dashboard" icon={<ChartPie className="h-4 w-4" />} label="Platform Analytics" onClick={() => setMenuOpen(false)} />
          <SideLink href="/admin/users" icon={<UsersRound className="h-4 w-4" />} label="User Management" onClick={() => setMenuOpen(false)} />
          <SideLink href="/admin/moderation" icon={<ShieldCheck className="h-4 w-4" />} label="Content Moderation" onClick={() => setMenuOpen(false)} />
          <SideLink href="/admin/logs" icon={<Settings className="h-4 w-4" />} label="System Settings" onClick={() => setMenuOpen(false)} />
        </nav>

        {/* Drawer Footer CTA */}
        <div className="p-5 border-t border-gray-border">
          <Link
            href="/signup?role=owner"
            onClick={() => setMenuOpen(false)}
            className="block w-full text-center bg-primary-green hover:bg-primary-green-hover text-white font-semibold py-3 rounded transition-colors"
          >
            + Add Property
          </Link>
        </div>
      </aside>
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
