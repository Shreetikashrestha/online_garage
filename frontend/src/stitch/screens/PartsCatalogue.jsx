import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';

const CATEGORIES = ['All Parts', 'Brakes', 'Engine', 'Electrical', 'Suspension', 'Body Panels', 'Fluids'];

const CATEGORY_LABELS = {
  Brakes: 'Braking Systems',
  Engine: 'Engine Intake',
  Electrical: 'Lighting',
  Suspension: 'Suspension',
  'Body Panels': 'Body Parts',
  Fluids: 'Fluids',
};

const MOCK_PARTS = [
  { id: 'p1', name: 'Ventilated Front Rotor Kit', category: 'Brakes', price: 425, installationFee: 85, description: 'Precision machined from high-carbon steel. Improved heat dissipation and zero-fade performance for heavy-duty applications.', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=80', certification: 'OEM Grade' },
  { id: 'p2', name: 'High-Flow Air Filter', category: 'Engine', price: 89, installationFee: 30, description: 'Micro-glass filtration technology providing 99.9% protection against contaminants while optimizing airflow to the combustion chamber.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', certification: 'OEM Grade' },
  { id: 'p3', name: 'Matrix LED Headlight Unit', category: 'Electrical', price: 1250, installationFee: 200, description: 'OEM replacement with adaptive beam technology. Full integration with onboard computer systems. Plug-and-play installation.', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80', certification: 'OEM Grade' },
  { id: 'p4', name: 'Heavy Duty Gas Shocks', category: 'Suspension', price: 210, installationFee: 120, description: 'Twin-tube nitrogen gas charged shocks. Designed for optimal control and comfort on corrugated roads and off-road terrain.', image: 'https://images.unsplash.com/photo-1604006852748-903fccbc4019?auto=format&fit=crop&w=400&q=80', certification: 'OEM Grade' },
  { id: 'p5', name: '700CCA Startup Battery', category: 'Electrical', price: 195, installationFee: 40, description: 'Maintenance-free Calcium/Calcium battery. High cold cranking amps for reliable starting in extreme temperatures.', image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=400&q=80', certification: 'OEM Grade' },
  { id: 'p6', name: 'Full Synthetic 5W-30 (5L)', category: 'Fluids', price: 72, installationFee: 25, description: 'Advanced friction protection. Formulated to exceed Toyota Hilux service specifications for fuel economy and engine longevity.', image: 'https://images.unsplash.com/photo-1558618047-f4e684ca5c89?auto=format&fit=crop&w=400&q=80', certification: 'API SN' },
];

const CERT_MAP = {
  'OEM Grade': { bg: 'bg-[#1B5E20]/10', text: 'text-[#1B5E20]', border: 'border-[#1B5E20]/20', label: 'Genuine' },
  'API SN': { bg: 'bg-[#1A4A8A]/10', text: 'text-[#1A4A8A]', border: 'border-[#1A4A8A]/20', label: 'Certified' },
};

export default function PartsCatalogue() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('All Parts');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/parts');
        setParts(res.data.data?.parts || res.data.data || MOCK_PARTS);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load parts.');
        setParts(MOCK_PARTS);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, []);

  const filtered = parts.filter(p => {
    const matchCat = activeCategory === 'All Parts' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (part, withInstall = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === part.id && i.withInstall === withInstall);
      if (existing) return prev;
      return [...prev, { ...part, withInstall, qty: 1 }];
    });
  };

  const cartCount = cart.length;

  const badge = (cert) => CERT_MAP[cert] || { bg: 'bg-[#B71C1C]/10', text: 'text-[#B71C1C]', border: 'border-[#B71C1C]/20', label: cert };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-xl">
          <span className="font-display-lg text-headline-md font-extrabold text-primary tracking-tighter cursor-pointer" onClick={() => navigate('/')}>Online Garage</span>
          <div className="hidden md:flex gap-lg items-center">
            <a className="font-headline-sm text-secondary border-b-2 border-secondary transition-colors py-xs cursor-pointer" onClick={e => { e.preventDefault(); navigate('/parts'); }}>Catalogue</a>
            <a className="font-headline-sm text-on-surface-variant hover:text-secondary transition-colors py-xs cursor-pointer" onClick={e => { e.preventDefault(); navigate('/services'); }}>Services</a>
            <a className="font-headline-sm text-on-surface-variant hover:text-secondary transition-colors py-xs cursor-pointer" onClick={e => { e.preventDefault(); navigate('/workshops'); }}>Workshops</a>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="pl-10 pr-md py-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary w-64 text-body-sm transition-all"
              placeholder="Search part number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
          <button
            className="flex items-center gap-xs px-md py-sm bg-surface-container-highest hover:bg-surface-container-high transition-colors rounded-lg font-button-text text-on-surface relative"
            onClick={() => navigate('/parts/checkout', { state: { cart } })}
            disabled={cartCount === 0}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </button>
          <button className="bg-[#B71C1C] text-white font-bold px-lg py-sm rounded-[5px] flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all">
            <span>🚨 SOS Help</span>
          </button>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col h-screen py-lg px-md w-[280px] sticky top-[64px] bg-tertiary text-white shadow-lg shrink-0">
          <div className="mb-xxl">
            <div className="flex items-center gap-sm mb-md">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <p className="font-headline-sm text-white">Workshop Portal</p>
                <p className="text-body-sm text-on-tertiary-container">Mechanical Precision</p>
              </div>
            </div>
          </div>
          <nav className="flex-grow space-y-sm">
            <a className="flex items-center gap-md p-md rounded-lg text-on-tertiary-container hover:bg-surface-tint/20 hover:text-white transition-all cursor-pointer" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="flex items-center gap-md p-md rounded-lg text-secondary-container border-l-4 border-secondary-container bg-surface-tint/10 transition-all cursor-pointer">
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Parts Catalogue</span>
            </a>
            <a className="flex items-center gap-md p-md rounded-lg text-on-tertiary-container hover:bg-surface-tint/20 hover:text-white transition-all cursor-pointer" onClick={e => { e.preventDefault(); navigate('/invoices'); }}>
              <span className="material-symbols-outlined">receipt_long</span>
              <span>Invoices</span>
            </a>
            <a className="flex items-center gap-md p-md rounded-lg text-on-tertiary-container hover:bg-surface-tint/20 hover:text-white transition-all cursor-pointer">
              <span className="material-symbols-outlined">manage_accounts</span>
              <span>Account Settings</span>
            </a>
          </nav>
          <div className="mt-auto space-y-sm pt-lg border-t border-on-tertiary-fixed-variant">
            <a className="flex items-center gap-md p-md text-on-tertiary-container hover:text-white transition-all cursor-pointer">
              <span className="material-symbols-outlined">help</span>
              <span>Help Center</span>
            </a>
            <a className="flex items-center gap-md p-md text-on-tertiary-container hover:text-white transition-all cursor-pointer" onClick={e => { e.preventDefault(); useAuthStore.getState().logout(); navigate('/'); }}>
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow px-margin py-xl bg-background max-w-[1440px] mx-auto lg:mx-0">
          {/* Header & Filter Section */}
          <header className="mb-xxl">
            <div className="flex flex-col md:flex-row justify-between items-end gap-lg mb-lg">
              <div>
                <h1 className="font-display-lg text-headline-lg text-primary mb-xs">Spare Parts Catalogue</h1>
                <p className="text-on-surface-variant max-w-2xl">Precision-engineered components for maximum reliability. Filter by vehicle or browse our certified workshop-grade categories.</p>
              </div>
              {user && (
                <div className="bg-white border border-outline-variant rounded-lg p-sm flex items-center gap-md shadow-sm">
                  <div className="flex flex-col px-md border-r border-outline-variant">
                    <span className="text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Active Vehicle</span>
                    <span className="font-bold flex items-center gap-xs">
                      Toyota Hilux 2024
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </span>
                  </div>
                  <div className="flex flex-col px-md">
                    <span className="text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Parts Match</span>
                    <span className="text-[#1B5E20] font-bold">100% Compatible</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile search bar */}
            <div className="relative lg:hidden mb-lg">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full pl-10 pr-md py-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary text-body-sm transition-all"
                placeholder="Search part number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-sm overflow-x-auto pb-sm scrollbar-hide">
              {CATEGORIES.map(c => {
                const isActive = activeCategory === c;
                return (
                  <button
                    key={c}
                    className={`px-lg py-sm rounded-full font-button-text whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setActiveCategory(c)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-lg py-3 rounded-lg mb-xl" style={{ color: '#f87171' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
          )}

          {/* Parts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
            {filtered.map(part => {
              const b = badge(part.certification);
              return (
                <div key={part.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-shadow group" style={{ boxShadow: 'none' }}>
                  <div className="h-64 bg-surface-container relative overflow-hidden cursor-pointer" onClick={() => navigate(`/parts/${part.id}`, { state: { part } })}>
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={part.image}
                      alt={part.name}
                    />
                    <div className="absolute top-md right-md">
                      <span className={`${b.bg} ${b.text} font-bold text-label-md px-md py-xs rounded-full uppercase tracking-widest border ${b.border}`}>
                        {b.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-lg">
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <p className="text-on-surface-variant text-label-md uppercase mb-xs">{CATEGORY_LABELS[part.category] || part.category}</p>
                        <h3 className="font-headline-sm text-primary cursor-pointer" onClick={() => navigate(`/parts/${part.id}`, { state: { part } })}>{part.name}</h3>
                      </div>
                      <span className="text-headline-sm font-bold text-primary">${part.price.toFixed(2)}</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mb-lg line-clamp-2">{part.description}</p>
                    <div className="flex gap-sm">
                      <button className="flex-grow bg-primary text-white font-button-text py-md rounded-[5px] hover:bg-primary/90 transition-colors" onClick={() => addToCart(part, false)}>
                        Add to Cart
                      </button>
                      <button className="flex items-center justify-center border border-primary text-primary px-lg py-md rounded-[5px] hover:bg-primary/5 transition-colors font-button-text" onClick={() => addToCart(part, true)}>
                        Order + Install
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-xxl text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-lg">inventory_2</span>
              <h3 className="font-headline-sm text-primary mb-sm">No parts found</h3>
              <p className="text-body-sm text-on-surface-variant">No parts match your current search or filter criteria.</p>
              <button className="mt-lg px-lg py-sm bg-primary text-white rounded-full font-button-text hover:bg-primary/90 transition-colors" onClick={() => { setActiveCategory('All Parts'); setSearchQuery(''); }}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-margin py-lg w-full bg-surface-container-lowest border-t border-outline-variant text-on-surface">
        <div className="mb-md md:mb-0">
          <span className="font-label-md text-label-md font-bold uppercase tracking-widest">Online Garage</span>
          <p className="text-body-sm text-on-surface-variant mt-xs">© 2024 Online Garage. Workshop Grade Precision.</p>
        </div>
        <div className="flex gap-lg">
          <a className="text-body-sm text-on-surface-variant hover:underline transition-all cursor-pointer">Terms of Service</a>
          <a className="text-body-sm text-on-surface-variant hover:underline transition-all cursor-pointer">Privacy Policy</a>
          <a className="text-body-sm text-on-surface-variant hover:underline transition-all cursor-pointer">Parts Warranty</a>
          <a className="text-body-sm text-on-surface-variant hover:underline transition-all cursor-pointer">Installation Guide</a>
        </div>
      </footer>

      {/* UX Law Strip */}
      <div className="fixed bottom-0 left-0 w-full h-[40px] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center z-[100]">
        <p className="text-body-sm text-[#7D6608] font-medium">Applied: Hick's Law — Categorized navigation reduces decision-making time for complex inventory.</p>
      </div>
    </div>
  );
}
