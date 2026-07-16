import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useSocket from '../../hooks/useSocket';
import Spinner from '../../components/ui/Spinner';

export default function MechanicDashboard() {
  const { user } = useAuthStore();
  const socket = useSocket();
  const navigate = useNavigate();
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

  const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED' && b.estimatedTotal)
    .reduce((sum, b) => sum + b.estimatedTotal, 0);

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'M';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><Spinner /></div>;

  return (
    <div className="w-full animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="flex gap-0 relative">
        {/* Side Navigation */}
        <aside className="hidden xl:flex flex-col w-[260px] flex-shrink-0 bg-[#1A1A1A] rounded-xl border border-outline-variant self-start sticky top-24">
          <div className="px-lg pt-lg pb-md">
            <h2 className="font-headline-sm text-headline-sm text-white">Mechanic Portal</h2>
            <p className="font-label-md text-label-md" style={{ color: '#9ca3af' }}>Jobs &amp; Earnings Center</p>
          </div>
          <nav className="flex flex-col flex-grow">
            <a className="border-l-4 border-secondary-container px-lg py-3 flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#fff', borderLeftColor: '#8fb7fe', backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={e => e.preventDefault()}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span> Dashboard
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fact_check</span> My Bookings
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span> My Earnings
            </a>
            <a className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span> My Profile
            </a>
          </nav>
          <div className="p-lg mt-auto flex flex-col gap-md" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-col gap-2 pt-md">
              <a className="flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help</span> Help Center
              </a>
              <a className="flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); useAuthStore.getState().logout(); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span> Sign Out
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 xl:pl-lg">
          {/* Greeting Strip */}
          <section className="bg-[#1A1A1A] rounded-xl px-lg py-xl mb-xl border border-outline-variant">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg mb-1 text-white">
                  Mechanic Dashboard
                </h1>
                <p className="font-body-md text-body-md flex items-center gap-2" style={{ color: '#9ca3af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>handyman</span>
                  Manage your job requests and live status online.
                </p>
              </div>
              {profile && (
                <div className="flex items-center gap-3 px-md py-2 rounded-lg border" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                  <span className="font-label-md text-label-md" style={{ color: 'var(--text-secondary)' }}>Availability:</span>
                  <button
                    onClick={handleToggleAvailability}
                    disabled={updatingAvailability}
                    className="flex items-center gap-2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label={profile.isAvailable ? 'Go offline' : 'Go online'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: profile.isAvailable ? '#22c55e' : '#6b7280' }}>
                      {profile.isAvailable ? 'toggle_on' : 'toggle_off'}
                    </span>
                    <strong style={{ color: profile.isAvailable ? '#22c55e' : '#6b7280', fontSize: '0.85rem' }}>
                      {profile.isAvailable ? 'ONLINE' : 'OFFLINE'}
                    </strong>
                  </button>
                </div>
              )}
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 px-lg py-3 rounded-lg mb-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xxl">
            <div className="glass-card">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--accent-primary)', fontSize: '24px' }}>fact_check</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>Active Jobs</p>
                  <h3 className="font-headline-sm text-headline-sm text-white">{activeBookings.length}</h3>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '24px' }}>check_circle</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>Completed</p>
                  <h3 className="font-headline-sm text-headline-sm text-white">{completedCount}</h3>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(251,191,36,0.12)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fbbf24', fontSize: '24px' }}>payments</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md" style={{ color: 'var(--text-muted)' }}>Total Earnings</p>
                  <h3 className="font-headline-sm text-headline-sm text-white">${totalEarnings.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
            {/* Assigned Jobs Queue */}
            <div className="xl:col-span-2">
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h2 className="font-headline-sm text-headline-sm text-white mb-lg" style={{ fontSize: '1.25rem' }}>
                  Your Assigned Jobs ({bookings.length})
                </h2>

                {bookings.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '44px', color: 'var(--text-muted)' }}>schedule</span>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No active requests right now.</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set your availability status to online to receive jobs.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div className="flex justify-between items-start" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <strong className="text-white">{booking.service?.name}</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Client: {booking.user?.name}</p>
                          </div>
                          <span className={`badge ${
                            booking.status === 'COMPLETED' ? 'badge-success' :
                            booking.status === 'PENDING' ? 'badge-warning' : 'badge-blue'
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                          {booking.notes && (
                            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                              "{booking.notes}"
                            </p>
                          )}
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                            Location: {booking.userLatitude?.toFixed(4)}, {booking.userLongitude?.toFixed(4)}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                            Scheduled: {new Date(booking.scheduledTime).toLocaleString()}
                          </p>
                        </div>

                        {/* Status controls */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleUpdateJobStatus(booking.id, 'ACCEPTED')}
                                style={{ flex: 1, backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span> Accept Job
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleUpdateJobStatus(booking.id, 'CANCELLED')}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span> Reject
                              </button>
                            </>
                          )}

                          {booking.status === 'ACCEPTED' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleUpdateJobStatus(booking.id, 'EN_ROUTE')}
                              style={{ width: '100%' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>directions_car</span> Mark En Route (Start Driving)
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
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>stop</span> Stop Driving Simulation
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success"
                                  onClick={() => startSimulation(booking.id, booking.userLatitude, booking.userLongitude)}
                                  style={{ width: '100%' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>gps_fixed</span> Start GPS Driving Simulator
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
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>build</span> Begin Repairs (Start Work)
                            </button>
                          )}

                          {booking.status === 'IN_PROGRESS' && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleUpdateJobStatus(booking.id, 'COMPLETED')}
                              style={{ width: '100%' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span> Mark Work Completed
                            </button>
                          )}
                        </div>

                        {/* GPS Driving telemetry overlay */}
                        {activeSimulatingBookingId === booking.id && (
                          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(59,130,246,0.12)', borderTop: '1px solid rgba(59,130,246,0.3)', margin: '1.25rem -1.25rem -1.25rem -1.25rem', padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Simulating GPS route:</span>
                            <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontWeight: 'bold' }}>{simLat.toFixed(5)}, {simLng.toFixed(5)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Profile */}
            <div className="flex flex-col gap-xl">
              <div className="glass-card">
                <div className="flex justify-between items-center mb-lg">
                  <h2 className="font-headline-sm text-headline-sm text-white">Professional Profile</h2>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
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
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Engine rebuilds"
                          value={specialtyInput}
                          onChange={(e) => setSpecialtyInput(e.target.value)}
                          style={{ flexGrow: 1 }}
                        />
                        <button className="btn btn-secondary" onClick={handleAddSpecialty}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {specialties.map((spec, idx) => (
                          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                            {spec}
                            <button
                              type="button"
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
                          <span className="material-symbols-outlined" style={{ color: '#fbbf24', fontSize: '20px' }}>star</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Rating</span>
                          <strong style={{ fontSize: '0.85rem', marginTop: '0.15rem', color: '#ffffff' }}>{profile.rating?.toFixed(1)} / 5</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--accent-primary)', fontSize: '20px' }}>reviews</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Reviews</span>
                          <strong style={{ fontSize: '0.85rem', marginTop: '0.15rem', color: '#ffffff' }}>{profile.totalReviews} total</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--accent-secondary)', fontSize: '20px' }}>engineering</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Exp.</span>
                          <strong style={{ fontSize: '0.85rem', marginTop: '0.15rem', color: '#ffffff' }}>{profile.yearsOfExperience} yrs</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Biography</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {profile.bio || 'No biography written yet. Click Edit to add some details.'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>My Specialties</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {specialties.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No specialties added.</span>
                          ) : (
                            specialties.map((spec, idx) => (
                              <span key={idx} className="badge badge-blue">{spec}</span>
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
        </div>
      </div>
    </div>
  );
}
