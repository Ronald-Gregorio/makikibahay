
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Home, Shield, BarChart2, FileText, PanelLeft, PanelRight, Ticket, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/index";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/index";

const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: Home },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/admin/moderation', label: 'Moderation', icon: Shield },
    { href: '/admin/metrics', label: 'Metrics', icon: BarChart2 },
    { href: '/admin/logs', label: 'Logs', icon: FileText },
    { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
];


function AdminNav({ isCollapsed }: { isCollapsed: boolean }) {
    const pathname = usePathname();

    return (
        <TooltipProvider>
            <nav className={cn("flex flex-col gap-2", isCollapsed && "items-center")}>
                {adminNavItems.map((item) => (
                    <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    isCollapsed ? "h-9 w-9 justify-center" : "justify-start",
                                    pathname === item.href && "bg-muted text-primary"
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="flex-1">{item.label}</span>}
                                 <span className="sr-only">{item.label}</span>
                            </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">
                                {item.label}
                            </TooltipContent>
                        )}
                    </Tooltip>
                ))}
            </nav>
        </TooltipProvider>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') {
        return <div className="container mx-auto px-4 md:px-6 py-12 text-center">Loading or redirecting...</div>;
    }

  const sidebarWidth = isCollapsed ? '80px' : '280px';

  return (
    <div className="relative min-h-screen w-full flex">
      {/* Sidebar */}
      <div className={cn(
          "hidden md:flex flex-col border-r bg-muted/40 transition-[width] duration-300 ease-in-out"
        )} style={{ width: sidebarWidth }}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className={cn(
              "flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6",
              isCollapsed && "justify-center"
          )}>
            {isCollapsed ? (
                 <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)}>
                                <PanelRight className="h-5 w-5" />
                                <span className="sr-only">Expand sidebar</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Expand</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                <>
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="">Admin Panel</span>
                </Link>
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setIsCollapsed(true)}>
                                <PanelLeft className="h-4 w-4" />
                                <span className="sr-only">Toggle sidebar</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Collapse</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                </>
            )}
          </div>
          <div className="flex-1 overflow-auto py-2">
            <AdminNav isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
