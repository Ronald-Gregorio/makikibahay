
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockLogs = [
    { id: 1, level: 'info', message: 'User logged in: admin@example.com', timestamp: '2024-05-30 10:00:00' },
    { id: 2, level: 'info', message: 'User viewed listing: Sunshine Residences', timestamp: '2024-05-30 10:01:00' },
    { id: 3, level: 'warn', message: 'Failed login attempt for user: test@test.com', timestamp: '2024-05-30 10:02:00' },
    { id: 4, level: 'error', message: 'Database connection failed: timeout', timestamp: '2024-05-30 10:05:00' },
];

export default function SystemLogsPage() {
    return (
        <>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">System Logs</h1>
                <p className="text-muted-foreground mt-2">
                    A stream of system activity and errors.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                    <CardDescription>Showing the last 100 log entries.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={log.level === 'error' ? 'destructive' : log.level === 'warn' ? 'secondary' : 'default'}>
                                            {log.level.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.message}</TableCell>
                                    <TableCell>{log.timestamp}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </>
    );
}
