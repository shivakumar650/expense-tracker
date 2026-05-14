import { Trash2, AlertCircle } from 'lucide-react';

export default function TransactionList({ transactions, onDelete }) {

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'USD',
        }).format(amount).replace('₹', '$');
    };

    return (
        <div className="glass-panel" style={{ flex: 1 }}>
            <h2 className="transaction-list-header">Recent Transactions</h2>

            {transactions.length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={40} />
                    <p>No transactions yet.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Add your first income or expense!</p>
                </div>
            ) : (
                <div className="transaction-list">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="transaction-item">
                            <div className="transaction-info">
                                <span className="transaction-desc">{tx.description}</span>
                                <span className="transaction-date">{formatDate(tx.date)}</span>
                            </div>
                            <div className="transaction-meta">
                                <span className={`transaction-amount ${tx.type}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(tx.id)}
                                    title="Delete transaction"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
