import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function PaymentFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { booking, mechanic, service, total } = location.state || {};

  const bookingId = booking?.id;
  const timeLeft = 9;

  if (!booking) { navigate('/dashboard'); return null; }

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
        <section className="bg-[#FFEBEE] border border-[#EF9A9A] rounded-[8px] p-6 flex items-start gap-4">
          <div className="bg-[#C62828] text-white p-1 rounded-md mt-1">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </div>
          <div>
            <h1 className="text-[#C62828] text-xl font-heading font-bold">Payment failed</h1>
            <p className="text-[#C62828] opacity-80 text-sm mt-1">Your booking is saved — you were not charged</p>
          </div>
        </section>

        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-[8px] p-4 flex items-center gap-3 text-sm">
          <span className="material-symbols-outlined text-[#F57F17]">timer</span>
          <span className="text-[#F57F17] font-semibold">Booking expires in {timeLeft}:31 remaining</span>
          <span className="text-[#F57F17]/70 text-xs ml-auto">Saved &middot; {timeLeft}:31 remaining</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col h-full">
            <h2 className="text-lg font-heading font-bold mb-4 text-[#C62828]">What went wrong?</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF5350] shrink-0" />
                <span className="text-on-surface-variant">Card declined by bank</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF5350] shrink-0" />
                <span className="text-on-surface-variant">Insufficient funds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF5350] shrink-0" />
                <span className="text-on-surface-variant">Transaction timed out</span>
              </div>
            </div>
          </article>

          <article className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col h-full">
            <h2 className="text-lg font-heading font-bold mb-6">Was money taken?</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              No &mdash; your account was <strong className="text-[#1B5E20]">NOT charged</strong>.
              Your booking is saved for 10 minutes. You can retry payment below.
            </p>
            <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-base">lock</span>
              <span>256-bit encrypted transaction</span>
            </div>
          </article>

          <article className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col h-full">
            <h2 className="text-lg font-heading font-bold mb-4">Quick help</h2>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Talk to us if your bank is having issues. Our support team is available 24/7.</p>
            <button
              className="w-full bg-[#f4f4f2] text-primary border border-transparent hover:border-outline-variant py-3 px-4 rounded-[5px] flex items-center justify-center gap-2 font-medium transition-all mt-auto"
              onClick={() => window.open('tel:+1234567890')}
            >
              <span className="material-symbols-outlined">support_agent</span>
              Contact Support
            </button>
          </article>
        </div>

        <h2 className="text-lg font-heading font-bold">Recovery options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col">
            <div className="w-11 h-11 rounded-lg bg-[#E3F2FD] flex items-center justify-center mb-4 border border-outline-variant">
              <span className="material-symbols-outlined text-[#1565C0]">credit_card</span>
            </div>
            <h3 className="font-heading font-bold text-base mb-1">Try different card</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex-grow">Use another debit/credit card or UPI handle.</p>
            <button
              className="w-full bg-[#222222] text-white font-semibold text-sm py-3 rounded-[5px] hover:bg-black transition-colors active:scale-[0.98]"
              onClick={() => navigate('/booking/payment', { state: { booking, mechanic, service, total } })}
            >
              Retry Payment
            </button>
          </div>
          <div className="bg-white border border-outline-variant rounded-[8px] p-6 flex flex-col">
            <div className="w-11 h-11 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-4 border border-outline-variant">
              <span className="material-symbols-outlined text-[#2E7D32]">account_balance_wallet</span>
            </div>
            <h3 className="font-heading font-bold text-base mb-1">Use wallet</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex-grow">Pay instantly using your Online Garage wallet balance.</p>
            <button
              className="w-full border border-outline-variant font-semibold text-sm py-3 rounded-[5px] text-primary hover:bg-surface-container transition-colors active:scale-[0.98]"
              onClick={() => navigate('/booking/payment', { state: { booking, mechanic, service, total, defaultMethod: 'WALLET' } })}
            >
              Pay from Wallet
            </button>
          </div>
        </div>

        <div className="bg-[#FFF9E6] border border-[#FFECB3] rounded-[8px] p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#856404] text-lg">verified_user</span>
          <p className="text-xs text-[#856404] leading-relaxed">
            Our payment system uses 256-bit encryption. No financial data is stored on our servers.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            className="border border-outline-variant text-on-surface-variant font-medium text-sm py-3 px-8 rounded-[5px] hover:bg-surface-container transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Cancel booking (free before arrival)
          </button>
        </div>
      </main>
    </>
  );
}
