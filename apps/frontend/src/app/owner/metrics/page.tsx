'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@makikibahay/ui";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@makikibahay/ui";
import { BarChart, LineChart, PieChart, AreaChart, Pie, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from "recharts";
import { TrendingUp, Users, DollarSign, CalendarDays, Percent, LineChart as LineChartIcon } from "lucide-react";

// Mock Data
const inquiryVolumeData = [
  { month: 'Jan', inquiries: 12 },
  { month: 'Feb', inquiries: 19 },
  { month: 'Mar', inquiries: 15 },
  { month: 'Apr', inquiries: 21 },
  { month: 'May', inquiries: 25 },
  { month: 'Jun', inquiries: 18 },
];

const leadSourceData = [
  { name: 'Makikibahay Search', value: 400, fill: 'var(--color-search)' },
  { name: 'Social Media', value: 300, fill: 'var(--color-social)' },
  { name: 'Referrals', value: 200, fill: 'var(--color-referrals)' },
  { name: 'Walk-ins', value: 100, fill: 'var(--color-walkins)' },
];

const chartConfig = {
    inquiries: { label: 'Inquiries', color: 'hsl(var(--primary))' },
    search: { label: 'Search', color: 'hsl(var(--chart-1))' },
    social: { label: 'Social Media', color: 'hsl(var(--chart-2))' },
    referrals: { label: 'Referrals', color: 'hsl(var(--chart-3))' },
    walkins: { label: 'Walk-ins', color: 'hsl(var(--chart-4))' },
}

const occupancyData = [
    {
      "month": "Jan",
      "occupied": 82,
    },
    {
      "month": "Feb",
      "occupied": 85,
    },
    {
      "month": "Mar",
      "occupied": 87,
    },
    {
      "month": "Apr",
      "occupied": 86,
    },
    {
      "month": "May",
      "occupied": 90,
    },
    {
      "month": "Jun",
      "occupied": 92,
    }
]


export default function MetricsPage() {
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
                        <div className="text-2xl font-bold">92%</div>
                        <p className="text-xs text-muted-foreground">+2% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Length of Stay</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14.5 months</div>
                        <p className="text-xs text-muted-foreground">+0.5 from last year</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                         <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5.8%</div>
                        <p className="text-xs text-muted-foreground">-1.2% from last quarter</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                         <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">21%</div>
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
                        <ChartContainer config={{occupied: { label: 'Occupancy', color: 'hsl(var(--primary))'}}} className="h-[300px] w-full">
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
