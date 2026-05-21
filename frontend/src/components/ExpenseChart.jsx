import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function ExpenseChart({ transactions }) {
    
    // Filter only expenses and group by description (as category)
    const expenses = transactions.filter(tx => tx.type === 'expense');
    
    const categoryTotals = expenses.reduce((acc, tx) => {
        // We'll use the first word of the description as a rough category if it's long, or just the whole string
        const category = tx.description.split(' ')[0].substring(0, 15); 
        acc[category] = (acc[category] || 0) + tx.amount;
        return acc;
    }, {});

    const chartData = Object.keys(categoryTotals).map(key => ({
        name: key,
        value: categoryTotals[key]
    })).sort((a, b) => b.value - a.value);

    // Modern professional color palette for the Pie Chart
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    if (transactions.length === 0 || chartData.length === 0) {
        return (
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Add expenses to see category breakdown</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>
                        {payload[0].name}: ${payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ paddingBottom: '0.5rem', marginBottom: '1rem', borderBottom: 'none', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Expense Breakdown
            </h2>
            <div className="chart-container" style={{ flex: 1, minHeight: '0', marginTop: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
