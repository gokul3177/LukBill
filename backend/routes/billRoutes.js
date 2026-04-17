const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Create a new bill
router.post('/', async (req, res) => {
    try {
        const { billTo, billDate, items, bankAccount } = req.body;

        // Calculate grand total server-side as well for safety
        const grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        const newBill = new Bill({
            billTo,
            billDate,
            items: items.map(item => ({ ...item, total: item.quantity * item.price })),
            bankAccount,
            grandTotal
        });

        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/bills/stats — today's totals + most billed item this week
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();

        // Today boundaries
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday   = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        // This-week boundary (Monday 00:00)
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon = 0
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);

        // Today's bills count + revenue
        const todayStats = await Bill.aggregate([
            { $match: { billDate: { $gte: startOfToday, $lt: endOfToday } } },
            { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$grandTotal' } } }
        ]);

        // Most billed item this week
        const weekItems = await Bill.aggregate([
            { $match: { billDate: { $gte: startOfWeek } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' } } },
            { $sort: { totalQty: -1 } },
            { $limit: 1 }
        ]);

        res.json({
            totalBillsToday: todayStats[0]?.count    ?? 0,
            revenueToday:    todayStats[0]?.revenue  ?? 0,
            mostBilledItem:  weekItems[0]?._id       ?? 'N/A'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bills (optional search by date)
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};

        if (date) {
            // Match bills on that exact date (ignoring time if stored as ISODate, but usually we just want the day)
            // Assuming the frontend sends YYYY-MM-DD
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            query.billDate = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const bills = await Bill.find(query).sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
