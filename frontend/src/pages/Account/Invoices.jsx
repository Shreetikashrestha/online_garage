import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Filter, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const STATUS_STYLE = {
  PAID: { color: 'var(--success)', background: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  PENDING: { color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
  OVERDUE: { color: '#f87171', background: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  REFUNDED: { color: 'var(--accent-primary)', background: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  FAILED: { color: '#f87171', background: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

const PAYMENT_STATUS_MAP = {
  HELD_IN_ESCROW: 'PAID',
  RELEASED: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
};

function bookingToInvoice(booking) {
  const payment = booking.payment;
  const displayStatus = payment ? PAYMENT_STATUS_MAP[payment.status] || 'PENDING' : 'PENDING';
  return {
    id: booking.id,
    displayId: `#INV-${booking.id.slice(-5).toUpperCase()}`,
    date: new Date(booking.createdAt),
    service: booking.service?.name || 'Service',
    vehicle: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : '—',
    registrationNumber: booking.vehicle?.registrationNumber || '',
    provider: booking.mechanic?.name || '—',
    amount: booking.finalTotal ?? booking.estimatedTotal ?? 0,
    status: displayStatus,
    bookingStatus: booking.status,
  };
}

export default function Invoices() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All Time');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const invoices = bookings.map(bookingToInvoice);

  const totalSpend = invoices
    .filter(i => i.status === 'PAID')
    .reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices
    .filter(i => i.status === 'FAILED' || (i.status === 'PENDING' && i.bookingStatus !== 'CANCELLED'))
    .reduce((s, i) => s + i.amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'FAILED').length;
  const pendingCount = invoices.filter(i => i.status === 'PENDING' && i.bookingStatus !== 'CANCELLED').length;

  const lastServiceDate = invoices.length > 0
    ? invoices.reduce((latest, i) => i.date > latest ? i.date : latest, invoices[0].date)
    : null;

  const now = new Date();
  const filtered = invoices.filter(i => {
    if (filter === 'This Year' && i.date.getFullYear() !== now.getFullYear()) return false;
    if (filter === 'Last 6 Months') {
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      if (i.date < sixMonthsAgo) return false;
    }
    const q = search.toLowerCase();
    if (q && !i.displayId.toLowerCase().includes(q) && !i.service.toLowerCase().includes(q) && !i.vehicle.toLowerCase().includes(q)) return false;
    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><Spinner /></div>;

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>TOTAL LIFETIME SPENDING</p>
          <p style={styles.statVal}>${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>OUTSTANDING BALANCE</p>
          <p style={{ ...styles.statVal, color: outstanding > 0 ? '#f87171' : 'var(--success)' }}>
            ${outstanding.toFixed(2)}
          </p>
          {overdueCount > 0 && <p style={styles.statSub}>⚠ {overdueCount} Overdue</p>}
          {pendingCount > 0 && <p style={{ ...styles.statSub, color: '#fbbf24' }}>⏳ {pendingCount} Pending</p>}
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>LAST SERVICE DATE</p>
          <p style={styles.statVal}>
            {lastServiceDate
              ? lastServiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      <div className="glass-card">
        <div style={styles.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={styles.sectionTitle}>Invoice History</h3>
            {overdueCount > 0 && (
              <span style={styles.overdueAlert}>
                <AlertTriangle size={14} /> {overdueCount} Overdue
              </span>
            )}
          </div>
          <div style={styles.tableActions}>
            <div style={styles.searchWrapper}>
              <Search size={13} style={styles.searchIcon} />
              <input
                type="text"
                className="form-control"
                placeholder="Search invoices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '1.8rem', height: '34px', fontSize: '0.82rem' }}
              />
            </div>
            <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ height: '34px', fontSize: '0.82rem', width: '120px' }}>
              <option>All Time</option>
              <option>This Year</option>
              <option>Last 6 Months</option>
            </select>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Invoice ID', 'Date', 'Service', 'Vehicle', 'Provider', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => {
                  const statusStyle = STATUS_STYLE[inv.status] || STATUS_STYLE.PENDING;
                  return (
                    <tr key={inv.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#fff', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {inv.displayId}
                      </td>
                      <td style={styles.td}>{inv.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={styles.td}>{inv.service}</td>
                      <td style={styles.td}>
                        {inv.vehicle}
                        {inv.registrationNumber && (
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {inv.registrationNumber}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>{inv.provider}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#fff' }}>
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td style={styles.td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: '700', backgroundColor: statusStyle.background, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary" style={styles.actionBtn} title="Download PDF">
                            <Download size={13} />PDF
                          </button>
                          {inv.status === 'FAILED' && (
                            <button
                              className="btn btn-danger"
                              style={styles.actionBtn}
                              onClick={() => navigate(`/booking/payment-failed?booking=${inv.id}`)}
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div style={styles.pagination}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' },
  statCard: { padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' },
  statLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' },
  statVal: { fontSize: '1.5rem', fontWeight: '800', color: '#fff' },
  statSub: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#fff' },
  overdueAlert: { display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' },
  tableActions: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  searchWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '700px' },
  th: { textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '0.85rem 0.75rem', color: 'var(--text-secondary)', verticalAlign: 'middle' },
  actionBtn: { padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' },
};
