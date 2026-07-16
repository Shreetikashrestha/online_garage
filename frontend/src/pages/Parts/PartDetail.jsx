import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { ShoppingCart, Wrench, Shield, CheckCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const PART_IMAGES = {
  'Synthetic Oil 5W-30': 'https://images.unsplash.com/photo-1583182332473-b31ba08929c8?auto=format&fit=crop&w=600&q=80',
  'Ceramic Brake Pads (Set)': 'https://unsplash.com/photos/b7ek9sG9mwU/download?force=true&w=600',
  'Matrix LED Headlight Unit': 'https://unsplash.com/photos/k9-PK7NLWQ4/download?force=true&w=600',
  'Heavy Duty Gas Shocks': 'https://unsplash.com/photos/34yNyLyKJ4Y/download?force=true&w=600',
  '700CCA Startup Battery': 'https://unsplash.com/photos/ovGrEUgrkyE/download?force=true&w=600',
  'Full Synthetic 5W-30 (5L)': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
};

export default function PartDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [part, setPart] = useState(location.state?.part || null);
  const [loading, setLoading] = useState(!part);
  const [error, setError] = useState(null);
  const [showAllCompat, setShowAllCompat] = useState(false);

  useEffect(() => {
    if (!part && id) {
      fetchPart();
    }
  }, [id]);

  async function fetchPart() {
    try {
      const res = await api.get(`/services/spare-parts/item/${id}`);
      const p = res.data.data.part;
      p.image = PART_IMAGES[p.name] || p.image;
      setPart(p);
    } catch (err) {
      setError('Failed to load part details.');
    } finally {
      setLoading(false);
    }
  }

  const goToCheckout = (orderType) => {
    const cart = [{ ...part, orderType, qty: 1 }];
    navigate('/parts/checkout', { state: { cart } });
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/parts')}>Back to Catalogue</button>
      </div>
    );
  }

  if (!part) return null;

  const total = part.price + (part.installationFee || 0);
  const compatibilities = part.compatibilities || [];

  return (
    <div style={styles.container} className="animate-fade-in">
      <p style={styles.breadcrumb}>
        <Link to="/parts" style={{ color: 'var(--accent-primary)' }}>Catalogue</Link>
        {' › '}
        <span style={{ color: 'var(--text-secondary)' }}>{part.name}</span>
      </p>

      <div style={styles.grid}>
        <div style={styles.imageCol}>
          <div style={styles.imageWrapper}>
            <img src={part.image || `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80`} alt={part.name} style={styles.image} />
            <span style={styles.authBadge}>✓ {part.certification || 'Verified'}</span>
          </div>
        </div>

        <div style={styles.infoCol}>
          <h1 style={styles.partName}>{part.name}</h1>
          <p style={styles.sku}>SKU: {part.sku || `SKU-${part.id?.toUpperCase()}`}</p>

          <div style={styles.priceBlock}>
            <span style={styles.price}>${part.price.toFixed(2)}</span>
            <span style={styles.exclTax}>Excl. Tax</span>
          </div>

          <div style={styles.priceRows}>
            <div style={styles.priceRow}><span>Part Price</span><span>${part.price.toFixed(2)}</span></div>
            <div style={styles.priceRow}>
              <span>Installation Fee <span style={styles.infoIcon}>ℹ</span></span>
              <span>+${(part.installationFee || 0).toFixed(2)}</span>
            </div>
            <div style={{ ...styles.priceRow, fontWeight: '800', color: '#ffffff', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <span>Total Estimate</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.actions}>
            <button className="btn btn-secondary" style={styles.actionBtn} onClick={() => goToCheckout('order')}>
              <ShoppingCart size={16} /> $ Order Only
            </button>
            <button className="btn btn-secondary" style={styles.actionBtn} onClick={() => goToCheckout('install')}>
              🔧 Install Only
            </button>
            <button className="btn btn-primary" style={styles.actionBtn} onClick={() => goToCheckout('order_install')}>
              <Wrench size={16} /> Order + Install
            </button>
          </div>

          <div style={styles.guarantees}>
            <div style={styles.guaranteeItem}>
              <Shield size={20} color="var(--success)" />
              <div>
                <p style={styles.guarTitle}>Warranty Included</p>
                <p style={styles.guarDesc}>24-month or 24,000-mile comprehensive protection on parts and labor.</p>
              </div>
            </div>
            <div style={styles.guaranteeItem}>
              <Shield size={20} color="var(--success)" />
              <div>
                <p style={styles.guarTitle}>{part.certification || 'Certified'} Status</p>
                <p style={styles.guarDesc}>Meets or exceeds OEM specifications for all commercial fleet requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.bottomGrid}>
        <div className="glass-card">
          <h3 style={styles.sectionTitle}>Technical Specs</h3>
          <div style={styles.specList}>
            <div style={styles.specRow}>
              <span style={styles.specKey}>Certification</span>
              <span style={styles.specVal}>{part.certification || 'Standard'}</span>
            </div>
            <div style={styles.specRow}>
              <span style={styles.specKey}>Installation Fee</span>
              <span style={styles.specVal}>${(part.installationFee || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={styles.sectionTitle}>Vehicle Compatibility</h3>
            {compatibilities.length > 0 && (
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{compatibilities.length} models</span>
            )}
          </div>
          {compatibilities.length > 0 ? (
            <>
              <div style={styles.compatGrid}>
                {(showAllCompat ? compatibilities : compatibilities.slice(0, 4)).map(c => (
                  <div key={c.id || `${c.vehicleMake}-${c.vehicleModel}`} style={styles.compatItem}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {c.vehicleMake} {c.vehicleModel} ({c.yearFrom}–{c.yearTo})
                    </span>
                    <CheckCircle size={16} color="var(--success)" />
                  </div>
                ))}
              </div>
              {compatibilities.length > 4 && (
                <button style={styles.viewAllCompat} onClick={() => setShowAllCompat(!showAllCompat)}>
                  {showAllCompat ? 'Show less' : `View all ${compatibilities.length} compatible models`}
                  <ChevronDown size={14} style={{ transform: showAllCompat ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
            </>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compatibility data not available for this part.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' },
  breadcrumb: { fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.75rem' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '2.5rem', marginBottom: '2rem' },
  imageCol: { flex: '1 1 340px' },
  imageWrapper: { position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' },
  image: { width: '100%', height: '340px', objectFit: 'cover', display: 'block' },
  authBadge: { position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(16,185,129,0.85)', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' },
  infoCol: { flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  partName: { fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.2' },
  sku: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  priceBlock: { display: 'flex', alignItems: 'baseline', gap: '0.5rem' },
  price: { fontSize: '2rem', fontWeight: '800', color: '#ffffff' },
  exclTax: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  priceRows: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' },
  infoIcon: { fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'help' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  actionBtn: { width: '100%', height: '48px', fontSize: '0.95rem' },
  guarantees: { display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' },
  guaranteeItem: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  guarTitle: { fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' },
  guarDesc: { fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' },
  specList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  specRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' },
  specKey: { color: 'var(--text-secondary)' },
  specVal: { fontWeight: '600', color: '#ffffff' },
  compatGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' },
  compatItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' },
  viewAllCompat: { background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 },
};