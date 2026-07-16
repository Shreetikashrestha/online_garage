import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Copy, MapPin, MessageSquare, ShieldCheck, Share2, Wrench } from 'lucide-react';

export default function BookingConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, mechanic, service, type, total, paymentMode } = location.state || {};

  if (!booking) {
    navigate('/dashboard');
    return null;
  }

  const isPartsOrder = type === 'PARTS_ORDER' || type === 'PARTS_ORDER_WITH_INSTALL';
  const hasInstall = type === 'PARTS_ORDER_WITH_INSTALL';
  const mechanicName = mechanic?.name || mechanic?.user?.name || 'Assigned Mechanic';
  const refNo = `${isPartsOrder ? 'PO' : 'OG'}-${booking.id?.slice(-6).toUpperCase() || 'READY'}`;
  const trackingUrl = `${window.location.origin}/tracking/${booking.id}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(trackingUrl);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <section style={styles.hero}>
        <div style={styles.successIcon}><CheckCircle size={42} /></div>
        <p style={styles.kicker}>{isPartsOrder ? 'Order confirmed' : 'Booking confirmed'}</p>
        <h1 style={styles.title}>{isPartsOrder ? 'Your parts order is being processed.' : 'Your mechanic request is live.'}</h1>
        <p style={styles.subtitle}>Reference {refNo}. You can now track progress, chat, and share the live status.</p>
      </section>

      <div style={styles.grid}>
        <section className="glass-card" style={styles.card}>
          <h3 style={styles.cardTitle}><Wrench size={18} /> Service details</h3>
          <div style={styles.detailRows}>
            <Detail label="Reference" value={refNo} />
            <Detail label="Service" value={service?.name || (isPartsOrder ? 'Parts order' : 'Roadside service')} />
            <Detail label="Assigned to" value={isPartsOrder ? 'Parts fulfilment' : mechanicName} />
            <Detail label="Payment" value={paymentMode === 'PAY_AFTER_SERVICE' ? 'After service approval' : 'Escrow protected'} />
            <Detail label="Estimate" value={`Rs. ${Number(total || booking.estimatedTotal || 0).toFixed(0)}`} strong />
          </div>
        </section>

        <section className="glass-card" style={styles.card}>
          <h3 style={styles.cardTitle}><ShieldCheck size={18} /> Protection active</h3>
          <div style={styles.protocolList}>
            {[
              ['Live GPS', 'Track mechanic movement and status updates.'],
              ['Price lock', 'Any estimate increase requires approval.'],
              ['Recorded chat', 'Keep job instructions in one place.'],
              ['Support escalation', 'SOS stays available throughout the job.'],
            ].map(([title, text]) => (
              <div key={title} style={styles.protocolItem}>
                <span style={styles.protocolDot} />
                <div>
                  <p style={styles.protocolTitle}>{title}</p>
                  <p style={styles.protocolText}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card" style={styles.card}>
          <h3 style={styles.cardTitle}><MapPin size={18} /> Share tracking</h3>
          <p style={styles.shareText}>Send the live tracking link to someone you trust for extra safety.</p>
          <div style={styles.mapMock}>
            <span style={styles.mapPin}><MapPin size={18} /></span>
            <span style={styles.mapRoute} />
            <span style={styles.mapTool}><Wrench size={18} /></span>
          </div>
          <button
            className="btn btn-success"
            style={styles.fullBtn}
            onClick={() => window.open(`https://wa.me/?text=Track my OnlineGarage booking: ${trackingUrl}`)}
          >
            <Share2 size={16} /> Send via WhatsApp
          </button>
          <button className="btn btn-secondary" style={styles.fullBtn} onClick={handleCopyLink}>
            <Copy size={16} /> Copy tracking link
          </button>
        </section>
      </div>

      <div style={styles.actions}>
          {(hasInstall || !isPartsOrder) && (
            <button className="btn btn-primary" style={styles.primaryAction} onClick={() => navigate(`/tracking/${booking.id}`, { state: { booking } })}>
              View live tracking <ArrowRight size={18} />
            </button>
          )}
        <button className="btn btn-secondary" style={styles.primaryAction} onClick={() => navigate('/dashboard')}>
          <MessageSquare size={18} /> Go to dashboard
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value, strong }) {
  return (
    <div style={styles.detailRow}>
      <span>{label}</span>
      <strong style={{ color: strong ? '#ffffff' : 'var(--text-secondary)' }}>{value}</strong>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1040px', margin: '0 auto', paddingBottom: '3rem' },
  hero: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', padding: '2rem 0 2.25rem' },
  successIcon: { width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', color: '#ffffff', background: 'var(--accent-gradient)', boxShadow: '0 18px 44px rgba(20,184,166,0.22)' },
  kicker: { color: 'var(--success)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 },
  title: { fontSize: '2.25rem', maxWidth: '680px' },
  subtitle: { maxWidth: '620px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { margin: 0, display: 'flex', flexDirection: 'column' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', marginBottom: '1rem' },
  detailRows: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  detailRow: { display: 'flex', justifyContent: 'space-between', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem' },
  protocolList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  protocolItem: { display: 'flex', gap: '0.65rem', alignItems: 'flex-start' },
  protocolDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', marginTop: '0.35rem', flexShrink: 0 },
  protocolTitle: { color: '#ffffff', fontWeight: 800, fontSize: '0.9rem' },
  protocolText: { fontSize: '0.82rem', lineHeight: 1.45 },
  shareText: { fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '0.75rem' },
  mapMock: { position: 'relative', height: '118px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(20,184,166,0.12)), #0f131d', marginBottom: '0.85rem', overflow: 'hidden' },
  mapPin: { position: 'absolute', left: '22%', top: '42%', color: '#ffffff' },
  mapTool: { position: 'absolute', right: '23%', top: '42%', color: 'var(--success)' },
  mapRoute: { position: 'absolute', left: '29%', right: '30%', top: '50%', height: '2px', background: 'var(--accent-gradient)' },
  fullBtn: { width: '100%', marginTop: '0.65rem' },
  actions: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.85rem' },
  primaryAction: { minWidth: '230px', minHeight: '50px' },
};
