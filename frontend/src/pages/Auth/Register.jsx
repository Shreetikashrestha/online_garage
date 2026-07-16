import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Car, ChevronRight, CheckCircle,
  FileText, Lock, Mail, Phone, Shield, Upload, User, Wrench,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
const VEHICLE_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Other'];

export default function Register() {
  const navigate = useNavigate();
  const { isLoading, error } = useAuthStore();

  // Clear stale store errors on mount and reset any lingering auth state
  useEffect(() => {
    useAuthStore.getState().setError(null);
    // If there's a leftover non-persisted token from a previous registration
    // attempt, clear it so we start fresh
    const state = useAuthStore.getState();
    if (!state.isAuthenticated) {
      delete api.defaults.headers.common.Authorization;
    }
  }, []);

  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState('');

  // Step 1 — personal info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');

  // Temporarily store token for steps 2 & 3 (not persisted to localStorage)
  const tempTokenRef = useRef(null);

  // Step 2 — vehicle
  const [make, setMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [year, setYear] = useState(2024);
  const [fuelType, setFuelType] = useState('PETROL');
  const [plateNumber, setPlateNumber] = useState('');
  const [vin, setVin] = useState('');
  const [addingVehicle, setAddingVehicle] = useState(false);

  // Step 3 — identity
  const [idFile, setIdFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  const stepLabels = ['Personal Info', 'Vehicle', 'Verify ID'];

  // Helper: make authenticated API call using the temp token from registration
  const authCall = (fn) => {
    if (tempTokenRef.current) {
      api.defaults.headers.common.Authorization = `Bearer ${tempTokenRef.current}`;
    }
    return fn();
  };

  // ── Step 1 handler ──────────────────────────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    setValidationError('');
    useAuthStore.getState().setError(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setValidationError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    try {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError(null);

      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      });

      const { tokens } = response.data.data;

      // Store token in ref only (not localStorage, not Zustand isAuthenticated)
      // This lets us call /api/user/vehicles in Step 2 without triggering redirects
      tempTokenRef.current = tokens.accessToken;
      api.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;

      useAuthStore.getState().setLoading(false);
      setStep(2);
    } catch (err) {
      useAuthStore.getState().setLoading(false);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setValidationError(message);
    }
  };

  // ── Step 2 handler ──────────────────────────────────────────────
  const handleStep2 = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!make.trim() || !vehicleModel.trim() || !plateNumber.trim()) {
      setValidationError('Make, model and number plate are required.');
      return;
    }

    setAddingVehicle(true);
    try {
      await authCall(() =>
        api.post('/user/vehicles', {
          make: make.trim(),
          model: vehicleModel.trim(),
          year: parseInt(year, 10),
          fuelType,
          registrationNumber: plateNumber.trim(),
          vin: vin.trim() || undefined,
          isPrimary: true,
        })
      );
      setStep(3);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to add vehicle. Please try again.';
      setValidationError(message);
    } finally {
      setAddingVehicle(false);
    }
  };

  // ── Finish — clear temp token & go to login ───────────────────────
  const finishRegistration = () => {
    // Clean up temp token
    tempTokenRef.current = null;
    delete api.defaults.headers.common.Authorization;
    // Also clear any partial auth state from the store
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, error: null });
    navigate('/login', {
      replace: true,
      state: { registered: true, email: email.trim().toLowerCase() },
    });
  };

  // ── Step 3 upload ────────────────────────────────────────────────
  const handleUploadID = async () => {
    if (!idFile) return;
    setValidationError('');
    setUploadingDoc(true);
    const fd = new FormData();
    fd.append('document', idFile);
    try {
      await authCall(() =>
        api.post('/user/identity/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      setUploaded(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Upload failed. Please try again.';
      setValidationError(message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const isStep1Loading = isLoading;

  return (
    <div style={s.page} className="animate-fade-in">
      <div className="glass-card" style={s.card}>

        {/* ── Progress bar ── */}
        <div style={s.progressWrap}>
          <div style={s.progressMeta}>
            <span style={s.stepLabel}>STEP {step} OF 3</span>
            <span style={s.progressPct}>{progress}%</span>
          </div>
          <div style={s.progressTrack}><div style={{ ...s.progressFill, width: `${progress}%` }} /></div>
        </div>

        {/* ── Step bubbles ── */}
        <div style={s.stepRow}>
          {stepLabels.map((label, idx) => {
            const n = idx + 1;
            const done = n < step;
            const active = n === step;
            return (
              <React.Fragment key={n}>
                <div style={s.stepItem}>
                  <div style={{
                    ...s.bubble,
                    backgroundColor: done ? 'var(--success)' : active ? 'var(--accent-primary)' : 'transparent',
                    borderColor: done ? 'var(--success)' : active ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: done || active ? '#fff' : 'var(--text-muted)',
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: done || active ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {n < 3 && <div style={s.connector} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── STEP 1: Personal Info ── */}
        {step === 1 && (
          <>
            <div style={s.header}>
              <h2 style={s.title}>Create your account</h2>
              <p style={s.subtitle}>Fill in your details to get started</p>
            </div>

            {(validationError || error) && (
              <div style={s.errorBox}><AlertTriangle size={14} /><span>{validationError || error}</span></div>
            )}

            {/* Role selector */}
            <div style={s.roleWrap}>
              {[{ v: 'USER', label: 'I need assistance' }, { v: 'MECHANIC', label: 'I am a Mechanic' }].map(r => (
                <button key={r.v} type="button" onClick={() => setRole(r.v)}
                  style={{ ...s.roleBtn, backgroundColor: role === r.v ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)' }}>
                  {role === r.v && '✓ '}{r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleStep1} style={s.form} noValidate>
              <Field id="reg-name" label="Full Name" icon={<User size={15} />} type="text" placeholder="John Doe" value={name} onChange={setName} />
              <Field id="reg-email" label="Email Address" icon={<Mail size={15} />} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
              <Field id="reg-phone" label="Mobile Number" icon={<Phone size={15} />} type="tel" placeholder="+977 98XXXXXXXX" value={phone} onChange={setPhone} />
              <Field id="reg-pass" label="Password (min 8 chars)" icon={<Lock size={15} />} type="password" placeholder="••••••••" value={password} onChange={setPassword} />
              <Field id="reg-confirm" label="Confirm Password" icon={<Lock size={15} />} type="password" placeholder="••••••••" value={confirmPassword} onChange={setConfirmPassword} />

              {role === 'MECHANIC' && (
                <div style={s.infoBox}><Wrench size={14} color="var(--accent-secondary)" /><p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>After registering, complete your mechanic profile from your Jobs Panel.</p></div>
              )}

              <p style={s.terms}>By continuing you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>

              <button type="submit" className="btn btn-primary" style={s.btn} disabled={isStep1Loading}>
                {isStep1Loading ? <Spinner size="sm" color="white" /> : <>Continue to Vehicle Profile <ChevronRight size={16} /></>}
              </button>
            </form>

            <p style={s.switchLink}>Already have an account? <Link to="/login">Sign In</Link></p>
          </>
        )}

        {/* ── STEP 2: Vehicle Profile ── */}
        {step === 2 && (
          <>
            <div style={s.header}>
              <div style={s.iconCircle}><Car size={22} color="var(--accent-primary)" /></div>
              <h2 style={s.title}>Add Your Vehicle</h2>
              <p style={s.subtitle}>This helps match you with the right mechanics and parts</p>
            </div>

            {validationError && (
              <div style={s.errorBox}><AlertTriangle size={14} /><span>{validationError}</span></div>
            )}

            <form onSubmit={handleStep2} style={s.form} noValidate>
              <div style={s.twoCol}>
                <div className="form-group">
                  <label className="form-label">Make *</label>
                  <input className="form-control" placeholder="e.g. Toyota" value={make} onChange={e => setMake(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input className="form-control" placeholder="e.g. Corolla" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} required />
                </div>
              </div>

              <div style={s.twoCol}>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-control" value={year} onChange={e => setYear(parseInt(e.target.value, 10))} style={{ height: '44px' }}>
                    {Array.from({ length: 36 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select className="form-control" value={fuelType} onChange={e => setFuelType(e.target.value)} style={{ height: '44px' }}>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Number Plate *</label>
                <input className="form-control" placeholder="BA 1 PA 1234" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">VIN / Chassis <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>OPTIONAL</span></label>
                <input className="form-control" placeholder="17-character code" value={vin} onChange={e => setVin(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary" style={s.btn} disabled={addingVehicle}>
                {addingVehicle ? <Spinner size="sm" color="white" /> : <>Save Vehicle &amp; Continue <ChevronRight size={16} /></>}
              </button>
              <button type="button" className="btn btn-secondary" style={{ ...s.btn, marginTop: '0.65rem' }} onClick={() => setStep(3)}>
                Skip — I'll add a vehicle later
              </button>
            </form>
          </>
        )}

        {/* ── STEP 3: Identity Verification ── */}
        {step === 3 && (
          <>
            <div style={s.header}>
              <div style={s.iconCircle}><Shield size={22} color="var(--accent-primary)" /></div>
              <h2 style={s.title}>Verify Your Identity</h2>
              <p style={s.subtitle}>Upload a government-issued ID to unlock Pay-After-Service and full platform access.</p>
            </div>

            {uploaded ? (
              /* ── Success state ── */
              <div style={s.successBox}>
                <CheckCircle size={52} color="var(--success)" />
                <h3 style={{ color: '#fff', marginTop: '1rem' }}>Document Uploaded!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', textAlign: 'center', lineHeight: '1.55' }}>
                  Our team will review your document within 4 hours. You can still use the platform while waiting.
                </p>
                <button className="btn btn-primary" style={{ ...s.btn, marginTop: '1.5rem' }} onClick={finishRegistration}>
                  Go to Sign In <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* ── Drop zone ── */}
                <div
                  style={{ ...s.dropZone, borderColor: dragOver ? 'var(--accent-primary)' : 'var(--border-color)', backgroundColor: dragOver ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.01)' }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setIdFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                >
                  {idFile ? (
                    <>
                      <FileText size={38} color="var(--accent-primary)" />
                      <p style={{ fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>{idFile.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(idFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      <button type="button" style={s.changeFile} onClick={e => { e.stopPropagation(); setIdFile(null); }}>Change file</button>
                    </>
                  ) : (
                    <>
                      <Upload size={34} color="var(--accent-primary)" />
                      <p style={{ fontWeight: '600', color: '#fff', marginTop: '0.5rem' }}>Drag &amp; drop or click to upload</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Passport, Driving Licence, or National ID</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>JPG · PNG · PDF — max 10 MB</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) setIdFile(e.target.files[0]); }} />
                </div>

                {/* What happens next */}
                <div style={s.nextBox}>
                  <p style={s.nextTitle}>WHAT HAPPENS NEXT</p>
                  {['Document reviewed by our verification team within 4 hours.', 'You receive email confirmation once approved.', 'Unlocks Pay-After-Service on all bookings.'].map((t, i) => (
                    <div key={i} style={s.nextRow}>
                      <span style={s.nextNum}>{i + 1}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t}</span>
                    </div>
                  ))}
                </div>

                {(validationError || error) && (
                  <div style={s.errorBox}><AlertTriangle size={14} /><span>{validationError || error}</span></div>
                )}

                <button className="btn btn-primary" style={s.btn} disabled={!idFile || uploadingDoc} onClick={handleUploadID}>
                  {uploadingDoc ? <Spinner size="sm" color="white" /> : <>Upload &amp; Finish <ChevronRight size={16} /></>}
                </button>
                <button className="btn btn-secondary" style={{ ...s.btn, marginTop: '0.65rem' }} onClick={finishRegistration}>
                  Verify later — I'll do this from settings
                </button>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ── Reusable field ──────────────────────────────────────────────────
function Field({ id, label, icon, type, placeholder, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>{icon}</span>
        <input
          id={id} type={type} className="form-control" placeholder={placeholder}
          value={value} onChange={e => onChange(e.target.value)}
          style={{ paddingLeft: '2.4rem' }}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          required
        />
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────
const s = {
  page: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '80vh', padding: '2.5rem 1rem' },
  card: { width: '100%', maxWidth: '520px', padding: '2rem' },
  progressWrap: { marginBottom: '1.25rem' },
  progressMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' },
  stepLabel: { fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' },
  progressPct: { fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '700' },
  progressTrack: { height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '2px', transition: 'width 0.4s ease' },
  stepRow: { display: 'flex', alignItems: 'center', marginBottom: '1.75rem' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' },
  bubble: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', border: '2px solid', transition: 'all 0.25s' },
  connector: { flex: 1, height: '2px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem 14px' },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  iconCircle: { width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' },
  subtitle: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.82rem', marginBottom: '1.25rem' },
  roleWrap: { display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1.25rem' },
  roleBtn: { flex: 1, border: 'none', padding: '0.65rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' },
  form: { display: 'flex', flexDirection: 'column' },
  infoBox: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start', backgroundColor: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' },
  terms: { fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' },
  btn: { width: '100%', height: '46px', marginTop: '0.25rem' },
  switchLink: { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  dropZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px dashed', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.25rem' },
  changeFile: { background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', cursor: 'pointer', marginTop: '0.4rem' },
  nextBox: { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' },
  nextTitle: { fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' },
  nextRow: { display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' },
  nextNum: { width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: '700', color: '#fff', flexShrink: 0 },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0.5rem', textAlign: 'center' },
};
