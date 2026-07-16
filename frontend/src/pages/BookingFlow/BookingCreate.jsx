import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Car, CreditCard, DollarSign, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

export default function BookingCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Extract passed state from homepage redirection
  const { mechanic, service, userLatitude, userLongitude } = location.state || {};

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH or CARD
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if no state passed
    if (!mechanic || !service) {
      navigate('/');
      return;
    }

    async function fetchVehicles() {
      try {
        const response = await api.get('/user/vehicles');
        const list = response.data.data.vehicles || response.data.data || [];
        setVehicles(list);
        
        // Auto select primary vehicle
        const primary = list.find((v) => v.isPrimary);
        if (primary) {
          setSelectedVehicleId(primary.id);
        } else if (list.length > 0) {
          setSelectedVehicleId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVehicles(false);
      }
    }

    fetchVehicles();

    // Default scheduled date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
  }, [mechanic, service, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicleId) {
      setError('Please select a vehicle. If you do not have one registered, add one first.');
      return;
    }

    setSubmitting(true);

    const bookingTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

    const bookingPayload = {
      mechanicId: mechanic.userId,
      serviceId: service.id,
      vehicleId: selectedVehicleId,
      scheduledTime: bookingTime.toISOString(),
      userLatitude: parseFloat(userLatitude || 27.7172),
      userLongitude: parseFloat(userLongitude || 85.324),
      notes,
    };

    try {
      // 1. Create booking
      const bookingResponse = await api.post('/bookings', bookingPayload);
      const booking = bookingResponse.data.data.booking;

      // 2. Initialize Payment
      try {
        await api.post('/payments/initialize', {
          bookingId: booking.id,
          method: paymentMethod,
        });
        
        navigate('/dashboard');
      } catch (payErr) {
        console.warn('Payment init error:', payErr);
        setError(
          `Booking created successfully (ID: ${booking.id}), but payment initialization failed: ${
            payErr.response?.data?.message || payErr.message
          }. Changing payment method to CASH is recommended.`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mechanic || !service) return null;

  return (
    <div style={styles.container} className="animate-fade-in">
      <h2 style={styles.pageTitle}>Confirm Your Booking</h2>
      <p style={styles.pageSubtitle}>Review details and secure your roadside mechanic.</p>

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={18} />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      <div style={styles.grid}>
        {/* Left Form Panel */}
        <div style={styles.formCol}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Vehicle Selection */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={styles.sectionTitle}>Select Vehicle</h3>
              {loadingVehicles ? (
                <Spinner size="sm" />
              ) : vehicles.length === 0 ? (
                <div style={styles.emptyVehicles}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    You don't have any vehicles registered in your garage yet.
                  </p>
                  <Link to="/vehicles" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    Manage Garage
                  </Link>
                </div>
              ) : (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="vehicle-select">Choose a Vehicle</label>
                  <select
                    id="vehicle-select"
                    className="form-control"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    style={{ height: '46px' }}
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} ({v.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date & Time Selection */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={styles.sectionTitle}>Schedule Arrival</h3>
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="date">Scheduled Date</label>
                  <input
                    id="date"
                    type="date"
                    className="form-control"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="time">Scheduled Time</label>
                  <input
                    id="time"
                    type="time"
                    className="form-control"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
                <label className="form-label" htmlFor="notes">Notes for the Mechanic (Optional)</label>
                <textarea
                  id="notes"
                  className="form-control"
                  placeholder="Describe your issue, e.g., flat tire, radiator leaking, vehicle won't start..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={styles.sectionTitle}>Choose Payment Method</h3>
              
              {user && (
                <div style={styles.verificationAlert}>
                  <ShieldCheck size={16} color={user.isIdentityVerified ? 'var(--success)' : 'var(--warning)'} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Your ID is {user.isIdentityVerified ? 'Verified' : 'Unverified'}. 
                    {user.isIdentityVerified 
                      ? ' You qualify for Post-Pay (Pay after completion).' 
                      : ' Pre-Pay holding funds in escrow is required for Card payments.'}
                  </span>
                </div>
              )}

              <div style={styles.paymentToggle}>
                <label 
                  style={{
                    ...styles.paymentOption,
                    borderColor: paymentMethod === 'CASH' ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: paymentMethod === 'CASH' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  }}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="CASH" 
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    style={styles.radio}
                  />
                  <DollarSign size={20} color="var(--success)" />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Pay with Cash</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pay mechanic directly on site</p>
                  </div>
                </label>

                <label 
                  style={{
                    ...styles.paymentOption,
                    borderColor: paymentMethod === 'CARD' ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: paymentMethod === 'CARD' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  }}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="CARD" 
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    style={styles.radio}
                  />
                  <CreditCard size={20} color="var(--accent-secondary)" />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Pay with Card (Stripe Escrow)</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Secure checkout hold</p>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.confirmBtn}
              disabled={submitting || vehicles.length === 0}
            >
              {submitting ? <Spinner size="sm" color="white" /> : (
                <>
                  Confirm & Request Mechanic <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Detail Card Panel */}
        <div style={styles.summaryCol}>
          <div className="glass-card" style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Booking Summary</h3>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Mechanic</span>
              <strong style={{ color: '#ffffff' }}>{mechanic.name}</strong>
            </div>

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Service Type</span>
              <strong style={{ color: '#ffffff' }}>{service.name}</strong>
            </div>

            <div style={styles.summaryDivider}></div>

            <h4 style={styles.costTitle}>Pricing Breakdown</h4>
            <div style={styles.costRow}>
              <span>Base Rate</span>
              <span>${service.basePrice.toFixed(2)}</span>
            </div>
            <div style={styles.costRow}>
              <span>Travel Fee</span>
              <span>${(service.travelFeePerKm * 5 || 10).toFixed(2)}</span>
            </div>
            <div style={styles.costRow}>
              <span>Est. Hourly Labor</span>
              <span>${(service.hourlyLaborRate || 0).toFixed(2)} / hr</span>
            </div>

            <div style={styles.summaryDivider}></div>

            <div style={styles.totalRow}>
              <span>Estimated Total</span>
              <span style={styles.totalVal}>${(service.basePrice + (service.travelFeePerKm * 5 || 10)).toFixed(2)}</span>
            </div>

            <p style={styles.disclaimer}>
              * The actual total may vary depending on spare parts and total labor hours worked. Final price is captured upon job completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '3rem',
    textAlign: 'left',
  },
  pageTitle: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  pageSubtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: '#f87171',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  formCol: {
    flex: '2 1 500px',
  },
  summaryCol: {
    flex: '1 1 350px',
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    color: '#ffffff',
  },
  emptyVehicles: {
    textAlign: 'center',
    padding: '1.5rem 0',
  },
  verificationAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    padding: '0.6rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.25rem',
  },
  paymentToggle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  radio: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--accent-primary)',
  },
  confirmBtn: {
    width: '100%',
    height: '50px',
    fontSize: '1.05rem',
    marginTop: '1.5rem',
  },
  summaryCard: {
    position: 'sticky',
    top: '100px',
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#ffffff',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    marginBottom: '0.75rem',
  },
  summaryLabel: {
    color: 'var(--text-secondary)',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1.25rem 0',
  },
  costTitle: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  costRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#ffffff',
  },
  totalVal: {
    fontSize: '1.3rem',
    color: 'var(--accent-primary)',
  },
  disclaimer: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '1.5rem',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
};
