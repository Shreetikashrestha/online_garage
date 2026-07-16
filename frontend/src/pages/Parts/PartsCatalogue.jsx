import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';

const CATEGORIES = ['All Parts', 'Brakes', 'Engine', 'Electrical', 'Suspension', 'Body Panels', 'Fluids'];

const CART_KEY = 'onlinegarage.cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

const CATEGORY_MAP = {
  'Synthetic Oil 5W-30': 'Fluids',
  'Ceramic Brake Pads (Set)': 'Brakes',
  'Matrix LED Headlight Unit': 'Electrical',
  'Heavy Duty Gas Shocks': 'Suspension',
  '700CCA Startup Battery': 'Electrical',
  'Full Synthetic 5W-30 (5L)': 'Fluids',
  'Ventilated Front Rotor Kit': 'Brakes',
  'High-Flow Air Filter': 'Engine',
};

const PART_IMAGES = {
  'Synthetic Oil 5W-30': 'https://images.unsplash.com/photo-1583182332473-b31ba08929c8?auto=format&fit=crop&w=400&q=80',
  'Ceramic Brake Pads (Set)': 'https://unsplash.com/photos/b7ek9sG9mwU/download?force=true&w=400',
  'Matrix LED Headlight Unit': 'https://unsplash.com/photos/k9-PK7NLWQ4/download?force=true&w=400',
  'Heavy Duty Gas Shocks': 'https://unsplash.com/photos/34yNyLyKJ4Y/download?force=true&w=400',
  '700CCA Startup Battery': 'https://unsplash.com/photos/ovGrEUgrkyE/download?force=true&w=400',
  'Full Synthetic 5W-30 (5L)': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80',
};
const CERT_COLORS = {
  'OEM Grade': { bg: 'rgba(16,185,129,0.85)', label: 'Genuine' },
  'Certified': { bg: 'rgba(59,130,246,0.85)', label: 'Certified' },
  'API SN': { bg: 'rgba(16,185,129,0.85)', label: 'Genuine' },
};

export default function PartsCatalogue() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('All Parts');
  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    async function fetchData() {
      try {
        const partsRes = await api.get('/services/spare-parts');
        setParts(partsRes.data.data.parts.map(p => ({
          ...p,
          category: CATEGORY_MAP[p.name] || 'Parts',
          image: PART_IMAGES[p.name] || `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80`,
        })));
      } catch (err) {
        setError('Failed to load parts. Please try again.');
      }

      if (user) {
        try {
          const vehiclesRes = await api.get('/user/vehicles');
          setVehicles(vehiclesRes.data.data || []);
        } catch {
          // vehicles are optional, ignore failure
        }
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  const filtered = parts.filter(p => {
    const matchCat = activeCategory === 'All Parts' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (part, orderType) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === part.id && i.orderType === orderType);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...part, orderType, qty: 1 }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Spinner size="lg" /></div>;
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Spare Parts Catalogue</h2>
          <p style={styles.sub}>Precision-engineered components for maximum reliability. Filter by vehicle or browse our certified workshop-grade categories.</p>
        </div>
        {vehicles.length > 0 && (
          <div style={styles.vehicleBadge}>
            <div>
              <p style={styles.vehicleBadgeLabel}>ACTIVE VEHICLE</p>
              <p style={styles.vehicleBadgeName}>{vehicles.find(v => v.isPrimary)?.name || `${vehicles[0].make} ${vehicles[0].model}`}</p>
            </div>
            <span className="badge badge-success">100% Compatible</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div style={styles.searchRow}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search part name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', height: '40px' }}
          />
        </div>
        <button className="btn btn-primary" style={{ position: 'relative' }} onClick={() => navigate('/parts/checkout', { state: { cart } })} disabled={cartCount === 0}>
          <ShoppingCart size={18} />
          Cart
          {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>

      <div style={styles.categories}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            style={{ ...styles.categoryBtn, backgroundColor: activeCategory === c ? '#000' : 'transparent', color: activeCategory === c ? '#fff' : 'var(--text-secondary)', border: `1px solid ${activeCategory === c ? '#000' : 'var(--border-color)'}` }}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filtered.map(part => {
          const certStyle = CERT_COLORS[part.certification] || { bg: 'rgba(16,185,129,0.85)', label: part.certification };
          return (
            <div key={part.id} className="glass-card" style={styles.partCard}>
              <div style={styles.partImageWrapper} onClick={() => navigate(`/parts/${part.id}`, { state: { part } })}>
                <img src={part.image} alt={part.name} style={styles.partImage} />
                <span style={{ ...styles.certBadge, backgroundColor: certStyle.bg }}>{certStyle.label}</span>
              </div>
              <div style={styles.partBody}>
                <p style={styles.partCategory}>{part.category}</p>
                <div style={styles.partNameRow}>
                  <h3 style={styles.partName} onClick={() => navigate(`/parts/${part.id}`, { state: { part } })}>{part.name}</h3>
                  <span style={styles.partPrice}>${part.price.toFixed(2)}</span>
                </div>
                <p style={styles.partDesc}>{part.description}</p>
                <div style={styles.partActions}>
                  <button className="btn btn-secondary" style={styles.partBtn} onClick={() => addToCart(part, 'order')}>
                    $&nbsp;Order
                  </button>
                  <button className="btn btn-secondary" style={styles.partBtn} onClick={() => addToCart(part, 'install')}>
                    🔧&nbsp;Install
                  </button>
                  <button className="btn btn-primary" style={styles.partBtn} onClick={() => addToCart(part, 'order_install')}>
                    Both
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No parts match your search.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' },
  sub: { fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.3rem', maxWidth: '560px' },
  vehicleBadge: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' },
  vehicleBadgeLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' },
  vehicleBadgeName: { fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' },
  searchRow: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' },
  searchWrapper: { flex: 1, position: 'relative' },
  cartBadge: { position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  categories: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' },
  categoryBtn: { padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all var(--transition-fast)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' },
  partCard: { padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  partImageWrapper: { position: 'relative', height: '180px', overflow: 'hidden', cursor: 'pointer' },
  partImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' },
  certBadge: { position: 'absolute', top: '0.6rem', right: '0.6rem', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' },
  partBody: { padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  partCategory: { fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' },
  partNameRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  partName: { fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', cursor: 'pointer', lineHeight: '1.3', flex: 1 },
  partPrice: { fontSize: '1rem', fontWeight: '800', color: '#ffffff', flexShrink: 0 },
  partDesc: { fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', flexGrow: 1 },
  partActions: { display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem' },
  partBtn: { flex: 1, padding: '0.5rem 0.4rem', fontSize: '0.78rem' },
};