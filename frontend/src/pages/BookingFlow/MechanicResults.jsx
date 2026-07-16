import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Filter, MapPin, ShieldCheck, Star } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const STEPS = ['Issue', 'Mechanic', 'Summary', 'Payment'];

export default function MechanicResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { problemType } = location.state || {};

  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [latitude] = useState(27.7172);
  const [longitude] = useState(85.324);

  useEffect(() => {
    if (!problemType) {
      navigate('/booking/problem');
      return;
    }

    async function load() {
      try {
        const serviceResponse = await api.get('/services');
        const allServices = serviceResponse.data.data.services || serviceResponse.data.data || [];
        setServices(allServices);

        const service = allServices[0];
        setSelectedService(service || null);

        if (service) {
          const resultResponse = await api.post('/services/search', {
            latitude,
            longitude,
            serviceId: service.id,
          });

          const results = resultResponse.data.data.mechanics || resultResponse.data.data || [];
          setMechanics(results.map((mechanic, index) => normalizeMechanic(mechanic, index)));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [problemType, latitude, longitude, navigate]);

  const filtered = useMemo(() => {
    return mechanics
      .filter((mechanic) => !verifiedOnly || mechanic.isReliable || mechanic.isIdVerified)
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price') return a.startingPrice - b.startingPrice;
        return Number(a.distance_km) - Number(b.distance_km);
      });
  }, [mechanics, sortBy, verifiedOnly]);

  const handleSelect = (mechanic) => {
    navigate('/booking/summary', {
      state: { mechanic, service: selectedService, userLatitude: latitude, userLongitude: longitude, problemType },
    });
  };

  return (
    <div style={styles.container} className="animate-fade-in flow-shell">
      <div style={styles.topBar}>
        <button className="btn btn-secondary" style={styles.backBtn} onClick={() => navigate('/booking/problem', { state: { problemType } })}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flow-stepper">
          {STEPS.map((label, index) => (
            <React.Fragment key={label}>
              <span className={`flow-step ${index < 1 ? 'is-complete' : index === 1 ? 'is-active' : ''}`}>
                <span className="flow-step-number">{index + 1}</span>{label}
              </span>
              {index < STEPS.length - 1 && <span className="flow-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={styles.headingRow}>
        <div>
          <p style={styles.kicker}>Step 2 of 4</p>
          <h2 style={styles.title}>{loading ? 'Finding nearby mechanics' : `${filtered.length} mechanics nearby`}</h2>
          <p style={styles.subtitle}>Compare arrival time, reliability, service profile, and estimated starting price.</p>
        </div>
        <div style={styles.locationBadge}><MapPin size={16} /> Kathmandu area</div>
      </div>

      <div style={styles.grid}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}><Filter size={16} /> Filters</div>
          <label style={styles.fieldLabel}>Sort results</label>
          <select className="form-control" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="rating">Top rated</option>
            <option value="price">Lowest price</option>
          </select>

          <button
            className="btn btn-secondary"
            style={{
              ...styles.filterToggle,
              borderColor: verifiedOnly ? 'rgba(16,185,129,0.45)' : 'var(--border-color)',
              color: verifiedOnly ? 'var(--success)' : 'var(--text-secondary)',
            }}
            onClick={() => setVerifiedOnly((value) => !value)}
          >
            <ShieldCheck size={16} /> Verified or reliable only
          </button>

          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>Selected issue</p>
            <p style={styles.summaryValue}>{problemType}</p>
            <p style={styles.summaryLabel}>Service catalogue</p>
            <p style={styles.summaryValue}>{services.length || 0} available</p>
          </div>
        </aside>

        <div style={styles.results}>
          {loading ? (
            <div style={styles.loading}><Spinner /><p style={{ marginTop: '1rem' }}>Searching verified mechanics...</p></div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>No mechanics match this filter. Try showing all providers.</div>
          ) : (
            filtered.map((mechanic, index) => (
              <article key={mechanic.id || mechanic.userId || mechanic.name} style={{ ...styles.card, borderColor: index === 0 ? 'rgba(59,130,246,0.55)' : 'var(--border-color)' }}>
                {index === 0 && <span style={styles.bestMatch}>Best match</span>}
                <div style={styles.mechanicMain}>
                  <img src={mechanic.photo} alt={mechanic.name} style={styles.avatar} />
                  <div style={styles.mechanicInfo}>
                    <div style={styles.nameRow}>
                      <h3 style={styles.mechanicName}>{mechanic.name}</h3>
                      <span style={styles.rating}><Star size={14} fill="#fbbf24" stroke="none" /> {mechanic.rating.toFixed(1)} <span style={{ color: 'var(--text-muted)' }}>({mechanic.totalReviews})</span></span>
                    </div>
                    <p style={styles.exp}>{mechanic.yearsExperience} years experience in mobile repair</p>
                    <div style={styles.badges}>
                      {mechanic.badges.map((badge) => <span className="badge badge-success" key={badge}>{badge}</span>)}
                    </div>
                    <div style={styles.metaRow}>
                      <span><MapPin size={13} /> {mechanic.distance_km} km</span>
                      <span><Clock size={13} /> {mechanic.eta} min ETA</span>
                      <span>Rs. {mechanic.startingPrice}</span>
                    </div>
                  </div>
                </div>
                <div style={styles.actions}>
                  <button className="btn btn-primary" style={styles.actionBtn} onClick={() => handleSelect(mechanic)}>
                    Select <ArrowRight size={16} />
                  </button>
                  <button className="btn btn-secondary" style={styles.actionBtn} onClick={() => navigate(`/mechanics/${mechanic.userId || mechanic.id}`)}>
                    View profile
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeMechanic(mechanic, index) {
  const distance = Number(mechanic.distance_km || (0.8 + index * 0.7)).toFixed(1);
  return {
    ...mechanic,
    name: mechanic.name || mechanic.user?.name || `Garage Pro ${index + 1}`,
    photo: mechanic.photo || mechanic.user?.avatarUrl || `https://i.pravatar.cc/120?img=${index + 10}`,
    distance_km: distance,
    eta: Math.round(Number(distance) * 6 + 5),
    startingPrice: mechanic.startingPrice || 650 + index * 140,
    yearsExperience: mechanic.yearsOfExperience || mechanic.yearsExperience || 7 + index * 2,
    rating: Number(mechanic.rating || 4.6 + (index % 3) * 0.12),
    totalReviews: mechanic.totalReviews || 88 + index * 41,
    badges: [
      mechanic.isReliable ? 'Reliable' : null,
      mechanic.isIdVerified ? 'Verified ID' : null,
      mechanic.specialty?.[0] || 'Mobile service',
    ].filter(Boolean).slice(0, 3),
  };
}

const styles = {
  container: { paddingBottom: '3rem' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' },
  backBtn: { padding: '0.55rem 0.8rem' },
  headingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  kicker: { fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' },
  title: { fontSize: '2rem', fontWeight: 800 },
  subtitle: { marginTop: '0.35rem', maxWidth: '560px' },
  locationBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '0.45rem 0.8rem' },
  grid: { display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: '1.25rem' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(18,22,32,0.72)', alignSelf: 'start' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff', fontWeight: 800 },
  fieldLabel: { color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' },
  filterToggle: { justifyContent: 'flex-start', width: '100%', fontSize: '0.84rem' },
  summaryBox: { borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'grid', gap: '0.35rem' },
  summaryLabel: { color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 },
  summaryValue: { color: '#ffffff', fontWeight: 700, marginBottom: '0.35rem' },
  results: { display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  loading: { textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' },
  empty: { padding: '2rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' },
  card: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.15rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(18,22,32,0.72)', flexWrap: 'wrap' },
  bestMatch: { position: 'absolute', top: '-1px', left: '1rem', background: 'var(--accent-gradient)', color: '#ffffff', padding: '0.24rem 0.6rem', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 },
  mechanicMain: { display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 480px' },
  avatar: { width: '68px', height: '68px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' },
  mechanicInfo: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  nameRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  mechanicName: { fontSize: '1.08rem' },
  rating: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 },
  exp: { fontSize: '0.84rem' },
  badges: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.84rem' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.55rem', minWidth: '145px' },
  actionBtn: { width: '100%' },
};
