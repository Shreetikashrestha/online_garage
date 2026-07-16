import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

function getInitials(name) {
  return (name || '')
    .split(' ')
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function StarRating({ rating, size = 'text-[18px]' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} className={`material-symbols-outlined fill-icon ${size}`}>star</span>);
    } else if (i === full && half) {
      stars.push(<span key={i} className={`material-symbols-outlined fill-icon ${size}`}>star_half</span>);
    } else {
      stars.push(<span key={i} className={`material-symbols-outlined ${size}`}>star</span>);
    }
  }
  return <div className="flex text-[#FFC107]">{stars}</div>;
}

function ReviewStars({ count }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < count) {
      stars.push(<span key={i} className="material-symbols-outlined fill-icon">star</span>);
    } else {
      stars.push(<span key={i} className="material-symbols-outlined">star</span>);
    }
  }
  return <div className="flex text-[#FFC107] scale-75 origin-left">{stars}</div>;
}

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Spinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant">error</span>
        <p className="text-on-surface-variant text-body-md">{error || 'Profile not found.'}</p>
        <button
          className="bg-primary-container text-white px-md py-2 rounded-[5px] font-bold text-button-text hover:opacity-90 transition-all"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </div>
    );
  }

  const mechName = profile.user?.name || 'Mechanic';
  const rating = profile.rating || 4.9;
  const totalReviews = profile.totalReviews || 0;
  const avatarSrc = profile.photo || profile.user?.avatarUrl || `https://i.pravatar.cc/120?u=${id}`;
  const specialties = profile.specialty || ['Engine Diagnostics', 'Japanese Imports', 'Transparent Pricing'];
  const bio = profile.bio || 'Master technician with over a decade of hands-on experience in high-precision automotive engineering. I specialize in Japanese imports, specifically Maruti, Honda, and Toyota systems. My workshop philosophy is built on transparency and technical integrity — I explain every diagnostic finding before turning a wrench.';

  const services = [
    { name: 'Diagnostic Check', price: '₹400', icon: 'troubleshoot' },
    { name: 'General Service', price: '₹1,200', icon: 'settings' },
    { name: 'Brake Repair', price: '₹800', icon: 'car_repair' },
    { name: 'Engine Tuning', price: '₹2,500', icon: 'tune' },
  ];

  const credentials = [
    { icon: 'workspace_premium', label: 'ASE Certified', sub: 'Automotive Service Excellence' },
    { icon: 'corporate_fare', label: 'Maruti Authorized', sub: 'Brand Specific Training' },
    { icon: 'how_to_reg', label: 'Identity Verified', sub: 'Government ID Match' },
    { icon: 'safety_check', label: 'Insured Pro', sub: profile.isIdVerified ? 'Policy Active' : 'MechHub Policy #8921' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-lg py-sm max-w-[1440px] mx-auto">
          <div className="flex items-center gap-xl">
            <span className="font-headline-md text-headline-md font-bold text-primary">OnlineGarage</span>
            <nav className="hidden md:flex gap-md">
              <button className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" onClick={() => navigate('/')}>Home</button>
              <button className="font-body-md text-body-md text-secondary font-bold border-b-2 border-secondary" onClick={() => navigate('/booking/mechanics')}>Services</button>
              <button className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</button>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <button
              className="bg-[#B71C1C] text-white px-md py-2 rounded-[5px] font-bold text-body-sm hover:opacity-90 transition-opacity flex items-center gap-xs"
              onClick={() => navigate('/sos')}
            >
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              SOS Help
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
              <img
                className="w-full h-full object-cover"
                src={avatarSrc}
                alt={mechName}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-lg py-xl flex gap-lg relative">
        {/* Main Content Area */}
        <div className="flex-grow w-2/3">
          {/* Hero Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mb-lg">
            <div className="flex flex-col md:flex-row gap-xl items-start">
              <div className="w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 border-2 border-outline-variant shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  src={avatarSrc}
                  alt={mechName}
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-md mb-xs">
                  <h1 className="font-headline-lg text-headline-lg text-primary">{mechName}</h1>
                  <span className="bg-[#1B5E20]/10 text-[#1B5E20] px-md py-1 rounded-full text-label-md font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] fill-icon">verified</span>
                    Verified Master Tech
                  </span>
                </div>
                <div className="flex items-center gap-sm mb-md">
                  <StarRating rating={rating} />
                  <span className="font-bold text-body-md">{rating.toFixed(1)}</span>
                  <span className="text-on-surface-variant text-body-sm">({totalReviews} Reviews)</span>
                </div>
                {/* Statistics Bar */}
                <div className="grid grid-cols-3 gap-md mt-xl border-t border-outline-variant pt-lg">
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant text-label-md uppercase tracking-wider mb-1">Experience</span>
                    <span className="font-headline-sm text-headline-sm text-primary">{profile.yearsOfExperience || 12}+ Years</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant text-label-md uppercase tracking-wider mb-1">Repairs Done</span>
                    <span className="font-headline-sm text-headline-sm text-primary">1,200+</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant text-label-md uppercase tracking-wider mb-1">Specialty</span>
                    <span className="bg-secondary/10 text-secondary px-sm py-1 rounded-lg text-label-md font-bold text-center">{specialties[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bento Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* About Section */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg col-span-2">
              <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">person_search</span>
                About the Specialist
              </h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed mb-md">{bio}</p>
              <div className="flex flex-wrap gap-sm">
                {specialties.map(s => (
                  <span key={s} className="bg-surface-container border border-outline-variant px-md py-2 rounded-[5px] text-body-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
                    {s}
                  </span>
                ))}
              </div>
            </section>

            {/* Specialized Services */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
              <h3 className="font-headline-sm text-headline-sm mb-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">build_circle</span>
                Specialized Services
              </h3>
              <ul className="space-y-md">
                {services.map(s => (
                  <li key={s.name} className="flex justify-between items-center p-md bg-surface border border-outline-variant rounded-lg group hover:border-secondary transition-colors cursor-default">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">{s.icon}</span>
                      <span className="font-body-md">{s.name}</span>
                    </div>
                    <span className="font-bold text-primary">{s.price}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Credentials & Certifications */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
              <h3 className="font-headline-sm text-headline-sm mb-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">card_membership</span>
                Credentials
              </h3>
              <div className="grid grid-cols-2 gap-md">
                {credentials.map(c => (
                  <div key={c.label} className="p-md border border-outline-variant rounded-lg bg-surface flex flex-col items-center text-center group hover:bg-secondary-fixed transition-all">
                    <span className="material-symbols-outlined text-secondary text-[40px] mb-2">{c.icon}</span>
                    <span className="font-bold text-body-sm">{c.label}</span>
                    <span className="text-on-surface-variant text-[10px] uppercase">{c.sub}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Customer Reviews */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg col-span-2">
              <div className="flex justify-between items-end mb-lg">
                <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary">forum</span>
                  Customer Experiences
                </h3>
                {totalReviews > 2 && (
                  <button className="text-secondary font-bold text-body-sm hover:underline">View All {totalReviews} Reviews</button>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-on-surface-variant text-body-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-lg">
                  {reviews.slice(0, 3).map((r, idx) => (
                    <div key={r.id || idx} className="border-b border-outline-variant pb-md last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-sm">
                          <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold text-on-surface-variant">
                            {getInitials(r.reviewer?.name)}
                          </div>
                          <div>
                            <span className="font-bold block text-body-sm">{r.reviewer?.name || 'User'}</span>
                            <ReviewStars count={Math.round(r.rating || 5)} />
                          </div>
                        </div>
                        <span className="text-on-surface-variant text-label-md">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-body-sm italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Sidebar / Booking Card */}
        <aside className="w-1/3">
          <div className="sticky top-24 space-y-lg">
            {/* Booking Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex justify-between items-center mb-lg">
                <div className="flex flex-col">
                  <span className="text-label-md uppercase text-on-surface-variant tracking-widest">Base Rate</span>
                  <span className="font-headline-md text-headline-md text-primary">{profile.baseRate || '₹399'}/visit</span>
                </div>
                <div className="bg-[#1B5E20]/10 text-[#1B5E20] px-md py-1 rounded-full text-label-md font-bold flex items-center gap-xs">
                  <span className="w-2 h-2 bg-[#1B5E20] rounded-full animate-pulse"></span>
                  Available Now
                </div>
              </div>
              <div className="space-y-md mb-xl">
                <div className="flex items-center gap-md p-md bg-surface rounded-lg border border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-label-md text-on-surface-variant">Estimated Arrival</span>
                    <span className="font-bold text-body-md">{profile.eta || '12 mins to your location'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-md p-md bg-surface rounded-lg border border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <div className="flex flex-col">
                    <span className="text-label-md text-on-surface-variant">Next Slot</span>
                    <span className="font-bold text-body-md">{profile.nextSlot || 'Today, 2:30 PM onwards'}</span>
                  </div>
                </div>
              </div>
              <button
                className="w-full bg-primary-container text-white py-md rounded-[5px] font-bold text-button-text hover:opacity-90 transition-all flex items-center justify-center gap-sm mb-md shadow-md active:scale-95"
                onClick={() => navigate('/booking/mechanics')}
              >
                <span className="material-symbols-outlined">calendar_today</span>
                Book {mechName.split(' ')[0]}
              </button>
              <button className="w-full border border-outline text-on-surface py-md rounded-[5px] font-bold text-button-text hover:bg-surface-container transition-all flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined">chat</span>
                Message Specialist
              </button>
              <p className="text-center text-[10px] text-on-surface-variant mt-md uppercase tracking-tighter">
                Safe Tech Guarantee Included • Verified Professional
              </p>
            </div>

            {/* Small Map Preview */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm h-48 relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80')`,
                }}
              ></div>
              <div className="absolute bottom-md left-md bg-surface px-md py-xs rounded-lg border border-outline-variant text-label-md font-bold shadow-md">
                {profile.location || 'Sector 45, Gurgaon'}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* UX Law Strip */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#FFF9E6] border-t border-[#E0C040] h-[40px] flex items-center justify-center px-lg">
        <p className="font-body-sm text-body-sm text-[#7D6608] font-medium">
          Applied: <span className="font-bold">Social Proof</span> (verified reviews) &amp; <span className="font-bold">Authority</span> (official certifications)
        </p>
      </footer>
      <div className="h-[40px]"></div>
    </div>
  );
}
