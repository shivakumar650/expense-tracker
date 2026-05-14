import { IndianRupee, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function SummaryCards({ summary }) {
    // Add fallback in case summary is null or undefined
    const { totalIncome = 0, totalExpense = 0, balance = 0 } = summary || {};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'USD', // The image shows dollars, but we'll use local mapping to INR symbols or leave as INR
        }).format(amount).replace('₹', '$'); // Force '$' look to mimic UI, but you can revert to ₹ if needed. Let's stick to $ as per UI mockup for looks.
    };

    return (
        <div className="summary-cards-wrapper">
            <div className="summary-card primary">
                <div className="card-label">
                    Main Balance
                </div>
                <div className="card-amount">
                    {formatCurrency(balance)}
                </div>
                <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                    Active since Jan 2024
                </div>
            </div>

            <div className="summary-card secondary">
                <div>
                    <div className="card-label">
                        <ArrowUpCircle size={16} color="var(--income-color)" /> Extra Income
                    </div>
                    <div className="card-amount small" style={{ color: 'var(--income-color)' }}>
                        {formatCurrency(totalIncome)}
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="card-label">
                        <ArrowDownCircle size={16} color="var(--expense-color)" /> Total Expenses
                    </div>
                    <div className="card-amount small" style={{ color: 'var(--expense-color)' }}>
                        {formatCurrency(totalExpense)}
                    </div>
                </div>
            </div>
        </div>
    );
}
