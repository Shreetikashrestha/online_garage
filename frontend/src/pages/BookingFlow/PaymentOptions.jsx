import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, CheckCircle, CreditCard, Shield, Smartphone, TriangleAlert } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

const STEPS = ['Issue', 'Mechanic', 'Summary', 'Payment'];

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { booking, mechanic, service, total = 0 } = location.state || {};

  const [method, setMethod] = useState('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!booking) {
    navigate('/dashboard');
    return null;
  }

  const isVerified = !!user?.isIdentityVerified;
  const payableMode = isVerified ? 'PAY_AFTER_SERVICE' : 'PAY_NOW';

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/payments/initialize', { bookingId: booking.id, method });
      navigate('/booking/confirmed', { state: { booking, mechanic, service, total, paymentMode: payableMode } });
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (message.includes('Stripe') || message.includes('configured')) {
        navigate('/booking/confirmed', { state: { booking, mechanic, service, total, paymentMode: payableMode } });
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in flow-shell">
      <div style={styles.topBar}>
        <button className="btn btn-secondary" style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to summary
        </button>
        <div className="flow-stepper">
          {STEPS.map((label, index) => (
            <React.Fragment key={label}>
              <span className={`flow-step ${index < 3 ? 'is-complete' : 'is-active'}`}>
                <span className="flow-step-number">{index + 1}</span>{label}
              </span>
              {index < STEPS.length - 1 && <span className="flow-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={styles.heading}>
        <p style={styles.kicker}>Step 4 of 4</p>
        <h2 style={styles.title}>Set up payment protection</h2>
        <p style={styles.subtitle}>Verified users can pay after service approval. New users pay now into escrow.</p>
      </div>

      {error && <div style={styles.errorBox}><TriangleAlert size={16} /> {error}</div>}

      <div style={styles.grid}>
        <section style={{ ...styles.panel, borderColor: isVerified ? 'rgba(16,185,129,0.35)' : 'var(--border-color)', opacity: isVerified ? 1 : 0.58 }}>
          <span style={styles.badgeSuccess}><CheckCircle size={14} /> Verified profile</span>
          <h3 style={styles.panelTitle}>Pay after service</h3>
          <p style={styles.panelDesc}>Approve the finished work first, then release payment. Your booking remains protected by the platform.</p>
          <div style={styles.amountBox}>
            <span>Estimated total</span>
            <strong>Rs. {Number(total).toFixed(0)}</strong>
          </div>

          {isVerified ? (
            <>
              <PaymentOption id="CARD" label="Card ending in 4242" icon={<CreditCard size={18} />} selected={method} setSelected={setMethod} />
              <PaymentOption id="WALLET" label="Digital wallet" icon={<Smartphone size={18} />} selected={method} setSelected={setMethod} />
              <PaymentOption id="CASH" label="Cash after completion" icon={<Banknote size={18} />} selected={method} setSelected={setMethod} />
              <button className="btn btn-success" style={styles.confirmBtn} disabled={submitting} onClick={handleConfirm}>
                {submitting ? <Spinner size="sm" color="white" /> : 'Confirm pay-after-service'}
              </button>
            </>
          ) : (
            <div style={styles.lockedBox}>Verify identity to unlock this option.</div>
          )}
        </section>

        <section style={{ ...styles.panel, borderColor: !isVerified ? 'rgba(239,68,68,0.35)' : 'var(--border-color)', opacity: !isVerified ? 1 : 0.58 }}>
          <span style={styles.badgeWarn}><Shield size={14} /> Escrow required</span>
          <h3 style={styles.panelTitle}>Pay at booking time</h3>
          <p style={styles.panelDesc}>Funds are held securely until the mechanic completes the job and the final amount is approved.</p>
          <div style={styles.amountBox}>
            <span>Due now</span>
            <strong>Rs. {Number(total).toFixed(0)}</strong>
          </div>

          {!isVerified ? (
            <>
              <button className="btn btn-danger" style={styles.confirmBtn} disabled={submitting} onClick={handleConfirm}>
                {submitting ? <Spinner size="sm" color="white" /> : `Pay Rs. ${Number(total).toFixed(0)} now`}
              </button>
              <button className="btn btn-secondary" style={styles.confirmBtn} onClick={() => navigate('/verify-identity')}>
                Verify ID instead
              </button>
            </>
          ) : (
            <div style={styles.lockedBox}>This path is intended for new or unverified profiles.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function PaymentOption({ id, label, icon, selected, setSelected }) {
  const active = selected === id;
  return (
    <label style={{ ...styles.methodOption, borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)', background: active ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
      <input type="radio" name="method" value={id} checked={active} onChange={() => setSelected(id)} style={{ accentColor: 'var(--accent-primary)' }} />
      {icon}
      <span>{label}</span>
    </label>
  );
}

const styles = {
  container: { paddingBottom: '3rem', maxWidth: '920px', margin: '0 auto' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' },
  backBtn: { padding: '0.55rem 0.8rem' },
  heading: { marginBottom: '1.5rem' },
  kicker: { fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' },
  title: { fontSize: '2rem', fontWeight: 800 },
  subtitle: { marginTop: '0.35rem' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.24)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' },
  panel: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(18,22,32,0.72)' },
  badgeSuccess: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'flex-start', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.24)', borderRadius: 'var(--radius-full)', padding: '0.35rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 },
  badgeWarn: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'flex-start', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.24)', borderRadius: 'var(--radius-full)', padding: '0.35rem 0.65rem', fontSize: '0.76rem', fontWeight: 800 },
  panelTitle: { fontSize: '1.25rem' },
  panelDesc: { fontSize: '0.88rem', lineHeight: 1.6 },
  amountBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' },
  methodOption: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', cursor: 'pointer' },
  confirmBtn: { width: '100%', minHeight: '48px' },
  lockedBox: { padding: '0.9rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textAlign: 'center' },
};
