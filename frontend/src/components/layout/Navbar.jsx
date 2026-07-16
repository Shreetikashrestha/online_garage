import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Car,
  ClipboardList,
  LogIn,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          <span style={styles.logoMark}><Wrench size={19} /></span>
          <span style={styles.logoText}>Online<span style={styles.logoAccent}>Garage</span></span>
        </Link>

        <button
          className="nav-menu-button"
          style={styles.menuToggle}
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${isOpen ? 'is-open' : ''}`} style={styles.linksContainer}>
          <Link to="/" style={styles.link} onClick={closeMenu}>Services</Link>
          <Link to="/parts" style={styles.link} onClick={closeMenu}>Spare Parts</Link>

          {isAuthenticated && user?.role === 'USER' && (
            <>
              <Link to="/vehicles" style={styles.link} onClick={closeMenu}><Car size={16} /> Vehicles</Link>
              <Link to="/dashboard" style={styles.link} onClick={closeMenu}><ClipboardList size={16} /> Bookings</Link>
              <Link to="/invoices" style={styles.link} onClick={closeMenu}><Receipt size={16} /> Invoices</Link>
            </>
          )}

          {isAuthenticated && user?.role === 'MECHANIC' && (
            <Link to="/mechanic-dashboard" style={styles.link} onClick={closeMenu}>
              <ClipboardList size={16} /> Jobs Panel
            </Link>
          )}

          <div style={styles.authWrapper}>
            <Link to="/sos" style={styles.sosBtn} onClick={closeMenu}>
              <AlertOctagon size={15} /> SOS
            </Link>

            {isAuthenticated ? (
              <>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>{(user?.name || 'U').slice(0, 1).toUpperCase()}</div>
                  <div style={styles.userMeta}>
                    <span style={styles.userName}>{user?.name || 'User'}</span>
                    <span style={styles.userRole}><ShieldCheck size={12} /> {user?.role || 'USER'}</span>
                  </div>
                </div>
                <Link to="/settings" style={styles.iconBtn} onClick={closeMenu} aria-label="Account settings">
                  <Settings size={16} />
                </Link>
                <button className="btn btn-secondary" style={styles.logoutBtn} onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={styles.authBtn} onClick={closeMenu}>
                  <LogIn size={16} /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={styles.authBtn} onClick={closeMenu}>
                  <UserPlus size={16} /> Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .nav-links {
          display: flex;
        }

        .nav-menu-button {
          display: none;
        }

        @media (max-width: 980px) {
          .nav-menu-button {
            display: inline-flex !important;
          }

          .nav-links {
            display: none !important;
          }

          .nav-links.is-open {
            display: flex !important;
            position: absolute;
            top: calc(100% + 0.75rem);
            left: 1rem;
            right: 1rem;
            flex-direction: column;
            align-items: stretch !important;
            gap: 0.75rem !important;
            padding: 1rem;
            background: rgba(18, 22, 32, 0.98);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
          }
        }
      `}</style>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    minHeight: '72px',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(10, 12, 16, 0.86)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border-color)',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    textDecoration: 'none',
    color: '#ffffff',
  },
  logoMark: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    color: 'var(--accent-primary)',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.35rem',
    fontWeight: '800',
    letterSpacing: '0',
  },
  logoAccent: {
    color: 'var(--accent-primary)',
  },
  menuToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    color: '#ffffff',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  },
  linksContainer: {
    alignItems: 'center',
    gap: '1.2rem',
  },
  link: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  authWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  sosBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#fecaca',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '800',
    fontSize: '0.84rem',
  },
  authBtn: {
    padding: '0.68rem 1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    background: 'var(--accent-gradient)',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  userName: {
    fontSize: '0.84rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  userRole: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  iconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
  },
  logoutBtn: {
    padding: '0.6rem 0.85rem',
  },
};
