import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Phone, MessageSquare, Send, Wifi, Activity } from 'lucide-react';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';
import LiveMap from '../../components/map/LiveMap';
import Spinner from '../../components/ui/Spinner';

const MOCK_TIMELINE = [
  { time: '14:02', label: 'Booking accepted', detail: 'Mechanic confirmed your request.', done: true },
  { time: '14:15', label: 'Arrived at Location', detail: 'Mechanic arrived at your location.', done: true },
  { time: '14:22', label: 'Diagnostic Confirmed', detail: 'Brake caliper seized on rear-left wheel assembly.', done: true },
  { time: '14:28', label: 'Parts Prep', detail: 'System pressure testing and component replacement.', active: true },
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
  { from: 'mechanic', name: 'MARCUS', time: '14:22', text: '"Please point your camera towards the front left wheel assembly. I need to check for mechanical interference."' },
];

export default function Tracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [mechanicLoc, setMechanicLoc] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(CHAT_MSGS);
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
        } catch (e) {}
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

  const STATUS_STEPS = [
    { label: 'Confirmed', statuses: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'] },
    { label: 'En Route', statuses: ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'] },
    { label: 'Arrived', statuses: ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'] },
    { label: 'In Progress', statuses: ['IN_PROGRESS', 'COMPLETED'] },
    { label: 'Completed', statuses: ['COMPLETED'] },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '6rem 0' }}><Spinner /><p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Initializing map radar...</p></div>;

  if (error || !booking) return (
    <div style={{ textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <p style={{ color: '#f87171' }}>{error || 'Booking not found'}</p>
      <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}><ChevronLeft size={16} /> Back to Dashboard</button>
    </div>
  );

  const mechName = booking.mechanic?.name || 'Marcus Chen';

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.topBar}>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={() => navigate('/dashboard')}>
          <ChevronLeft size={16} /> Back to dashboard
        </button>
        <div style={styles.liveIndicator}>
          <span style={styles.liveDot} />
          <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '600' }}>LIVE TRACKING ACTIVE</span>
        </div>
        <button className="btn btn-danger" style={{ fontWeight: '700' }}>🚨 SOS Help</button>
      </div>

      <div style={styles.grid}>
        {/* Map */}
        <div style={styles.mapCol}>
          <div className="glass-card" style={styles.mapCard}>
            <LiveMap height="420px" userLocation={userLoc} mechanicLocation={mechanicLoc} zoom={14} />
          </div>

          {/* Telemetry feed */}
          <div className="glass-card" style={styles.telemetryCard}>
            <div style={styles.telemetryHeader}>
              <Activity size={14} color="var(--accent-primary)" />
              <span style={styles.telemetryTitle}>REAL-TIME TELEMETRY</span>
              <span style={styles.liveBadge}>LIVE NOW {new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div style={styles.telemetryList}>
              {MOCK_TELEMETRY.map((t, i) => (
                <div key={i} style={styles.telemetryRow}>
                  <span style={styles.telemetryTime}>{t.time}</span>
                  <span style={{ ...styles.telemetryType, backgroundColor: t.type === 'ACTION' ? 'rgba(59,130,246,0.15)' : t.type === 'STATUS' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: t.type === 'ACTION' ? 'var(--accent-primary)' : t.type === 'STATUS' ? 'var(--success)' : 'var(--warning)' }}>
                    [{t.type}]
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={styles.rightCol}>
          {/* Mechanic card */}
          <div className="glass-card" style={styles.mechCard}>
            <div style={styles.mechRow}>
              <div style={styles.mechAvatar}>{mechName.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.mechNameRow}>
                  <p style={styles.mechName}>{mechName}</p>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>VERIFIED</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MASTER TECH · {booking.service?.name}</p>
              </div>
            </div>
            <div style={styles.mechStats}>
              <div style={styles.mechStat}>
                <p style={styles.mechStatVal}>4.2 KM</p>
                <p style={styles.mechStatLabel}>DISTANCE</p>
              </div>
              <div style={styles.mechStat}>
                <p style={styles.mechStatVal}>12 MIN</p>
                <p style={styles.mechStatLabel}>ETA</p>
              </div>
              <div style={styles.mechStat}>
                <p style={{ ...styles.mechStatVal, color: '#f87171' }}>LIVE SOS</p>
                <p style={styles.mechStatLabel}>ABNORMAL GRINDING</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {['timeline', 'chat', 'diagnostics'].map(tab => (
              <button key={tab} style={{ ...styles.tab, borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === tab ? '#fff' : 'var(--text-muted)' }} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="glass-card" style={styles.tabContent}>
              <h4 style={styles.tabTitle}>Repair Timeline</h4>
              <div style={styles.timeline}>
                {MOCK_TIMELINE.map((step, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineLeft}>
                      <p style={styles.timelineTime}>{step.time}</p>
                      {i < MOCK_TIMELINE.length - 1 && <div style={styles.timelineConnector} />}
                    </div>
                    <div style={{ ...styles.timelineDot, backgroundColor: step.done ? 'var(--success)' : step.active ? 'var(--accent-primary)' : 'var(--bg-tertiary)', boxShadow: step.active ? '0 0 10px rgba(59,130,246,0.4)' : 'none' }} />
                    <div style={styles.timelineContent}>
                      <p style={{ ...styles.timelineLabel, color: step.done || step.active ? '#fff' : 'var(--text-muted)' }}>{step.label}</p>
                      {step.active && <p style={styles.timelineActive}>IN PROGRESS</p>}
                      <p style={styles.timelineDetail}>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              {booking.status === 'COMPLETED' && (
                <div style={styles.completedBox}>
                  <CheckCircle size={20} color="var(--success)" />
                  <div>
                    <p style={{ color: '#fff', fontWeight: '700', fontSize: '0.875rem' }}>Service Completed</p>
                    <button className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => navigate('/dashboard')}>Release Payment</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat tab */}
          {activeTab === 'chat' && (
            <div className="glass-card" style={styles.tabContent}>
              <div style={styles.chatHeader}>
                <Wifi size={14} color="var(--success)" />
                <span style={styles.chatHeaderText}>LIVE CONNECTION · {mechName.split(' ')[0].toUpperCase()} CHEN</span>
                <span style={styles.chatCriticality}>CRITICALITY: HIGH</span>
              </div>
              <div style={styles.chatMessages} ref={chatRef}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ ...styles.chatMsg, alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <p style={{ ...styles.chatMsgName, color: msg.from === 'user' ? 'var(--accent-primary)' : 'var(--success)' }}>{msg.name} · {msg.time}</p>
                    <div style={{ ...styles.chatBubble, backgroundColor: msg.from === 'user' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', borderColor: msg.from === 'user' ? 'rgba(59,130,246,0.3)' : 'var(--border-color)' }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} style={styles.chatInputRow}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ flex: 1, height: '38px', fontSize: '0.82rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 0.75rem' }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}

          {/* Diagnostics tab */}
          {activeTab === 'diagnostics' && (
            <div className="glass-card" style={styles.tabContent}>
              <h4 style={styles.tabTitle}>Quick Diagnostics</h4>
              <p style={styles.tabSubtitle}>Step 1 of 2 — Identify key symptoms to expedite the mobile workshop's setup upon arrival.</p>
              <div style={styles.diagOptions}>
                {['Abnormal Grinding', 'Fluid Leakage', 'Power Loss', 'Excessive Smoke'].map(opt => (
                  <button key={opt} className="btn btn-secondary" style={styles.diagBtn}>{opt}</button>
                ))}
              </div>
              <div style={styles.diagTelemetry}>
                <div style={styles.diagRow}><span style={styles.diagLabel}>Engine Thermal Load</span><span style={styles.diagVal}>102°C</span></div>
                <div style={styles.diagRow}><span style={styles.diagLabel}>Battery Output Stability</span><span style={styles.diagVal}>94%</span></div>
                <div style={styles.diagRow}><span style={styles.diagLabel}>Wheel RPM</span><span style={{ ...styles.diagVal, color: '#f87171' }}>0 km/h</span></div>
                <div style={styles.diagRow}><span style={styles.diagLabel}>Acoustic Signal</span><span style={{ ...styles.diagVal, color: '#f87171' }}>Grinding</span></div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Start Visual Scan</button>
            </div>
          )}

          {/* Call / message buttons */}
          <div style={styles.actionButtons}>
            <button className="btn btn-secondary" style={{ flex: 1 }}><Phone size={16} />Call Tech</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setActiveTab('chat')}><MessageSquare size={16} />Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 6px rgba(16,185,129,0.6)' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' },
  mapCol: { flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  mapCard: { padding: '0.5rem', overflow: 'hidden' },
  telemetryCard: { padding: '1rem' },
  telemetryHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' },
  telemetryTitle: { fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', flex: 1 },
  liveBadge: { fontSize: '0.65rem', color: 'var(--success)', fontWeight: '700', fontFamily: 'monospace' },
  telemetryList: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  telemetryRow: { display: 'flex', alignItems: 'flex-start', gap: '0.6rem' },
  telemetryTime: { fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0, minWidth: '60px' },
  telemetryType: { fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 },
  rightCol: { flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  mechCard: { padding: '1.1rem' },
  mechRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' },
  mechAvatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '0.85rem', flexShrink: 0 },
  mechNameRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  mechName: { fontSize: '0.95rem', fontWeight: '700', color: '#fff' },
  mechStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' },
  mechStat: { textAlign: 'center' },
  mechStatVal: { fontSize: '0.85rem', fontWeight: '700', color: '#fff' },
  mechStatLabel: { fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.1rem' },
  tabs: { display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '0' },
  tab: { flex: 1, background: 'none', border: 'none', padding: '0.6rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'color 0.15s', textTransform: 'capitalize' },
  tabContent: { padding: '1rem', minHeight: '280px' },
  tabTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' },
  tabSubtitle: { fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '0' },
  timelineItem: { display: 'flex', gap: '0.6rem', alignItems: 'flex-start', paddingBottom: '0.75rem' },
  timelineLeft: { width: '42px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
  timelineTime: { fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' },
  timelineConnector: { width: '1px', flex: 1, backgroundColor: 'var(--border-color)', marginTop: '4px' },
  timelineDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  timelineContent: { flex: 1, paddingBottom: '0.5rem' },
  timelineLabel: { fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.1rem' },
  timelineActive: { fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.2rem' },
  timelineDetail: { fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' },
  completedBox: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', padding: '0.4rem 0.6rem', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)' },
  chatHeaderText: { fontSize: '0.65rem', fontWeight: '700', color: 'var(--success)', flex: 1, letterSpacing: '0.05em' },
  chatCriticality: { fontSize: '0.65rem', color: '#f87171', fontWeight: '700' },
  chatMessages: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '0.75rem' },
  chatMsg: { display: 'flex', flexDirection: 'column', maxWidth: '85%' },
  chatMsgName: { fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.2rem' },
  chatBubble: { padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid' },
  chatInputRow: { display: 'flex', gap: '0.5rem' },
  diagOptions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' },
  diagBtn: { padding: '0.5rem', fontSize: '0.78rem', textAlign: 'left' },
  diagTelemetry: { display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' },
  diagRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' },
  diagLabel: { color: 'var(--text-secondary)' },
  diagVal: { fontWeight: '700', color: '#fff', fontFamily: 'monospace' },
  actionButtons: { display: 'flex', gap: '0.75rem' },
};
