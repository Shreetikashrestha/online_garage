import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const getStatusBadge = (s) => {
    const map = {
      PENDING: 'badge-warning',
      ACCEPTED: 'badge-blue',
      EN_ROUTE: 'badge-blue',
      ARRIVED: 'badge-success',
      IN_PROGRESS: 'badge-success',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    return map[s] || '';
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const primaryVehicle = vehicles.find(v => v.isPrimary) || vehicles[0];
  const recentBookings = bookings.slice(0, 5);
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><Spinner /></div>;

  return (
    <div className="w-full animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Sidebar + Main Content Flex */}
      <div className="flex gap-0 relative">
        {/* Side Navigation */}
        <aside className="hidden xl:flex flex-col w-[260px] flex-shrink-0 bg-[#1A1A1A] rounded-xl border border-outline-variant self-start sticky top-24">
          <div className="px-lg pt-lg pb-md">
            <h2 className="font-headline-sm text-headline-sm text-white">Account Management</h2>
            <p className="font-label-md text-label-md text-on-tertiary-container" style={{ color: '#9ca3af' }}>Vehicle &amp; Service Control</p>
          </div>
          <nav className="flex flex-col flex-grow">
            <a className="border-l-4 border-secondary-container bg-tertiary-container px-lg py-3 flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#fff', borderLeftColor: '#8fb7fe', backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={e => e.preventDefault()}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span> Dashboard
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/vehicles'); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>directions_car</span> My Vehicles
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/bookings'); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>history</span> Booking History
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/invoices'); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span> Payments
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/settings'); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span> Settings
            </a>
          </nav>
          <div className="p-lg mt-auto flex flex-col gap-md" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button className="btn btn-primary w-full" onClick={() => navigate('/vehicles')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add New Vehicle
            </button>
            <div className="flex flex-col gap-2 pt-md">
              <a className="flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help</span> Help Center
              </a>
              <a className="flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); useAuthStore.getState().logout(); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span> Sign Out
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 xl:pl-lg">
          {/* Greeting Strip */}
          <section className="bg-[#1A1A1A] rounded-xl px-lg py-xl mb-xl border border-outline-variant">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg mb-1 text-white">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
                {primaryVehicle && (
                  <p className="font-body-md text-body-md opacity-80 flex items-center gap-2" style={{ color: '#9ca3af' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>directions_car</span>
                    {primaryVehicle.make} {primaryVehicle.model} · {primaryVehicle.registrationNumber}
                  </p>
                )}
              </div>
              <button className="bg-[#B71C1C] text-white font-button-text text-button-text px-md py-2 rounded-lg sos-shadow hover:opacity-90 transition-all flex items-center gap-2" onClick={() => setIsSOSOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>emergency</span> 🚨 SOS Help
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-lg py-3 rounded-lg mb-xl" style={{ color: '#f87171' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xxl">
            <div className="glass-card cursor-pointer group" onClick={() => navigate('/booking/problem')} role="button" tabIndex={0}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-md group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--accent-primary)', fontSize: '24px' }}>build</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-1 text-white">Mechanical</h3>
              <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>Expert diagnostics, scheduled servicing, and performance repairs.</p>
            </div>
            <div className="glass-card cursor-pointer group" onClick={() => navigate('/booking/problem')} role="button" tabIndex={0}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-md group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: '24px' }}>auto_towing</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-1 text-white">Towing</h3>
              <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>24/7 emergency roadside recovery and vehicle transportation.</p>
            </div>
            <div className="glass-card cursor-pointer group" onClick={() => navigate('/parts')} role="button" tabIndex={0}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-md group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--accent-secondary)', fontSize: '24px' }}>inventory_2</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-1 text-white">Spare Parts</h3>
              <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>Genuine OEM components and high-quality aftermarket spares.</p>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
            {/* Recent Bookings Table */}
            <div className="xl:col-span-2">
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="px-lg py-lg border-b border-outline-variant flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <h2 className="font-headline-sm text-headline-sm text-white">Recent bookings</h2>
                  <Link to="/bookings" className="font-label-md text-label-md hover:underline" style={{ color: 'var(--accent-primary)' }}>View All</Link>
                </div>
                {bookings.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--text-muted)' }}>history</span>
                    <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No bookings yet.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/booking/problem')}>Book a Service</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <th className="px-lg py-md font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>REF</th>
                          <th className="px-lg py-md font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>TYPE</th>
                          <th className="px-lg py-md font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>PROVIDER</th>
                          <th className="px-lg py-md font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>DATE</th>
                          <th className="px-lg py-md font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>AMOUNT</th>
                          <th className="px-lg py-md font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>STATUS</th>
                          <th className="px-lg py-md"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map(b => (
                          <tr key={b.id} className="border-b transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td className="px-lg py-lg font-body-sm text-body-sm font-bold text-white">#{b.id.slice(-4)}</td>
                            <td className="px-lg py-lg font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>{b.service?.name || 'Service'}</td>
                            <td className="px-lg py-lg font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>{b.mechanic?.name || 'N/A'}</td>
                            <td className="px-lg py-lg font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(b.scheduledTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td className="px-lg py-lg font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>${b.estimatedTotal?.toFixed(2)}</td>
                            <td className="px-lg py-lg">
                              <span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span>
                            </td>
                            <td className="px-lg py-lg text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(b.status) && (
                                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }} onClick={() => navigate(`/tracking/${b.id}`, { state: { booking: b } })}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>near_me</span> Track
                                  </button>
                                )}
                                {b.status === 'COMPLETED' && !b.review && (
                                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }} onClick={() => { setSelectedBookingId(b.id); setRating(5); setComment(''); setIsReviewOpen(true); }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>rate_review</span> Review
                                  </button>
                                )}
                                {b.status === 'COMPLETED' && b.payment?.status === 'HELD_IN_ESCROW' && (
                                  <button className="btn btn-success" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleReleasePayment(b.id)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock_open</span> Release
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-xl">
              {/* My Vehicles Card */}
              <div className="glass-card">
                <div className="flex justify-between items-center mb-lg">
                  <h2 className="font-headline-sm text-headline-sm text-white">My Vehicles</h2>
                  <Link to="/vehicles" className="font-label-md text-label-md hover:underline flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add
                  </Link>
                </div>
                {vehicles.length === 0 ? (
                  <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No vehicles registered.</p>
                ) : (
                  vehicles.slice(0, 3).map(v => (
                    <div key={v.id} className="flex items-center gap-md p-md rounded-lg mb-md" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <div className="w-12 h-8 rounded border flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-color)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>directions_car</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-body-md text-body-md font-bold text-white">{v.make} {v.model}</h4>
                        <p className="font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>{v.registrationNumber}</p>
                      </div>
                      {v.isPrimary && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/15 text-green-400">Main</span>
                      )}
                    </div>
                  ))
                )}
                <p className="font-body-sm text-body-sm text-center pt-md" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
                  {vehicles.length === 0
                    ? 'Add a vehicle to get started.'
                    : `You have ${vehicles.length} registered vehicle${vehicles.length > 1 ? 's' : ''}.`}
                </p>
              </div>

              {/* Identity Verification */}
              {!user?.isIdentityVerified && (
                <div className="rounded-xl p-lg border" style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                  <div className="flex items-start gap-md">
                    <div className="p-2 rounded-lg border" style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--warning)', fontSize: '22px' }}>verified_user</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-white leading-tight mb-1">Identity Verification</h3>
                      <p className="font-body-sm text-body-sm mb-md" style={{ color: 'var(--text-secondary)' }}>Verify your identity to unlock premium roadside features and fast-track bookings.</p>
                      <button className="btn btn-primary w-full" onClick={() => navigate('/verify-identity')}>Start Verification</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Nearest Workshop / Map Card */}
              <div className="relative h-[180px] rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                <img
                  alt="Service locations map"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-md">
                  <span className="font-label-md text-label-md text-white/70">Nearest Workshop</span>
                  <h4 className="font-headline-sm text-headline-sm text-white">Pioneer Square Hub</h4>
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
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--success)' }}>check_circle</span>
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

      <style>{`
        .sos-shadow {
          box-shadow: 0px 8px 24px rgba(183, 28, 28, 0.25);
        }
      `}</style>
    </div>
  );
}
