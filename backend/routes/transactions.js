const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/transactions
// @desc    Get all transactions
router.get('/', (req, res) => {
    try {
        const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
router.post('/', (req, res) => {
    const { amount, description, type, date } = req.body;

    if (!amount || !description || !type) {
        return res.status(400).json({ error: 'Please provide amount, description, and type' });
    }

    try {
        const insertDate = date || new Date().toISOString();
        const insert = db.prepare('INSERT INTO transactions (amount, description, type, date) VALUES (?, ?, ?, ?)');
        const result = insert.run(amount, description, type, insertDate);

        // Fetch the newly inserted transaction
        const newTransaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const info = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ success: true, message: 'Transaction removed' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
