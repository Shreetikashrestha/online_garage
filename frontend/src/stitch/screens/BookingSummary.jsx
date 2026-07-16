import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function BookingSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mechanic, service, userLatitude, userLongitude, problemType } = location.state || {};

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM - 01:00 PM');
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mechanic || !service) { navigate('/booking/problem'); return; }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);

    api.get('/user/vehicles')
      .then(r => {
        const list = r.data.data.vehicles || r.data.data || [];
        setVehicles(list);
        const primary = list.find(v => v.isPrimary);
        if (primary) setSelectedVehicleId(primary.id);
        else if (list.length > 0) setSelectedVehicleId(list[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingVehicles(false));
  }, [mechanic, service, navigate]);

  if (!mechanic || !service) return null;

  const travelFee = (service.travelFeePerKm || 0) * 5;
  const total = service.basePrice + travelFee;

  const timeSlotMap = {
    '09:00 AM - 11:00 AM': { h: 9, m: 0 },
    '11:00 AM - 01:00 PM': { h: 11, m: 0 },
    '02:00 PM - 04:00 PM': { h: 14, m: 0 },
    '04:00 PM - 06:00 PM': { h: 16, m: 0 },
  };

  const handleConfirm = async () => {
    if (!selectedVehicleId) { setError('Please select a vehicle.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const slot = timeSlotMap[scheduledTime] || { h: 11, m: 0 };
      const dt = new Date(scheduledDate);
      dt.setHours(slot.h, slot.m, 0, 0);

      const bookingRes = await api.post('/bookings', {
        mechanicId: mechanic.userId || mechanic.id,
        serviceId: service.id,
        vehicleId: selectedVehicleId,
        scheduledTime: dt.toISOString(),
        userLatitude: parseFloat(userLatitude || 27.7172),
        userLongitude: parseFloat(userLongitude || 85.324),
        notes,
      });
      const booking = bookingRes.data.data.booking;
      navigate('/booking/payment', { state: { booking, mechanic, service, total } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const mechName = mechanic.name || mechanic.user?.name;
  const mechRating = mechanic.rating || 4.8;
  const mechReviews = mechanic.totalReviews || 124;
  const mechSpecialties = mechanic.specialty || ['Engine Diagnostic'];
  const mechExp = mechanic.yearsOfExperience || 12;
  const distKm = mechanic.distance_km || 2.1;

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body-md">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-xl">
          <span className="font-headline-md text-headline-md font-bold text-primary">Online Garage</span>
          <div className="hidden md:flex gap-lg">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Problems</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Vehicle</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Services</a>
            <a className="font-body-md text-body-md text-secondary font-bold border-b-2 border-secondary" href="#">Confirm</a>
          </div>
        </div>
        <button
          onClick={() => navigate('/sos')}
          className="bg-[#B71C1C] text-white px-md py-xs rounded-[5px] font-bold text-body-md shadow-sm active:opacity-80 active:scale-95 transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          SOS Help
        </button>
      </nav>

      {/* Main Canvas */}
      <main className="flex-grow pt-24 pb-xxl px-margin max-w-[1440px] mx-auto w-full">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-xl">
          <div className="flex items-center w-full max-w-3xl">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold mb-xs">
                <span className="material-symbols-outlined">check</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">Vehicle</span>
            </div>
            <div className="h-[2px] bg-secondary-container flex-grow mb-6"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold mb-xs">
                <span className="material-symbols-outlined">check</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">Problem</span>
            </div>
            <div className="h-[2px] bg-secondary-container flex-grow mb-6"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold mb-xs">
                <span className="material-symbols-outlined">check</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">Service</span>
            </div>
            <div className="h-[2px] bg-secondary-container flex-grow mb-6"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-primary text-white border-4 border-secondary-container flex items-center justify-center font-bold mb-xs">
                4
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">Review</span>
            </div>
          </div>
        </div>

        {/* Content Layout: Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Summary Column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-lg">
            {/* Mechanic & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Mechanic Card */}
              <div className="bg-white border border-outline-variant p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#1B5E20]/10 text-[#1B5E20] px-3 py-1 rounded-full text-label-md font-label-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified
                </div>
                <h3 className="font-headline-sm text-headline-sm mb-md">Selected Mechanic</h3>
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center text-primary font-bold text-xl">
                    {mechName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-primary">{mechName}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Master Technician • {mechExp} yrs exp.</p>
                    <div className="flex items-center mt-xs text-[#E0C040]">
                      {[1, 2, 3, 4].map(i => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                      <span className="ml-1 text-on-surface font-bold text-label-md">{mechRating} ({mechReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {mechSpecialties.slice(0, 2).map(s => (
                        <span key={s} className="text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">{s}</span>
                      ))}
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {distKm} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Card */}
              <div className="bg-white border border-outline-variant p-lg rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-headline-sm text-headline-sm mb-md">Your Vehicle</h3>
                {loadingVehicles ? (
                  <div className="flex justify-center py-4"><Spinner size="sm" /></div>
                ) : selectedVehicle ? (
                  <div className="flex items-center gap-md">
                    <div className="w-24 h-16 bg-surface-container rounded-lg overflow-hidden flex items-center justify-center">
                      <span className="material-symbols-outlined text-[36px] text-primary">directions_car</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-primary">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Plate: <span className="bg-surface-container px-2 py-0.5 rounded text-primary font-bold">{selectedVehicle.registrationNumber}</span>
                      </p>
                      <p className="font-label-md text-label-md text-[#1A4A8A] mt-xs">Service: {service.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No vehicles registered.</p>
                )}
                {!loadingVehicles && vehicles.length > 0 && (
                  <div className="mt-3">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] block mb-1">Switch vehicle</label>
                    <select
                      className="w-full px-3 py-2 border border-outline-variant rounded-[5px] focus:outline-none focus:border-secondary transition-all bg-surface font-body-md text-sm"
                      value={selectedVehicleId}
                      onChange={e => setSelectedVehicleId(e.target.value)}
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} ({v.registrationNumber})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Options */}
            <div className="bg-white border border-outline-variant p-lg rounded-xl shadow-sm border-secondary">
              <h3 className="font-headline-sm text-headline-sm mb-md">Booking Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Preferred Date</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">calendar_today</span>
                    <input
                      className="w-full pl-12 pr-4 py-3 border border-outline-variant rounded-[5px] focus:outline-none focus:border-secondary transition-all bg-surface font-body-md"
                      type="date"
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Preferred Time</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">schedule</span>
                    <select
                      className="w-full pl-12 pr-4 py-3 border border-outline-variant rounded-[5px] focus:outline-none focus:border-secondary transition-all bg-surface font-body-md appearance-none"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                    >
                      <option>09:00 AM - 11:00 AM</option>
                      <option>11:00 AM - 01:00 PM</option>
                      <option>02:00 PM - 04:00 PM</option>
                      <option>04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-md">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">Problem Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-outline-variant rounded-[5px] focus:outline-none focus:border-secondary transition-all bg-surface font-body-md resize-none"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe the issue in detail..."
                />
              </div>
              <div className="mt-md flex items-start gap-sm bg-surface-container-low p-md rounded-lg">
                <span className="material-symbols-outlined text-[#1A4A8A]">info</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">The mechanic will arrive within a 20-minute window of your selected time. We will notify you via SMS when they are 5 minutes away.</p>
              </div>
            </div>

            {/* Trust Signals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-md">
              <div className="flex items-center gap-md p-md bg-white border border-outline-variant rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Workshop Guarantee</p>
                  <p className="text-[10px] text-on-surface-variant">12-month parts & labor warranty.</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-md bg-white border border-outline-variant rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#1A4A8A]/10 text-[#1A4A8A] flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Secure Payment</p>
                  <p className="text-[10px] text-on-surface-variant">256-bit SSL encrypted checkout.</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-md bg-white border border-outline-variant rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#E0C040]/10 text-[#E0C040] flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>price_check</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">Price Lock</p>
                  <p className="text-[10px] text-on-surface-variant">Final quote. No hidden surcharges.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown Column */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 bg-primary text-white p-lg rounded-xl shadow-lg flex flex-col gap-lg h-fit">
              <h3 className="font-headline-sm text-headline-sm border-b border-outline/30 pb-md">Payment Summary</h3>
              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-center font-body-md text-on-primary-container">
                  <span>Service Subtotal</span>
                  <span>${service.basePrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-on-primary-container">
                  <span>Labor (Est.)</span>
                  <span>${service.hourlyLaborRate?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-on-primary-container">
                  <span>Travel Fee</span>
                  <span>${travelFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-on-primary-container">
                  <span>Diagnostic Parts</span>
                  <span>$0.00</span>
                </div>
              </div>
              <div className="border-t border-outline/30 pt-md mt-md">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest">Order Total</p>
                    <p className="text-[12px] text-on-primary-container/60 italic">Includes all taxes and fees</p>
                  </div>
                  <p className="font-display-lg text-display-lg text-white">${total.toFixed(2)}</p>
                </div>
              </div>

              {error && (
                <p className="text-[#f87171] font-body-sm text-body-sm">{error}</p>
              )}

              <div className="flex flex-col gap-md mt-xl">
                <button
                  onClick={handleConfirm}
                  disabled={submitting || vehicles.length === 0}
                  className="w-full bg-secondary text-white py-lg rounded-[5px] font-bold text-button-text hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>Proceed to Payment <span className="material-symbols-outlined">arrow_forward</span></>
                  )}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-transparent border border-outline/50 text-white py-md rounded-[5px] font-bold text-body-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Edit Booking
                </button>
              </div>
              <p className="text-center text-[12px] text-on-primary-container/50 mt-md">
                By clicking "Proceed to Payment" you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-md px-margin flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest border-t border-outline-variant">
        <div className="flex flex-col md:flex-row items-center gap-md">
          <span className="font-label-md text-label-md font-bold text-on-surface">Online Garage</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">© 2024 Online Garage. All Rights Reserved. Mechanical Precision & Safety Guaranteed.</span>
        </div>
        <div className="flex gap-lg">
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary" href="#">Terms of Service</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary" href="#">Privacy Policy</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary" href="#">Trust Center</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary" href="#">Contact Support</a>
        </div>
      </footer>

      {/* UX Law Strip */}
      <div className="fixed bottom-0 left-0 w-full h-[40px] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center z-[100]">
        <p className="font-body-sm text-body-sm text-[#7A5A00]">
          Applied: <strong>Hick's Law</strong> — Reducing choices by summarizing final details before the complex payment transaction.
        </p>
      </div>
    </div>
  );
}
