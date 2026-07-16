import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Car,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';
import heroLayer from '../../assets/hero.png';

const FLOW = [
  { icon: Car, title: 'Select vehicle', text: 'Pick your saved car or add one before booking.' },
  { icon: Wrench, title: 'Describe issue', text: 'Choose the problem type and add quick notes.' },
  { icon: MapPin, title: 'Match mechanic', text: 'Compare ETA, rating, price, and reliability.' },
  { icon: ShieldCheck, title: 'Confirm safely', text: 'Price lock, escrow, tracking, and support stay active.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then((r) => setServices(r.data.data.services || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingServices(false));
  }, []);

  const startBooking = () => {
    navigate(isAuthenticated ? '/booking/problem' : '/login');
  };

  return (
    <div style={styles.page}>
      <section className="home-hero" style={styles.hero}>
        <div style={styles.heroCopy}>
          <span style={styles.eyebrow}><BadgeCheck size={15} /> Verified mechanics only</span>
          <h1 style={styles.heroTitle}>
            Book roadside repair, towing, and parts in one guided flow.
          </h1>
          <p style={styles.heroSub}>
            OnlineGarage turns a breakdown into a clear sequence: identify the issue, choose a mechanic, approve the price, and track the job live.
          </p>
          <div style={styles.heroActions}>
            <button className="btn btn-primary" style={styles.heroBtn} onClick={startBooking}>
              Start booking <ArrowRight size={18} />
            </button>
            <Link to="/parts" className="btn btn-secondary" style={styles.heroBtn}>
              Browse spare parts
            </Link>
          </div>
        </div>

        <div style={styles.dispatchPanel} aria-label="Live booking preview">
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.panelKicker}>Live dispatch</p>
              <h2 style={styles.panelTitle}>Mechanic arriving</h2>
            </div>
            <span style={styles.livePill}>12 min</span>
          </div>
          <div style={styles.mapMock}>
            <img src={heroLayer} alt="" style={styles.heroLayer} />
            <div style={{ ...styles.pin, top: '27%', left: '28%' }}><Car size={16} /></div>
            <div style={{ ...styles.pin, ...styles.pinActive, top: '55%', left: '62%' }}><Wrench size={16} /></div>
            <div style={styles.routeLine} />
          </div>
          <div style={styles.dispatchStats}>
            <div>
              <p style={styles.statValue}>4.9</p>
              <p style={styles.statLabel}>Rating</p>
            </div>
            <div>
              <p style={styles.statValue}>Rs. 850</p>
              <p style={styles.statLabel}>Locked estimate</p>
            </div>
            <div>
              <p style={styles.statValue}>GPS</p>
              <p style={styles.statLabel}>Live tracking</p>
            </div>
          </div>
        </div>
      </section>

      <div style={styles.trustStrip}>
        {['Price locked', 'Live GPS tracking', 'Verified ID', 'Secure payment', 'Support escalation'].map((item) => (
          <span key={item} style={styles.trustItem}><CheckCircle size={16} /> {item}</span>
        ))}
      </div>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>Booking Flow</p>
          <h2 style={styles.sectionTitle}>A clear path from problem to repair</h2>
        </div>
        <div className="home-flow-grid" style={styles.flowGrid}>
          {FLOW.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} style={styles.flowCard}>
                <span style={styles.flowNumber}>0{index + 1}</span>
                <Icon size={24} color="var(--accent-primary)" />
                <h3 style={styles.cardTitle}>{step.title}</h3>
                <p style={styles.cardText}>{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>Services</p>
          <h2 style={styles.sectionTitle}>What you can book today</h2>
        </div>

        {loadingServices ? (
          <div style={styles.loading}><Spinner /></div>
        ) : (
          <div className="home-service-grid" style={styles.serviceGrid}>
            {[
              { icon: Wrench, title: 'Mobile Mechanic', text: 'Diagnostics, minor repairs, battery, brake, and engine support at your location.', action: 'Book mechanic', onClick: startBooking },
              { icon: Truck, title: 'Towing', text: 'Request vehicle transport with clear ETA, destination, and dispatch support.', action: 'Request tow', onClick: startBooking },
              { icon: PackageCheck, title: 'Spare Parts', text: 'Browse genuine parts and proceed to checkout or installation booking.', action: 'Order parts', href: '/parts' },
            ].map((service) => {
              const Icon = service.icon;
              const content = (
                <>
                  <div style={styles.serviceIcon}><Icon size={24} /></div>
                  <h3 style={styles.cardTitle}>{service.title}</h3>
                  <p style={styles.cardText}>{service.text}</p>
                  <span style={styles.cardAction}>{service.action} <ArrowRight size={15} /></span>
                </>
              );

              return service.href ? (
                <Link key={service.title} to={service.href} style={styles.serviceCard}>{content}</Link>
              ) : (
                <button key={service.title} style={styles.serviceCard} onClick={service.onClick}>{content}</button>
              );
            })}
          </div>
        )}

        {services.length > 0 && (
          <div style={styles.serviceHint}>
            <Clock size={16} />
            <span>{services.length} service types are currently available from the backend catalogue.</span>
          </div>
        )}
      </section>

      <section className="home-support-band" style={styles.supportBand}>
        <div>
          <p style={styles.sectionLabel}>After confirmation</p>
          <h2 style={styles.sectionTitle}>Track, chat, approve, and keep the job accountable.</h2>
        </div>
        <div style={styles.supportItems}>
          <span><MapPin size={18} /> Live route</span>
          <span><MessageSquare size={18} /> In-app chat</span>
          <span><ShieldCheck size={18} /> Price approval</span>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { paddingBottom: '4rem' },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.05fr) minmax(330px, 0.95fr)',
    gap: '2rem',
    alignItems: 'center',
    padding: '3rem 0 2.25rem',
  },
  heroCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    color: '#86efac',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 'var(--radius-full)',
    padding: '0.35rem 0.75rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  heroTitle: {
    fontSize: '3.35rem',
    lineHeight: 1.05,
    fontWeight: 800,
    letterSpacing: 0,
    maxWidth: '760px',
    marginBottom: '1.25rem',
  },
  heroSub: {
    fontSize: '1.04rem',
    lineHeight: 1.7,
    maxWidth: '620px',
    marginBottom: '1.8rem',
  },
  heroActions: { display: 'flex', gap: '0.85rem', flexWrap: 'wrap' },
  heroBtn: { minWidth: '168px' },
  dispatchPanel: {
    background: 'linear-gradient(180deg, rgba(18,22,32,0.9), rgba(18,22,32,0.68))',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem',
    boxShadow: 'var(--shadow-lg)',
  },
  panelHeader: { display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' },
  panelKicker: { fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' },
  panelTitle: { fontSize: '1.35rem' },
  livePill: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.35)',
    borderRadius: 'var(--radius-full)',
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    fontWeight: 800,
  },
  mapMock: {
    position: 'relative',
    minHeight: '290px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(20,184,166,0.1)), #0e121a',
    border: '1px solid var(--border-color)',
  },
  heroLayer: {
    position: 'absolute',
    width: '220px',
    right: '8%',
    top: '16%',
    opacity: 0.8,
  },
  pin: {
    position: 'absolute',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: '#111827',
    border: '1px solid var(--border-color)',
    color: '#ffffff',
    zIndex: 2,
  },
  pinActive: {
    background: 'var(--accent-gradient)',
    boxShadow: '0 0 26px rgba(20,184,166,0.35)',
  },
  routeLine: {
    position: 'absolute',
    left: '32%',
    top: '38%',
    width: '34%',
    height: '2px',
    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
    transform: 'rotate(23deg)',
    opacity: 0.9,
  },
  dispatchStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginTop: '0.85rem',
  },
  statValue: { color: '#ffffff', fontWeight: 800, fontSize: '1.05rem' },
  statLabel: { color: 'var(--text-muted)', fontSize: '0.72rem' },
  trustStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    padding: '1rem 0',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '3rem',
  },
  trustItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: 'var(--text-secondary)',
    fontSize: '0.86rem',
  },
  section: { marginBottom: '3.5rem' },
  sectionHeader: { marginBottom: '1.4rem' },
  sectionLabel: {
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 800,
    fontSize: '0.73rem',
    marginBottom: '0.3rem',
  },
  sectionTitle: { fontSize: '2rem', maxWidth: '680px' },
  flowGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' },
  flowCard: {
    position: 'relative',
    padding: '1.25rem',
    background: 'rgba(18,22,32,0.7)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    minHeight: '190px',
  },
  flowNumber: {
    position: 'absolute',
    right: '1rem',
    top: '0.85rem',
    color: 'rgba(255,255,255,0.12)',
    fontSize: '1.5rem',
    fontWeight: 800,
  },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' },
  serviceCard: {
    textAlign: 'left',
    padding: '1.35rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(18,22,32,0.7)',
    color: 'inherit',
    cursor: 'pointer',
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  serviceIcon: {
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent-primary)',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.22)',
    borderRadius: 'var(--radius-sm)',
  },
  cardTitle: { fontSize: '1.08rem' },
  cardText: { fontSize: '0.9rem', lineHeight: 1.6 },
  cardAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#ffffff',
    fontWeight: 800,
    marginTop: 'auto',
  },
  loading: { padding: '2rem', textAlign: 'center' },
  serviceHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.86rem',
    marginTop: '1rem',
  },
  supportBand: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1.5rem',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    background: 'rgba(18,22,32,0.7)',
  },
  supportItems: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
};
