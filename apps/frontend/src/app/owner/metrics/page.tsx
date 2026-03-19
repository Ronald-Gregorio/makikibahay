'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/index";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/index";
import { BarChart, LineChart, PieChart, AreaChart, Pie, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from "recharts";
import { TrendingUp, Users, DollarSign, CalendarDays, Percent, LineChart as LineChartIcon } from "lucide-react";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/api/dashboard";

export default function MetricsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                // If dashboardService provides the chart arrays directly, we'll map them.
                // Assuming it returns an object matching the mock structure for now.
                const data = await dashboardService.getOwnerMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Failed to load metrics:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMetrics();
    }, []);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading Metrics Dashboard...</div>;
    }

    // Fallback safely to empty data instead of mock values
    const safeData = metrics || {};
    const occupancyData = safeData.occupancyData || [];
    const inquiryVolumeData = safeData.inquiryVolumeData || [];
    const leadSourceData = safeData.leadSourceData || [];
    const stats = safeData.stats || { occupancyRate: "0%", avgStay: "0", churnRate: "0%", conversionRate: "0%" };
    
    const chartConfig = {
        inquiries: { label: 'Inquiries', color: 'hsl(var(--primary))' },
        search: { label: 'Search', color: 'hsl(var(--chart-1))' },
        social: { label: 'Social Media', color: 'hsl(var(--chart-2))' },
        referrals: { label: 'Referrals', color: 'hsl(var(--chart-3))' },
        walkins: { label: 'Walk-ins', color: 'hsl(var(--chart-4))' },
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Key Metrics</h1>
                <p className="text-muted-foreground mt-2">
                    Analyze the performance of your listings.
                </p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.occupancyRate}</div>
                        <p className="text-xs text-muted-foreground">+2% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Length of Stay</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgStay}</div>
                        <p className="text-xs text-muted-foreground">+0.5 from last year</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.churnRate}</div>
                        <p className="text-xs text-muted-foreground">-1.2% from last quarter</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversionRate}</div>
                        <p className="text-xs text-muted-foreground">Inquiry to Lease</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inquiry Volume */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inquiry Volume</CardTitle>
                        <CardDescription>Monthly inquiries over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={inquiryVolumeData} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis />
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="inquiries" fill="var(--color-inquiries)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Lead Sources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Source of Leads</CardTitle>
                        <CardDescription>Where your tenants are coming from.</CardDescription>
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
                                    data={leadSourceData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    strokeWidth={5}
                                >
                                    <LabelList
                                        dataKey="name"
                                        className="fill-background"
                                        stroke="none"
                                        fontSize={12}
                                        formatter={(value: keyof typeof chartConfig) =>
                                            chartConfig[value]?.label
                                        }
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Occupancy Over Time</CardTitle>
                        <CardDescription>Percentage of rooms occupied each month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{ occupied: { label: 'Occupancy', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                            <AreaChart
                                data={occupancyData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            indicator="dot"
                                            formatter={(value) => `${value}%`}
                                        />
                                    }
                                />
                                <Area
                                    dataKey="occupied"
                                    type="natural"
                                    fill="var(--color-occupied)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-occupied)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
