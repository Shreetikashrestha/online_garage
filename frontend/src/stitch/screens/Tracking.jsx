import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';
import LiveMap from '../../components/map/LiveMap';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import useAuthStore from '../../store/authStore';

const MOCK_TIMELINE = [
  { time: '14:02', label: 'Booking Confirmed', detail: 'Mechanic confirmed your request.', done: true },
  { time: '14:15', label: 'Diagnostic Confirmed', detail: 'Brake caliper seized on rear-left wheel assembly.', done: true },
  { time: '14:22', label: 'Parts Prep', detail: '', done: true },
  { time: '14:28', label: 'Active Repair', detail: 'System pressure testing and component replacement.', active: true },
  { time: '14:55', label: 'Final Testing', detail: 'Quality check and verification.', pending: true },
];

const MOCK_TELEMETRY = [
  { time: '14:31:05', type: 'ACTION', msg: 'Applying lubricant to caliper assembly.' },
  { time: '14:28:12', type: 'SENSOR', msg: 'Hydraulic pressure stabilized at 1.2 bar.' },
  { time: '14:24:45', type: 'ACTION', msg: 'Removed worn brake pads; initiating heat shield inspection.' },
  { time: '14:22:10', type: 'STATUS', msg: 'Tools sanitized and ready for component extraction.' },
];

const CHAT_MSGS = [
  { from: 'mechanic', name: 'MARCUS', time: '14:22', text: "I've received your diagnostic packet. The grinding sound you noted at low speeds is likely the brake pad sensor or a seized caliper." },
  { from: 'user', name: 'YOU', time: '14:23', text: 'STALLED' },
  { from: 'mechanic', name: 'MARCUS', time: '14:22', text: "Got it. I'm standing by the front wheel now. Initiating visual scan." },
  { from: 'mechanic', name: 'MARCUS', time: '14:22', text: 'Please point your camera towards the front left wheel assembly.' },
];

