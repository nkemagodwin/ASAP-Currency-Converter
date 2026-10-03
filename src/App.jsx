import React, { useMemo, useState } from 'react';
import './App.css';

const currencies = [
  { code: 'USD', name: 'US Dollar', flag: 'US', balance: 12480.42, color: 'blue' },
  { code: 'NGN', name: 'Nigerian Naira', flag: 'NG', balance: 8640000, color: 'orange' },
  { code: 'EUR', name: 'Euro', flag: 'EU', balance: 3850.15, color: 'purple' },
  { code: 'GBP', name: 'British Pound', flag: 'GB', balance: 1205.8, color: 'green' },
];
const rates = { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1600, GHS: 15.5, JPY: 149.5 };
const activity = [
  { title: 'Converted USD to NGN', detail: 'Today, 10:42 AM', amount: '+₦160,000.00', status: 'Completed', icon: '↗' },
  { title: 'Funds added via bank transfer', detail: 'Yesterday, 4:18 PM', amount: '+$2,500.00', status: 'Completed', icon: '+' },
  { title: 'Converted GBP to USD', detail: 'May 18, 9:05 AM', amount: '-£800.00', status: 'Completed', icon: '↙' },
  { title: 'Payment to Meridian Labs', detail: 'May 17, 2:30 PM', amount: '-$420.00', status: 'Completed', icon: '−' },
];

function App() {
  const [page, setPage] = useState('Overview');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('NGN');
  const [amount, setAmount] = useState('100');
  const [dark, setDark] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const converted = useMemo(() => ((Number(amount) || 0) / rates[from]) * rates[to], [amount, from, to]);
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3500); };
  const nav = (next) => setPage(next);
  const submitConversion = (event) => { event.preventDefault(); notify(`Conversion ready: ${Number(amount || 0).toLocaleString()} ${from} to ${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`); };

  return (
    <div className={`app-shell ${dark ? 'theme-dark' : 'theme-light'}`}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><span>asap<span className="brand-muted">funds</span></span></div>
        <button className="workspace-switcher"><span className="workspace-avatar">AG</span><span><b>Asap Group</b><small>Personal workspace</small></span><span className="chevron">⌄</span></button>
        <p className="nav-label">Workspace</p>
        <nav aria-label="Main navigation">
          {['Overview', 'Convert', 'Payments', 'Activity'].map((item) => <button key={item} className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => nav(item)}><span className="nav-icon">{item === 'Overview' ? '◈' : item === 'Convert' ? '⇄' : item === 'Payments' ? '▣' : '◷'}</span>{item}<span className="nav-count">{item === 'Payments' ? '3' : ''}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><p className="nav-label">Support</p><button className="nav-item" onClick={() => notify('Help center is opening soon.')}> <span className="nav-icon">?</span>Help center</button><button className="nav-item" onClick={() => setModal('settings')}><span className="nav-icon">⚙</span>Settings</button><div className="upgrade-card"><span className="upgrade-kicker">ASAP PRO</span><strong>Move money smarter.</strong><p>Higher limits, team approvals, and priority support.</p><button onClick={() => notify('Pro plan upgrades are coming soon.')}>Explore Pro <span>→</span></button></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">A</span> asap<span>funds</span></div><div className="topbar-actions"><button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? '☼' : '☾'}</button><button className="notification" aria-label="Notifications" onClick={() => notify('You are all caught up.')}>♢<i /></button><button className="profile"><span className="profile-avatar">AG</span><span className="profile-name">Alex Green</span><span>⌄</span></button></div></header>
        <div className="content-wrap">
          <div className="page-heading"><div><p className="eyebrow">Tuesday, May 20, 2026</p><h1>{page}</h1><p className="heading-copy">{page === 'Overview' ? 'Good morning, Alex. Here is your money at a glance.' : `Manage your ${page.toLowerCase()} from one simple workspace.`}</p></div><button className="primary-button" onClick={() => setModal('funds')}>+ Add funds</button></div>
          {page === 'Overview' && <Overview amount={amount} setAmount={setAmount} from={from} setFrom={setFrom} to={to} setTo={setTo} converted={converted} submitConversion={submitConversion} nav={nav} notify={notify} />}
          {page === 'Convert' && <section className="panel page-panel"><div className="panel-heading"><div><p className="eyebrow">Instant conversion</p><h2>Exchange currencies</h2></div><span className="status-pill"><i /> Live rates</span></div><Converter amount={amount} setAmount={setAmount} from={from} setFrom={setFrom} to={to} setTo={setTo} converted={converted} submitConversion={submitConversion} /></section>}
          {page === 'Payments' && <Payments notify={notify} />}
          {page === 'Activity' && <Activity />}
        </div>
      </main>
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
      {modal && <Modal type={modal} close={() => setModal(null)} notify={notify} />}
    </div>
  );
}

