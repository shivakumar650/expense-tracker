import { useState } from 'react';

export default function TransactionForm({ onAddTransaction }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('expense');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description) return;

        setLoading(true);
        try {
            await onAddTransaction({
                amount: parseFloat(amount),
                description,
                type
            });

            // Reset form on success
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error('Failed to add transaction', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel highlighted" style={{ height: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#fff' }}>
                New Entry
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'space-between' }}>
                <div>
                    <div className="form-group">
                        <label htmlFor="type" style={{ color: 'rgba(255,255,255,0.8)' }}>Transaction Type</label>
                        <select
                            id="type"
                            className="form-select"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" style={{ color: 'rgba(255,255,255,0.8)' }}>Description</label>
                        <input
                            type="text"
                            id="description"
                            className="form-input"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="e.g., Groceries, Salary, Rent"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount" style={{ color: 'rgba(255,255,255,0.8)' }}>Amount</label>
                        <input
                            type="number"
                            id="amount"
                            className="form-input"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="$ 0.00"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ background: '#fff', color: 'var(--bg-color)', marginTop: '2rem' }}
                >
                    {loading ? 'Adding...' : 'Save New Entry'}
                </button>
            </form>
        </div>
    );
}
