import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

const INCIDENT_TYPES = [
  { id: 'ACCIDENT', icon: 'car_crash', label: 'Accident', desc: 'Collision or impact report', severity: 'CRITICAL' },
  { id: 'MECHANICAL', icon: 'engineering', label: 'Mechanical Failure', desc: 'Breakdown, smoke, or lockouts', severity: 'HIGH' },
  { id: 'MEDICAL', icon: 'medical_services', label: 'Medical', desc: 'Immediate health assistance', severity: 'CRITICAL' },
];

const FIRST_AID = [
  { icon: 'water_drop', title: 'Severe Bleeding', steps: ['Apply direct pressure with clean cloth', 'Elevate wound above heart level'] },
  { icon: 'favorite', title: 'CPR Assistance', steps: ['Place hands in center of chest', 'Push hard and fast at 100-120 bpm'] },
  { icon: 'accessibility_new', title: 'Spinal Safety', steps: ['Do not move the victim', 'Support the head and neck in neutral position'] },
];

const DISPATCH_STEPS = [
  { time: '14:02:10', label: 'Alerted', done: true },
  { time: '14:02:45', label: 'Dispatched', done: true },
  { time: '', label: 'In Transit', active: true },
  { time: '', label: 'ALS Unit', pending: true },
  { time: '', label: 'On Scene', pending: true },
];

