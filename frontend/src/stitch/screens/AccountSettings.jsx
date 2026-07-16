import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const NOTIFICATION_PREFS = [
  { id: 'critical', label: 'Critical Alerts', desc: 'High-priority vehicle safety warnings and SOS pings.', enabled: true },
  { id: 'orders', label: 'Order Updates', desc: 'Status changes on parts, inventory and repair schedules.', enabled: true },
  { id: 'marketing', label: 'Marketing & Tips', desc: 'Occasional workshop optimization advice and partner news.', enabled: false },
];

export default function AccountSettings() {
  const { user, updateProfile, isLoading, error } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(NOTIFICATION_PREFS);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({ name, phone });
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/user/password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.';
      setPasswordError(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleNotif = (id) => {
    setNotifPrefs(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const email = user?.email || '';
  const workshopId = user?.workshopId || `#OG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const userName = user?.name || 'Alex Carter';
  const userPhone = user?.phone || '+1 (555) 000-0000';
  const userInitial = userName.charAt(0).toUpperCase();
  const isVerified = user?.isIdentityVerified ?? true;

  return (
    <div className="w-full max-w-[1160px] mx-auto pb-12 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-[32px] font-bold tracking-[-0.01em] text-primary mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1c1b' }}>
            Profile & Privacy
          </h3>
          <p className="text-body-md" style={{ color: '#444748' }}>Manage your technical credentials and garage security protocols.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'rgba(27,94,32,0.1)', borderColor: 'rgba(27,94,32,0.2)', color: '#1B5E20' }}>
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="text-[12px] font-semibold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Verified Professional</span>
        </div>
      </div>

      {/* Success / Error banners */}
      {saveSuccess && (
        <div className="mb-4 px-4 py-3 rounded-lg border text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#059669' }}>
          <span className="material-symbols-outlined text-[18px]">check_circle</span> Profile updated successfully
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#dc2626' }}>
          <span className="material-symbols-outlined text-[18px]">error</span> {error}
        </div>
      )}

      {/* BENTO GRID */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        {/* Profile Information (Large) */}
        <section className="col-span-8 rounded-lg p-6 flex flex-col" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid #DDDBD5' }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-[20px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1c1b' }}>Profile Information</h4>
              <p className="text-sm" style={{ color: '#444748' }}>Public identity for workshop collaborations.</p>
            </div>
            <button
              className="text-sm font-semibold hover:underline"
              style={{ color: '#335e9f', fontFamily: "'Inter', sans-serif" }}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit details'}
            </button>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#444748', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Full Name</label>
                {editing ? (
                  <input
                    className="w-full px-4 py-3 rounded-[5px] text-sm outline-none transition-all"
                    style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Official name for workshop collaborations."
                    required
                    onFocus={e => { e.target.style.borderColor = '#335e9f'; }}
                    onBlur={e => { e.target.style.borderColor = '#c4c7c7'; }}
                  />
                ) : (
                  <div className="px-4 py-3 rounded-[5px] text-base" style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}>{userName}</div>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#444748', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Official Email</label>
                <div className="px-4 py-3 rounded-[5px] text-base" style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif", opacity: 0.6 }}>{email}</div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#444748', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Phone Number</label>
                {editing ? (
                  <input
                    className="w-full px-4 py-3 rounded-[5px] text-sm outline-none transition-all"
                    style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    onFocus={e => { e.target.style.borderColor = '#335e9f'; }}
                    onBlur={e => { e.target.style.borderColor = '#c4c7c7'; }}
                  />
                ) : (
                  <div className="px-4 py-3 rounded-[5px] text-base" style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}>{userPhone}</div>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#444748', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Workshop ID</label>
                <div className="px-4 py-3 rounded-[5px] text-base italic" style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#444748', fontFamily: "'Inter', sans-serif" }}>{workshopId}</div>
              </div>
            </div>

            {editing && (
              <button
                type="submit"
                className="px-6 py-3 rounded-[5px] text-white font-bold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: '#0b0c0c', fontFamily: "'Inter', sans-serif" }}
                disabled={saving || isLoading}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </form>

          <div className="mt-auto pt-6 border-t flex items-center justify-between" style={{ borderColor: '#c4c7c7' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1B5E20]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-sm" style={{ color: '#444748' }}>Your credentials have been verified by Garage HQ.</p>
            </div>
            <a className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: '#1A4A8A', fontFamily: "'Inter', sans-serif" }} href="#">
              Re-verify status <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </section>

        {/* Security Health (Small Side) */}
        <section className="col-span-4 rounded-lg p-6 border-l-4" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid #DDDBD5', borderLeft: '4px solid #ba1a1a' }}>
          <div className="mb-4">
            <h4 className="text-[20px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1c1b' }}>Security Health</h4>
            <p className="text-sm" style={{ color: '#444748' }}>Last login: 2 hours ago from London, UK</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#eeeeec' }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ color: '#335e9f' }}>fingerprint</span>
                <span className="text-sm" style={{ color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}>Biometric Unlock</span>
              </div>
              <div
                className="w-8 h-4 rounded-full relative cursor-pointer transition-colors"
                style={{ backgroundColor: '#335e9f' }}
                onClick={() => {}}
              >
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#eeeeec' }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ color: '#444748' }}>vpn_key</span>
                <span className="text-sm" style={{ color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}>Session Timeout</span>
              </div>
              <span className="text-xs font-bold" style={{ color: '#444748', fontFamily: "'Inter', sans-serif" }}>30 MIN</span>
            </div>
          </div>
          <button className="w-full mt-6 py-3 rounded-[5px] text-white font-bold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: '#0b0c0c', fontFamily: "'Inter', sans-serif" }}>
            Update Security Protocol
          </button>
        </section>

        {/* Notification Preferences (Medium) */}
        <section className="col-span-5 rounded-lg p-6" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid #DDDBD5' }}>
          <h4 className="text-[20px] font-semibold mb-4" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1c1b' }}>Notification Hub</h4>
          <div className="space-y-6">
            {notifPrefs.map((n) => (
              <div key={n.id} className="flex items-start gap-4">
                <div className="mt-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: '#335e9f', borderColor: '#c4c7c7' }}
                    checked={n.enabled}
                    onChange={() => toggleNotif(n.id)}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a1c1b', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>{n.label}</p>
                  <p className="text-sm" style={{ color: '#444748' }}>{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Password & 2FA (Medium-Large) */}
        <section className="col-span-7 rounded-lg p-6" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid #DDDBD5' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(26,74,138,0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: '#1A4A8A' }}>shield_lock</span>
            </div>
            <div>
              <h4 className="text-[20px] font-semibold" style={{ fontFamily: "'DM Sans', sans-serif", color: '#1a1c1b' }}>Security Enforcement</h4>
              <p className="text-sm" style={{ color: '#444748' }}>Passwords and two-factor authentication.</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-4 px-4 py-3 rounded-lg border text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#059669' }}>
              <span className="material-symbols-outlined text-[18px]">check_circle</span> Password changed successfully
            </div>
          )}
          {passwordError && (
            <div className="mb-4 px-4 py-3 rounded-lg border text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#dc2626' }}>
              <span className="material-symbols-outlined text-[18px]">error</span> {passwordError}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #c4c7c7' }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a1c1b', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Password</p>
                <p className="text-sm" style={{ color: '#444748' }}>Last changed 45 days ago.</p>
                {showPasswordForm && (
                  <div className="mt-4 space-y-3" style={{ maxWidth: '320px' }}>
                    <input
                      type="password"
                      className="w-full px-3 py-2 rounded-[5px] text-sm outline-none"
                      style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <input
                      type="password"
                      className="w-full px-3 py-2 rounded-[5px] text-sm outline-none"
                      style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}
                      placeholder="New password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <input
                      type="password"
                      className="w-full px-3 py-2 rounded-[5px] text-sm outline-none"
                      style={{ backgroundColor: '#f4f4f2', border: '1px solid #c4c7c7', color: '#1a1c1b', fontFamily: "'Inter', sans-serif" }}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 rounded-[5px] text-white font-bold text-xs transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#0b0c0c', fontFamily: "'Inter', sans-serif" }}
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                      >
                        {changingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        className="px-4 py-2 rounded-[5px] text-xs font-bold"
                        style={{ border: '1px solid #747878', color: '#1a1c1b', fontFamily: "'Inter', sans-serif", backgroundColor: 'transparent' }}
                        onClick={() => { setShowPasswordForm(false); setPasswordError(''); setPasswordSuccess(false); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {!showPasswordForm && (
                <button
                  className="px-4 py-2 rounded-[5px] text-sm font-bold"
                  style={{ border: '1px solid #747878', color: '#1a1c1b', fontFamily: "'Inter', sans-serif", backgroundColor: 'transparent' }}
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a1c1b', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Two-Factor Authentication (2FA)</p>
                <p className="text-sm" style={{ color: '#444748' }}>
                  {twoFAEnabled ? 'Active via Authenticator App.' : 'Not configured.'}
                </p>
              </div>
              <button
                className="px-4 py-2 rounded-[5px] text-sm font-bold"
                style={{
                  backgroundColor: twoFAEnabled ? 'rgba(27,94,32,0.1)' : 'rgba(239,68,68,0.08)',
                  color: twoFAEnabled ? '#1B5E20' : '#dc2626',
                  border: `1px solid ${twoFAEnabled ? 'rgba(27,94,32,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  fontFamily: "'Inter', sans-serif",
                }}
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
              >
                {twoFAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER INFO BOX */}
      <div className="mt-6 p-6 rounded-lg flex items-center gap-4" style={{ backgroundColor: '#F1F1EF', border: '1px solid #DDDBD5' }}>
        <span className="material-symbols-outlined" style={{ color: '#0b0c0c', transform: 'scale(1.25)' }}>info</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a1c1b', fontFamily: "'Inter', sans-serif", lineHeight: '1.2', letterSpacing: '0.05em' }}>Data Privacy & Storage</p>
          <p className="text-sm" style={{ color: '#444748' }}>
            Your workshop data is encrypted using AES-256 standards. We never share your technical diagnostics with third parties without explicit consent.{' '}
            <a className="underline" style={{ color: '#335e9f' }} href="#">Read Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* UX LAW STRIP */}
      <div className="mt-4 h-[40px] flex items-center justify-center" style={{ backgroundColor: '#FFF9E6', borderTop: '1px solid #E0C040' }}>
        <p className="text-sm font-semibold" style={{ color: '#856404', fontFamily: "'Inter', sans-serif" }}>
          Applied: Miller's Law (Organized settings into 7±2 manageable semantic clusters)
        </p>
      </div>
    </div>
  );
}
