import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Car, Clock, Lock, MapPin, ShieldCheck, Star } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const STEPS = ['Issue', 'Mechanic', 'Summary', 'Payment'];

export default function BookingSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mechanic, service, userLatitude, userLongitude, problemType } = location.state || {};

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mechanic || !service) {
      navigate('/booking/problem');
      return;
    }

    api.get('/user/vehicles')
      .then((response) => {
        const list = response.data.data.vehicles || response.data.data || [];
        setVehicles(list);
        const primary = list.find((vehicle) => vehicle.isPrimary);
        setSelectedVehicleId(primary?.id || list[0]?.id || '');
      })
      .catch(console.error)
      .finally(() => setLoadingVehicles(false));
  }, [mechanic, service, navigate]);

  const totals = useMemo(() => {
    const base = Number(service?.basePrice || 0);
    const travel = Number(service?.travelFeePerKm || 0) * 5;
    const labor = Number(service?.hourlyLaborRate || 0);
    return { base, travel, labor, total: base + travel };
  }, [service]);

  if (!mechanic || !service) return null;

  const mechanicName = mechanic.name || mechanic.user?.name || 'Assigned Mechanic';
  const eta = mechanic.eta || 12;

  const handleConfirm = async () => {
    if (!selectedVehicleId) {
      setError('Please select or add a vehicle before continuing.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + eta);

      const bookingResponse = await api.post('/bookings', {
        mechanicId: mechanic.userId || mechanic.id,
        serviceId: service.id,
        vehicleId: selectedVehicleId,
        scheduledTime: scheduledTime.toISOString(),
        userLatitude: parseFloat(userLatitude || 27.7172),
        userLongitude: parseFloat(userLongitude || 85.324),
        notes,
      });

      const booking = bookingResponse.data.data.booking;
      navigate('/booking/payment', { state: { booking, mechanic, service, total: totals.total } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in flow-shell">
      <div style={styles.topBar}>
        <button className="btn btn-secondary" style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Edit mechanic
        </button>
        <div className="flow-stepper">
          {STEPS.map((label, index) => (
            <React.Fragment key={label}>
              <span className={`flow-step ${index < 2 ? 'is-complete' : index === 2 ? 'is-active' : ''}`}>
                <span className="flow-step-number">{index + 1}</span>{label}
              </span>
              {index < STEPS.length - 1 && <span className="flow-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={styles.heading}>
        <p style={styles.kicker}>Step 3 of 4</p>
        <h2 style={styles.title}>Review and lock your booking</h2>
        <p style={styles.subtitle}>Confirm the mechanic, vehicle, and estimate before payment setup.</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <section style={styles.mechanicCard}>
            <div style={styles.avatar}>{mechanicName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.nameRow}>
                <h3 style={styles.mechanicName}>{mechanicName}</h3>
                <button style={styles.textLink} onClick={() => navigate(-1)}>Change</button>
              </div>
              <div style={styles.metaRow}>
                <span><Star size={14} fill="#fbbf24" stroke="none" /> {Number(mechanic.rating || 4.8).toFixed(1)}</span>
                <span><MapPin size={14} /> {mechanic.distance_km || 2.1} km away</span>
                <span><Clock size={14} /> {eta} min ETA</span>
              </div>
              <div style={styles.badges}>
                <span className="badge badge-blue">Verified service</span>
                <span className="badge badge-success">Price lock eligible</span>
              </div>
            </div>
          </section>

          <section className="glass-card" style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}><Car size={18} /> Vehicle and notes</h3>
            {loadingVehicles ? (
              <Spinner size="sm" />
            ) : vehicles.length === 0 ? (
              <div style={styles.emptyVehicle}>
                <p>No vehicles are saved yet.</p>
                <button className="btn btn-secondary" onClick={() => navigate('/vehicles')}>Add vehicle</button>
              </div>
            ) : (
              <select className="form-control" value={selectedVehicleId} onChange={(event) => setSelectedVehicleId(event.target.value)}>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                  </option>
                ))}
              </select>
            )}

            <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="form-label">Mechanic notes</label>
              <textarea
                className="form-control"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add symptoms, location notes, or safety details..."
                style={{ minHeight: '88px' }}
              />
            </div>
          </section>

          <section style={styles.lockBox}>
            <Lock size={18} color="var(--success)" />
            <div>
              <p style={styles.lockTitle}>Estimate locked at Rs. {totals.total.toFixed(0)}</p>
              <p style={styles.lockText}>Any increase for parts or labor must be approved in-app before the mechanic continues.</p>
            </div>
          </section>
        </div>

        <aside className="glass-card" style={styles.summaryCard}>
          <h3 style={styles.sectionTitle}><ShieldCheck size={18} /> Booking summary</h3>
          <div style={styles.priceRows}>
            <div style={styles.priceRow}><span>Issue</span><strong>{problemType || 'Mechanical'}</strong></div>
            <div style={styles.priceRow}><span>Service</span><strong>{service.name}</strong></div>
            <div style={styles.divider} />
            <div style={styles.priceRow}><span>Base fee</span><strong>Rs. {totals.base.toFixed(0)}</strong></div>
            <div style={styles.priceRow}><span>Travel estimate</span><strong>Rs. {totals.travel.toFixed(0)}</strong></div>
            <div style={styles.priceRow}><span>Hourly labor</span><strong>Rs. {totals.labor.toFixed(0)}</strong></div>
            <div style={styles.divider} />
            <div style={styles.totalRow}><span>Total estimate</span><strong>Rs. {totals.total.toFixed(0)}</strong></div>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <button className="btn btn-primary" style={styles.confirmBtn} disabled={submitting || vehicles.length === 0} onClick={handleConfirm}>
            {submitting ? <Spinner size="sm" color="white" /> : <>Continue to payment <ArrowRight size={17} /></>}
          </button>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' },
  backBtn: { padding: '0.55rem 0.8rem' },
  heading: { marginBottom: '1.5rem' },
  kicker: { fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' },
  title: { fontSize: '2rem', fontWeight: 800 },
  subtitle: { marginTop: '0.35rem' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 0.8fr)', gap: '1.25rem', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  mechanicCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(18,22,32,0.72)' },
  avatar: { width: '58px', height: '58px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-gradient)', color: '#ffffff', fontWeight: 800, flexShrink: 0 },
  nameRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' },
  mechanicName: { fontSize: '1.16rem' },
  textLink: { background: 'none', border: 0, color: 'var(--accent-primary)', fontWeight: 800, cursor: 'pointer' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.84rem' },
  badges: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.55rem' },
  sectionCard: { margin: 0 },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '1rem' },
  emptyVehicle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  lockBox: { display: 'flex', gap: '0.75rem', padding: '1rem', border: '1px solid rgba(16,185,129,0.24)', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.07)' },
  lockTitle: { color: 'var(--success)', fontWeight: 800, marginBottom: '0.25rem' },
  lockText: { fontSize: '0.86rem', lineHeight: 1.5 },
  summaryCard: { position: 'sticky', top: '92px' },
  priceRows: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  priceRow: { display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' },
  divider: { height: '1px', background: 'var(--border-color)', margin: '0.35rem 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontSize: '1.08rem' },
  errorText: { color: '#f87171', fontSize: '0.86rem', marginTop: '1rem' },
  confirmBtn: { width: '100%', height: '50px', marginTop: '1.2rem' },
};
