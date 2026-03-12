
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import { Button } from "@/components/ui/index";
import { Eye, ShieldAlert, User, Home, ArrowRight, Check, X, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/index";
import { Separator } from "@/components/ui/index";


import { dashboardService } from "@/services/api/dashboard";
import { useState, useEffect } from "react";

type Ticket = {
    id: number;
    reporter: { id: string; name: string; role: string; avatar: string; email: string };
    reported: { id: string; name: string; role: string; email?: string; owner?: { name: string; email: string; } };
    type: string;
    description: string;
    status: string;
    timestamp: string;
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getAdminTickets()
            .then(setTickets)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Support Tickets</h1>
                <p className="text-muted-foreground mt-2">
                    Manage and resolve reports from users and owners.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Open & In-Progress Tickets</CardTitle>
                    <CardDescription>Showing all tickets that require attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report Details</TableHead>
                                <TableHead>Reported Entity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            )}
                            {tickets.map(ticket => (
                                <TicketRow key={ticket.id} ticket={ticket} />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

function TicketRow({ ticket }: { ticket: Ticket }) {

    const getReportedEntityEmail = () => {
        if ('email' in ticket.reported) {
            return ticket.reported.email;
        }
        if ('owner' in ticket.reported && ticket.reported.owner?.email) {
            return ticket.reported.owner.email;
        }
        return '';
    }

    const reportedEntityEmail = getReportedEntityEmail();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <TableRow className="cursor-pointer">
                    <TableCell>
                        <div className="font-medium flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            <span>{ticket.type}</span>
                        </div>
                        <div className="text-muted-foreground text-xs mt-1">
                            Reported by: {ticket.reporter.name} ({ticket.reporter.role})
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {ticket.reported.role === 'listing' ? <Home className="h-4 w-4 text-muted-foreground" /> : <User className="h-4 w-4 text-muted-foreground" />}
                            <span>{ticket.reported.name}</span>
                            <Badge variant="secondary" className="capitalize">{ticket.reported.role}</Badge>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge
                            variant={ticket.status === 'Open' ? 'destructive' : ticket.status === 'In Progress' ? 'secondary' : 'default'}
                        >
                            {ticket.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {new Date(ticket.timestamp).toLocaleDateString()}
                    </TableCell>
                </TableRow>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline flex items-center gap-3">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        {ticket.type}
                    </DialogTitle>
                    <DialogDescription>Ticket #{ticket.id} &middot; Opened on {new Date(ticket.timestamp).toLocaleString()}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={ticket.reporter.avatar} alt={ticket.reporter.name} data-ai-hint="person" />
                                <AvatarFallback>{ticket.reporter.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{ticket.reporter.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">{ticket.reporter.role}</p>
                            </div>
                        </div>

                        <ArrowRight className="h-6 w-6 text-muted-foreground" />

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="font-semibold">{ticket.reported.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">{ticket.reported.role}</p>
                            </div>
                            <Avatar>
                                <AvatarFallback>
                                    {ticket.reported.role === 'listing' ? <Home /> : <User />}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Report Description</h4>
                        <Card className="bg-muted/50 p-4">
                            <p className="text-foreground">{ticket.description}</p>
                        </Card>
                    </div>
                </div>
                <DialogFooter className="flex-wrap justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/inbox?to=${ticket.reporter.email}`}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Message Reporter
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/inbox?to=${reportedEntityEmail}`}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Message {ticket.reported.role === 'listing' ? 'Owner' : 'User'}
                        </Link>
                    </Button>
                    {ticket.reported.role === 'listing' && (
                        <Button variant="secondary" asChild>
                            <Link href={`/listings/${ticket.reported.id}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" /> Review Listing
                            </Link>
                        </Button>
                    )}
                    <div className="flex-grow" />
                    <Button variant="destructive" className="bg-red-700 hover:bg-red-800">Suspend {ticket.reported.role === 'user' ? 'User' : 'Listing'}</Button>
                    <Button>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Resolved
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
