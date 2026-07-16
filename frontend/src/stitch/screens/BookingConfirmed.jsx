// Stitch-generated: BookingConfirmed
import { useNavigate, useLocation } from 'react-router-dom';

export default function BookingConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, mechanic, service } = location.state || {};

  if (!booking) { navigate('/dashboard'); return null; }

  const mechName = mechanic?.name || mechanic?.user?.name || 'Assigned Mechanic';
  const refNo = `#MH-${booking.id?.slice(-5).toUpperCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tracking/${booking.id}`);
    alert('Tracking link copied!');
  };

  return (
    <>
      <header className="bg-white border-b border-outline-variant px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold tracking-tight">Online Garage</span>
        </div>
        <button
          className="bg-[#B71C1C] text-white px-4 py-2 rounded-[5px] flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-all"
          onClick={() => navigate('/sos')}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          SOS Help
        </button>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
        <section className="bg-[#F1F8E9] border border-[#C8E6C9] rounded-[8px] p-6 flex items-start gap-4">
          <div className="bg-[#1B5E20] text-white p-1 rounded-md mt-1">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-[#1B5E20] text-xl font-heading font-bold">Booking confirmed! Mechanic is on the way.</h1>
            <p className="text-[#1B5E20] opacity-80 text-sm mt-1">Confirmation sent to your phone and email</p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col h-full">
            <h2 className="text-lg font-heading font-bold mb-6">Booking details</h2>
            <div className="space-y-3 text-sm flex-grow">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Ref:</span>
                <span className="font-bold">{refNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mechanic:</span>
                <span className="font-medium">{mechName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Service:</span>
                <span className="font-medium">{service?.name || 'Roadside Assistance'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ETA:</span>
                <span className="font-medium">8–15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Amount:</span>
                <span className="font-bold">${booking.estimatedTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Payment:</span>
                <span className="text-[#1B5E20] font-medium">After service approval</span>
              </div>
            </div>
          </article>

          <article className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col h-full">
            <h2 className="text-lg font-heading font-bold mb-6">Your safety features</h2>
            <ul className="space-y-4 text-sm">
              {[
                { icon: 'shield_person', label: '1 backup mechanic on standby' },
                { icon: 'near_me', label: 'Live GPS tracking active' },
                { icon: 'lock', label: 'Price locked at $' + (booking.estimatedTotal?.toFixed(2) || '0.00') },
                { icon: 'photo_camera', label: 'Part photo verification on' },
                { icon: 'chat', label: 'In-app chat with mechanic' },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col h-full">
            <h2 className="text-lg font-heading font-bold mb-4">Share tracking</h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Let someone know where you are. Send them the live tracking link.</p>
            <div className="space-y-3">
              <button
                className="w-full bg-[#f4f4f2] text-primary border border-transparent hover:border-outline-variant py-3 px-4 rounded-[5px] flex items-center justify-center gap-2 font-medium transition-all"
                onClick={() => window.open(`https://wa.me/?text=I've requested a mechanic. Track here: ${window.location.origin}/tracking/${booking.id}`)}
              >
                <span className="material-symbols-outlined">chat</span>
                Send via WhatsApp
              </button>
              <button
                className="w-full bg-[#f4f4f2] text-primary border border-transparent hover:border-outline-variant py-3 px-4 rounded-[5px] flex items-center justify-center gap-2 font-medium transition-all"
                onClick={handleCopyLink}
              >
                <span className="material-symbols-outlined">content_copy</span>
                Copy tracking link
              </button>
            </div>
          </article>
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="flex items-center gap-2 text-primary font-heading font-bold text-lg hover:underline underline-offset-4"
            onClick={() => navigate(`/tracking/${booking.id}`, { state: { booking } })}
          >
            View live tracking
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </main>

      <footer className="mt-auto py-4 bg-[#FFFBEC] border-t border-[#FFECB3] text-center text-xs text-[#856404] italic">
        * This status page updates automatically every 30 seconds.
      </footer>
    </>
  );
}