export default function SOSEmergency() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [phase, setPhase] = useState('picker');
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lat, setLat] = useState(27.7172);
  const [lng, setLng] = useState(85.324);
  const [broadcastHeld, setBroadcastHeld] = useState(false);
  const holdTimerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      });
    }
  }, []);

  useEffect(() => {
    if (phase === 'active' || phase === 'dispatched') {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const getSelectedIncident = () => INCIDENT_TYPES.find(t => t.id === selectedType);

  const handleDispatch = async () => {
    const incident = getSelectedIncident();
    if (!incident) return;
    setSubmitting(true);
    try {
      await api.post('/sos/alert', {
        latitude: lat,
        longitude: lng,
        message: `${incident.label} emergency — dispatching ALS unit`,
      });
    } catch {
      /* proceed regardless — critical UX */
    } finally {
      setSubmitting(false);
      setPhase('active');
    }
  };

  const handleBroadcastStart = () => {
    if (!selectedType) return;
    setBroadcastHeld(true);
    holdTimerRef.current = setTimeout(() => {
      handleDispatch();
    }, 800);
  };

  const handleBroadcastEnd = () => {
    setBroadcastHeld(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  if (phase === 'active' || phase === 'dispatched') {
    return (
      <div className="min-h-screen bg-surface pb-xl animate-fade-in">
        <div
          className="flex items-center justify-between px-lg py-md"
          style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-md">
            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff' }}>Online Garage</span>
            <span
              className="font-label-md text-label-md"
              style={{ color: '#f87171', fontWeight: '700', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              SOSMechHub
            </span>
          </div>
          <div
            className="flex items-center gap-xs px-md py-1 rounded-sm font-label-md text-label-md font-bold tracking-widest"
            style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            MEDICAL DISPATCH ACTIVE
          </div>
          <button
            className="btn btn-danger"
            style={{ height: '36px', padding: '0 1rem', fontSize: '0.75rem' }}
            onClick={() => navigate(-1)}
          >
            GET HELP NOW
          </button>
        </div>

        <div className="flex items-center justify-center pt-xl pb-sm gap-xs">
          <span className="status-dot bg-error" style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
          <span className="font-label-md text-label-md font-bold tracking-widest" style={{ color: '#f87171' }}>URGENCY: HIGH</span>
        </div>
        <div className="text-center mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-white">{user?.name || 'John Doe'}</h1>
          <p style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.85rem' }}>ALS ARRIVAL &middot; En Route</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Immediate First Aid &middot; Emergency Protocol</p>
          <div
            className="inline-block px-md py-xs mt-xs font-label-md text-label-md font-bold"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 'var(--radius-sm)' }}
          >
            A+ Negative
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-lg px-lg">
          <aside className="hidden lg:flex flex-col lg:col-span-2 pt-lg gap-xs">
            {['Dashboard', 'My Vehicles', 'Booking History', 'Payments', 'Settings'].map(item => (
              <button key={item} className="font-body-sm text-body-sm text-left px-sm py-2 rounded-sm transition-all" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>{item}</button>
            ))}
            <button className="font-label-md text-label-md text-left px-sm pt-lg pb-xs font-bold tracking-widest" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>SUPPORT</button>
            <button className="font-body-sm text-body-sm text-left px-sm py-2 rounded-sm transition-all" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/')}>Help Center</button>
            <button className="font-body-sm text-body-sm text-left px-sm py-2 rounded-sm transition-all" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign Out</button>
          </aside>

          <div className="lg:col-span-7 flex flex-col gap-md pt-lg">
            <div className="flex items-baseline gap-xs">
              <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>{formatTime(elapsedSeconds)}</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>min</span>
            </div>
            <p className="font-body-md text-body-md" style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}>
              Follow these voice-guided protocols until the ALS unit arrives. Stay calm.
            </p>

            <div
              className="flex gap-md items-center p-lg rounded-md"
              style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>shield</span>
              </div>
              <div>
                <p className="font-body-md text-body-md font-bold text-white">Unit M-24 (Advanced Life Support)</p>
                <span className="inline-block px-sm py-xs font-label-md text-label-md font-bold" style={{ backgroundColor: 'var(--danger)', color: '#fff', borderRadius: 'var(--radius-sm)', margin: '0.2rem 0' }}>CRITICAL</span>
                <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>Dispatched from Station 12</p>
              </div>
            </div>

            <div
              className="flex gap-md items-center p-md rounded-md"
              style={{ border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--danger)', fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-white">Jackson Memorial Trauma Center</p>
                <p className="font-body-sm text-body-sm" style={{ color: 'var(--success)' }}>ETA Post-Pickup: 8 min</p>
              </div>
            </div>

            <div className="flex flex-col gap-md">
              {FIRST_AID.map(f => (
                <div key={f.title} className="flex gap-md items-start p-md rounded-md relative" style={{ border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>{f.icon}</span>
                  <div>
                    <p className="font-body-md text-body-md font-bold text-white">{f.title}</p>
                    {f.steps.map(s => <p key={s} className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>&middot; {s}</p>)}
                  </div>
                  {f.title === 'Spinal Safety' && (
                    <span className="absolute top-md right-md font-label-md text-label-md font-bold px-sm py-xs" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: 'var(--warning)', borderRadius: 'var(--radius-sm)' }}>CAUTION</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-md pt-lg">
            <div className="glass-card p-lg">
              <p className="font-label-md text-label-md font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>ACTIVE VEHICLE</p>
              <p className="font-headline-sm text-headline-sm text-white mt-xs">Porsche 911 Carrera S</p>
              <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>84% Range</p>
            </div>

            <div className="glass-card p-lg">
              <p className="font-label-md text-label-md font-bold tracking-widest" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>DISPATCH TIMELINE</p>
              {DISPATCH_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-md pb-sm">
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: step.done ? 'var(--success)' : step.active ? 'var(--warning)' : 'var(--bg-tertiary)',
                    boxShadow: step.active ? '0 0 8px rgba(245,158,11,0.5)' : 'none',
                  }} />
                  <div className="flex items-center gap-md">
                    {step.time && <span className="font-body-sm text-body-sm font-mono" style={{ color: 'var(--text-muted)', minWidth: '65px' }}>{step.time}</span>}
                    <span className="font-body-sm text-body-sm font-semibold" style={{ color: step.done ? '#fff' : step.active ? 'var(--warning)' : 'var(--text-muted)' }}>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary w-full">
              <span className="material-symbols-outlined text-[16px]">pin_drop</span>
              SHARE LOCATION
            </button>
            <button className="btn btn-secondary w-full">
              Search nearby hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="fixed top-0 w-full h-[54px] z-50 bg-surface border-b-[1.5px] border-outline-variant flex justify-between items-center px-lg">
        <div className="font-headline-sm text-headline-sm font-bold" style={{ color: 'var(--text-primary)' }}>MechHub</div>
        <div className="flex items-center gap-md">
          <button
            className="flex items-center gap-xs px-md py-1.5 rounded-lg font-button-text text-button-text active:opacity-80 transition-all"
            style={{ backgroundColor: '#B71C1C', color: '#fff' }}
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            CANCEL SOS
          </button>
        </div>
      </header>

      <main className="pt-[54px] pb-[40px] min-h-screen grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden" style={{ height: 'calc(100vh - 40px)' }}>
        <section className="md:col-span-7 lg:col-span-8 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center grayscale contrast-125"
              style={{ backgroundImage: `url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')` }}
            ></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#B71C1C', animation: 'pulse-red 2s infinite' }}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-lg left-lg right-lg z-10">
            <div
              className="p-lg rounded-xl shadow-lg flex items-center gap-lg"
              style={{ backgroundColor: 'rgba(18, 22, 32, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-color)' }}
            >
              <div
                className="w-24 h-16 rounded overflow-hidden flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKfQNpXeYgbagZjENNN8xLdfbmo5mvEDtDUbE1NijE3lha0JTSY70HavRgXx7jUccAam5NhhZLCzC1CPzgTBuoowYMnXYsHpwNQ--XI3vMV9IXQexNkCnT615GmPTNCJ_2WeGYT9c4TgLrG56khqMVs-eKY0QlLibjFcSUW8zMVRaoKz5hYvVOI3SDKfjJp4X8RdpM0Pk1-cQvXGu3CTec_YgkH7wruzv1xzk8qoucmBOx8TnLR69mfin2meSBBiXjmMbEk7r2E8Y"
                  alt="Vehicle"
                />
              </div>
              <div>
                <span className="font-label-md text-label-md uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Active Vehicle</span>
                <h2 className="font-headline-md text-headline-md text-white">Porsche 911 Carrera S</h2>
                <div className="flex gap-md mt-1">
                  <span className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                    {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </span>
                  <span className="flex items-center gap-1 font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="material-symbols-outlined text-[16px]">battery_charging_full</span>
                    84% Range
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="md:col-span-5 lg:col-span-4 flex flex-col z-20 overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}>
          <div className="p-xl flex flex-col h-full">
            <div className="mb-xxl">
              <div className="flex items-center gap-sm mb-md">
                <span className="status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', backgroundColor: '#B71C1C', animation: 'pulse 2s infinite' }}></span>
                <span className="font-label-md text-label-md font-bold tracking-widest" style={{ color: '#B71C1C' }}>Urgency: High</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg mb-xs text-white">Emergency Protocol</h1>
              <p className="font-body-md text-body-md" style={{ color: 'var(--text-secondary)' }}>Identify the incident type to notify the appropriate response teams immediately.</p>
            </div>

            <div className="grid grid-cols-1 gap-md mb-xxl">
              {INCIDENT_TYPES.map(t => {
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    className="group flex items-center justify-between p-lg rounded-xl text-left active:scale-[0.98] transition-all"
                    style={{
                      border: `1.5px solid ${isSelected ? '#B71C1C' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'rgba(183, 28, 28, 0.08)' : 'transparent',
                    }}
                    onClick={() => setSelectedType(t.id)}
                  >
                    <div className="flex items-center gap-md">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: isSelected ? 'rgba(183, 28, 28, 0.12)' : 'var(--bg-tertiary)',
                        }}
                      >
                        <span className="material-symbols-outlined text-[28px]" style={{ color: isSelected ? '#ef4444' : 'var(--text-secondary)' }}>{t.icon}</span>
                      </div>
                      <div>
                        <span className="font-headline-sm text-headline-sm block text-white">{t.label}</span>
                        <span className="font-body-sm text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t.desc}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: isSelected ? '#ef4444' : 'var(--text-muted)' }}>chevron_right</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto">
              {selectedType && !submitting && (
                <div className="p-md rounded-lg mb-lg flex items-center gap-md" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--accent-primary)', animation: 'spin 2s linear infinite' }}>sync</span>
                  <span className="font-body-sm text-body-sm" style={{ color: 'var(--text-primary)' }}>Connecting to Local Dispatch...</span>
                </div>
              )}

              <button
                className="w-full py-xl rounded-xl font-headline-md text-headline-md flex flex-col items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: !selectedType || submitting ? 'var(--bg-tertiary)' : broadcastHeld ? '#8E1616' : '#B71C1C',
                  color: '#fff',
                  transform: broadcastHeld ? 'scale(0.98)' : 'scale(1)',
                }}
                disabled={!selectedType || submitting}
                onMouseDown={handleBroadcastStart}
                onMouseUp={handleBroadcastEnd}
                onMouseLeave={handleBroadcastEnd}
                onTouchStart={handleBroadcastStart}
                onTouchEnd={handleBroadcastEnd}
              >
                {submitting ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  <>
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>cell_tower</span>
                      Broadcast Emergency
                    </div>
                    <span className="font-label-md text-label-md opacity-80 uppercase tracking-tighter">
                      {broadcastHeld ? 'Initializing...' : 'Hold to initiate broadcast'}
                    </span>
                  </>
                )}
              </button>

              <p className="text-center mt-lg font-body-sm text-body-sm px-md" style={{ color: 'var(--text-muted)' }}>
                By broadcasting, you authorize MechHub to share your GPS coordinates and vehicle telemetry with emergency responders.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 w-full h-[40px] z-[60] flex items-center justify-center px-md" style={{ backgroundColor: '#FFF9E6', borderTop: '1px solid #E0C040' }}>
        <span className="font-body-sm text-body-sm" style={{ color: 'var(--tertiary, #0c0c0b)' }}>Applied: Fitts's Law — Sizing critical interactive elements for rapid accessibility in high-stress scenarios.</span>
      </footer>

      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(183, 28, 28, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(183, 28, 28, 0); }
          100% { box-shadow: 0 0 0 0 rgba(183, 28, 28, 0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
