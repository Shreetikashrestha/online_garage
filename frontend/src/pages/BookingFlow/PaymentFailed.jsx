import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CreditCard, Wallet, Phone, Clock } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, mechanic, service, total } = location.state || {};

  const bookingId = booking?.id;
  const timeLeft = 9; // minutes until booking expires

  if (!booking) { navigate('/dashboard'); return null; }

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Error state */}
      <div style={styles.errorHeader}>
        <div style={styles.errorIcon}><AlertTriangle size={36} color="#fff" /></div>
        <h2 style={styles.errorTitle}>Payment failed</h2>
        <p style={styles.errorSub}>Your booking is saved</p>
      </div>

      {/* Info box */}
      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Was money taken?</span>
          <span style={styles.infoVal}>No — your account was <strong style={{ color: 'var(--success)' }}>NOT charged</strong>. Your booking is saved for 10 minutes.</span>
        </div>
      </div>

      {/* Timer */}
      <div style={styles.timerBox}>
        <Clock size={16} color="var(--warning)" />
        <span style={{ color: 'var(--warning)', fontWeight: '600', fontSize: '0.875rem' }}>⏱ Booking expires in {timeLeft}:31 remaining</span>
        <span style={{ color: 'var(--accent-primary)', fontSize: '0.78rem', marginLeft: 'auto' }}>Saved · {timeLeft}:31 remaining</span>
      </div>

      {/* What went wrong */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={styles.sectionTitle}>What went wrong?</h3>
        <div style={styles.reasonRow}>
          <div style={styles.reasonDot} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Card declined by bank</span>
        </div>
      </div>

      {/* Recovery options */}
      <h3 style={styles.sectionTitle}>Recovery options</h3>
      <div style={styles.optionsGrid}>
        <div style={styles.optionCard}>
          <div style={styles.optionIcon}><CreditCard size={22} color="var(--accent-primary)" /></div>
          <h4 style={styles.optionTitle}>Try different card</h4>
          <p style={styles.optionDesc}>Use another debit/credit card or UPI handle.</p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => navigate('/booking/payment', { state: { booking, mechanic, service, total } })}
          >
            Retry Payment
          </button>
        </div>
        <div style={styles.optionCard}>
          <div style={styles.optionIcon}><Wallet size={22} color="var(--accent-secondary)" /></div>
          <h4 style={styles.optionTitle}>Use wallet</h4>
          <p style={styles.optionDesc}>Pay instantly using your MechHub wallet balance.</p>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={() => navigate('/booking/payment', { state: { booking, mechanic, service, total, defaultMethod: 'WALLET' } })}
          >
            Pay from Wallet
          </button>
        </div>
        <div style={styles.optionCard}>
          <div style={styles.optionIcon}><Phone size={22} color="var(--success)" /></div>
          <h4 style={styles.optionTitle}>Contact support</h4>
          <p style={styles.optionDesc}>Talk to us if your bank is having issues.</p>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
            Call Support
          </button>
        </div>
      </div>

      {/* Security note */}
      <div style={styles.securityNote}>
        <span style={{ fontSize: '0.9rem' }}>🔒</span>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Our payment system uses 256-bit encryption. No financial data is stored on our servers.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>Cancel booking (free before arrival)</button>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem', maxWidth: '700px', margin: '0 auto' },
  errorHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem 0 1.5rem', textAlign: 'center' },
  errorIcon: { width: '68px', height: '68px', borderRadius: '50%', backgroundColor: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(239,68,68,0.3)' },
  errorTitle: { fontSize: '2rem', fontWeight: '800', color: '#fff' },
  errorSub: { fontSize: '1rem', color: 'var(--success)', fontWeight: '600' },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1rem' },
  infoRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'baseline' },
  infoLabel: { fontSize: '0.8rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap' },
  infoVal: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
  timerBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 1rem', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' },
  reasonRow: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  reasonDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f87171', flexShrink: 0 },
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  optionCard: { display: 'flex', flexDirection: 'column', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' },
  optionIcon: { width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', border: '1px solid var(--border-color)' },
  optionTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' },
  optionDesc: { fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', flexGrow: 1 },
  securityNote: { display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.01)' },
};
