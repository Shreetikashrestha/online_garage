import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const SORT_OPTIONS = [
  { key: 'distance', label: 'Nearest first' },
  { key: 'rating', label: 'Rating' },
  { key: 'price', label: 'Price' },
];

function getInitials(name) {
  return (name || '')
    .split(' ')
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

const AVATAR_COLORS = ['#222222', '#0D9488', '#4F46E5', '#9333EA', '#0891B2', '#D97706'];

export default function MechanicResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { problemType } = location.state || {};

  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latitude] = useState(27.7172);
  const [longitude] = useState(85.324);
  const [sortBy, setSortBy] = useState('distance');
  const [filterReliable, setFilterReliable] = useState(false);

  useEffect(() => {
    if (!problemType) { navigate('/booking/problem'); return; }

    async function load() {
      try {
        const svcRes = await api.get('/services');
        const allServices = svcRes.data.data.services || svcRes.data.data || [];
        setServices(allServices);

        const firstService = allServices[0];
        if (firstService) {
          setSelectedService(firstService);
          await searchMechanics(firstService.id, latitude, longitude);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [problemType]);

  const searchMechanics = async (serviceId, lat, lng) => {
    setLoading(true);
    try {
      const res = await api.post('/services/search', { latitude: lat, longitude: lng, serviceId });
      const results = res.data.data.mechanics || res.data.data || [];
      const enriched = results.map((m, i) => ({
        ...m,
        distance_km: m.distance_km || (0.8 + i * 0.7).toFixed(1),
        eta: m.eta || `${Math.round((m.distance_km || 0.8 + i * 0.7) * 6 + 4)} min`,
        etaRange: m.etaRange || `${Math.round((m.distance_km || 0.8 + i * 0.7) * 5 + 3)}–${Math.round((m.distance_km || 0.8 + i * 0.7) * 7 + 5)} min`,
        totalJobs: m.totalJobs || (120 + i * 130),
        startingPrice: m.startingPrice || (600 + i * 150),
        badges: [
          ...(m.isReliable ? [{ label: 'Reliable', icon: true }] : []),
          ...(m.isIdVerified ? [{ label: 'Verified ID', icon: false }] : []),
          ...(m.specialty?.length ? [{ label: `${m.specialty[0]} specialist`, icon: false }] : []),
        ].filter(Boolean).slice(0, 3),
        yearsExperience: m.yearsOfExperience || (8 + i * 2),
        rating: m.rating || 4.5 + (i % 3) * 0.15,
        totalReviews: m.totalReviews || (89 + i * 53),
      }));
      setMechanics(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = mechanics.filter(m => !filterReliable || m.isReliable);
    switch (sortBy) {
      case 'price':
        result.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => a.distance_km - b.distance_km);
    }
    return result;
  }, [mechanics, sortBy, filterReliable]);

  const handleSelect = (mechanic) => {
    navigate('/booking/summary', { state: { mechanic, service: selectedService, userLatitude: latitude, userLongitude: longitude, problemType } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#222222] font-sans">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/booking/problem', { state: { problemType } })}
            className="text-[#222222] font-medium flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
        </div>
        <div>
          <button
            onClick={() => navigate('/sos')}
            className="bg-[#C53030] text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-red-700 transition-colors"
          >
            <span className="text-lg">🚨</span> SOS Help
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="px-8 py-3 text-sm text-gray-500 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto">
          Dashboard → Problem → <span className="text-[#222222]">Choose mechanic</span>
        </div>
      </nav>

      <main className="flex-grow p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center gap-3">
          {[{ n: 1, label: 'Issue' }, { n: 2, label: 'Mechanic', active: true }, { n: 3, label: 'Confirm' }].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${s.active ? 'bg-[#222222] text-white' : 'bg-gray-100 text-gray-500 border border-[#E5E7EB]'}`}>
                  {s.n}
                </div>
                <span className={`text-xs mt-0.5 ${s.active ? 'text-[#222222] font-medium' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="w-10 h-0.5 bg-[#E5E7EB] mb-5" />}
            </div>
          ))}
        </div>

        {/* Filter & Map Section */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-6">
          <h2 className="font-bold text-lg">Filters</h2>
          <div className="space-y-6">
            {/* Sort By */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Sort by</p>
              <div className="flex gap-2 flex-wrap">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${sortBy === opt.key ? 'bg-[#222222] text-white' : 'bg-gray-100 text-[#222222] hover:bg-gray-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <hr className="border-[#E5E7EB]" />
            {/* Reliability */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Reliability</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterReliable(!filterReliable)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-colors ${filterReliable ? 'bg-[#222222] text-white' : 'bg-gray-100 text-[#222222] hover:bg-gray-200'}`}
                >
                  {filterReliable && (
                    <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="14">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                  Reliable badge
                </button>
              </div>
            </div>
            {/* Vehicle Type */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Vehicle</p>
              <div className="flex gap-2">
                <button className="bg-gray-100 text-[#222222] px-4 py-1.5 rounded-full text-sm font-medium">All vehicles</button>
              </div>
            </div>
          </div>
          {/* Map */}
          <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-sm font-medium">{filtered.length} mechanics available nearby</p>
          </div>
        </section>

        {/* Mechanic List Section */}
        <section className="space-y-4">
          <p className="text-sm text-gray-600 font-medium ml-1">
            {loading ? 'Searching...' : `${filtered.length} mechanics available near you — sorted by ${sortBy}`}
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🔧</div>
              <p className="text-gray-500 font-medium">No mechanics found nearby.</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search radius.</p>
            </div>
          ) : (
            filtered.map((m, idx) => {
              const colorIdx = (m.id || m.userId || idx) % AVATAR_COLORS.length;
              const initials = getInitials(m.name || m.user?.name);
              return (
                <div
                  key={m.id || m.userId}
                  className={`bg-white rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${idx === 0 ? 'border-2 border-[#222222]' : 'border border-[#E5E7EB]'}`}
                >
                  <div className="flex gap-4 items-center">
                    {/* Avatar */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white flex-shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[colorIdx] }}
                    >
                      {initials}
                    </div>
                    {/* Info */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl font-[DM_Sans,sans-serif]">{m.name || m.user?.name}</h3>
                      <div className="flex flex-wrap gap-2 py-1">
                        {m.badges.map(b => (
                          <span key={b.label} className="border border-gray-300 px-3 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                            {b.icon && (
                              <svg className="text-green-600" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="12">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                            {b.label}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center text-yellow-500">
                          <svg fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </span>
                        <span className="font-bold text-[#222222]">{Number(m.rating).toFixed(1)}</span>
                        ({m.totalReviews} reviews) • {m.distance_km} km away • ETA {m.etaRange || `${m.eta} min`} • {m.totalJobs}+ jobs
                      </div>
                    </div>
                  </div>
                  {/* Price & CTA */}
                  <div className="text-right flex flex-col items-end gap-3 w-full md:w-auto">
                    <div>
                      <div className="text-3xl font-bold font-[DM_Sans,sans-serif]">₹{m.startingPrice}</div>
                      <div className="text-xs text-gray-500 font-medium">estimated total</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/mechanics/${m.userId || m.id}`)}
                        className="text-sm font-semibold text-gray-600 border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleSelect(m)}
                        className="font-bold text-[#222222] flex items-center gap-2 hover:translate-x-1 transition-transform"
                      >
                        Select →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* UX Law Strip */}
      <footer className="bg-gray-800 text-white py-4 mt-12 overflow-hidden whitespace-nowrap relative">
        <div className="flex animate-marquee gap-8" style={{ width: '200%', animation: 'marquee 30s linear infinite' }}>
          <span className="font-bold flex items-center gap-2">⚠️ <span className="uppercase tracking-widest text-sm">Hick's Law:</span> Reducing choice complexity speeds up user decision-making</span>
          <span className="font-bold flex items-center gap-2">⚠️ <span className="uppercase tracking-widest text-sm">Miller's Law:</span> Only show essential details to avoid cognitive overload</span>
          <span className="font-bold flex items-center gap-2">⚠️ <span className="uppercase tracking-widest text-sm">Fitts's Law:</span> Primary actions are sized and placed for easy reach</span>
          <span className="font-bold flex items-center gap-2">⚠️ <span className="uppercase tracking-widest text-sm">Hick's Law:</span> Reducing choice complexity speeds up user decision-making</span>
        </div>
      </footer>

      {/* Floating help button */}
      <button
        onClick={() => navigate('/sos')}
        className="fixed bottom-6 right-6 w-10 h-10 bg-[#222222] text-white rounded-full flex items-center justify-center font-bold shadow-lg hover:scale-110 transition-transform z-50"
      >
        ?
      </button>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
