
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/index";
import { BarChart, LineChart, PieChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
                <div className="container mx-auto px-4 py-12 text-center">Loading metrics...</div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers}</div>
                                <p className="text-xs text-muted-foreground">+2 since last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                                <Home className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalListings}</div>
                                <p className="text-xs text-muted-foreground">+1 since last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalRevenue}</div>
                                <p className="text-xs text-muted-foreground">This is a mock value</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{activeUsers}</div>
                                <p className="text-xs text-muted-foreground">Mock live users</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>New users over the last 6 months.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <LineChart data={userGrowthData} accessibilityLayer>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                        <YAxis />
                                        <Tooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Listing Status</CardTitle>
                                <CardDescription>The current status of all properties.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square h-[250px]"
                                >
                                    <PieChart>
                                        <Tooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Pie
                                            data={listingStatusData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            strokeWidth={5}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </>
    );
}
