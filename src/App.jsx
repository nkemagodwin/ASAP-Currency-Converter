import React, { useMemo, useState } from 'react';
import './App.css';

const rates = { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1600, GHS: 15.5, JPY: 149.5 };
const currencies = [
  { code: 'USD', name: 'US Dollar', flag: 'US' },
  { code: 'EUR', name: 'Euro', flag: 'EU' },
  { code: 'GBP', name: 'British Pound', flag: 'GB' },
  { code: 'NGN', name: 'Nigerian Naira', flag: 'NG' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: 'GH' },
  { code: 'JPY', name: 'Japanese Yen', flag: 'JP' },
];

const activity = [
  { title: 'Converted USD to NGN', meta: 'Today, 10:42 AM', amount: '+₦160,000.00', type: 'positive' },
  { title: 'Added funds', meta: 'Yesterday, 4:18 PM', amount: '+$2,500.00', type: 'positive' },
  { title: 'Converted GBP to USD', meta: 'May 18, 9:05 AM', amount: '-£800.00', type: 'negative' },
];

function App() {
  const [activePage, setActivePage] = useState('Overview');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('NGN');
  const [amount, setAmount] = useState('100');
  const [notice, setNotice] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const converted = useMemo(() => {
    const value = Number(amount) || 0;
    return (value / rates[from]) * rates[to];
  }, [amount, from, to]);

  const swapCurrencies = () => { setFrom(to); setTo(from); };
  const submitConversion = (event) => {
    event.preventDefault();
    setNotice(`Conversion ready: ${Number(amount || 0).toLocaleString()} ${from} → ${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`);
  };

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : 'theme-light'}`}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><span>asap<span className="brand-muted">funds</span></span></div>
        <div className="workspace"><span className="workspace-avatar">AG</span><span><strong>Asap Group</strong><small>Personal workspace</small></span><span className="chevron">⌄</span></div>
        <nav aria-label="Main navigation">
          {['Overview', 'Convert', 'Payments', 'Activity'].map((item) => (
            <button key={item} className={`nav-item ${activePage === item ? 'active' : ''}`} onClick={() => setActivePage(item)}>
              <span className="nav-icon">{item === 'Overview' ? '◈' : item === 'Convert' ? '⇄' : item === 'Payments' ? '▣' : '◷'}</span>{item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item"><span className="nav-icon">?</span>Help center</button><button className="nav-item"><span className="nav-icon">⚙</span>Settings</button><div className="upgrade-card"><span className="upgrade-kicker">ASAP PRO</span><strong>Move money smarter.</strong><p>Unlock higher limits and priority support.</p><button onClick={() => setNotice('Pro plan upgrades are coming soon.')}>Explore Pro <span>→</span></button></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="mobile-brand">asap<span>funds</span></div><div className="topbar-actions"><button className="icon-button" aria-label="Toggle theme" onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☼' : '☾'}</button><button className="notification" aria-label="Notifications">♢<span /></button><div className="profile"><span className="profile-avatar">AG</span><span className="profile-name">Alex Green</span><span>⌄</span></div></div></header>
        <div className="content-wrap">
          <div className="page-heading"><div><p className="eyebrow">{activePage === 'Overview' ? 'Tuesday, May 20, 2026' : 'Workspace'}</p><h1>{activePage}</h1><p className="heading-copy">{activePage === 'Overview' ? 'Good morning, Alex. Here is your money at a glance.' : 'Manage your global money movement from one place.'}</p></div><button className="primary-button" onClick={() => setShowAddFunds(true)}>+ Add funds</button></div>

          {activePage === 'Overview' && <>
            <section className="metric-grid" aria-label="Account summary"><article className="metric-card highlight"><div className="metric-label">Total balance <button aria-label="Balance information">ⓘ</button></div><div className="metric-value">$24,680<span>.42</span></div><div className="metric-foot positive">↗ 8.4% <small>vs last month</small></div><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article><article className="metric-card"><div className="metric-label">Monthly volume</div><div className="metric-value">$8,420<span>.00</span></div><div className="metric-foot positive">↗ 12.7% <small>vs last month</small></div></article><article className="metric-card"><div className="metric-label">Active currencies</div><div className="metric-value">06</div><div className="metric-foot neutral">Across 4 accounts</div></article></section>
            <div className="dashboard-grid"><section className="panel converter-panel"><div className="panel-heading"><div><p className="eyebrow">Instant conversion</p><h2>Move money globally</h2></div><span className="status-pill"><i /> Live rates</span></div><form onSubmit={submitConversion}><div className="amount-field"><label>Amount</label><div className="amount-row"><input aria-label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" /><select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From currency">{currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div></div><button type="button" className="swap-button" onClick={swapCurrencies} aria-label="Swap currencies">⇅</button><div className="amount-field"><label>You receive</label><div className="amount-row"><output>{converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}</output><select value={to} onChange={(e) => setTo(e.target.value)} aria-label="To currency">{currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select></div></div><div className="rate-note">1 {from} = {(rates[to] / rates[from]).toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}<span>Rate includes a 0.35% transparent fee</span></div><button className="primary-button full-width" type="submit">Review conversion <span>→</span></button>{notice && <p className="form-notice" role="status">{notice}</p>}</form></section><section className="panel balance-panel"><div className="panel-heading"><div><p className="eyebrow">Portfolio</p><h2>Currency balances</h2></div><button className="text-button" onClick={() => setActivePage('Activity')}>View all →</button></div><div className="balance-list">{currencies.slice(0, 4).map((currency, index) => <div className="balance-row" key={currency.code}><span className={`currency-icon c-${index}`}>{currency.flag}</span><span className="currency-name"><strong>{currency.code}</strong><small>{currency.name}</small></span><span className="balance-amount"><strong>{index === 0 ? '$12,480.42' : index === 1 ? '€4,220.00' : index === 2 ? '£2,180.30' : '₦9,450,000'}</strong><small className="positive">+{index + 2}.4%</small></span></div>)}</div><button className="outline-button full-width" onClick={() => setActivePage('Payments')}>Manage balances</button></section></div>
            <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h2>Your latest money moves</h2></div><button className="text-button" onClick={() => setActivePage('Activity')}>View activity →</button></div><div className="activity-list">{activity.map(item => <div className="activity-row" key={item.title}><span className={`activity-icon ${item.type}`}>{item.type === 'positive' ? '↗' : '↙'}</span><span className="activity-title"><strong>{item.title}</strong><small>{item.meta}</small></span><strong className={item.type}>{item.amount}</strong><span className="activity-status">Completed</span></div>)}</div></section>
          </>}
          {activePage !== 'Overview' && <section className="panel empty-page"><span className="empty-icon">{activePage === 'Convert' ? '⇄' : activePage === 'Payments' ? '▣' : '◷'}</span><h2>{activePage === 'Convert' ? 'Currency converter' : activePage === 'Payments' ? 'Payment center' : 'Activity history'}</h2><p>This workspace is ready for your next move. Use the overview to convert currencies, manage balances, and track every transaction.</p><button className="primary-button" onClick={() => setActivePage('Overview')}>Back to overview</button></section>}
        </div>
      </main>
      {showAddFunds && <div className="modal-backdrop" onClick={() => setShowAddFunds(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAddFunds(false)} aria-label="Close">×</button><p className="eyebrow">Fund your account</p><h2>Add money securely</h2><p>Choose a funding method to top up your ASAP balance.</p><button className="method-button" onClick={() => { setShowAddFunds(false); setNotice('Bank transfer instructions sent to your workspace.'); }}>Bank transfer <span>→</span></button><button className="method-button" onClick={() => { setShowAddFunds(false); setNotice('Card funding is ready to configure.'); }}>Debit or credit card <span>→</span></button></div></div>}
    </div>
  );
}
export default App;
