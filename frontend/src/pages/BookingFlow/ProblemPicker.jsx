import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Circle,
  Droplet,
  MoreHorizontal,
  Settings,
  ShieldAlert,
  Truck,
  Wrench,
} from 'lucide-react';

const PROBLEMS = [
  { id: 'MECHANICAL', icon: Wrench, label: 'Mechanical', desc: 'Engine noise, transmission issues, dashboard warning, or unusual vibration.' },
  { id: 'TYRE', icon: Circle, label: 'Tyre', desc: 'Puncture, flat tyre, wheel alignment, or pressure issue.' },
  { id: 'TOWING', icon: Truck, label: 'Towing', desc: 'Vehicle cannot be driven and needs transport to a safe destination.' },
  { id: 'PART', icon: Settings, label: 'Part replacement', desc: 'Battery, filters, belts, lights, brakes, or other known components.' },
  { id: 'LEAK', icon: Droplet, label: 'Fluid leak', desc: 'Oil, coolant, brake fluid, or other visible fluid leakage.' },
  { id: 'OTHER', icon: MoreHorizontal, label: 'Not sure', desc: 'Electrical fault, strange behavior, or anything that needs diagnosis.' },
];

const STEPS = ['Issue', 'Mechanic', 'Summary', 'Payment'];

export default function ProblemPicker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    navigate('/booking/mechanics', { state: { problemType: selected } });
  };

  return (
    <div style={styles.container} className="animate-fade-in flow-shell">
      <p style={styles.breadcrumb}>Dashboard &gt; Booking flow</p>

      <div style={styles.topRow}>
        <div>
          <p style={styles.kicker}>Step 1 of 4</p>
          <h2 style={styles.title}>What needs attention?</h2>
          <p style={styles.subtitle}>Choose the closest issue so we can match the right mechanic and estimate.</p>
        </div>
        <div className="flow-stepper">
          {STEPS.map((label, index) => (
            <React.Fragment key={label}>
              <span className={`flow-step ${index === 0 ? 'is-active' : ''}`}>
                <span className="flow-step-number">{index + 1}</span>{label}
              </span>
              {index < STEPS.length - 1 && <span className="flow-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        {PROBLEMS.map((problem) => {
          const Icon = problem.icon;
          const isSelected = selected === problem.id;
          return (
            <button
              key={problem.id}
              style={{
                ...styles.card,
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(18,22,32,0.72)',
              }}
              onClick={() => setSelected(problem.id)}
            >
              <div style={{ ...styles.cardIcon, color: isSelected ? '#ffffff' : 'var(--accent-primary)' }}>
                <Icon size={28} />
              </div>
              <h3 style={styles.cardLabel}>{problem.label}</h3>
              <p style={styles.cardDesc}>{problem.desc}</p>
              {isSelected && (
                <div style={styles.checkIcon}><CheckCircle size={20} color="var(--success)" /></div>
              )}
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}><ShieldAlert size={16} /> Not sure? Use SOS for a direct escalation to our response team.</p>
        <button
          className="btn btn-primary"
          style={styles.continueBtn}
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue to mechanics <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem', maxWidth: '980px', margin: '0 auto' },
  breadcrumb: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' },
  kicker: { fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#ffffff' },
  subtitle: { marginTop: '0.45rem', maxWidth: '520px', fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: {
    position: 'relative',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast), background-color var(--transition-fast), transform var(--transition-fast)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minHeight: '190px',
  },
  cardIcon: {
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
  },
  cardLabel: { fontSize: '1.12rem', fontWeight: '700', color: '#ffffff' },
  cardDesc: { fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.55' },
  checkIcon: { position: 'absolute', top: '1rem', right: '1rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' },
  footerText: { display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px' },
  continueBtn: { minWidth: '250px' },
};
