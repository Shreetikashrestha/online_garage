import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Calendar, ShieldCheck, Award, MessageSquare, Wrench } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function MechanicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await api.get(`/mechanics/${id}`);
        setProfile(profileRes.data.data.profile);
        const revRes = await api.get(`/mechanics/${id}/reviews`);
        setReviews(revRes.data.data.reviews || []);
      } catch (err) {
        setError('Failed to load mechanic profile.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><Spinner /></div>;

  if (error || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: '#f87171' }}>{error || 'Profile not found.'}</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const mechName = profile.user?.name || 'Mechanic';
  const rating = profile.rating || 4.9;
  const totalReviews = profile.totalReviews || 0;

  const services = [
    { name: 'Diagnostic Check', price: '₹400' },
    { name: 'General Service', price: '₹1,200' },
    { name: 'Brake Repair', price: '₹800' },
    { name: 'Engine Tuning', price: '₹2,500' },
  ];

  const credentials = [
    { icon: '🏆', label: 'ASE Certified', sub: 'Automotive Service Excellence' },
    { icon: '🔧', label: 'Brand Authorized', sub: 'Brand Specific Training' },
    { icon: '🪪', label: 'Identity Verified', sub: 'Government ID Match' },
    { icon: '🛡', label: 'Insured Pro', sub: profile.isIdVerified ? 'Policy Active' : 'Pending' },
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.grid}>
        {/* Main */}
        <div style={styles.mainCol}>
          {/* Hero card */}
          <div className="glass-card" style={styles.heroCard}>
            <img
              src={profile.photo || profile.user?.avatarUrl || `https://i.pravatar.cc/120?u=${id}`}
              alt={mechName}
              style={styles.avatar}
            />
            <div style={styles.heroInfo}>
              <div style={styles.nameRow}>
                <h2 style={styles.mechName}>{mechName}</h2>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Verified Master Tech</span>
              </div>
              <div style={styles.ratingRow}>
                {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= Math.round(rating) ? '#fbbf24' : 'var(--text-muted)', fontSize: '1rem' }}>★</span>)}
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fbbf24', marginLeft: '0.25rem' }}>{rating.toFixed(1)}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({totalReviews} Reviews)</span>
              </div>
              <div style={styles.statsRow}>
                <div style={styles.stat}><p style={styles.statVal}>{profile.yearsOfExperience || 12}+ Years</p><p style={styles.statLabel}>EXPERIENCE</p></div>
                <div style={styles.stat}><p style={styles.statVal}>1,200+</p><p style={styles.statLabel}>REPAIRS DONE</p></div>
                <div style={styles.stat}>
                  <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{profile.specialty?.[0] || 'Specialist'}</span>
                  <p style={styles.statLabel}>SPECIALTY</p>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={styles.sectionTitle}>About the Specialist</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '1rem' }}>
              {profile.bio || 'Master technician with extensive hands-on experience in high-precision automotive engineering. Workshop philosophy built on transparency and technical integrity.'}
            </p>
            <div style={styles.tags}>
              {(profile.specialty || ['Engine Diagnostics', 'Japanese Imports', 'Transparent Pricing']).map(s => (
                <span key={s} className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Services + Credentials */}
          <div style={styles.twoCol}>
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Specialized Services</h3>
              <div style={styles.serviceList}>
                {services.map(s => (
                  <div key={s.name} style={styles.serviceItem}>
                    <Wrench size={14} color="var(--text-muted)" />
                    <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                    <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.875rem' }}>{s.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card">
              <h3 style={styles.sectionTitle}>Credentials</h3>
              <div style={styles.credGrid}>
                {credentials.map(c => (
                  <div key={c.label} style={styles.credItem}>
                    <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>{c.label}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="glass-card" style={{ marginTop: '1.5rem' }}>
            <div style={styles.reviewsHeader}>
              <h3 style={styles.sectionTitle}>Customer Experiences</h3>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>View All {totalReviews} Reviews</a>
            </div>
            {reviews.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No reviews yet.</p>
            ) : (
              reviews.slice(0, 2).map(r => (
                <div key={r.id} style={styles.reviewItem}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.reviewAvatar}>{r.reviewer?.name?.charAt(0) || 'U'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.reviewMeta}>
                        <span style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.875rem' }}>{r.reviewer?.name || 'User'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={styles.reviewStars}>
                        {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.85rem' }}>★</span>)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>"{r.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div className="glass-card" style={{ position: 'sticky', top: '90px' }}>
            <div style={styles.rateRow}>
              <span style={styles.baseRate}>₹399/visit</span>
              <span style={styles.availDot}>● Available Now</span>
            </div>
            <div style={styles.sideInfoRows}>
              <div style={styles.sideInfoRow}>
                <MapPin size={16} color="var(--text-muted)" />
                <div>
                  <p style={styles.sideLabel}>Estimated Arrival</p>
                  <p style={styles.sideVal}>12 mins to your location</p>
                </div>
              </div>
              <div style={styles.sideInfoRow}>
                <Clock size={16} color="var(--text-muted)" />
                <div>
                  <p style={styles.sideLabel}>Next Slot</p>
                  <p style={styles.sideVal}>Today, 2:30 PM onwards</p>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', marginBottom: '0.75rem' }}
              onClick={() => navigate('/booking/mechanics')}
            >
              <Calendar size={16} /> Book {mechName.split(' ')[0]}
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', height: '44px' }}>
              <MessageSquare size={16} /> Message Specialist
            </button>
            <p style={styles.guarantee}>SAFE TECH GUARANTEE INCLUDED · VERIFIED PROFESSIONAL</p>

            {/* Mini map */}
            <div style={styles.miniMap}>
              <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80" alt="location" style={styles.miniMapImg} />
              <div style={styles.miniMapLabel}>{profile.user?.phone ? 'Active Area' : 'Kathmandu'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { paddingBottom: '3rem' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '2rem' },
  mainCol: { flex: '2 1 500px' },
  sidebar: { flex: '0 1 280px' },
  heroCard: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  avatar: { width: '100px', height: '100px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid var(--accent-primary)', flexShrink: 0 },
  heroInfo: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' },
  mechName: { fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.75rem' },
  statsRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statVal: { fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' },
  statLabel: { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' },
  serviceList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  serviceItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' },
  credGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  credItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' },
  reviewsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  reviewItem: { padding: '1rem 0', borderBottom: '1px solid var(--border-color)' },
  reviewHeader: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  reviewAvatar: { width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff', fontSize: '0.85rem', flexShrink: 0 },
  reviewMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reviewStars: { marginTop: '0.15rem' },
  rateRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  baseRate: { fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' },
  availDot: { fontSize: '0.78rem', color: 'var(--success)', fontWeight: '600' },
  sideInfoRows: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' },
  sideInfoRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.01)' },
  sideLabel: { fontSize: '0.7rem', color: 'var(--text-muted)' },
  sideVal: { fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', marginTop: '0.1rem' },
  guarantee: { fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', marginBottom: '1rem', letterSpacing: '0.04em' },
  miniMap: { position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '120px', marginTop: '1rem' },
  miniMapImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  miniMapLabel: { position: 'absolute', bottom: '0.6rem', left: '0.75rem', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' },
};
