import React from 'react';
import { Shield, Hammer, CreditCard, Flame } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.row}>
          {/* Logo and Brand description */}
          <div style={styles.colLarge}>
            <h3 style={styles.brandTitle}>Online<span style={{ color: 'var(--accent-primary)' }}>Garage</span></h3>
            <p style={styles.brandText}>
              Stunningly fast, on-demand mechanic services. Secure escrow payments, certified experts, and real-time mechanics tracking at your fingertips.
            </p>
          </div>

          {/* Quick info badges */}
          <div style={styles.colSmall}>
            <h4 style={styles.colTitle}>Features</h4>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}><Flame size={14} color="var(--danger)" /> Live SOS</li>
              <li style={styles.featureItem}><CreditCard size={14} color="var(--success)" /> Escrow Hold</li>
              <li style={styles.featureItem}><Hammer size={14} color="var(--accent-primary)" /> Top Mechanics</li>
              <li style={styles.featureItem}><Shield size={14} color="var(--accent-secondary)" /> ID Verified</li>
            </ul>
          </div>

          {/* Contact */}
          <div style={styles.colSmall}>
            <h4 style={styles.colTitle}>Support</h4>
            <p style={styles.textSmall}>Help Center</p>
            <p style={styles.textSmall}>Privacy Policy</p>
            <p style={styles.textSmall}>Terms of Service</p>
          </div>
        </div>

        <div style={styles.copyright}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            &copy; {currentYear} OnlineGarage. Built by Antigravity under Advanced Agentic Coding. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#07090d',
    borderTop: '1px solid var(--border-color)',
    padding: '3rem 1.5rem 1.5rem 1.5rem',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2.5rem',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  colLarge: {
    flex: '2 1 350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    textAlign: 'left',
  },
  colSmall: {
    flex: '1 1 150px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    textAlign: 'left',
  },
  brandTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  brandText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '450px',
  },
  colTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  featureList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  textSmall: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  copyright: {
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '1.5rem',
    textAlign: 'center',
  },
};
