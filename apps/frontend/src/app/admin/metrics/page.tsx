
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/index";
import { AreaChart, Area, BarChart, LineChart, PieChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Home, DollarSign, Activity, Download, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/index";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/index";
import { Checkbox } from "@/components/ui/index";
import { Label } from "@/components/ui/index";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/index";
import { Calendar } from "@/components/ui/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { format, subMonths, subYears, startOfQuarter, endOfQuarter, subQuarters } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { dashboardService } from "@/services/api/dashboard";

// Chart config moved down

const chartConfig = {
    users: { label: 'New Users', color: 'hsl(var(--primary))' },
    active: { label: 'Active', color: 'hsl(var(--chart-1))' },
    pending: { label: 'Pending', color: 'hsl(var(--chart-2))' },
    rented: { label: 'Rented', color: 'hsl(var(--chart-3))' },
}

export default function AdminMetricsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 2),
        to: new Date(),
    });

    useEffect(() => {
        dashboardService.getAdminMetrics()
            .then(data => setMetrics(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const {
        totalUsers = 0,
        totalListings = 0,
        totalRevenue = '0',
        activeUsers = 0,
        userGrowthData = [],
        listingStatusData = []
    } = metrics || {};

    const handleExport = () => {
        // This is a placeholder for the CSV export logic.
        // In a real app, you would gather the selected data and format it as a CSV string
        // then trigger a download.
        toast({
            title: "Export Started",
            description: "Your data is being prepared for download as a CSV file.",
        });
    };

    const handleQuickRangeChange = (value: string) => {
        const now = new Date();
        switch (value) {
            case 'this-month':
                setDate({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) });
                break;
            case 'this-quarter':
                setDate({ from: startOfQuarter(now), to: endOfQuarter(now) });
                break;
            case 'last-3-months':
                setDate({ from: subMonths(now, 2), to: now });
                break;
            case 'last-quarter':
                const lastQuarter = subQuarters(now, 1);
                setDate({ from: startOfQuarter(lastQuarter), to: endOfQuarter(lastQuarter) });
                break;
            case 'last-6-months':
                setDate({ from: subMonths(now, 5), to: now });
                break;
            case 'last-year':
                setDate({ from: subYears(now, 1), to: now });
                break;
        }
    }

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Platform Metrics</h1>
                    <p className="text-muted-foreground mt-2">
                        An overview of the platform's performance.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Export Metrics</DialogTitle>
                            <DialogDescription>
                                Select the data and date range you want to export.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div>
                                <Label className="font-semibold">Metrics to Export</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="export-total-users" defaultChecked />
                                        <Label htmlFor="export-total-users" className="font-normal">Total Users</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="export-total-listings" defaultChecked />
                                        <Label htmlFor="export-total-listings" className="font-normal">Total Listings</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="export-total-revenue" defaultChecked />
                                        <Label htmlFor="export-total-revenue" className="font-normal">Total Revenue</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="export-active-now" defaultChecked />
                                        <Label htmlFor="export-active-now" className="font-normal">Active Now</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="export-user-growth" defaultChecked />
                                        <Label htmlFor="export-user-growth" className="font-normal">User Growth</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="export-listing-status" defaultChecked />
                                        <Label htmlFor="export-listing-status" className="font-normal">Listing Status</Label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label className="font-semibold">Date Range</Label>
                                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date"
                                                variant={"outline"}
                                                className={cn(
                                                    "justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date?.from ? (
                                                    date.to ? (
                                                        <>
                                                            {format(date.from, "LLL dd, y")} -{" "}
                                                            {format(date.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(date.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={date?.from}
                                                selected={date}
                                                onSelect={setDate}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Select onValueChange={handleQuickRangeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a quick range..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="this-month">This Month</SelectItem>
                                            <SelectItem value="this-quarter">This Quarter</SelectItem>
                                            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                                            <SelectItem value="last-quarter">Last Quarter</SelectItem>
                                            <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                                            <SelectItem value="last-year">Last Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleExport} type="submit">Export to CSV</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            {loading ? (
                <div className="container mx-auto px-4 py-12 text-center h-[50vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Umami-style Minimal Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        <div className="flex flex-col space-y-1 p-2">
                            <span className="text-3xl font-bold tracking-tight">{totalUsers.toLocaleString()}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</span>
                        </div>
                        <div className="flex flex-col space-y-1 p-2">
                            <span className="text-3xl font-bold tracking-tight">{totalListings.toLocaleString()}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Listings</span>
                        </div>
                        <div className="flex flex-col space-y-1 p-2">
                            <span className="text-3xl font-bold tracking-tight">{activeUsers.toLocaleString()}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Visitors</span>
                        </div>
                        <div className="flex flex-col space-y-1 p-2">
                            <span className="text-3xl font-bold tracking-tight text-primary-green">₱{(Number(totalRevenue) || 0).toLocaleString()}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</span>
                        </div>
                    </div>

                    {/* Main Umami Chart */}
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0 pt-0 pb-4">
                            <CardTitle className="text-lg font-medium">Platform Growth</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 h-[400px]">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} opacity={0.5} />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} opacity={0.5} />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Bottom Categorical Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 pt-4">
                        {/* Mock Pages / Listings List */}
                        <div>
                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <h3 className="font-semibold text-sm tracking-wide uppercase">Top Viewed Listings</h3>
                                <span className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Views</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: "/listings/manila-luxury", views: 1245, percentage: 85 },
                                    { name: "/listings/qc-studio", views: 982, percentage: 65 },
                                    { name: "/listings/bgc-solo-room", views: 754, percentage: 45 },
                                    { name: "/listings/makati-condo", views: 512, percentage: 30 },
                                    { name: "/listings/cabanatuan-house", views: 341, percentage: 20 },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col relative group">
                                        <div className="absolute top-0 left-0 h-full bg-primary/10 rounded-sm -z-10 transition-all duration-500 ease-out" style={{ width: `${item.percentage}%` }}></div>
                                        <div className="flex items-center justify-between px-2 py-1.5">
                                            <span className="text-sm truncate w-3/4">{item.name}</span>
                                            <span className="text-sm tabular-nums text-muted-foreground">{item.views.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mock Referrers / Sources List */}
                        <div>
                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <h3 className="font-semibold text-sm tracking-wide uppercase">Top Referrers</h3>
                                <span className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Visitors</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: "Google", views: 3421, percentage: 90 },
                                    { name: "Direct", views: 1845, percentage: 55 },
                                    { name: "Facebook", views: 1205, percentage: 40 },
                                    { name: "Twitter", views: 854, percentage: 25 },
                                    { name: "makikibahay.com", views: 231, percentage: 10 },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col relative group">
                                        <div className="absolute top-0 left-0 h-full bg-primary/10 rounded-sm -z-10 transition-all duration-500 ease-out" style={{ width: `${item.percentage}%` }}></div>
                                        <div className="flex items-center justify-between px-2 py-1.5">
                                            <span className="text-sm truncate w-3/4">{item.name}</span>
                                            <span className="text-sm tabular-nums text-muted-foreground">{item.views.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
