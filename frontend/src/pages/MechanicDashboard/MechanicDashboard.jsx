import React, { useState, useEffect, useRef } from 'react';
import { ToggleLeft, ToggleRight, Wrench, Shield, CheckCircle, Clock, MapPin, User, Star, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useSocket from '../../hooks/useSocket';
import Spinner from '../../components/ui/Spinner';

export default function MechanicDashboard() {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [error, setError] = useState(null);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Driving simulator state
  const [activeSimulatingBookingId, setActiveSimulatingBookingId] = useState(null);
  const [simLat, setSimLat] = useState(27.7172);
  const [simLng, setSimLng] = useState(85.324);
  const simulationInterval = useRef(null);

  const fetchProfileAndJobs = async () => {
    try {
      const profileResponse = await api.get('/mechanics/me/profile');
      const profileData = profileResponse.data.data.profile;
      setProfile(profileData);
      setBio(profileData.bio || '');
      setYearsOfExperience(profileData.yearsOfExperience || 0);
      setSpecialties(profileData.specialty || []);

      const bookingsResponse = await api.get('/bookings');
      setBookings(bookingsResponse.data.data.bookings || bookingsResponse.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load mechanic panel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndJobs();

    return () => {
      stopSimulation();
    };
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setUpdatingAvailability(true);
    try {
      const nextAvailability = !profile.isAvailable;
      const response = await api.patch('/mechanics/me/availability', {
        isAvailable: nextAvailability
      });
      setProfile({
        ...profile,
        isAvailable: response.data.data.profile.isAvailable
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update availability.');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.patch('/mechanics/me/profile', {
        bio,
        yearsOfExperience: parseInt(yearsOfExperience, 10),
        specialty: specialties,
      });
      setProfile(response.data.data.profile);
      setIsEditingProfile(false);
      alert('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (indexToRemove) => {
    setSpecialties(specialties.filter((_, idx) => idx !== indexToRemove));
  };

  // Job Status Handler
  const handleUpdateJobStatus = async (bookingId, nextStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
      fetchProfileAndJobs();

      // If completing service or cancelling, stop simulation if active
      if (['COMPLETED', 'CANCELLED'].includes(nextStatus) && activeSimulatingBookingId === bookingId) {
        stopSimulation();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const startSimulation = (bookingId, userLat, userLng) => {
    stopSimulation();
    setActiveSimulatingBookingId(bookingId);

    let currentLat = userLat - 0.012;
    let currentLng = userLng - 0.012;
    setSimLat(currentLat);
    setSimLng(currentLng);

    socket.emit('tracking:join', bookingId);

    simulationInterval.current = setInterval(() => {
      const latDiff = userLat - currentLat;
      const lngDiff = userLng - currentLng;
      
      const step = 0.0015;

      if (Math.abs(latDiff) < step && Math.abs(lngDiff) < step) {
        currentLat = userLat;
        currentLng = userLng;
        stopSimulation();
        handleUpdateJobStatus(bookingId, 'ARRIVED');
        alert('You have reached the customer destination!');
      } else {
        currentLat += Math.sign(latDiff) * step;
        currentLng += Math.sign(lngDiff) * step;
      }

      setSimLat(currentLat);
      setSimLng(currentLng);

      socket.emit('tracking:update', {
        bookingId,
        latitude: currentLat,
        longitude: currentLng
      });
      console.log('🔌 Emitted simulated tracking coordinates:', currentLat, currentLng);
    }, 3000);
  };

  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    if (activeSimulatingBookingId) {
      socket.emit('tracking:leave', activeSimulatingBookingId);
    }
    setActiveSimulatingBookingId(null);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Mechanic Dashboard</h2>
          <p style={styles.pageSubtitle}>Manage your job requests and live status online.</p>
        </div>

        {profile && (
          <div style={styles.onlineBadge}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Availability Status:</span>
            <button 
              onClick={handleToggleAvailability}
              style={styles.toggleBtn}
              disabled={updatingAvailability}
              aria-label={profile.isAvailable ? 'Go offline' : 'Go online'}
            >
              {profile.isAvailable ? (
                <ToggleRight size={44} color="var(--success)" />
              ) : (
                <ToggleLeft size={44} color="var(--text-muted)" />
              )}
              <strong style={{ color: profile.isAvailable ? 'var(--success)' : 'var(--text-muted)' }}>
                {profile.isAvailable ? 'ONLINE' : 'OFFLINE'}
              </strong>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner />
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Active Jobs Queue */}
          <div style={styles.leftCol}>
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={styles.sectionTitle}>Your Assigned Jobs ({bookings.length})</h3>
              
              {bookings.length === 0 ? (
                <div style={styles.emptyState}>
                  <Clock size={44} color="var(--text-muted)" />
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No active requests right now.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set your availability status to online to receive jobs.</p>
                </div>
              ) : (
                <div style={styles.bookingQueue}>
                  {bookings.map((booking) => (
                    <div key={booking.id} style={styles.bookingCard}>
                      <div style={styles.cardHeader}>
                        <div>
                          <strong>{booking.service?.name}</strong>
                          <p style={styles.clientText}>Client: {booking.user?.name}</p>
                        </div>
                        <span className={`badge ${
                          booking.status === 'COMPLETED' ? 'badge-success' : 
                          booking.status === 'PENDING' ? 'badge-warning' : 'badge-blue'
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div style={styles.cardBody}>
                        {booking.notes && <p style={styles.notesText}>"{booking.notes}"</p>}
                        <p style={styles.detailItem}>Location: {booking.userLatitude.toFixed(4)}, {booking.userLongitude.toFixed(4)}</p>
                        <p style={styles.detailItem}>Scheduled: {new Date(booking.scheduledTime).toLocaleString()}</p>
                      </div>

                      {/* Status controls */}
                      <div style={styles.cardActions}>
                        {booking.status === 'PENDING' && (
                          <>
                            <button 
                              className="btn btn-primary btn-success" 
                              onClick={() => handleUpdateJobStatus(booking.id, 'ACCEPTED')}
                              style={{ flex: 1 }}
                            >
                              Accept Job
                            </button>
                            <button 
                              className="btn btn-danger" 
                              onClick={() => handleUpdateJobStatus(booking.id, 'CANCELLED')}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {booking.status === 'ACCEPTED' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleUpdateJobStatus(booking.id, 'EN_ROUTE')}
                            style={{ width: '100%' }}
                          >
                            Mark En Route (Start Driving)
                          </button>
                        )}

                        {booking.status === 'EN_ROUTE' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                            {activeSimulatingBookingId === booking.id ? (
                              <button 
                                className="btn btn-danger" 
                                onClick={stopSimulation}
                                style={{ width: '100%' }}
                              >
                                Stop Driving Simulation
                              </button>
                            ) : (
                              <button 
                                className="btn btn-success"
                                onClick={() => startSimulation(booking.id, booking.userLatitude, booking.userLongitude)}
                                style={{ width: '100%' }}
                              >
                                Start GPS Driving Simulator 🚘
                              </button>
                            )}
                            
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleUpdateJobStatus(booking.id, 'ARRIVED')}
                              style={{ width: '100%' }}
                            >
                              Mark Arrived (Manual Override)
                            </button>
                          </div>
                        )}

                        {booking.status === 'ARRIVED' && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleUpdateJobStatus(booking.id, 'IN_PROGRESS')}
                            style={{ width: '100%' }}
                          >
                            Begin Repairs (Start Work)
                          </button>
                        )}

                        {booking.status === 'IN_PROGRESS' && (
                          <button 
                            className="btn btn-success"
                            onClick={() => handleUpdateJobStatus(booking.id, 'COMPLETED')}
                            style={{ width: '100%' }}
                          >
                            Mark Work Completed
                          </button>
                        )}
                      </div>

                      {/* GPS Driving telemetry visual overlay */}
                      {activeSimulatingBookingId === booking.id && (
                        <div style={styles.telemetryOverlay} className="animate-fade-in">
                          <span style={styles.telemetryText}>Simulating GPS route:</span>
                          <span style={styles.telemetryCoords}>{simLat.toFixed(5)}, {simLng.toFixed(5)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mechanic Profile Summary */}
          <div style={styles.rightCol}>
            <div className="glass-card">
              <div style={styles.profileMetaHeader}>
                <h3 style={styles.sectionTitle}>Professional Profile</h3>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={styles.profileForm}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="exp">Years of Experience</label>
                    <input
                      id="exp"
                      type="number"
                      className="form-control"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="bio">Biography / Bio</label>
                    <textarea
                      id="bio"
                      className="form-control"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ minHeight: '100px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialties / Skills</label>
                    <div style={styles.specialtyInputGroup}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Engine rebuilds"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        style={{ flexGrow: 1 }}
                      />
                      <button className="btn btn-secondary" onClick={handleAddSpecialty}>
                        Add
                      </button>
                    </div>

                    <div style={styles.specialtyChips}>
                      {specialties.map((spec, idx) => (
                        <span key={idx} style={styles.chip}>
                          {spec}
                          <button 
                            type="button" 
                            style={styles.removeChipBtn}
                            onClick={() => handleRemoveSpecialty(idx)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={savingProfile}
                    style={{ width: '100%', height: '44px', marginTop: '1rem' }}
                  >
                    {savingProfile ? <Spinner size="sm" color="white" /> : 'Save Profile Changes'}
                  </button>
                </form>
              ) : (
                profile && (
                  <div style={styles.profileShow}>
                    <div style={styles.profileStatRow}>
                      <div style={styles.statBox}>
                        <Star size={20} color="#fbbf24" fill="#fbbf24" />
                        <span style={styles.statLabel}>Rating</span>
                        <strong style={styles.statVal}>{profile.rating.toFixed(1)} / 5</strong>
                      </div>
                      <div style={styles.statBox}>
                        <User size={20} color="var(--accent-primary)" />
                        <span style={styles.statLabel}>Reviews</span>
                        <strong style={styles.statVal}>{profile.totalReviews} total</strong>
                      </div>
                      <div style={styles.statBox}>
                        <Wrench size={20} color="var(--accent-secondary)" />
                        <span style={styles.statLabel}>Exp.</span>
                        <strong style={styles.statVal}>{profile.yearsOfExperience} yrs</strong>
                      </div>
                    </div>

                    <div style={styles.profileTextSec}>
                      <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Biography</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {profile.bio || 'No biography written yet. Click Edit to add some details.'}
                      </p>
                    </div>

                    <div style={styles.profileTextSec}>
                      <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>My Specialties</strong>
                      <div style={styles.specialtyChips}>
                        {specialties.length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No specialties added.</span>
                        ) : (
                          specialties.map((spec, idx) => (
                            <span key={idx} className="badge badge-blue">
                              {spec}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '3rem',
    textAlign: 'left',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  pageTitle: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  pageSubtitle: {
    color: 'var(--text-secondary)',
  },
  onlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-md)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: '#f87171',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  leftCol: {
    flex: '2 1 500px',
  },
  rightCol: {
    flex: '1 1 350px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '1.5rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 1.5rem',
    textAlign: 'center',
  },
  bookingQueue: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  bookingCard: {
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    marginBottom: '0.75rem',
  },
  clientText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '0.15rem',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    marginBottom: '1rem',
  },
  notesText: {
    fontStyle: 'italic',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '0.5rem',
  },
  detailItem: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  cardActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  telemetryOverlay: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderTop: '1px solid rgba(59, 130, 246, 0.3)',
    margin: '1.25rem -1.25rem -1.25rem -1.25rem',
    padding: '0.5rem 1.25rem',
    fontSize: '0.75rem',
  },
  telemetryText: {
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  telemetryCoords: {
    color: 'var(--accent-primary)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  profileMetaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  specialtyInputGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  specialtyChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
  },
  removeChipBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  profileShow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  profileStatRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    padding: '0.75rem 0.5rem',
    borderRadius: 'var(--radius-md)',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  statVal: {
    fontSize: '0.85rem',
    marginTop: '0.15rem',
    color: '#ffffff',
  },
  profileTextSec: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
};
