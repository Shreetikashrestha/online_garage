import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Lock, Mail, Wrench } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isLoading, isAuthenticated, user, error } = useAuthStore();

  // Pre-fill email when coming from successful registration
  const fromRegister   = location.state?.registered ?? false;
  const prefillEmail   = location.state?.email ?? '';

  const [email,    setEmail]    = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState('');

  // Clear stale store errors once on mount
  useEffect(() => { useAuthStore.getState().setError(null); }, []);

  // If user is already authenticated (e.g. token still valid), redirect immediately
  const checkedRef = useRef(false);
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    if (isAuthenticated && user) {
      redirectByRole(user.role);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function redirectByRole(role) {
    if (role === 'MECHANIC') navigate('/mechanic-dashboard', { replace: true });
    else if (role === 'ADMIN') navigate('/admin', { replace: true });
    else navigate('/dashboard', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr('');

    if (!email.trim())    { setLocalErr('Email is required.'); return; }
    if (!password)        { setLocalErr('Password is required.'); return; }

    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      redirectByRole(loggedUser.role);
    } catch {
      // error message already set in store — nothing extra needed
    }
  };

  const displayError = localErr || error;

  return (
    <div style={s.page} className="animate-fade-in">
      <div className="glass-card" style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.iconWrap}><Wrench size={26} color="var(--accent-primary)" /></div>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.subtitle}>Sign in to your OnlineGarage account</p>
        </div>

        {/* Success banner after registration */}
        {fromRegister && !displayError && (
          <div style={s.successBanner}>
            <CheckCircle size={15} />
            <span>Account created! Sign in with your new credentials.</span>
          </div>
        )}

        {/* Error banner */}
        {displayError && (
          <div style={s.errorBanner}>
            <AlertTriangle size={15} />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={s.fieldWrap}>
              <Mail size={16} style={s.icon} />
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setLocalErr(''); useAuthStore.getState().setError(null); }}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={s.fieldWrap}>
              <Lock size={16} style={s.icon} />
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setLocalErr(''); useAuthStore.getState().setError(null); }}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={s.btn} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" color="white" /> : 'Sign In'}
          </button>
        </form>

        <p style={s.switchLink}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:         { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: '2rem 1rem' },
  card:         { width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', textAlign: 'center' },
  header:       { marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  iconWrap:     { width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  title:        { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' },
  subtitle:     { fontSize: '0.88rem', color: 'var(--text-secondary)' },
  successBanner:{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '0.84rem', marginBottom: '1.25rem', textAlign: 'left' },
  errorBanner:  { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.84rem', marginBottom: '1.25rem', textAlign: 'left' },
  form:         { display: 'flex', flexDirection: 'column' },
  fieldWrap:    { position: 'relative', display: 'flex', alignItems: 'center' },
  icon:         { position: 'absolute', left: '0.85rem', color: 'var(--text-muted)', pointerEvents: 'none' },
  btn:          { marginTop: '1rem', width: '100%', height: '46px' },
  switchLink:   { marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' },
};
