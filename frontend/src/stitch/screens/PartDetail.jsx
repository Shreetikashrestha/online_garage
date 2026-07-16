import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const MOCK_SPECS = {
  Material: 'Advanced Ceramic',
  'Wear Sensor': 'Electronic Integrated',
  'Friction Code': 'GG Rated',
  'Operating Temp': 'Up to 650°C',
  Certification: 'ECE R90',
};

const MOCK_COMPAT = [
  { range: '2020 – 2024 SUV X5', confirmed: true },
  { range: '2019 – 2023 Sedan M3', confirmed: true },
  { range: '2021 – 2024 Coupe G82', confirmed: true },
  { range: '2018 – 2022 Touring G21', confirmed: true },
];

export default function PartDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [showAllCompat, setShowAllCompat] = useState(false);

  const part = location.state?.part || {
    id: id || 'p1',
    name: 'Brake Pad Set',
    category: 'Brakes',
    price: 124.50,
    installationFee: 85.00,
    description: 'High-performance ceramic brake pads with advanced friction compound for consistent stopping power.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    certification: 'Verified Authentic',
    sku: 'G-BRAKE-2024-UP',
  };

  const total = part.price + (part.installationFee || 0);

  const handleAddToCart = () => {
    navigate('/parts/checkout', { state: { cart: [{ ...part, withInstall: false, qty: 1 }] } });
  };

  const handleOrderWithInstall = () => {
    navigate('/parts/checkout', { state: { cart: [{ ...part, withInstall: true, qty: 1 }] } });
  };

  return (
    <>
      <nav className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-xl">
          <span className="font-display-lg text-headline-md font-extrabold text-primary tracking-tighter cursor-pointer" onClick={() => navigate('/')}>Online Garage</span>
          <div className="hidden md:flex gap-lg">
            <a className="font-headline-sm text-headline-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" onClick={() => navigate('/parts')}>Catalogue</a>
            <a className="font-headline-sm text-headline-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" onClick={() => navigate('/services')}>Services</a>
            <a className="font-headline-sm text-headline-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" onClick={() => navigate('/workshops')}>Workshops</a>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="px-md py-sm font-button-text text-button-text border border-outline rounded-lg flex items-center gap-xs" onClick={() => navigate('/parts/checkout')}>
            <span className="material-symbols-outlined">shopping_cart</span>
            Cart
          </button>
          <button className="px-md py-sm bg-[#B71C1C] text-white font-bold rounded-[5px] flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all">
            🚨 SOS Help
          </button>
        </div>
      </nav>

      <div className="flex min-h-screen">
        <aside className="hidden lg:flex flex-col h-screen py-lg px-md w-[280px] bg-tertiary sticky top-[64px]">
          <div className="mb-xxl">
            <h2 className="font-headline-md text-headline-md text-on-tertiary">Workshop Portal</h2>
            <p className="font-body-sm text-body-sm text-on-tertiary-container">Mechanical Precision</p>
          </div>
          <div className="flex flex-col gap-sm flex-grow">
            <a className="flex items-center gap-md px-md py-sm rounded transition-all text-on-tertiary-container hover:bg-surface-tint/20 hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded transition-all text-secondary-container bg-surface-tint/10 border-l-4 border-secondary-container cursor-pointer">
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Parts Catalogue</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded transition-all text-on-tertiary-container hover:bg-surface-tint/20 hover:text-white cursor-pointer" onClick={() => navigate('/invoices')}>
              <span className="material-symbols-outlined">receipt_long</span>
              <span>Invoices</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm rounded transition-all text-on-tertiary-container hover:bg-surface-tint/20 hover:text-white cursor-pointer">
              <span className="material-symbols-outlined">manage_accounts</span>
              <span>Account Settings</span>
            </a>
          </div>
          <div className="mt-auto flex flex-col gap-sm pt-lg border-t border-on-tertiary-fixed-variant">
            <a className="flex items-center gap-md px-md py-sm text-on-tertiary-container hover:text-white transition-all cursor-pointer">
              <span className="material-symbols-outlined">help</span>
              <span>Help Center</span>
            </a>
            <a className="flex items-center gap-md px-md py-sm text-on-tertiary-container hover:text-white transition-all cursor-pointer" onClick={() => { useAuthStore.getState().logout(); navigate('/'); }}>
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </a>
          </div>
        </aside>

        <main className="flex-grow p-lg md:p-xl max-w-[1160px] mx-auto">
          <div className="flex items-center gap-xs text-on-surface-variant font-body-sm text-body-sm mb-lg">
            <a className="cursor-pointer hover:underline" onClick={() => navigate('/parts')}>Catalogue</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <a className="cursor-pointer hover:underline" onClick={() => navigate('/parts')}>Braking Systems</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-semibold">{part.name}</span>
          </div>

          <div className="grid grid-cols-12 gap-gutter">
            <div className="col-span-12 lg:col-span-7 bento-card relative overflow-hidden flex items-center justify-center min-h-[400px]">
              <div className="absolute top-md right-md flex gap-sm">
                <span className="text-[#1B5E20] bg-[#1B5E20]/10 rounded-full px-md py-xs font-label-md text-label-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Authentic
                </span>
              </div>
              <img alt={part.name} className="w-full h-full object-contain transition-transform hover:scale-105 duration-500" src={part.image} />
            </div>

            <div className="col-span-12 lg:col-span-5 bento-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-md">
                  <div>
                    <h1 className="font-headline-lg text-headline-lg mb-xs">{part.name}</h1>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">SKU: {part.sku || `SKU-${part.id?.toUpperCase()}`}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-headline-md text-headline-md">${part.price.toFixed(2)}</span>
                    <span className="text-on-surface-variant font-label-md text-label-md">Excl. Tax</span>
                  </div>
                </div>
                <div className="space-y-md border-t border-outline-variant pt-md">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Part Price</span>
                    <span className="font-semibold">${part.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center group cursor-help">
                    <div className="flex items-center gap-xs">
                      <span className="text-on-surface-variant">Installation Fee</span>
                      <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
                    </div>
                    <span className="font-semibold">+${(part.installationFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-sm px-md bg-surface-container-low rounded">
                    <span className="font-bold">Total Estimate</span>
                    <span className="font-bold text-headline-sm">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-xl space-y-sm">
                <button className="w-full py-md bg-primary text-white font-button-text text-button-text rounded-lg hover:opacity-90 transition-opacity" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="w-full py-md border-2 border-primary text-primary font-button-text text-button-text rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-sm" onClick={handleOrderWithInstall}>
                  <span className="material-symbols-outlined">build</span>
                  Order + Installation
                </button>
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bento-card flex items-center gap-lg">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[32px]">shield_with_heart</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm">Warranty Included</h3>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">24-month or 24,000-mile comprehensive protection on parts and labor.</p>
                </div>
              </div>
              <div className="bento-card flex items-center gap-lg">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[32px]">verified_user</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm">Certified Fleet Status</h3>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">Meets or exceeds OEM specifications for all commercial fleet requirements.</p>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bento-card">
              <h3 className="font-headline-md text-headline-md mb-lg">Technical Specs</h3>
              <dl className="space-y-md">
                {Object.entries(MOCK_SPECS).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-outline-variant pb-xs">
                    <dt className="text-on-surface-variant">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="col-span-12 lg:col-span-8 bento-card">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-md text-headline-md">Vehicle Compatibility</h3>
                <div className="bg-[#1B5E20]/10 text-[#1B5E20] px-md py-xs rounded-full flex items-center gap-xs font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Confirmed for: 2022 SUV X5
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {(showAllCompat ? MOCK_COMPAT : MOCK_COMPAT.slice(0, 4)).map(c => (
                  <div key={c.range} className={`p-md rounded-lg bg-surface-container flex items-center justify-between ${c.confirmed ? 'border-l-4 border-[#1B5E20]' : ''}`}>
                    <span className="font-semibold">{c.range}</span>
                    {c.confirmed && <span className="material-symbols-outlined text-[#1B5E20]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  </div>
                ))}
              </div>
              <button className="mt-lg text-secondary font-button-text text-button-text flex items-center gap-xs hover:underline" onClick={() => setShowAllCompat(!showAllCompat)}>
                {showAllCompat ? 'Show less' : 'View all 42 compatible models'}
                <span className="material-symbols-outlined" style={{ transform: showAllCompat ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>expand_more</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <footer className="flex flex-col md:flex-row justify-between items-center px-margin py-lg w-full bg-surface-container-lowest border-t border-outline-variant mt-xxl">
        <div className="flex flex-col gap-xs mb-lg md:mb-0">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Online Garage</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 Online Garage. Workshop Grade Precision.</p>
        </div>
        <div className="flex gap-lg">
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline cursor-pointer">Terms of Service</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline cursor-pointer">Privacy Policy</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline cursor-pointer">Parts Warranty</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline cursor-pointer">Installation Guide</a>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 w-full h-[40px] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center z-[100]">
        <span className="font-body-sm text-body-sm text-[#5C4D1A]">Applied: Aesthetic-Usability Effect &amp; Von Restorff Effect (SOS Branding)</span>
      </div>
    </>
  );
}