export default function Tracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [mechanicLoc, setMechanicLoc] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(CHAT_MSGS);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [sosMessage, setSosMessage] = useState('Need immediate roadside assistance');
  const [sosLat, setSosLat] = useState(27.7172);
  const [sosLng, setSosLng] = useState(85.324);
  const [submittingSOS, setSubmittingSOS] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const chatRef = useRef(null);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      const data = res.data.data.booking || res.data.data;
      setBooking(data);
      setUserLoc([data.userLatitude, data.userLongitude]);
      if (['EN_ROUTE', 'IN_PROGRESS', 'ARRIVED'].includes(data.status)) {
        try {
          const locRes = await api.get(`/tracking/${bookingId}`);
          const locData = locRes.data.data.location || locRes.data.data;
          if (locData?.latitude && locData?.longitude) {
            setMechanicLoc([locData.latitude, locData.longitude]);
          }
        } catch (e) { /* ignore */ }
      }
    } catch (err) {
      setError('Failed to fetch tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    socket.emit('tracking:join', bookingId);
    const cleanup = socket.on('tracking:location_updated', (data) => {
      if (data?.latitude && data?.longitude) {
        setMechanicLoc([data.latitude, data.longitude]);
      }
    });
    const poll = setInterval(fetchBooking, 8000);
    return () => {
      socket.emit('tracking:leave', bookingId);
      cleanup();
      clearInterval(poll);
    };
  }, [bookingId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { from: 'user', name: 'YOU', time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), text: chatInput }]);
    setChatInput('');
  };

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setSubmittingSOS(true);
    try {
      await api.post('/sos/alert', { latitude: parseFloat(sosLat), longitude: parseFloat(sosLng), message: sosMessage });
      setSosSuccess(true);
      setTimeout(() => { setIsSOSOpen(false); setSosSuccess(false); }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger SOS.');
    } finally {
      setSubmittingSOS(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ACTION': return { bg: 'rgba(59,130,246,0.15)', color: 'var(--accent-primary)' };
      case 'SENSOR': return { bg: 'rgba(245,158,11,0.15)', color: 'var(--warning)' };
      case 'STATUS': return { bg: 'rgba(239,68,68,0.15)', color: 'var(--danger)' };
      default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
    }
  };

  const mechName = booking?.mechanic?.name || 'Marcus V.';
  const mechInitials = mechName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const vehicleName = booking?.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : '2023 Tesla Model Y';
  const vehicleColor = booking?.vehicle?.color || 'Deep Blue Metallic';
  const vehicleLicense = booking?.vehicle?.registrationNumber || 'SOS-742-G';
  const warrantyStatus = booking?.vehicle?.warrantyStatus || 'COVERED';
  const eta = booking?.eta || '45 MINS';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Spinner />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Initializing map radar...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>error_outline</span>
        <p style={{ color: '#f87171' }}>{error || 'Booking not found'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar + Main Content Flex */}
      <div className="flex gap-0 relative animate-fade-in" style={{ paddingBottom: '3rem' }}>
        {/* Side Navigation */}
        <aside className="hidden xl:flex flex-col w-[260px] flex-shrink-0 bg-[#1A1A1A] rounded-xl border border-outline-variant self-start sticky top-24" style={{ borderColor: 'var(--border-color)' }}>
          <div className="px-lg pt-lg pb-md">
            <p className="font-label-md text-label-md uppercase tracking-widest" style={{ color: '#9ca3af' }}>Active Incident</p>
            <h2 className="font-headline-sm text-headline-sm mt-xs text-white">Mobile Unit 4</h2>
            <div className="mt-sm flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }}></span>
              <span className="font-body-sm text-body-sm" style={{ color: '#9ca3af' }}>On-Site &amp; Repairing</span>
            </div>
          </div>
          <nav className="flex-1">
            <a className="flex items-center gap-md px-lg py-3 transition-all" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </a>
            <a className="flex items-center gap-md px-lg py-3" style={{ color: '#fff', borderLeft: '4px solid var(--accent-primary)', backgroundColor: 'rgba(59,130,246,0.08)' }}>
              <span className="material-symbols-outlined">location_on</span>
              <span className="font-label-md text-label-md">Live Tracking</span>
            </a>
            <a className="flex items-center gap-md px-lg py-3 transition-all" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/invoices'); }}>
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="font-label-md text-label-md">Invoices</span>
            </a>
            <a className="flex items-center gap-md px-lg py-3 transition-all" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/sos'); }}>
              <span className="material-symbols-outlined">emergency</span>
              <span className="font-label-md text-label-md">SOS Help</span>
            </a>
          </nav>
          <div className="px-lg mt-auto pt-lg" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button className="w-full py-2 mb-md rounded-lg font-button-text text-button-text transition-colors" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>support_agent</span>
              Support Agent
            </button>
            <a className="flex items-center gap-md px-sm py-sm transition-all" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); navigate('/'); }}>
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 xl:pl-lg">
          <div className="grid grid-cols-12 gap-gutter">
            {/* Map View (Bento Large) */}
            <div className="col-span-12 lg:col-span-8 bg-[var(--glass-bg)] backdrop-blur-xl rounded-xl overflow-hidden relative" style={{ border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', minHeight: '500px' }}>
              <LiveMap height="500px" userLocation={userLoc} mechanicLocation={mechanicLoc} zoom={14} />
              {/* Technician Overlay Card */}
              <div className="absolute bottom-lg left-lg right-lg p-md flex flex-col md:flex-row items-center justify-between gap-md" style={{ backgroundColor: 'rgba(18, 22, 32, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--accent-primary)' }}>
                    <span className="font-headline-sm text-headline-sm text-white font-bold">{mechInitials}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-sm flex-wrap">
                      <h3 className="font-headline-sm text-headline-sm text-white">{mechName}</h3>
                      <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>VERIFIED MASTER TECH</span>
                    </div>
                    <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>Mobile Unit 4 &bull; Arrival: 14:02 (On-Site)</p>
                  </div>
                </div>
                <div className="flex gap-sm w-full md:w-auto">
                  <button className="flex-1 md:flex-none btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                    Call Tech
                  </button>
                  <button className="flex-1 md:flex-none btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }} onClick={() => setIsChatOpen(true)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat_bubble</span>
                    Message
                  </button>
                </div>
              </div>
            </div>

            {/* Repair Timeline (Bento Right) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div className="flex justify-between items-center mb-lg">
                  <h3 className="font-headline-sm text-headline-sm text-white">Repair Timeline</h3>
                  <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>ETA: {eta}</span>
                </div>
                <div className="relative space-y-xl" style={{ paddingLeft: '1rem' }}>
                  <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border-color)' }} />
                  {MOCK_TIMELINE.map((step, i) => (
                    <div key={i} className="relative flex gap-lg items-start">
                      {step.done ? (
                        <div className="z-10 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--success)', border: '3px solid var(--bg-primary)' }}>
                          <span className="material-symbols-outlined text-white" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        </div>
                      ) : step.active ? (
                        <div className="z-10 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'transparent', border: '2px solid var(--accent-primary)' }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)', animation: 'pulse 2s infinite' }} />
                        </div>
                      ) : (
                        <div className="z-10 w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)', border: '3px solid var(--bg-primary)' }} />
                      )}
                      <div className="flex-1" style={step.active ? { backgroundColor: 'rgba(59,130,246,0.06)', borderLeft: '3px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', marginLeft: '-0.5rem' } : {}}>
                        {step.active && (
                          <p className="font-label-md text-label-md font-bold" style={{ color: 'var(--accent-primary)' }}>IN PROGRESS</p>
                        )}
                        <h4 className="font-body-md text-body-md font-semibold text-white">{step.label}</h4>
                        <p className="font-label-md text-label-md mt-xs" style={{ color: 'var(--text-muted)' }}>{step.time}</p>
                        {step.detail && (
                          <p className="font-body-sm text-body-sm mt-xs" style={{ color: 'var(--text-secondary)' }}>{step.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Service Log (Bento Wide Bottom) */}
            <div className="col-span-12 lg:col-span-8 glass-card" style={{ padding: '1.25rem' }}>
              <div className="flex items-center justify-between mb-lg pb-md" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>terminal</span>
                  <h3 className="font-headline-sm text-headline-sm text-white">Live Service Log</h3>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>REAL-TIME TELEMETRY</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success)', animation: 'pulse 2s infinite' }} />
                </div>
              </div>
              <div className="space-y-md" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                {MOCK_TELEMETRY.map((t, i) => {
                  const tc = getTypeColor(t.type);
                  return (
                    <div key={i} className="flex gap-md items-start" style={{ paddingBottom: '0.5rem', borderBottom: i < MOCK_TELEMETRY.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{t.time}</span>
                      <span className="font-semibold shrink-0" style={{ color: tc.color }}>[{t.type}]</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{t.msg}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Summary (Bento Bottom Small) */}
            <div className="col-span-12 lg:col-span-4 rounded-xl p-lg relative overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <div className="absolute -right-16 -bottom-16 opacity-5">
                <span className="material-symbols-outlined" style={{ fontSize: '200px', fontVariationSettings: "'FILL' 1", color: 'var(--accent-primary)' }}>build_circle</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-white mb-md relative z-10">Incident Asset</h3>
              <div className="space-y-md relative z-10">
                <div className="flex justify-between items-center pb-sm" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>Vehicle</span>
                  <span className="font-semibold text-white">{vehicleName}</span>
                </div>
                <div className="flex justify-between items-center pb-sm" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>Color</span>
                  <span className="font-semibold text-white">{vehicleColor}</span>
                </div>
                <div className="flex justify-between items-center pb-sm" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>License</span>
                  <span className="font-semibold tracking-widest text-white">{vehicleLicense}</span>
                </div>
                <div className="flex justify-between items-center pt-sm">
                  <span className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>Warranty Status</span>
                  <span className="badge badge-success text-[10px]">{warrantyStatus}</span>
                </div>
              </div>
              <button className="btn btn-danger w-full mt-lg relative z-10" onClick={() => setIsSOSOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>emergency</span>
                SOS Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} title="Live Chat with Mechanic">
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          <div className="flex items-center gap-xs mb-md pb-md" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
            <span className="font-label-md text-label-md font-bold" style={{ color: 'var(--success)' }}>LIVE CONNECTION</span>
            <span className="font-label-md text-label-md" style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>CRITICALITY: HIGH</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', marginBottom: '0.75rem' }} ref={chatRef}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <p className="font-label-md text-label-md font-bold mb-xs" style={{ color: msg.from === 'user' ? 'var(--accent-primary)' : 'var(--success)' }}>
                  {msg.name} &middot; {msg.time}
                </p>
                <div style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', backgroundColor: msg.from === 'user' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid', borderColor: msg.from === 'user' ? 'rgba(59,130,246,0.25)' : 'var(--border-color)' }}>
                  <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              style={{ flex: 1, height: '38px', fontSize: '0.82rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            </button>
          </form>
        </div>
      </Modal>

      {/* SOS Modal */}
      <Modal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} title="Emergency SOS">
        {sosSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--success)' }}>check_circle</span>
            <h3 style={{ color: '#fff', marginTop: '1rem' }}>SOS Broadcast Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Nearby mechanics have been alerted.</p>
          </div>
        ) : (
          <form onSubmit={handleTriggerSOS} style={{ display: 'flex', flexDirection: 'column' }}>
            <p className="font-body-sm text-body-sm mb-lg" style={{ color: 'var(--text-secondary)' }}>
              An emergency signal will be broadcast to all nearby mechanics. Please confirm your location.
            </p>
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Latitude</label>
                <input type="number" step="0.000001" className="form-control" value={sosLat} onChange={e => setSosLat(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Longitude</label>
                <input type="number" step="0.000001" className="form-control" value={sosLng} onChange={e => setSosLng(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Describe Emergency</label>
              <textarea className="form-control" value={sosMessage} onChange={e => setSosMessage(e.target.value)} style={{ minHeight: '80px' }} required />
            </div>
            <button type="submit" className="btn btn-danger" style={{ width: '100%', height: '48px', fontWeight: '700' }} disabled={submittingSOS}>
              {submittingSOS ? <Spinner size="sm" color="white" /> : 'BROADCAST SOS SIGNAL'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
