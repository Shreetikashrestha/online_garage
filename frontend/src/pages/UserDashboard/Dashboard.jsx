import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Truck, Settings, Plus, ShieldCheck, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [sosMessage, setSosMessage] = useState('Need immediate roadside assistance');
  const [sosLat, setSosLat] = useState(27.7172);
  const [sosLng, setSosLng] = useState(85.324);
  const [submittingSOS, setSubmittingSOS] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [bookRes, vehRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/user/vehicles'),
      ]);
      setBookings(bookRes.data.data.bookings || bookRes.data.data || []);
      setVehicles(vehRes.data.data.vehicles || vehRes.data.data || []);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setSosLat(pos.coords.latitude);
        setSosLng(pos.coords.longitude);
      });
    }
  }, []);

  const handleReleasePayment = async (bookingId) => {
    if (!window.confirm('Confirm service is complete to your satisfaction. This releases escrow funds to the mechanic.')) return;
    try {
      await api.post('/payments/release', { bookingId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release payment.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/bookings/${selectedBookingId}/review`, { rating, comment });
      setIsReviewOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setSubmittingSOS(true);
    try {
      await api.post('/sos/alert', { latitude: parseFloat(sosLat), longitude: parseFloat(sosLng), message: sosMessage });
      setSosSuccess(true);
      setTimeout(() => { setIsSOSOpen(false); setSosSuccess(false); }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger SOS.');
    } finally {
      setSubmittingSOS(false);
    }
  };

  const getStatusClass = (s) => ({ PENDING: 'badge-warning', ACCEPTED: 'badge-blue', EN_ROUTE: 'badge-blue', ARRIVED: 'badge-success', IN_PROGRESS: 'badge-success', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' }[s] || '');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const primaryVehicle = vehicles.find(v => v.isPrimary) || vehicles[0];
  const recentBookings = bookings.slice(0, 3);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><Spinner /></div>;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          {primaryVehicle && (
            <p style={styles.vehicleTag}>
              🚗 {primaryVehicle.make} {primaryVehicle.model} · {primaryVehicle.registrationNumber}
            </p>
          )}
        </div>
        <button className="btn btn-danger" style={styles.sosBtn} onClick={() => setIsSOSOpen(true)}>
          🚨 SOS Help
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}><AlertTriangle size={16} /><span>{error}</span></div>
      )}

      {/* Service shortcuts */}
      <div style={styles.shortcuts}>
        {[
          { icon: <Wrench size={28} color="var(--accent-primary)" />, label: 'Mechanical', sub: 'Expert diagnostics, scheduled servicing, and performance repairs.', path: '/booking/problem' },
          { icon: <Truck size={28} color="var(--warning)" />, label: 'Towing', sub: '24/7 emergency roadside recovery and vehicle transportation.', path: '/booking/problem' },
          { icon: <Settings size={28} color="var(--accent-secondary)" />, label: 'Spare Parts', sub: 'Genuine OEM components and high-quality aftermarket spares.', path: '/parts' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={styles.shortcutCard} onClick={() => navigate(s.path)} role="button" tabIndex={0}>
            <div style={styles.shortcutIcon}>{s.icon}</div>
            <h3 style={styles.shortcutLabel}>{s.label}</h3>
            <p style={styles.shortcutSub}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={styles.mainGrid}>
        {/* Recent bookings */}
        <div style={styles.bookingsCol}>
          <div className="glass-card">
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Recent bookings</h3>
              <Link to="/bookings" style={styles.viewAll}>View All</Link>
            </div>

            {bookings.length === 0 ? (
              <div style={styles.emptyState}>
                <Clock size={36} color="var(--text-muted)" />
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>No bookings yet.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/booking/problem')}>Book a Service</button>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['REF', 'TYPE', 'PROVIDER', 'DATE', 'AMOUNT', 'STATUS'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b.id} style={styles.tr}>
                        <td style={styles.td}>#{b.id.slice(-4)}</td>
                        <td style={styles.td}>{b.service?.name || 'Service'}</td>
                        <td style={styles.td}>{b.mechanic?.name || 'N/A'}</td>
                        <td style={styles.td}>{new Date(b.scheduledTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={styles.td}>${b.estimatedTotal?.toFixed(2)}</td>
                        <td style={styles.td}>
                          <span className={`badge ${getStatusClass(b.status)}`}>{b.status}</span>
                        </td>
                        <td style={styles.td}>
                          {['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status) && (
                            <button className="btn btn-secondary" style={styles.actionBtn} onClick={() => navigate(`/tracking/${b.id}`, { state: { booking: b } })}>Track</button>
                          )}
                          {b.status === 'COMPLETED' && !b.review && (
                            <button className="btn btn-secondary" style={styles.actionBtn} onClick={() => { setSelectedBookingId(b.id); setRating(5); setComment(''); setIsReviewOpen(true); }}>Review</button>
                          )}
                          {b.status === 'COMPLETED' && b.payment?.status === 'HELD_IN_ESCROW' && (
                            <button className="btn btn-success" style={styles.actionBtn} onClick={() => handleReleasePayment(b.id)}>Release</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={styles.sidebar}>
          {/* My Vehicles */}
          <div className="glass-card" style={styles.sideCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>My Vehicles</h3>
              <Link to="/vehicles" style={styles.viewAll}><Plus size={16} /> Add</Link>
            </div>
            {vehicles.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No vehicles registered.</p>
            ) : (
              vehicles.slice(0, 2).map(v => (
                <div key={v.id} style={styles.vehicleItem}>
                  <div style={styles.vehicleIcon}>🚗</div>
                  <div>
                    <p style={styles.vehicleName}>{v.make} {v.model}</p>
                    <p style={styles.vehicleSub}>{v.registrationNumber}</p>
                  </div>
                  {v.isPrimary && <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>MAIN</span>}
                </div>
              ))
            )}
            <p style={styles.vehicleFootnote}>
              {vehicles.length === 0 ? 'Add a vehicle to get started.' : `You have ${vehicles.length} registered vehicle${vehicles.length > 1 ? 's' : ''}.`}
            </p>
          </div>

          {/* Identity Verification */}
          {!user?.isIdentityVerified && (
            <div style={styles.verifyCard}>
              <ShieldCheck size={28} color="var(--warning)" />
              <h4 style={styles.verifyTitle}>Identity Verification</h4>
              <p style={styles.verifySub}>Verify your identity to unlock premium roadside features and fast-track bookings.</p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/verify-identity')}>
                Start Verification
              </button>
            </div>
          )}

          {/* Nearest Workshop */}
          <div className="glass-card" style={styles.sideCard}>
            <div style={styles.mapPreview}>
              <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80" alt="map" style={styles.mapPreviewImg} />
              <div style={styles.mapPreviewOverlay}>
                <MapPin size={16} color="#fff" />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>Nearest Workshop</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>Pioneer Square Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Write a Review">
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: n <= rating ? '#fbbf24' : 'var(--text-muted)' }}>★</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Comment</label>
            <textarea className="form-control" value={comment} onChange={e => setComment(e.target.value)} style={{ minHeight: '90px' }} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={submittingReview}>
            {submittingReview ? <Spinner size="sm" color="white" /> : 'Submit Review'}
          </button>
        </form>
      </Modal>

      {/* SOS Modal */}
      <Modal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} title="🚨 Emergency SOS">
        {sosSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <CheckCircle size={48} color="var(--success)" />
            <h3 style={{ color: '#fff', marginTop: '1rem' }}>SOS Broadcast Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Nearby mechanics have been alerted.</p>
          </div>
        ) : (
          <form onSubmit={handleTriggerSOS} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Latitude</label>
                <input type="number" step="0.000001" className="form-control" value={sosLat} onChange={e => setSosLat(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Longitude</label>
                <input type="number" step="0.000001" className="form-control" value={sosLng} onChange={e => setSosLng(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Describe Emergency</label>
              <textarea className="form-control" value={sosMessage} onChange={e => setSosMessage(e.target.value)} style={{ minHeight: '80px' }} required />
            </div>
            <button type="submit" className="btn btn-danger" style={{ width: '100%', height: '48px', fontWeight: '700' }} disabled={submittingSOS}>
              {submittingSOS ? <Spinner size="sm" color="white" /> : 'BROADCAST SOS SIGNAL'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  greeting: { fontSize: '2rem', fontWeight: '800', color: '#ffffff' },
  vehicleTag: { fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.3rem' },
  sosBtn: { fontWeight: '700', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: '#f87171', marginBottom: '1.5rem' },
  shortcuts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
  shortcutCard: { cursor: 'pointer', transition: 'transform var(--transition-normal)', ':hover': { transform: 'translateY(-4px)' } },
  shortcutIcon: { width: '52px', height: '52px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--border-color)' },
  shortcutLabel: { fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' },
  shortcutSub: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' },
  mainGrid: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
  bookingsCol: { flex: '2 1 500px' },
  sidebar: { flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' },
  viewAll: { fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', textAlign: 'center' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '0.75rem', color: 'var(--text-secondary)', verticalAlign: 'middle' },
  actionBtn: { padding: '0.3rem 0.75rem', fontSize: '0.75rem' },
  sideCard: { padding: '1.25rem' },
  vehicleItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' },
  vehicleIcon: { fontSize: '1.5rem' },
  vehicleName: { fontSize: '0.9rem', fontWeight: '600', color: '#ffffff' },
  vehicleSub: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  vehicleFootnote: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' },
  verifyCard: { backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' },
  verifyTitle: { fontSize: '1rem', fontWeight: '700', color: '#ffffff' },
  verifySub: { fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' },
  mapPreview: { position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px' },
  mapPreviewImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  mapPreviewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
};
