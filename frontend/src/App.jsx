import { useState, useEffect } from 'react';
import { Wallet, Sun, Moon } from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpenseChart from './components/ExpenseChart';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  // Theme Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
    }
  }, [isDarkMode]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/transactions`),
        fetch(`${API_URL}/summary`)
      ]);

      if (!txRes.ok || !sumRes.ok) throw new Error('Failed to fetch data');

      const txData = await txRes.json();
      const sumData = await sumRes.json();

      setTransactions(txData);
      setSummary(sumData);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (newTransaction) => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });

      if (!res.ok) throw new Error('Failed to add transaction');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete transaction');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (dateFilter === 'all') return true;
    const txDate = new Date(tx.date);
    const now = new Date();
    if (dateFilter === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return txDate >= oneWeekAgo;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Date,Description,Type,Amount'];
    const csvData = filteredTransactions.map(tx => 
        `"${new Date(tx.date).toLocaleDateString()}","${tx.description}",${tx.type},${tx.amount}`
    );
    const csv = [...headers, ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };


  if (loading && transactions.length === 0) {
    return (
      <div className="app-container">
        <div className="loading-state">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Area */}
      <aside className="sidebar">
        <div className="sidebar-branding">
          <Wallet size={28} color="var(--accent-color)" />
          <h2>Reiner</h2>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Transactions
          </a>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Cards
          </a>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Payments
          </a>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <a href="#" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="dashboard-topbar">
          <div className="dashboard-title-area">
            <h1>Dashboard</h1>
          </div>
          <div className="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="topbar-actions">
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.4rem 1rem', borderRadius: '20px' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
            <button 
              className="theme-btn" 
              onClick={handleExportCSV} 
              title="Export to CSV"
              style={{ width: 'auto', padding: '0 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500 }}
            >
              Export CSV
            </button>
            <button
              className="theme-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="profile-btn">SK</button>
          </div>
        </header>

        {error ? (
          <div className="glass-panel" style={{ borderColor: 'var(--expense-color)', color: 'var(--expense-color)', marginBottom: '1rem' }}>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Top Cards Section */}
            <SummaryCards summary={summary} />

            {/* Bottom Grid Section */}
            <div className="dashboard-grid">
              {/* Left Column (Lists & Charts) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <TransactionList
                  transactions={filteredTransactions}
                  onDelete={handleDeleteTransaction}
                />
                <div style={{ height: '300px' }}>
                  <ExpenseChart transactions={filteredTransactions} />
                </div>
              </div>

              {/* Right Column (Form Panel) */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
