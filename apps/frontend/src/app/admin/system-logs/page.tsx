
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import { Input } from "@/components/ui/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index";
import { Search, FileText, UserPlus, Home, MessageSquare, Star, AlertCircle } from "lucide-react";
import { dashboardService } from "@/services/api/dashboard";

type LogEntry = {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    source: string;
};

const typeIconMap: Record<string, any> = {
    user_registration: UserPlus,
    listing_created: Home,
    review_submitted: Star,
    message_sent: MessageSquare,
};

const levelColorMap: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-600 border-blue-200',
    warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    error: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');

    useEffect(() => {
        dashboardService.getAdminSystemLogs()
            .then(data => setLogs(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = logs;

        if (searchQuery) {
            result = result.filter(log =>
                log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sourceFilter !== 'all') {
            result = result.filter(log => log.source === sourceFilter);
        }

        setFilteredLogs(result);
    }, [searchQuery, sourceFilter, logs]);

    const uniqueSources = [...new Set(logs.map(l => l.source))];

    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">System Logs</h1>
                <p className="text-muted-foreground mt-2">
                    Activity log derived from recent platform activity.
                </p>
            </header>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter by source..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            {uniqueSources.map(source => (
                                <SelectItem key={source} value={source} className="capitalize">{source}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>{filteredLogs.length} entries found.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Loading logs...</TableCell>
                                </TableRow>
                            )}
                            {!loading && filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        No log entries found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredLogs.map(log => {
                                const IconComponent = typeIconMap[log.type] || FileText;
                                return (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm">{log.message}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{log.source}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${levelColorMap[log.level] || ''} capitalize`}>
                                                {log.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
