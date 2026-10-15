const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, beforeEach, test } = require('node:test');
const { once } = require('node:events');

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'expense-tracker-test-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'transactions.db');

const db = require('../db');
const app = require('../server');
let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
    db.prepare('DELETE FROM transactions').run();
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    db.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

async function request(url, options) {
    const response = await fetch(`${baseUrl}${url}`, options);
    return { response, body: await response.json() };
}

test('health endpoint reports the service as ready', async () => {
    const { response, body } = await request('/health');

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
});

test('empty transaction list and summary are returned correctly', async () => {
    const [transactions, summary] = await Promise.all([
        request('/api/transactions'),
        request('/api/summary')
    ]);

    assert.equal(transactions.response.status, 200);
    assert.deepEqual(transactions.body, []);
    assert.equal(summary.response.status, 200);
    assert.deepEqual(summary.body, { totalIncome: 0, totalExpense: 0, balance: 0 });
});

test('invalid transaction payloads are rejected with a client error', async () => {
    const invalidTransactions = [
        { amount: 0, description: 'Zero', type: 'expense' },
        { amount: -1, description: 'Negative', type: 'expense' },
        { amount: '12', description: 'String amount', type: 'expense' },
        { amount: 12, description: 'Invalid type', type: 'transfer' },
        { amount: 12, description: '   ', type: 'income' },
        { description: 'Missing amount', type: 'income' }
    ];

    for (const transaction of invalidTransactions) {
        const { response } = await request('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        assert.equal(response.status, 400);
    }
});

test('transactions can be created, listed, summarized, and deleted', async () => {
    const create = async (transaction) => request('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });

    const expense = await create({ amount: 12.5, description: 'Lunch', type: 'expense' });
    const income = await create({ amount: 30, description: 'Refund', type: 'income' });

    assert.equal(expense.response.status, 201);
    assert.equal(income.response.status, 201);

    const transactions = await request('/api/transactions');
    assert.equal(transactions.body.length, 2);

    const summary = await request('/api/summary');
    assert.deepEqual(summary.body, { totalIncome: 30, totalExpense: 12.5, balance: 17.5 });

    const deleted = await request(`/api/transactions/${expense.body.id}`, { method: 'DELETE' });
    assert.equal(deleted.response.status, 200);
    assert.deepEqual(deleted.body, { success: true, message: 'Transaction removed' });

    const missing = await request(`/api/transactions/${expense.body.id}`, { method: 'DELETE' });
    assert.equal(missing.response.status, 404);
});
