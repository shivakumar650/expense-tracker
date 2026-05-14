import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function ExpenseChart({ transactions }) {

    // Prepare data for the chart by grouping amounts by date (or displaying them sequentially)
    // For a simple tracking app, we'll map the recent transactions and display their values.
    // We'll reverse the array to show the oldest first on the left of the chart.
    const chartData = [...transactions].reverse().map(tx => {
        return {
            name: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            income: tx.type === 'income' ? tx.amount : 0,
            expense: tx.type === 'expense' ? tx.amount : 0,
            desc: tx.description
        };
    });

    if (transactions.length === 0) {
        return (
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Add data to see chart</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(26, 22, 45, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{label} - {payload[0]?.payload.desc}</p>
                    {payload.map((entry, index) => (
                        entry.value > 0 && (
                            <p key={index} style={{ margin: '0.25rem 0 0', color: entry.color, fontWeight: 600 }}>
                                {entry.name}: ${entry.value}
                            </p> // Changed to $ to match UI requirement visually
                        )
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ paddingBottom: '0.5rem', marginBottom: '1rem', borderBottom: 'none', fontSize: '1.25rem', color: '#fff' }}>
                Spending Overview
            </h2>
            <div className="chart-container" style={{ flex: 1, minHeight: '0', marginTop: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                        <Line type="monotone" dataKey="income" name="Income" stroke="var(--income-color)" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--income-color)' }} />
                        <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--expense-color)" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--expense-color)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
