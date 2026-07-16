import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

const PAYMENT_METHODS = [
  { id: 'CARD', icon: 'credit_card', label: 'Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'WALLET', icon: 'account_balance_wallet', label: 'Esewa/Khalti', desc: 'Digital wallet payments' },
  { id: 'CASH', icon: 'payments', label: 'Cash on Delivery', desc: 'Pay when service is completed' },
];

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { booking, mechanic, service, total } = location.state || {};

  const [method, setMethod] = useState('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  if (!booking) { navigate('/dashboard'); return null; }

  const isVerified = user?.isIdentityVerified;
  const discountedPrice = total ? total * 0.9 : 0;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/payments/initialize', { bookingId: booking.id, method });
      navigate('/booking/confirmed', { state: { booking, mechanic, service } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg.includes('Stripe') || msg.includes('configured')) {
        navigate('/booking/confirmed', { state: { booking, mechanic, service } });
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full h-[54px] z-50 bg-surface border-b-[1.5px] border-outline-variant">
        <div className="flex justify-between items-center px-lg h-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-xl">
            <button
              className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
              onClick={() => navigate(-1)}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">Online Garage</span>
          </div>
          <div className="flex items-center space-x-md">
            <button
              className="bg-[#B71C1C] text-white font-button-text text-button-text px-md py-2 rounded-[5px] flex items-center space-x-xs shadow-md active:scale-95 transition-all"
              onClick={() => navigate('/sos')}
            >
              <span className="material-symbols-outlined" data-icon="emergency">emergency</span>
              <span>🚨 SOS Help</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-[54px] pb-[40px] max-w-[1440px] mx-auto w-full px-lg">
        <div className="py-xl flex items-center justify-center space-x-xxl">
          <div className="flex items-center space-x-sm step-completed">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-label-md text-label-md">Step 1: Problem</span>
          </div>
          <div className="w-16 h-[1.5px] bg-outline-variant" />
          <div className="flex items-center space-x-sm step-completed">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="font-label-md text-label-md">Step 2: Mechanic</span>
          </div>
          <div className="w-16 h-[1.5px] bg-outline-variant" />
          <div className="flex items-center space-x-sm step-active">
            <span className="material-symbols-outlined" data-icon="payment">payment</span>
            <span className="font-label-md text-label-md">Step 3: Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter py-md">
          <div className="md:col-span-12 mb-lg">
            <h1 className="font-headline-lg text-headline-lg text-primary">Choose Your Payment Path</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Secure your service booking. Options depend on your account verification status.</p>
          </div>

          {error && (
            <div className="md:col-span-12 mb-md">
              <div className="bg-[#FFEBEE] border border-[#EF5350] p-md rounded-lg flex gap-sm items-start">
                <span className="material-symbols-outlined text-[#C62828] text-[20px]">error</span>
                <p className="font-body-sm text-body-sm text-[#C62828]">{error}</p>
              </div>
            </div>
          )}

          <div className={`md:col-span-6 ${!isVerified ? 'opacity-60' : ''}`}>
            <div className={`bg-surface-container-lowest border-2 rounded-xl p-lg h-full flex flex-col shadow-sm transition-all hover:shadow-md ${isVerified ? 'border-[#1B5E20]' : 'border-outline-variant'}`}>
              <div className="flex justify-between items-start mb-md">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#1B5E20]/10 text-[#1B5E20] rounded-full font-label-md text-label-md mb-xs">Recommended</span>
                  <div className="inline-block px-2 py-0.5 bg-[#E0C040] text-primary rounded font-label-md text-label-md mb-xs ml-2">10% Verified Member Discount</div>
                  <h2 className="font-headline-md text-headline-md text-primary">Pay After Service</h2>
                </div>
                <span className="material-symbols-outlined text-[#1B5E20] text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                For verified accounts, we hold your card details in a secure escrow. Funds are only released to the mechanic once you've inspected and approved the completed job.
              </p>
              <div className="mb-lg flex items-baseline space-x-sm">
                <span className="font-display-lg text-display-lg text-primary">₹{discountedPrice.toFixed(0)}</span>
                {total && <span className="font-body-md text-on-surface-variant line-through">₹{total.toFixed(0)}</span>}
              </div>
              <div className="bg-surface-container rounded-lg p-md mb-lg">
                <span className="font-label-md text-label-md text-on-surface-variant block mb-sm">Accepted Methods</span>
                <div className="flex flex-wrap gap-sm">
                  {PAYMENT_METHODS.map(pm => {
                    const isSelected = method === pm.id;
                    return (
                      <button
                        key={pm.id}
                        disabled={!isVerified}
                        onClick={() => isVerified && setMethod(pm.id)}
                        className={`flex items-center space-x-xs px-sm py-1 rounded border transition-all ${
                          isSelected && isVerified
                            ? 'bg-[#1B5E20]/10 border-[#1B5E20] text-[#1B5E20]'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary'
                        } ${!isVerified ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{pm.icon}</span>
                        <span className="font-label-md text-label-md">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-auto">
                {isVerified ? (
                  <>
                    <button
                      className="w-full bg-[#222222] text-white font-button-text text-button-text py-lg rounded-[5px] hover:bg-black transition-colors active:scale-[0.98] block text-center disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={submitting}
                      onClick={handleConfirm}
                    >
                      {submitting ? <Spinner size="sm" color="white" /> : "Confirm — I'll pay after service"}
                    </button>
                    <p className="text-center font-label-md text-label-md text-on-surface-variant mt-sm">No immediate charge will be made.</p>
                  </>
                ) : (
                  <button
                    className="w-full bg-[#1B5E20]/20 text-[#1B5E20] font-button-text text-button-text py-lg rounded-[5px] border border-[#1B5E20]/30 cursor-pointer hover:bg-[#1B5E20]/30 transition-colors"
                    onClick={() => setShowVerifyModal(true)}
                  >
                    Unlock Pay After Service
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`md:col-span-6 ${isVerified ? 'opacity-60' : ''}`}>
            <div className={`bg-surface-container-lowest border-2 rounded-xl p-lg h-full flex flex-col shadow-sm transition-all hover:shadow-md relative overflow-hidden ${!isVerified ? 'border-[#B71C1C]' : 'border-outline-variant'}`}>
              <div className="absolute -right-8 -top-8 opacity-5">
                <span className="material-symbols-outlined text-[160px]" data-icon="priority_high">priority_high</span>
              </div>
              <div className="flex justify-between items-start mb-md">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#B71C1C]/10 text-[#B71C1C] rounded-full font-label-md text-label-md mb-xs">Standard</span>
                  <h2 className="font-headline-md text-headline-md text-primary">Pay at Booking Time</h2>
                </div>
                <span className="material-symbols-outlined text-[#B71C1C] text-[40px]" data-icon="lock_clock">lock_clock</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">As an unverified user, upfront payment is required to confirm your booking. Funds held in secure escrow. 100% refund if service is not completed. This ensures technician safety and commitment.</p>
              <div className="flex-grow flex items-center justify-center mb-lg">
                <div className="text-center">
                  <span className="font-label-md text-label-md text-on-surface-variant block uppercase tracking-widest mb-xs">Total Amount</span>
                  <span className="font-display-lg text-display-lg text-primary">₹{total?.toFixed(0) || '0'}</span>
                </div>
              </div>
              <div className="mt-auto space-y-md">
                {!isVerified ? (
                  <button
                    className="w-full bg-[#B71C1C] text-white font-button-text text-button-text py-lg rounded-[5px] hover:bg-[#961717] transition-colors active:scale-[0.98] block text-center disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={submitting}
                    onClick={handleConfirm}
                  >
                    {submitting ? <Spinner size="sm" color="white" /> : `Pay ₹${total?.toFixed(0) || '0'} Now`}
                  </button>
                ) : (
                  <button
                    className="w-full border border-outline-variant font-button-text text-button-text py-lg rounded-[5px] text-on-surface-variant cursor-not-allowed"
                    disabled
                  >
                    Already verified
                  </button>
                )}
                <div className="text-center">
                  <button
                    className="text-[#1A4A8A] font-label-md text-label-md hover:underline flex items-center justify-center space-x-xs mx-auto"
                    onClick={() => navigate('/verify-identity')}
                  >
                    <span className="material-symbols-outlined text-sm" data-icon="badge">badge</span>
                    <span>Verify your ID to unlock Pay After Service</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 mt-lg">
            <div className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-lg mb-md md:mb-0">
                <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center">
                  {mechanic?.avatar ? (
                    <img alt={mechanic?.name || 'Mechanic'} className="w-full h-full object-cover" src={mechanic.avatar} />
                  ) : (
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant">person</span>
                  )}
                </div>
                <div>
                  <span className="font-label-md text-label-md text-[#1B5E20] font-bold">Selected Technician</span>
                  <h3 className="font-headline-sm text-headline-sm">{mechanic?.name || 'Not assigned'}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {mechanic?.expertise ? `Expertise: ${mechanic.expertise}` : service?.name ? `Service: ${service.name}` : 'Service booking'}
                    {mechanic?.rating ? ` • ${mechanic.rating} Rating` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right border-l-0 md:border-l border-outline-variant pl-0 md:pl-lg">
                <span className="font-label-md text-label-md text-on-surface-variant block">Service Location</span>
                <p className="font-body-md text-body-md font-semibold">{mechanic?.location || 'Your location'}</p>
                {mechanic?.eta && <span className="font-label-md text-label-md text-secondary block mt-xs">ETA: {mechanic.eta}</span>}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full h-[40px] z-[60] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center px-md">
        <div className="flex items-center space-x-lg">
          <span className="font-label-md text-label-md text-tertiary">Online Garage</span>
          <div className="h-4 w-[1px] bg-[#E0C040]" />
          <p className="font-body-sm text-body-sm text-tertiary text-center">
            Applied: Hick's Law — Reducing choices to two clear paths for faster decision making.
          </p>
        </div>
      </footer>

      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-md">
          <div className="bg-surface p-lg rounded-xl max-w-md w-full shadow-xl border border-outline-variant">
            <div className="flex items-center space-x-sm mb-md text-[#B71C1C]">
              <span className="material-symbols-outlined">error</span>
              <h3 className="font-headline-sm">Verification Required</h3>
            </div>
            <p className="font-body-md text-on-surface-variant mb-lg">
              To access 'Pay After Service' and the 10% member discount, you must first verify your identity.
            </p>
            <div className="flex flex-col space-y-sm">
              <button
                className="w-full bg-[#222222] text-white font-button-text text-button-text py-md rounded-[5px] text-center hover:bg-black transition-colors"
                onClick={() => { setShowVerifyModal(false); navigate('/verify-identity'); }}
              >
                Start Verification
              </button>
              <button
                className="w-full border border-outline-variant font-button-text text-button-text py-md rounded-[5px] hover:bg-surface-container transition-colors"
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
