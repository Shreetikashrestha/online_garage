import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const MOCK_INVOICES = [
  { id: '#INV-88219', date: 'Nov 02, 2023', status: 'OVERDUE', amount: 245.00, service: 'Mechanical', vehicle: 'Toyota Hilux', provider: 'Apex Auto Solutions' },
  { id: '#INV-88104', date: 'Oct 14, 2023', status: 'PAID', amount: 1220.00, service: 'Towing', vehicle: 'Mahindra Thar', provider: 'Rapid Rescue Towing' },
  { id: '#INV-87955', date: 'Sep 28, 2023', status: 'PAID', amount: 86.00, service: 'Spare Parts', vehicle: 'Toyota Hilux', provider: 'Genuine Motors Hub' },
  { id: '#INV-87501', date: 'Aug 12, 2023', status: 'PAID', amount: 3420.00, service: 'Mechanical', vehicle: 'Mahindra Thar', provider: 'Precision Gearbox Works' },
  { id: '#INV-87222', date: 'Jul 05, 2023', status: 'OVERDUE', amount: 175.00, service: 'Towing', vehicle: 'Toyota Hilux', provider: 'Rapid Rescue Towing' },
];

const STATUS_STYLE = {
  OVERDUE: { bg: 'bg-[#B71C1C]/10', text: 'text-[#B71C1C]' },
  PAID: { bg: 'bg-[#1B5E20]/10', text: 'text-[#1B5E20]' },
  REFUNDED: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
};

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [payingId, setPayingId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data.data?.invoices || res.data.data || []);
    } catch {
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalSpend = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

  const filtered = invoices.filter(i =>
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.service?.toLowerCase().includes(search.toLowerCase()) ||
    i.vehicle?.toLowerCase().includes(search.toLowerCase())
  );

  const lastDate = invoices.length > 0
    ? invoices.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
    : 'N/A';

  const handlePayNow = (id) => {
    setPayingId(id);
    setTimeout(() => {
      setPayingId(null);
      alert('Payment processed successfully!');
    }, 1500);
  };

  const handleDownload = (inv) => {
    alert(`Downloading PDF for ${inv.id}`);
  };

  if (loading) {
    return (
      <div className="ml-[280px] pt-16 h-screen flex items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-tertiary dark:bg-tertiary-container border-r border-outline-variant flex flex-col overflow-y-auto px-4 py-8 z-20">
        <div className="mb-10 px-4">
          <h1 className="font-headline-md text-headline-md font-bold text-on-tertiary">Online Garage</h1>
          <p className="text-on-tertiary-fixed-variant font-body-sm text-body-sm mt-1">Professional Workshop</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200 cursor-pointer" onClick={() => navigate('/vehicles')}>
            <span className="material-symbols-outlined">directions_car</span>
            <span className="font-body-md text-body-md">My Vehicles</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200 cursor-pointer" onClick={() => navigate('/order-history')}>
            <span className="material-symbols-outlined">history</span>
            <span className="font-body-md text-body-md">Order History</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200 cursor-pointer" onClick={() => navigate('/compatibility')}>
            <span className="material-symbols-outlined">extension</span>
            <span className="font-body-md text-body-md">Compatibility</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 border-l-4 border-secondary text-on-tertiary font-bold bg-surface-variant/10 transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Invoices</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200 cursor-pointer" onClick={() => navigate('/settings')}>
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Account Settings</span>
          </a>
        </nav>
        <div className="mt-auto px-4 pt-8 border-t border-surface-variant/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container">
            <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKjpRsDPrTz9TUoDYIS8Vjn__dvVm6KLvYUkdp2Xi382ZyrOrltABZv9t70rWh2Wf-SR8Fl0tKeqbJWA68DPlLfC4RsgNzAeNHgh4KrVVNyNSYxCwVWXw0IJEaUSVAiBOhPWq4iulYH9L_sBD7BE_fotk4iY0RVGCPXOvBiCJxLcqrzUxWgh7Qa6d1bcoYBB-KiNTz64ylMP7PBIcUa2w8HuyGjCMW4Ou4SoykWaF7iQrAvYr9wmzuFcgo2wdC2AMDW3TBpeYDhfA" />
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-tertiary">Alex Garage</p>
            <p className="text-[10px] text-on-tertiary-fixed-variant uppercase tracking-wider">Manager</p>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface dark:bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-lg z-10">
        <div className="flex items-center gap-8">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Invoices</h2>
          <nav className="hidden md:flex gap-6">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-all cursor-pointer" onClick={() => navigate('/vehicles')}>Vehicles</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-all cursor-pointer">Support</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <input
              className="bg-surface-container-low border border-outline-variant rounded-[5px] pl-10 pr-4 py-1.5 text-sm focus:border-secondary focus:ring-0 w-64 transition-all"
              placeholder="Search invoices..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          </div>
          <button className="bg-[#B71C1C] text-white px-4 py-2 rounded-[5px] font-button-text text-button-text flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md" onClick={() => navigate('/sos')}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
            SOS Help
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-[280px] pt-16 h-screen overflow-y-auto bg-surface">
        <div className="p-margin max-w-[1440px] mx-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-lg py-3 rounded-lg mb-xl text-red-600">
              <span className="material-symbols-outlined text-lg">warning</span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
            <div className="bg-white border border-outline-variant p-lg rounded-lg flex flex-col justify-between h-40">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Total Lifetime Spending</p>
                <h3 className="font-display-lg text-display-lg mt-2 text-primary">
                  ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[#1B5E20]">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="text-xs font-semibold">All time spending</span>
              </div>
            </div>

            <div className="bg-white border border-outline-variant p-lg rounded-lg flex flex-col justify-between h-40 relative overflow-hidden">
              <div className="z-10">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Outstanding Balance</p>
                <h3 className="font-display-lg text-display-lg mt-2 text-[#B71C1C]">
                  ${outstanding.toFixed(2)}
                </h3>
              </div>
              <div className="z-10">
                {overdueCount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#B71C1C]/10 text-[#B71C1C]">
                    {overdueCount} Overdue Invoice{overdueCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">warning</span>
              </div>
            </div>

            <div className="bg-primary text-white p-lg rounded-lg flex flex-col justify-between h-40">
              <div>
                <p className="font-label-md text-label-md text-on-primary-fixed-variant uppercase tracking-widest text-surface-variant/60">Last Service Date</p>
                <h3 className="font-headline-lg text-headline-lg mt-2">{lastDate}</h3>
              </div>
              <button className="text-white text-xs font-bold underline flex items-center gap-1 hover:text-secondary-container transition-colors" onClick={() => navigate('/booking-history')}>
                View Service Logs <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h4 className="font-headline-sm text-headline-sm">Invoice History</h4>
              {overdueCount > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#B71C1C]/10 text-[#B71C1C]">
                  <span className="material-symbols-outlined text-sm">error_outline</span>
                  {overdueCount} Overdue
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">receipt_long</span>
                <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
                  {search ? 'No invoices match your search.' : 'No invoices found.'}
                </p>
                {search && (
                  <button className="mt-3 text-sm font-semibold text-secondary hover:underline" onClick={() => setSearch('')}>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Invoice ID</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Description</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Status</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Amount</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Date</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filtered.map(inv => {
                      const s = STATUS_STYLE[inv.status] || { bg: 'bg-gray-500/10', text: 'text-gray-600' };
                      return (
                        <tr key={inv.id} className="invoice-row transition-all duration-200">
                          <td className="px-lg py-5 font-bold font-body-md text-body-md">{inv.id}</td>
                          <td className="px-lg py-5 font-body-md text-body-md text-on-surface-variant">
                            {inv.service}{inv.vehicle ? ` — ${inv.vehicle}` : ''}
                          </td>
                          <td className="px-lg py-5">
                            <span className={`px-3 py-1 rounded-full ${s.bg} ${s.text} text-[11px] font-bold uppercase tracking-wider`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-lg py-5 font-bold font-body-md text-body-md">${inv.amount.toFixed(2)}</td>
                          <td className="px-lg py-5 font-body-md text-body-md text-on-surface-variant">{inv.date}</td>
                          <td className="px-lg py-5 text-right">
                            {inv.status === 'OVERDUE' ? (
                              <button
                                className="bg-primary text-white px-4 py-1.5 rounded-[5px] text-xs font-bold hover:bg-secondary transition-all active:scale-95 flex items-center gap-2 ml-auto disabled:opacity-50"
                                onClick={() => handlePayNow(inv.id)}
                                disabled={payingId === inv.id}
                              >
                                {payingId === inv.id ? (
                                  <>Processing...</>
                                ) : (
                                  <>Pay Now</>
                                )}
                              </button>
                            ) : (
                              <button
                                className="text-on-surface-variant hover:text-primary flex items-center gap-1 ml-auto transition-colors"
                                onClick={() => handleDownload(inv)}
                              >
                                <span className="material-symbols-outlined text-lg">download</span>
                                <span className="font-button-text text-xs">PDF</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
              <p className="text-sm text-on-surface-variant">
                Showing <span className="font-bold">1-{Math.min(filtered.length, 5)}</span> of <span className="font-bold">{filtered.length}</span> invoice{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant rounded bg-white text-on-surface-variant disabled:opacity-50" disabled={filtered.length <= 5}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 border border-outline-variant rounded bg-white text-on-surface-variant disabled:opacity-50" disabled={filtered.length <= 5}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Promo Cards */}
          <div className="mt-xl grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <div className="bg-secondary-container p-lg rounded-lg flex items-center gap-6 group hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-secondary-container">Garage Care Subscription</h4>
                <p className="font-body-sm text-body-sm text-on-secondary-container/80 mt-1">Get 15% off all invoices with our annual maintenance plan. Proactive care for your vehicle.</p>
                <button className="mt-3 font-button-text text-button-text text-on-secondary-container flex items-center gap-2 group-hover:gap-4 transition-all">
                  Learn More <span className="material-symbols-outlined">east</span>
                </button>
              </div>
            </div>
            <div className="bg-tertiary-container p-lg rounded-lg flex items-center gap-6 group hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-on-tertiary">
                <span className="material-symbols-outlined text-4xl">contact_support</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-tertiary">Billing Questions?</h4>
                <p className="font-body-sm text-body-sm text-on-tertiary/60 mt-1">Chat with our finance department about invoice discrepancies or custom payment plans.</p>
                <button className="mt-3 font-button-text text-button-text text-on-tertiary flex items-center gap-2 group-hover:gap-4 transition-all">
                  Open Ticket <span className="material-symbols-outlined">contact_mail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
