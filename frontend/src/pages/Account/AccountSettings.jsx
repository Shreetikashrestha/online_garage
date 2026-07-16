import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Database, CreditCard, Shield, ChevronRight, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const SECTIONS = [
  { id: 'profile', icon: <User size={18} />, label: 'Profile Information', desc: 'Edit details' },
  { id: 'security', icon: <Lock size={18} />, label: 'Security Health', desc: 'Passwords and two-factor authentication.' },
  { id: 'notifications', icon: <Bell size={18} />, label: 'Notification Hub', desc: 'High-priority vehicle safety warnings and SOS pings.' },
  { id: 'privacy', icon: <Database size={18} />, label: 'Data Privacy & Storage', desc: 'Your workshop data is encrypted using AES-256 standards.' },
  { id: 'billing', icon: <CreditCard size={18} />, label: 'Garage Care Subscription', desc: 'Get 15% off all invoices with our annual maintenance plan.' },
];

const NOTIFICATION_PREFS = [
  { id: 'critical', label: 'Critical Alerts', desc: 'High-priority vehicle safety warnings and SOS pings.', enabled: true },
  { id: 'orders', label: 'Order Updates', desc: 'Status changes on parts, inventory and repair schedules.', enabled: true },
  { id: 'marketing', label: 'Marketing & Tips', desc: 'Occasional workshop optimization advice and partner news.', enabled: false },
];

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading, error } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(NOTIFICATION_PREFS);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({ name, phone });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = (id) => {
    setNotifPrefs(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const filteredSections = SECTIONS.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container} className="animate-fade-in">
      <h2 style={styles.title}>Account Settings</h2>

      <div style={styles.grid}>
        {/* Left nav */}
        <aside style={styles.sidebar}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>{user?.name?.charAt(0) || 'A'}</div>
            <div>
              <p style={styles.userName}>{user?.name || 'Alex Rivera'}</p>
              <p style={styles.userRole}>{user?.role === 'MECHANIC' ? 'Professional Workshop' : 'Account Management'}</p>
            </div>
          </div>

          <div style={styles.searchWrapper}>
            <Search size={14} style={styles.searchIcon} />
            <input
              type="text"
              className="form-control"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2rem', height: '36px', fontSize: '0.82rem' }}
            />
          </div>

          <nav style={styles.nav}>
            {filteredSections.map(s => (
              <button
                key={s.id}
                style={{
                  ...styles.navItem,
                  backgroundColor: activeSection === s.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  borderLeft: `3px solid ${activeSection === s.id ? 'var(--accent-primary)' : 'transparent'}`,
                  color: activeSection === s.id ? '#fff' : 'var(--text-secondary)',
                }}
                onClick={() => setActiveSection(s.id)}
              >
                <span style={{ color: activeSection === s.id ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>

          <div style={styles.sideFooter}>
            <button className="btn btn-secondary" style={styles.footerBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="btn btn-secondary" style={styles.footerBtn} onClick={() => navigate('/booking/problem')}>All Services</button>
          </div>
        </aside>

        {/* Right content */}
        <div style={styles.content}>
          {activeSection === 'profile' && (
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Profile Information</h3>
              <p style={styles.sectionDesc}>Public identity for workshop collaborations.</p>

              {saveSuccess && (
                <div style={styles.successBanner}>✓ Profile updated successfully</div>
              )}
              {error && <div style={styles.errorBanner}>{error}</div>}

              <form onSubmit={handleSaveProfile} style={styles.form}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Official name for workshop collaborations." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
                {user?.isIdentityVerified ? (
                  <div style={styles.verifiedBadge}>
                    <Shield size={16} color="var(--success)" />
                    <span>VERIFIED PROFESSIONAL — Your credentials have been verified by Garage HQ.</span>
                    <button type="button" style={styles.reverifyBtn}>Re-verify status</button>
                  </div>
                ) : (
                  <div style={styles.unverifiedBadge}>
                    <span>Identity not verified. Verify to access all features.</span>
                    <button type="button" style={styles.verifyBtn} onClick={() => navigate('/verify-identity')}>Verify Now →</button>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={saving || isLoading}>
                  {saving ? <Spinner size="sm" color="white" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Security Health</h3>
              <p style={styles.sectionDesc}>Last login: 2 hours ago from London, UK</p>
              <div style={styles.securityItems}>
                <div style={styles.securityItem}>
                  <div>
                    <p style={styles.secItemTitle}>Password</p>
                    <p style={styles.secItemSub}>Last changed 45 days ago.</p>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>Change Password</button>
                </div>
                <div style={styles.securityItem}>
                  <div>
                    <p style={styles.secItemTitle}>Two-Factor Authentication (2FA)</p>
                    <p style={styles.secItemSub}>Active via Authenticator App.</p>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>Manage 2FA</button>
                </div>
                <div style={styles.securityItem}>
                  <div>
                    <p style={styles.secItemTitle}>Biometric Unlock</p>
                    <p style={styles.secItemSub}>Enable fingerprint or face recognition.</p>
                  </div>
                  <div style={styles.toggle} onClick={() => {}}>
                    <div style={{ ...styles.toggleHandle, transform: 'translateX(22px)', backgroundColor: 'var(--success)' }} />
                  </div>
                </div>
                <div style={styles.securityItem}>
                  <div>
                    <p style={styles.secItemTitle}>Session Timeout</p>
                    <p style={styles.secItemSub}>Auto-logout after inactivity.</p>
                  </div>
                  <select className="form-control" style={{ width: '120px', height: '36px', fontSize: '0.82rem' }}>
                    <option>30 MIN</option>
                    <option>1 HOUR</option>
                    <option>4 HOURS</option>
                  </select>
                </div>
                <div style={styles.securityItem}>
                  <div>
                    <p style={styles.secItemTitle}>Update Security Protocol</p>
                    <p style={styles.secItemSub}>Review and update responding team credentials.</p>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>Update →</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Notification Hub</h3>
              <div style={styles.notifList}>
                {notifPrefs.map(n => (
                  <div key={n.id} style={styles.notifItem}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.notifTitle}>{n.label}</p>
                      <p style={styles.notifDesc}>{n.desc}</p>
                    </div>
                    <button
                      style={{ ...styles.toggle, backgroundColor: n.enabled ? 'var(--success)' : 'var(--bg-tertiary)' }}
                      onClick={() => toggleNotif(n.id)}
                    >
                      <div style={{ ...styles.toggleHandle, transform: n.enabled ? 'translateX(22px)' : 'translateX(2px)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Data Privacy & Storage</h3>
              <p style={styles.sectionDesc}>Your workshop data is encrypted using AES-256 standards. We never share your technical diagnostics with third parties without explicit consent.</p>
              <div style={styles.privacyItems}>
                <div style={styles.privacyItem}>
                  <Shield size={20} color="var(--accent-primary)" />
                  <div>
                    <p style={styles.secItemTitle}>Live Location Sharing</p>
                    <p style={styles.secItemSub}>ENABLED FOR FIRST RESPONDERS</p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
                <div style={styles.privacyItem}>
                  <Database size={20} color="var(--accent-secondary)" />
                  <div>
                    <p style={styles.secItemTitle}>Insurance Provider</p>
                    <p style={styles.secItemSub}>State Farm Elite · Policy POL-882194-00</p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Read Privacy Policy →</button>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Garage Care Subscription</h3>
              <div style={styles.billingBox}>
                <p style={styles.billingTitle}>Get 15% off all invoices with our annual maintenance plan. Proactive care for your vehicle.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Upgrade to Annual Plan</button>
              </div>
              <div style={styles.billingContact}>
                <p style={styles.secItemTitle}>Billing Questions?</p>
                <p style={styles.secItemSub}>Chat with our finance department about invoice discrepancies or custom payment plans.</p>
                <button className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Contact Finance Team</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem' },
  title: { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '2rem' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '2rem' },
  sidebar: { flex: '0 1 240px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  userCard: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' },
  userAvatar: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#fff', flexShrink: 0 },
  userName: { fontSize: '0.9rem', fontWeight: '700', color: '#fff' },
  userRole: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' },
  searchWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  navItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', textAlign: 'left', transition: 'all var(--transition-fast)' },
  sideFooter: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' },
  footerBtn: { width: '100%', padding: '0.5rem', fontSize: '0.8rem' },
  content: { flex: '1 1 500px' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' },
  sectionDesc: { fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column' },
  successBanner: { backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem' },
  verifiedBadge: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--success)', flexWrap: 'wrap' },
  unverifiedBadge: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--warning)' },
  reverifyBtn: { background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.78rem', marginLeft: 'auto' },
  verifyBtn: { background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' },
  securityItems: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  securityItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)', gap: '1rem' },
  secItemTitle: { fontSize: '0.875rem', fontWeight: '600', color: '#fff' },
  secItemSub: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' },
  toggle: { width: '46px', height: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', position: 'relative', cursor: 'pointer', flexShrink: 0, border: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' },
  toggleHandle: { position: 'absolute', top: '2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', transition: 'transform var(--transition-fast)' },
  notifList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  notifItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)' },
  notifTitle: { fontSize: '0.875rem', fontWeight: '600', color: '#fff' },
  notifDesc: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' },
  privacyItems: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' },
  privacyItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.01)', cursor: 'pointer' },
  billingBox: { padding: '1.25rem', backgroundColor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' },
  billingTitle: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.55' },
  billingContact: { padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' },
};
