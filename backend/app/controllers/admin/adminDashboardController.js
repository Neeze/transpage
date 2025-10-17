const { sequelize, User, Order, Payment, ActivityLog, ApiKey } = require("../../models");
const { Op } = require("sequelize");

// ========== DASHBOARD SUMMARY ==========
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            userCount,
            orderCount,
            paymentSum,
            successfulOrders,
            prevUsers,
            prevOrders,
            prevRevenue,
            prevSuccessOrders,
            recentOrders,
            recentUsers,
        ] = await Promise.all([
            User.count(),
            Order.count(),
            Payment.sum("amount", { where: { status: "success" } }),
            Order.count({ where: { status: "done" } }),

            User.count({ where: { createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] } } }),
            Order.count({ where: { createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] } } }),
            Payment.sum("amount", {
                where: {
                    status: "success",
                    createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] },
                },
            }),
            Order.count({
                where: {
                    status: "done",
                    createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] },
                },
            }),

            Order.findAll({
                limit: 5,
                order: [["createdAt", "DESC"]],
                include: [{ model: User, attributes: ["username", "email"] }],
            }),
            User.findAll({ limit: 5, order: [["createdAt", "DESC"]] }),
        ]);

        const completionRate = orderCount > 0 ? (successfulOrders / orderCount) * 100 : 0;
        const prevCompletion = prevOrders > 0 ? (prevSuccessOrders / prevOrders) * 100 : 0;

        const pctChange = (curr, prev) =>
            prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : "0.0";

        return res.json({
            userCount,
            orderCount,
            totalRevenue: paymentSum || 0,
            completionRate: completionRate.toFixed(1),
            recentOrders,
            recentUsers,
            change: {
                user: pctChange(userCount, prevUsers),
                order: pctChange(orderCount, prevOrders),
                revenue: pctChange(paymentSum || 0, prevRevenue || 0),
                completion: pctChange(completionRate, prevCompletion),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// ========== CHARTS ==========
exports.getDashboardChart = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const whereDate = {
            createdAt: {
                [Op.between]: [startDate || '2024-01-01', endDate || new Date()],
            },
        };

        const payments = await Payment.findAll({
            where: { ...whereDate, status: "success" },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
            ],
            group: ['date'],
            order: [['date', 'ASC']],
            raw: true,
        });

        const ordersByDay = await Order.findAll({
            where: whereDate,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['date'],
            order: [['date', 'ASC']],
            raw: true,
        });

        const orders = await Order.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status'],
            raw: true,
        });

        res.json({ payments, orders, ordersByDay });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// ========== ACTIVITY LOGS ==========
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            include: [{ model: User, attributes: ["username", "email"] }],
            order: [["createdAt", "DESC"]],
            limit: 50,
        });
        return res.json(logs);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
};