function Overview({ amount, setAmount, from, setFrom, to, setTo, converted, submitConversion, nav, notify }) {
  return <>
    <section className="metric-grid"><article className="metric-card highlight"><div className="metric-label">Total balance <span>ⓘ</span></div><div className="metric-value">$24,680<span>.42</span></div><div className="metric-foot positive">↗ 8.4% <small>vs last month</small></div><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article><article className="metric-card"><div className="metric-label">Monthly volume</div><div className="metric-value">$8,420<span>.00</span></div><div className="metric-foot positive">↗ 12.7% <small>vs last month</small></div><div className="metric-bar"><i /></div></article><article className="metric-card"><div className="metric-label">Active currencies</div><div className="metric-value">06</div><div className="metric-foot neutral">Across 4 accounts</div><div className="currency-dots"><i>US</i><i>EU</i><i>NG</i><i>+3</i></div></article></section>
    <div className="dashboard-grid"><section className="panel converter-panel"><div className="panel-heading"><div><p className="eyebrow">Instant conversion</p><h2>Move money globally</h2></div><span className="status-pill"><i /> Live rates</span></div><Converter {...{ amount, setAmount, from, setFrom, to, setTo, converted, submitConversion }} /></section><section className="panel balance-panel"><div className="panel-heading"><div><p className="eyebrow">Portfolio</p><h2>Currency balances</h2></div><button className="text-button" onClick={() => nav('Activity')}>View all →</button></div><div className="balance-list">{currencies.map((currency) => <div className="balance-row" key={currency.code}><span className={`currency-icon ${currency.color}`}>{currency.flag}</span><span className="currency-name"><b>{currency.code}</b><small>{currency.name}</small></span><strong>{currency.code === 'NGN' ? '₦8,640,000.00' : `${currency.code === 'EUR' ? '€' : currency.code === 'GBP' ? '£' : '$'}${currency.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</strong></div>)}</div><button className="outline-button full-width" onClick={() => notify('Add a new currency from Settings.')}>+ Add currency</button></section></div>
    <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h2>Your latest money moves</h2></div><button className="text-button" onClick={() => nav('Activity')}>View activity →</button></div><div className="activity-list">{activity.slice(0, 3).map((item) => <ActivityRow item={item} key={item.title} />)}</div></section>
  </>;
}

function Converter({ amount, setAmount, from, setFrom, to, setTo, converted, submitConversion }) {
  return <form onSubmit={submitConversion}><div className="conversion-fields"><div className="amount-field"><label htmlFor="amount">You send</label><div className="amount-row"><input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" /><select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From currency">{Object.keys(rates).map((code) => <option key={code}>{code}</option>)}</select></div></div><button type="button" className="swap-button" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap currencies">⇅</button><div className="amount-field"><label htmlFor="receive">You receive</label><div className="amount-row"><output id="receive">{converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}</output><select value={to} onChange={(e) => setTo(e.target.value)} aria-label="To currency">{Object.keys(rates).map((code) => <option key={code}>{code}</option>)}</select></div></div></div><div className="rate-note">1 {from} = {(rates[to] / rates[from]).toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}<span>Rate includes a 0.35% transparent fee</span></div><button className="primary-button full-width" type="submit">Review conversion <span>→</span></button></form>;
}

function ActivityRow({ item }) { return <div className="activity-row"><span className="activity-icon">{item.icon}</span><span className="activity-title"><b>{item.title}</b><small>{item.detail}</small></span><strong className={item.amount.startsWith('+') ? 'positive' : ''}>{item.amount}</strong><span className="activity-status">{item.status}</span></div>; }
function Activity() { return <section className="panel page-panel"><div className="panel-heading"><div><p className="eyebrow">All activity</p><h2>Transaction history</h2></div><button className="outline-button" onClick={() => window.print()}>Export CSV</button></div><div className="activity-list">{activity.map((item) => <ActivityRow item={item} key={item.title} />)}</div></section>; }
function Payments({ notify }) { return <section className="panel page-panel"><div className="panel-heading"><div><p className="eyebrow">Outbound payments</p><h2>Payment center</h2></div><button className="primary-button" onClick={() => notify('Payment creation is ready to configure.')}>New payment</button></div><div className="payment-grid"><div className="payment-card"><span className="payment-symbol">↗</span><b>Vendor payments</b><p>Pay suppliers and contractors in 40+ currencies.</p><button onClick={() => notify('Vendor payment flow opened.')}>Make a payment →</button></div><div className="payment-card"><span className="payment-symbol">▣</span><b>Scheduled payments</b><p>Automate recurring payments with full control.</p><button onClick={() => notify('No scheduled payments yet.')}>View schedule →</button></div></div></section>; }
function Modal({ type, close, notify }) { return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={close} aria-label="Close">×</button><p className="eyebrow">{type === 'funds' ? 'Fund your account' : 'Workspace settings'}</p><h2>{type === 'funds' ? 'Add money securely' : 'Make ASAP yours'}</h2><p>{type === 'funds' ? 'Choose a funding method to top up your workspace balance.' : 'Manage team access, notifications, and your workspace preferences.'}</p>{type === 'funds' ? <><button className="method-button" onClick={() => { close(); notify('Bank transfer instructions sent to your workspace.'); }}>Bank transfer <span>→</span></button><button className="method-button" onClick={() => { close(); notify('Card funding is ready to configure.'); }}>Debit or credit card <span>→</span></button></> : <button className="primary-button full-width" onClick={close}>Save preferences</button>}</div></div>; }
export default App;
