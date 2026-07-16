import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, Clock, AlertTriangle, Heart, Activity, Shield, ChevronRight, X } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

const INCIDENT_TYPES = [
  { id: 'ACCIDENT', icon: '🚗', label: 'Accident', desc: 'Collision or impact report', severity: 'CRITICAL' },
  { id: 'MECHANICAL', icon: '🔧', label: 'Mechanical Failure', desc: 'Breakdown, smoke, or lockouts', severity: 'HIGH' },
  { id: 'MEDICAL', icon: '🏥', label: 'Medical', desc: 'Immediate health assistance', severity: 'CRITICAL' },
];

const FIRST_AID = [
  { icon: '🩸', title: 'Severe Bleeding', steps: ['Apply direct pressure with clean cloth', 'Elevate wound above heart level'] },
  { icon: '❤️', title: 'CPR Assistance', steps: ['Place hands in center of chest', 'Push hard and fast at 100-120 bpm'] },
  { icon: '🦴', title: 'Spinal Safety', steps: ['Do not move the victim', 'Support the head and neck in neutral position'] },
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
  const [phase, setPhase] = useState('picker'); // picker | active | dispatched
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lat, setLat] = useState(27.7172);
  const [lng, setLng] = useState(85.324);
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

  const handleDispatch = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      await api.post('/sos/alert', {
        latitude: lat,
        longitude: lng,
        message: `${selectedType} emergency — dispatching ALS unit`,
      });
    } catch (err) {
      // proceed regardless — critical UX
    } finally {
      setSubmitting(false);
      setPhase('active');
    }
  };

  if (phase === 'active' || phase === 'dispatched') {
    return (
      <div style={styles.activeContainer} className="animate-fade-in">
        {/* Top bar */}
        <div style={styles.activeTopBar}>
          <div style={styles.activeTopLeft}>
            <span style={styles.logoText}>Online Garage</span>
            <span style={styles.sosBrand}>SOSMechHub</span>
          </div>
          <div style={styles.medicalBanner}>
            <Activity size={16} color="#fff" />
            <span>MEDICAL DISPATCH ACTIVE</span>
          </div>
          <button style={styles.getHelpBtn}>GET HELP NOW</button>
        </div>

        {/* Emergency alert */}
        <div style={styles.alertHeader}>
          <div style={styles.urgencyBadge}>URGENCY: HIGH</div>
          <h1 style={styles.alertTitle}>{user?.name || 'John Doe'}</h1>
          <p style={styles.alertSub}>ALS ARRIVAL · En Route</p>
          <p style={styles.alertInstruction}>Immediate First Aid · Emergency Protocol</p>
          <div style={styles.bloodType}><span>A+ Negative</span></div>
        </div>

        <div style={styles.mainGrid}>
          {/* Left sidebar nav */}
          <aside style={styles.sidebar}>
            <nav style={styles.sideNav}>
              {['Dashboard', 'My Vehicles', 'Booking History', 'Payments', 'Settings'].map(item => (
                <button key={item} style={styles.sideNavItem}>{item}</button>
              ))}
              <button style={styles.supportNavItem}>SUPPORT</button>
              <button style={styles.sideNavItem} onClick={() => navigate('/')}>Help Center</button>
              <button style={styles.sideNavItem} onClick={() => navigate('/login')}>Sign Out</button>
            </nav>
          </aside>

          {/* Center: dispatch panel */}
          <div style={styles.centerPanel}>
            <div style={styles.timerBlock}>
              <span style={styles.timerNum}>{formatTime(elapsedSeconds)}</span>
              <span style={styles.timerLabel}>min</span>
            </div>
            <p style={styles.timerDesc}>Follow these voice-guided protocols until the ALS unit arrives. Stay calm.</p>

            {/* ALS Unit card */}
            <div style={styles.unitCard}>
              <div style={styles.unitIcon}><Shield size={24} color="#fff" /></div>
              <div>
                <p style={styles.unitTitle}>Unit M-24 (Advanced Life Support)</p>
                <span style={styles.criticalBadge}>CRITICAL</span>
                <p style={styles.unitSub}>Dispatched from Station 12</p>
              </div>
            </div>

            {/* Destination */}
            <div style={styles.destCard}>
              <Heart size={18} color="var(--danger)" />
              <div>
                <p style={styles.destTitle}>Jackson Memorial Trauma Center</p>
                <p style={styles.destSub}>ETA Post-Pickup: 8 min</p>
              </div>
            </div>

            {/* First aid protocols */}
            <div style={styles.protocolList}>
              {FIRST_AID.map(f => (
                <div key={f.title} style={styles.protocolCard}>
                  <span style={styles.protocolIcon}>{f.icon}</span>
                  <div>
                    <p style={styles.protocolTitle}>{f.title}</p>
                    {f.steps.map(s => <p key={s} style={styles.protocolStep}>· {s}</p>)}
                  </div>
                  {f.title === 'Spinal Safety' && <span style={styles.cautionBadge}>CAUTION</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: dispatch timeline + vehicle */}
          <div style={styles.rightPanel}>
            {/* Vehicle info */}
            <div className="glass-card" style={styles.vehicleCard}>
              <p style={styles.vehicleLabel}>ACTIVE VEHICLE</p>
              <p style={styles.vehicleName}>Porsche 911 Carrera S</p>
              <p style={styles.vehicleSub}>84% Range</p>
            </div>

            {/* Dispatch timeline */}
            <div className="glass-card" style={styles.timelineCard}>
              <p style={styles.timelineTitle}>DISPATCH TIMELINE</p>
              {DISPATCH_STEPS.map((step, i) => (
                <div key={i} style={styles.timelineStep}>
                  <div style={{
                    ...styles.timelineDot,
                    backgroundColor: step.done ? 'var(--success)' : step.active ? 'var(--warning)' : 'var(--bg-tertiary)',
                    boxShadow: step.active ? '0 0 8px rgba(245,158,11,0.5)' : 'none',
                  }} />
                  <div style={styles.timelineContent}>
                    {step.time && <span style={styles.timelineTime}>{step.time}</span>}
                    <span style={{ ...styles.timelineLabel, color: step.done ? '#fff' : step.active ? 'var(--warning)' : 'var(--text-muted)' }}>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Share + search */}
            <button className="btn btn-primary" style={styles.shareBtn}>
              <MapPin size={16} /> SHARE LOCATION
            </button>
            <button className="btn btn-secondary" style={styles.hospitalBtn}>
              Search nearby hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase: picker
  return (
    <div style={styles.pickerContainer} className="animate-fade-in">
      <div style={styles.pickerHeader}>
        <h2 style={styles.pickerTitle}>🚨 Emergency SOS</h2>
        <p style={styles.pickerSub}>Identify the incident type to notify the appropriate response teams immediately.</p>
        <button style={styles.closeBtn} onClick={() => navigate(-1)}><X size={20} /></button>
      </div>

      <div style={styles.incidentGrid}>
        {INCIDENT_TYPES.map(t => (
          <button
            key={t.id}
            style={{
              ...styles.incidentCard,
              borderColor: selectedType === t.id ? 'var(--danger)' : 'var(--border-color)',
              backgroundColor: selectedType === t.id ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.01)',
            }}
            onClick={() => setSelectedType(t.id)}
          >
            <span style={styles.incidentIcon}>{t.icon}</span>
            <h3 style={styles.incidentLabel}>{t.label}</h3>
            <p style={styles.incidentDesc}>{t.desc}</p>
            <span style={{ ...styles.severityBadge, backgroundColor: t.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: t.severity === 'CRITICAL' ? '#f87171' : 'var(--warning)' }}>
              {t.severity}
            </span>
          </button>
        ))}
      </div>

      {/* Vehicle info preview */}
      <div style={styles.vehiclePreview}>
        <div style={styles.vehiclePreviewInfo}>
          <p style={styles.vehiclePreviewLabel}>ACTIVE VEHICLE</p>
          <p style={styles.vehiclePreviewName}>{user?.name || 'Your Vehicle'}</p>
        </div>
        <div>
          <p style={styles.vehiclePreviewLabel}>DISPATCH TIME</p>
          <p style={styles.vehiclePreviewName}>Immediate</p>
        </div>
        <div>
          <p style={styles.vehiclePreviewLabel}>LOCATION</p>
          <p style={styles.vehiclePreviewName}>{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</p>
        </div>
      </div>

      <div style={styles.pickerActions}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancel</button>
        <button
          className="btn btn-danger"
          style={{ flex: 2, height: '52px', fontWeight: '800', fontSize: '1rem' }}
          disabled={!selectedType || submitting}
          onClick={handleDispatch}
        >
          {submitting ? <Spinner size="sm" color="white" /> : 'DISPATCH EMERGENCY UNIT'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pickerContainer: { maxWidth: '700px', margin: '0 auto', paddingBottom: '3rem', position: 'relative' },
  pickerHeader: { textAlign: 'center', marginBottom: '2rem', position: 'relative' },
  pickerTitle: { fontSize: '2rem', fontWeight: '800', color: '#fff' },
  pickerSub: { color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '500px', margin: '0.5rem auto 0' },
  closeBtn: { position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' },
  incidentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  incidentCard: { display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition-fast)' },
  incidentIcon: { fontSize: '2rem' },
  incidentLabel: { fontSize: '1.1rem', fontWeight: '700', color: '#fff' },
  incidentDesc: { fontSize: '0.8rem', color: 'var(--text-secondary)' },
  severityBadge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', marginTop: '0.25rem', width: 'fit-content' },
  vehiclePreview: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' },
  vehiclePreviewInfo: {},
  vehiclePreviewLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' },
  vehiclePreviewName: { fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginTop: '0.2rem' },
  pickerActions: { display: 'flex', gap: '1rem' },
  // Active phase
  activeContainer: { minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '2rem' },
  activeTopBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' },
  activeTopLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  logoText: { fontWeight: '800', fontSize: '1.1rem', color: '#fff' },
  sosBrand: { fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '700', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.3)' },
  medicalBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--danger)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700', color: '#fff', letterSpacing: '0.05em' },
  getHelpBtn: { backgroundColor: 'var(--danger)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' },
  alertHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem 1rem', textAlign: 'center', gap: '0.4rem' },
  urgencyBadge: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.06em' },
  alertTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#fff' },
  alertSub: { fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' },
  alertInstruction: { fontSize: '0.8rem', color: 'var(--text-secondary)' },
  bloodType: { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#f87171', fontWeight: '700' },
  mainGrid: { display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', gap: '2rem', flexWrap: 'wrap' },
  sidebar: { flex: '0 0 180px' },
  sideNav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '1.5rem' },
  sideNavItem: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', transition: 'background var(--transition-fast)' },
  supportNavItem: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', padding: '0.75rem 0.75rem 0.25rem', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
  centerPanel: { flex: '2 1 400px', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  timerBlock: { display: 'flex', alignItems: 'baseline', gap: '0.25rem' },
  timerNum: { fontSize: '3.5rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' },
  timerLabel: { fontSize: '1rem', color: 'var(--text-muted)' },
  timerDesc: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '380px' },
  unitCard: { display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' },
  unitIcon: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  unitTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#fff' },
  criticalBadge: { display: 'inline-block', backgroundColor: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.2rem', marginBottom: '0.2rem' },
  unitSub: { fontSize: '0.78rem', color: 'var(--text-secondary)' },
  destCard: { display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' },
  destTitle: { fontSize: '0.875rem', fontWeight: '700', color: '#fff' },
  destSub: { fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.1rem' },
  protocolList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  protocolCard: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)', position: 'relative' },
  protocolIcon: { fontSize: '1.2rem', flexShrink: 0 },
  protocolTitle: { fontSize: '0.875rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' },
  protocolStep: { fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' },
  cautionBadge: { position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: 'rgba(245,158,11,0.15)', color: 'var(--warning)', fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' },
  rightPanel: { flex: '1 1 220px', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  vehicleCard: { padding: '1rem' },
  vehicleLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' },
  vehicleName: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginTop: '0.2rem' },
  vehicleSub: { fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' },
  timelineCard: { padding: '1rem' },
  timelineTitle: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' },
  timelineStep: { display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.6rem' },
  timelineDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  timelineContent: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  timelineTime: { fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: '65px' },
  timelineLabel: { fontSize: '0.8rem', fontWeight: '600' },
  shareBtn: { width: '100%' },
  hospitalBtn: { width: '100%' },
};
