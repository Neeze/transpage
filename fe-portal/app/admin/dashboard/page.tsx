"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@/components/ui/table";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
} from "recharts";
import {
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [chart, setChart] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/admin/dashboard"),
            api.get("/admin/dashboard/chart"),
        ])
            .then(([s, c]) => {
                setStats(s.data);

                const payments = c.data.payments.map((p: any) => ({
                    date: new Date(p.date).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                    }),
                    total: Number(p.total),
                }));

                const ordersByDay = c.data.ordersByDay.map((o: any) => ({
                    date: new Date(o.date).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                    }),
                    count: Number(o.count),
                }));

                const orders = c.data.orders.map((o: any) => ({
                    name: o.status,
                    value: Number(o.count),
                }));

                setChart({ payments, orders, ordersByDay });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );

    if (!stats || !chart)
        return (
            <div className="text-center text-muted-foreground">
                Không có dữ liệu
            </div>
        );

    const orderChange = parseFloat(stats.change?.order || 0);
    const userChange = parseFloat(stats.change?.user || 0);
    const revenueChange = parseFloat(stats.change?.revenue || 0);
    const completionChange = parseFloat(stats.change?.completion || 0);

    const COLORS = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ];

    return (
        <div className="space-y-8">
            {/* ─── Top Stats ─── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Người dùng" value={stats.userCount} change={userChange} />
                <StatCard title="Đơn hàng" value={stats.orderCount} change={orderChange} />
                <StatCard
                    title="Doanh thu (VND)"
                    value={stats.totalRevenue.toLocaleString("vi-VN")}
                    change={revenueChange}
                />
                <StatCard
                    title="Hoàn tất (%)"
                    value={`${stats.completionRate}%`}
                    change={completionChange}
                />
            </div>

            {/* ─── Charts ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Doanh thu theo ngày */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Doanh thu theo ngày</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ChartContainer
                            config={{
                                total: { label: "Doanh thu (VND)", color: "hsl(var(--chart-1))" },
                            }}
                            className="h-[300px] w-full"
                        >
                            <AreaChart data={chart.payments}>
                                <defs>
                                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(v) => v.toLocaleString("vi-VN")} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="hsl(var(--chart-1))"
                                    fill="url(#fillRevenue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Số lượng đơn theo ngày */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Số lượng đơn theo ngày</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ChartContainer
                            config={{
                                count: { label: "Số lượng đơn", color: "hsl(var(--chart-3))" },
                            }}
                            className="h-[300px] w-full"
                        >
                            <AreaChart data={chart.ordersByDay}>
                                <defs>
                                    <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--chart-3))"
                                    fill="url(#fillOrders)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Đơn hàng theo trạng thái (PieChart) */}
                {/* Đơn hàng theo trạng thái (PieChart) */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Đơn hàng theo trạng thái</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex justify-center items-center">
                        <ChartContainer
                            config={{
                                count: { label: "Số lượng", color: "hsl(var(--chart-2))" },
                            }}
                            className="h-[300px] w-full flex justify-center"
                        >
                            <PieChart width={320} height={300}>
                                <Pie
                                    data={chart.orders}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, value, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(1)}%`
                                    }
                                >
                                    {chart.orders.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={[
                                                "#4ade80", // xanh lá nhạt (success)
                                                "#60a5fa", // xanh dương (processing)
                                                "#fbbf24", // vàng (pending)
                                                "#f87171", // đỏ (failed)
                                                "#a78bfa", // tím (other)
                                            ][index % 5]}
                                        />
                                    ))}
                                </Pie>
                                <Legend />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

            </div>

            {/* ─── Recent Orders ─── */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Đơn hàng gần đây</CardTitle>
                    <ChangeIndicator change={orderChange} />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã Job</TableHead>
                                <TableHead>Người dùng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recentOrders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.jobId}</TableCell>
                                    <TableCell>{order.User?.username}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ─── New Users ─── */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Người dùng mới</CardTitle>
                    <ChangeIndicator change={userChange} />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recentUsers.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleString("vi-VN")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

/* ─────────────────────────────────────────────── */
function StatCard({
                      title,
                      value,
                      change,
                  }: {
    title: string;
    value: string | number;
    change: number;
}) {
    const isPositive = change >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{value}</div>
                    <div
                        className={`flex items-center gap-1 text-sm ${
                            isPositive ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{Math.abs(change)}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────── */
function ChangeIndicator({ change }: { change: number }) {
    const isPositive = change >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    return (
        <div
            className={`flex items-center gap-1 text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
            }`}
        >
            <Icon className="w-4 h-4" />
            <span>{Math.abs(change)}%</span>
        </div>
    );
}
