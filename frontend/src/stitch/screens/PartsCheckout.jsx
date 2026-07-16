import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function PartsCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [cart, setCart] = useState(location.state?.cart || []);
  const [payMethod, setPayMethod] = useState('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [installSlot, setInstallSlot] = useState('Tuesday, Oct 24 - 09:00 AM');

  if (cart.length === 0) {
    navigate('/parts');
    return null;
  }

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const partsSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const installLabor = cart.filter(i => i.withInstall).reduce((s, i) => s + (i.installationFee || 0), 0);
  const tax = partsSubtotal * 0.08;
  const total = partsSubtotal + installLabor + tax;

  const handleCompleteOrder = async () => {
    setSubmitting(true);
    try {
      await api.post('/orders', {
        items: cart,
        payMethod,
        installSlot: installSlot,
        partsSubtotal,
        installLabor,
        tax,
        total,
      });
      navigate('/dashboard');
    } catch {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="w-full animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-xl">
          <span className="font-display-lg text-headline-md font-extrabold text-primary tracking-tighter cursor-pointer" onClick={() => navigate('/')}>Online Garage</span>
          <div className="hidden md:flex gap-lg items-center">
            <a className="font-headline-sm text-secondary border-b-2 border-secondary transition-colors py-xs cursor-pointer" onClick={e => { e.preventDefault(); navigate('/parts'); }}>Parts Store</a>
            <a className="font-headline-sm text-on-surface-variant hover:text-secondary transition-colors py-xs cursor-pointer" onClick={e => { e.preventDefault(); navigate('/services'); }}>Services</a>
            <a className="font-headline-sm text-on-surface-variant hover:text-secondary transition-colors py-xs cursor-pointer" onClick={e => { e.preventDefault(); navigate('/workshops'); }}>Workshops</a>
          </div>
        </div>
        <div className="flex items-center gap-md">
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
            <a className="flex items-center gap-md p-md rounded-lg text-secondary-container border-l-4 border-secondary-container bg-surface-tint/10 transition-all cursor-pointer" onClick={e => { e.preventDefault(); navigate('/parts'); }}>
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
          {/* Progress Stepper */}
          <div className="bg-surface border border-outline-variant p-lg rounded-xl shadow-sm mb-xl">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant -z-10"></div>
              <div className="flex flex-col items-center gap-xs">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <span className="text-label-md font-label-md">Selection</span>
              </div>
              <div className="flex flex-col items-center gap-xs">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <span className="text-label-md font-label-md">Details</span>
              </div>
              <div className="flex flex-col items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold ring-4 ring-secondary-container/30">3</div>
                <span className="text-label-md font-label-md text-primary font-bold">Schedule</span>
              </div>
              <div className="flex flex-col items-center gap-xs">
                <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant flex items-center justify-center font-bold">4</div>
                <span className="text-label-md font-label-md text-on-surface-variant">Confirm</span>
              </div>
            </div>
          </div>

          {/* Checkout Grid */}
          <div className="grid grid-cols-12 gap-gutter">
            {/* Left Column: Details */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-lg">
              {/* Selected Parts */}
              <section className="bg-white border border-outline-variant rounded-lg p-lg shadow-sm">
                <div className="flex justify-between items-center mb-xl border-b border-outline-variant pb-md">
                  <h3 className="font-headline-sm text-headline-sm flex items-center gap-md">
                    <span className="material-symbols-outlined text-secondary">shopping_basket</span>
                    Selected Parts
                  </h3>
                  <span className="bg-[#1A4A8A1A] text-[#1A4A8A] text-label-md font-label-md px-md py-xs rounded-full">{cart.length} Item{cart.length !== 1 && 's'}</span>
                </div>
                <div className="space-y-md">
                  {cart.map(item => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-lg p-md border border-outline-variant rounded-lg hover:border-secondary transition-colors">
                      <div className="w-24 h-24 bg-surface-container rounded-lg shrink-0 overflow-hidden">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-xs">
                          <h4 className="font-headline-sm text-body-lg font-bold">{item.name}</h4>
                          <span className="font-bold text-body-lg">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                        <p className="text-on-surface-variant text-body-sm mb-md">Compatible with your vehicle</p>
                        <div className="flex items-center gap-md">
                          {item.withInstall && (
                            <span className="bg-[#1B5E20]/10 text-[#1B5E20] rounded-full px-sm py-1 font-label-md text-label-md flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              Professional Install Recommended
                            </span>
                          )}
                          <button className="text-error font-label-md text-label-md hover:underline" onClick={() => removeItem(item.id)}>Remove Item</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Installation & Shipping */}
              <section className="bg-white border border-outline-variant rounded-lg p-lg shadow-sm">
                <h3 className="font-headline-sm text-headline-sm flex items-center gap-md mb-xl border-b border-outline-variant pb-md">
                  <span className="material-symbols-outlined text-secondary">calendar_month</span>
                  Installation & Shipping
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs block">Delivery Address</label>
                    <div className="p-md border border-outline-variant rounded-lg bg-surface hover:border-secondary transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-button-text text-button-text">{user?.name || 'John Doe'}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Workshop District, {user?.phone || 'Your Location'}</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">edit</span>
                      </div>
                    </div>
                  </div>
                  {cart.some(i => i.withInstall) && (
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs block">Installation Slot (Certified Workshop)</label>
                      <select className="w-full p-md border border-outline-variant rounded-lg bg-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none font-body-md" value={installSlot} onChange={e => setInstallSlot(e.target.value)}>
                        <option>Tuesday, Oct 24 - 09:00 AM</option>
                        <option>Tuesday, Oct 24 - 02:00 PM</option>
                        <option>Wednesday, Oct 25 - 10:00 AM</option>
                        <option>Thursday, Oct 26 - 11:30 AM (Fastest)</option>
                      </select>
                      <p className="mt-sm text-body-sm text-[#1B5E20] flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        Workshop: Nearby Precision Motors (2.4 miles)
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Verified Tier */}
              {user?.isIdentityVerified && (
                <section className="bg-[#F4F4F2] border-l-4 border-secondary p-lg rounded-r-xl flex items-center gap-lg">
                  <div className="p-sm bg-secondary text-white rounded-full">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm">Verified Professional Tier</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">As a verified owner, you are eligible for the <strong>Pay-After-Service</strong> model. Only pay for the parts now, and settle the installation fee once the job is completed to your satisfaction.</p>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-lg">
              <section className="bg-white border border-outline-variant rounded-lg p-lg shadow-sm sticky top-24">
                <h3 className="font-headline-sm text-headline-sm mb-lg border-b border-outline-variant pb-md">Order Summary</h3>
                <div className="space-y-md mb-lg">
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Subtotal (Parts)</span>
                    <span>${partsSubtotal.toFixed(2)}</span>
                  </div>
                  {installLabor > 0 && (
                    <div className="flex justify-between text-body-md font-bold text-secondary">
                      <span className="flex items-center gap-xs">Installation Service <span className="material-symbols-outlined text-[16px]">info</span></span>
                      <span>${installLabor.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="text-[#1B5E20]">FREE</span>
                  </div>
                </div>
                <div className="border-t-2 border-dashed border-outline-variant pt-lg mb-lg">
                  <div className="flex justify-between items-end mb-sm">
                    <span className="font-headline-sm text-headline-sm">Total Due Today</span>
                    <span className="font-headline-lg text-headline-lg text-primary">${total.toFixed(2)}</span>
                  </div>
                  {installLabor > 0 && (
                    <p className="text-body-sm text-on-surface-variant text-right">Remaining ${installLabor.toFixed(2)} due after service.</p>
                  )}
                </div>

                {/* Trust Signals */}
                <div className="flex flex-col gap-sm mb-lg">
                  <div className="flex items-center gap-sm text-[#1B5E20] bg-[#1B5E20]/5 p-sm rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span className="font-label-md text-label-md">Genuine Certified Parts</span>
                  </div>
                  <div className="flex items-center gap-sm text-[#1A4A8A] bg-[#1A4A8A]/5 p-sm rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">security</span>
                    <span className="font-label-md text-label-md">12-Month / 12k Mile Warranty</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-sm mb-lg">
                  {[
                    { id: 'CARD', label: 'Credit Card', sub: 'Visa ending in 4421', icon: 'credit_card' },
                    { id: 'WALLET', label: 'Digital Wallet (Apple/Google)', icon: 'account_balance_wallet' },
                  ].map(m => (
                    <button
                      key={m.id}
                      className={`w-full flex items-center justify-between p-md rounded-lg bg-surface transition-all ${payMethod === m.id ? 'border-2 border-primary' : 'border border-outline-variant hover:bg-surface-container-low'}`}
                      onClick={() => setPayMethod(m.id)}
                    >
                      <div className="flex items-center gap-md">
                        <span className="material-symbols-outlined">{m.icon}</span>
                        <div className="text-left">
                          <p className="font-button-text text-button-text">{m.label}</p>
                          {m.sub && <p className="font-body-sm text-body-sm text-on-surface-variant">{m.sub}</p>}
                        </div>
                      </div>
                      {payMethod === m.id && <span className="material-symbols-outlined text-secondary">check_circle</span>}
                    </button>
                  ))}
                </div>

                <button className="w-full bg-primary text-white py-md rounded-lg font-button-text text-button-text hover:bg-tertiary transition-all mb-md shadow-lg flex items-center justify-center" disabled={submitting} onClick={handleCompleteOrder}>
                  {submitting ? <Spinner size="sm" color="white" /> : 'Complete Secure Order'}
                </button>
                <p className="text-center text-body-sm text-on-surface-variant flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Military-grade SSL Encryption
                </p>
              </section>

              {/* Guarantee */}
              <div className="p-md border border-outline-variant border-dashed rounded-lg flex gap-md items-center">
                <span className="material-symbols-outlined text-secondary text-[32px]">verified</span>
                <div>
                  <p className="font-label-md text-label-md text-primary">GARAGE GUARANTEE</p>
                  <p className="text-body-sm text-on-surface-variant">12-month warranty on all installation services.</p>
                </div>
              </div>
            </div>
          </div>
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
        <p className="text-body-sm text-[#7D6608] font-medium">Applied: Progressive Disclosure & Goal Gradient Effect</p>
      </div>
    </div>
  );
}
