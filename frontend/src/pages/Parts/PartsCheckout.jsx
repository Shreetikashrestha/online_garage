import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, CreditCard, Smartphone, Shield, CheckCircle, Pencil } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

const CART_KEY = 'onlinegarage.cart';

const PART_IMAGES = {
  'Synthetic Oil 5W-30': 'https://images.unsplash.com/photo-1583182332473-b31ba08929c8?auto=format&fit=crop&w=400&q=80',
  'Ceramic Brake Pads (Set)': 'https://unsplash.com/photos/b7ek9sG9mwU/download?force=true&w=400',
  'Matrix LED Headlight Unit': 'https://unsplash.com/photos/k9-PK7NLWQ4/download?force=true&w=400',
  'Heavy Duty Gas Shocks': 'https://unsplash.com/photos/34yNyLyKJ4Y/download?force=true&w=400',
  '700CCA Startup Battery': 'https://unsplash.com/photos/ovGrEUgrkyE/download?force=true&w=400',
  'Full Synthetic 5W-30 (5L)': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
};

export default function PartsCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [cart, setCart] = useState(location.state?.cart || []);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [payMethod, setPayMethod] = useState('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [installSlot, setInstallSlot] = useState('Tuesday, Oct 24 - 09:00 AM');

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await api.get('/user/vehicles');
        const v = res.data.data?.vehicles || res.data.data || [];
        setVehicles(v);
        const primary = v.find(v => v.isPrimary);
        if (primary) setSelectedVehicleId(primary.id);
        else if (v.length > 0) setSelectedVehicleId(v[0].id);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load your vehicles.';
        setError(msg);
      } finally {
        setLoadingVehicles(false);
      }
    }
    if (user) loadVehicles();
    else setLoadingVehicles(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/parts/checkout' } });
      return;
    }
    if (!location.state?.cart || location.state.cart.length === 0) {
      const saved = loadCartFromStorage();
      if (saved.length > 0) setCart(saved);
      else navigate('/parts');
    }
  }, []);

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  if (cart.length === 0 && !loadingVehicles) return null;

  const removeItem = (id, orderType) => {
    const updated = cart.filter(i => !(i.id === id && i.orderType === orderType));
    setCart(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    if (updated.length === 0) navigate('/parts');
  };

  const getItemTotal = (item) => {
    if (item.orderType === 'install') return (item.installationFee || 0) * (item.qty || 1);
    if (item.orderType === 'order_install') return (item.price + (item.installationFee || 0)) * (item.qty || 1);
    return item.price * (item.qty || 1); // 'order'
  };

  const partsSubtotal = cart.reduce((s, i) => {
    if (i.orderType === 'install') return s;
    return s + i.price * (i.qty || 1);
  }, 0);
  const installLabor = cart.filter(i => i.orderType === 'install' || i.orderType === 'order_install')
    .reduce((s, i) => s + (i.installationFee || 0) * (i.qty || 1), 0);
  const tax = partsSubtotal * 0.08;
  const total = cart.reduce((s, i) => s + getItemTotal(i), 0) + tax;

  const handleCompleteOrder = async () => {
    if (!selectedVehicleId) {
      setError('Please select a vehicle for the order.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const orderRes = await api.post('/services/spare-parts/order', {
        cart,
        vehicleId: selectedVehicleId,
        scheduledTime: new Date().toISOString(),
      });

      const bookingId = orderRes.data.data.booking.id;

      await api.post('/payments/initialize', {
        bookingId,
        method: payMethod,
      });

      localStorage.removeItem(CART_KEY);

      const needsInstall = cart.some(i => i.orderType === 'install' || i.orderType === 'order_install');

      navigate('/booking/confirmed', {
        state: {
          booking: {
            id: bookingId,
            estimatedTotal: orderRes.data.data.booking.estimatedTotal,
          },
          type: needsInstall ? 'PARTS_ORDER_WITH_INSTALL' : 'PARTS_ORDER',
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process order. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <h2 style={styles.title}>Checkout</h2>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#f87171', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <div className="glass-card" style={styles.section}>
            <div style={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={18} color="var(--text-secondary)" />
                <h3 style={styles.sectionTitle}>Selected Parts</h3>
              </div>
              <span className="badge badge-blue">{cart.length} Items</span>
            </div>
            {cart.map(item => (
              <div key={item.id} style={styles.cartItem}>
                <img src={item.image || PART_IMAGES[item.name] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80'} alt={item.name} style={styles.cartItemImage} />
                <div style={styles.cartItemInfo}>
                  <div style={styles.cartItemNameRow}>
                    <h4 style={styles.cartItemName}>{item.name} × {item.qty || 1}</h4>
                    <span style={styles.cartItemPrice}>${getItemTotal(item).toFixed(2)}</span>
                  </div>
                  {item.orderType === 'order' && (
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem', display: 'inline-block', marginTop: '0.3rem' }}>Order Only</span>
                  )}
                  {item.orderType === 'install' && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem', display: 'inline-block', marginTop: '0.3rem' }}>Install Only</span>
                  )}
                  {item.orderType === 'order_install' && (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', display: 'inline-block', marginTop: '0.3rem' }}>Order + Install</span>
                  )}
                  <button style={styles.removeBtn} onClick={() => removeItem(item.id, item.orderType)}>Remove Item</button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={styles.section}>
            <div style={styles.sectionHead}>
              <h3 style={styles.sectionTitle}>Delivery & Installation</h3>
            </div>
            <div style={styles.installGrid}>
              <div>
                <p style={styles.fieldLabel}>VEHICLE</p>
                {loadingVehicles ? (
                  <Spinner size="sm" />
                ) : vehicles.length > 0 ? (
                  <select className="form-control" style={{ height: '44px' }} value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNumber})</option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No vehicles found. Add one from your dashboard.</p>
                )}
              </div>
              <div>
                <p style={styles.fieldLabel}>DELIVERY ADDRESS</p>
                <div style={styles.addressBox}>
                  <div>
                    <p style={styles.addressName}>{user?.name || 'Your Name'}</p>
                    <p style={styles.addressLine}>{user?.phone || 'Add phone in settings'}</p>
                  </div>
                  <Pencil size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                </div>
              </div>
              {cart.some(i => i.orderType === 'install' || i.orderType === 'order_install') && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={styles.fieldLabel}>INSTALLATION SLOT</p>
                  <select className="form-control" style={{ height: '44px' }} value={installSlot} onChange={e => setInstallSlot(e.target.value)}>
                    <option>Tuesday, Oct 24 - 09:00 AM</option>
                    <option>Wednesday, Oct 25 - 10:00 AM</option>
                    <option>Thursday, Oct 26 - 02:00 PM</option>
                  </select>
                  <p style={styles.workshopNote}>✓ Parts will be delivered to your location</p>
                </div>
              )}
            </div>
          </div>

          {user?.isIdentityVerified && (
            <div style={styles.verifiedBanner}>
              <div style={styles.verifiedIcon}><Shield size={20} color="var(--accent-primary)" /></div>
              <div>
                <p style={styles.verifiedTitle}>Verified Professional Tier</p>
                <p style={styles.verifiedDesc}>As a verified owner, you are eligible for the Pay-After-Service model. Only pay for the parts now, and settle the installation fee once the job is completed to your satisfaction.</p>
              </div>
            </div>
          )}
        </div>

        <div style={styles.rightCol}>
          <div className="glass-card">
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <div style={styles.summaryRows}>
              {partsSubtotal > 0 && (
                <div style={styles.summaryRow}><span>Subtotal (Parts)</span><span>${partsSubtotal.toFixed(2)}</span></div>
              )}
              <div style={styles.summaryRow}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              {installLabor > 0 && (
                <div style={{ ...styles.summaryRow, color: 'var(--accent-primary)' }}><span>Installation Service</span><span>${installLabor.toFixed(2)}</span></div>
              )}
              <div style={styles.summaryRow}><span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span></div>
            </div>
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <span>Total Due Today</span>
              <span style={styles.totalVal}>${total.toFixed(2)}</span>
            </div>
            {installLabor > 0 && (
              <p style={styles.totalNote}>Remaining ${installLabor.toFixed(2)} due after service.</p>
            )}

            <div style={styles.divider} />

            <div style={styles.payMethods}>
              {[
                { id: 'CARD', label: 'Credit Card', sub: 'Pay with card', icon: <CreditCard size={18} /> },
                { id: 'WALLET', label: 'Digital Wallet (Apple/Google)', icon: <Smartphone size={18} /> },
              ].map(m => (
                <label key={m.id} style={{ ...styles.payOption, borderColor: payMethod === m.id ? 'var(--accent-primary)' : 'var(--border-color)' }}>
                  <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} style={{ accentColor: 'var(--accent-primary)' }} />
                  {m.icon}
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '600' }}>{m.label}</p>
                    {m.sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.sub}</p>}
                  </div>
                </label>
              ))}
            </div>

            <button className="btn btn-primary" style={styles.orderBtn} disabled={submitting || !selectedVehicleId} onClick={handleCompleteOrder}>
              {submitting ? <Spinner size="sm" color="white" /> : 'Complete Secure Order'}
            </button>
            <p style={styles.sslNote}>🔒 Military-grade SSL Encryption</p>

            <div style={styles.guarantee}>
              <CheckCircle size={16} color="var(--success)" />
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Garage Guarantee</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>12-month warranty on all installation services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '2rem' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
  leftCol: { flex: '2 1 460px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  rightCol: { flex: '1 1 280px' },
  section: {},
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#ffffff' },
  cartItem: { display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' },
  cartItemImage: { width: '72px', height: '72px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 },
  cartItemInfo: { flex: 1 },
  cartItemNameRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  cartItemName: { fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', lineHeight: '1.3' },
  cartItemPrice: { fontSize: '1rem', fontWeight: '700', color: '#ffffff', flexShrink: 0 },
  cartItemSub: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
  removeBtn: { background: 'none', border: 'none', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginTop: '0.4rem' },
  installGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  fieldLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.5rem' },
  addressBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.01)' },
  addressName: { fontSize: '0.875rem', fontWeight: '700', color: '#ffffff' },
  addressLine: { fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.4' },
  workshopNote: { fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.4rem' },
  verifiedBanner: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem 1.25rem', borderLeft: '3px solid var(--accent-primary)', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' },
  verifiedIcon: { flexShrink: 0, marginTop: '0.1rem' },
  verifiedTitle: { fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' },
  verifiedDesc: { fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' },
  summaryRows: { display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' },
  divider: { height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700' },
  totalVal: { fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' },
  totalNote: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' },
  payMethods: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' },
  payOption: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'border-color var(--transition-fast)' },
  orderBtn: { width: '100%', height: '50px', fontWeight: '700', marginBottom: '0.5rem' },
  sslNote: { fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.25rem' },
  guarantee: { display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.75rem', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-sm)' },
};