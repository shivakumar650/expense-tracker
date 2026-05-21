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

    const activeColor = type === 'income' ? 'var(--income-color)' : 'var(--expense-color)';
    const inputStyle = { 
        background: 'var(--input-bg)', 
        border: `1px solid ${type === 'income' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        transition: 'all 0.3s ease'
    };

    return (
        <div className="glass-panel highlighted" style={{ height: '100%', background: 'var(--panel-bg)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                New Entry
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 3rem)', justifyContent: 'space-between' }}>
                <div>
                    <div className="form-group">
                        <label htmlFor="type" style={{ color: 'var(--text-secondary)' }}>Transaction Type</label>
                        <select
                            id="type"
                            className="form-select"
                            style={inputStyle}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" style={{ color: 'var(--text-secondary)' }}>Description / Category</label>
                        <input
                            type="text"
                            id="description"
                            className="form-input"
                            style={inputStyle}
                            placeholder="e.g., Groceries, Salary, Rent"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount" style={{ color: 'var(--text-secondary)' }}>Amount</label>
                        <input
                            type="number"
                            id="amount"
                            className="form-input"
                            style={inputStyle}
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
                    style={{ background: activeColor, color: '#fff', marginTop: '2rem' }}
                >
                    {loading ? 'Adding...' : 'Save New Entry'}
                </button>
            </form>
        </div>
    );
}
