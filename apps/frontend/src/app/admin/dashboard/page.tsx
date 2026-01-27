'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Home, Shield, BarChart2, FileText, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function AdminDashboardPage() {
    const { user } = useAuth();

    if (!user || user.role !== 'admin') {
        return null; // The layout handles redirection
    }

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome, {user.name}. Manage the platform from here.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span>User Management</span>
                        </CardTitle>
                        <CardDescription>View, edit, or suspend user and owner accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/admin/users">Manage Users</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            <span>Listings Management</span>
                        </CardTitle>
                        <CardDescription>Oversee all property listings on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/listings">Manage Listings</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span>Content Moderation</span>
                        </CardTitle>
                        <CardDescription>Review and moderate user-submitted reviews and content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/admin/moderation">Moderate Content</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5" />
                            <span>Platform Metrics</span>
                        </CardTitle>
                        <CardDescription>View key performance indicators and analytics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href="/admin/metrics">View Metrics</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <span>System Logs</span>
                        </CardTitle>
                        <CardDescription>Check system activity and error logs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/logs">View Logs</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5" />
                            <span>Support Tickets</span>
                        </CardTitle>
                        <CardDescription>Review and manage user and owner reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/tickets">Manage Tickets</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
