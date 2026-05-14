const express = require('express');
const cors = require('cors');
const db = require('./db');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionsRouter);

// @route   GET /api/summary
// @desc    Get total income, expense, and balance
app.get('/api/summary', (req, res) => {
    try {
        const transactions = db.prepare('SELECT amount, type FROM transactions').all();

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((tx) => {
            if (tx.type === 'income') {
                totalIncome += tx.amount;
            } else if (tx.type === 'expense') {
                totalExpense += tx.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        res.json({
            totalIncome,
            totalExpense,
            balance
        });
    } catch (error) {
        console.error('Error calculating summary:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
