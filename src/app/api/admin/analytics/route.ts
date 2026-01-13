import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        // 1. Parse Date Range (Moved to top)
        const { searchParams } = new URL(req.url);
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
        if (fromParam) startDate = new Date(fromParam);

        let endDate = new Date();
        if (toParam) endDate = new Date(toParam);
        endDate.setHours(23, 59, 59, 999); // End of the day

        // 2. Summary Stats (Filtered)
        const totalStats = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, 0, "$total"]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    cancelledOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
                        }
                    },
                    cancelledRevenue: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, "$total", 0]
                        }
                    },
                    avgOrderValue: {
                        $avg: {
                            $cond: [{ $ne: ["$status", "cancelled"] }, "$total", null]
                        }
                    }
                }
            }
        ]);

        const stats = totalStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

        // 3. Sales over time (Granularity)
        // Determine Granularity based on range
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dateFormat = "%Y-%m-%d"; // Default: Daily
        if (diffDays <= 2) {
            dateFormat = "%Y-%m-%d %H:00"; // Hourly for <= 2 days
        } else if (diffDays > 120) {
            dateFormat = "%Y-%m"; // Monthly for > 4 months
        }

        const salesOverTime = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "+05:30" } },
                    orders: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, 0, "$total"]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        // 4. Top Products (By Revenue)
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        // 5. Recent Orders (Last 5)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "name email")
            .select("orderNumber total status createdAt userId paymentStatus")
            .lean();

        // 6. Today's Stats
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayStats = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            }
        ]);
        const today = todayStats[0] || { revenue: 0, orders: 0 };

        // 7. Fetch Target
        // @ts-ignore
        let targetSetting = await Settings.findOne({ key: 'dailyRevenueTarget' });
        if (!targetSetting) {
            // @ts-ignore
            targetSetting = await Settings.create({ key: 'dailyRevenueTarget', value: 50000 });
        }

        return NextResponse.json({
            summary: stats,
            chartData: salesOverTime.map(item => ({
                date: item._id,
                orders: item.orders,
                revenue: item.revenue
            })),
            topProducts: topProducts.map(p => ({ name: p._id, revenue: p.revenue, sold: p.totalSold })),
            recentOrders,
            today,
            target: targetSetting.value
        });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        const { target } = await req.json();
        if (target) {
            // @ts-ignore
            await Settings.findOneAndUpdate(
                { key: 'dailyRevenueTarget' },
                { value: target },
                { upsert: true }
            );
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
