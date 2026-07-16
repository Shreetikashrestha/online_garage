import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

export default function Vehicles() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [fuelType, setFuelType] = useState('PETROL');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/vehicles');
      setVehicles(response.data.data.vehicles || response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    const vehicleData = {
      make,
      model,
      year: parseInt(year, 10),
      fuelType,
      registrationNumber,
      vin: vin || undefined,
    };

    try {
      const response = await api.post('/user/vehicles', vehicleData);
      const newVehicle = response.data.data.vehicle || response.data.data;
      setVehicles([...vehicles, newVehicle]);

      setMake('');
      setModel('');
      setYear(new Date().getFullYear());
      setFuelType('PETROL');
      setRegistrationNumber('');
      setVin('');
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/user/vehicles/${id}`);
      setVehicles(vehicles.filter((v) => v.id !== id));
    } catch (err) {
      setError('Failed to delete vehicle.');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await api.patch(`/user/vehicles/${id}/primary`);
      setVehicles(vehicles.map((v) => ({
        ...v,
        isPrimary: v.id === id,
      })));
    } catch (err) {
      setError('Failed to update primary status.');
    }
  };

  const primaryVehicle = vehicles.find(v => v.isPrimary) || vehicles[0];

  return (
    <div className="w-full animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="flex gap-0 relative">
        {/* Sidebar */}
        <aside className="hidden xl:flex flex-col w-[260px] flex-shrink-0 bg-[#1A1A1A] rounded-xl border border-outline-variant self-start sticky top-24">
          <div className="px-lg pt-lg pb-md">
            <h2 className="font-headline-sm text-headline-sm text-white">Account Management</h2>
            <p className="font-label-md text-label-md" style={{ color: '#9ca3af' }}>Vehicle &amp; Service Control</p>
          </div>
          <nav className="flex flex-col flex-grow">
            <Link to="/dashboard" className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" style={{ color: '#9ca3af' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span> Dashboard
            </Link>
            <Link to="/vehicles" className="border-l-4 border-secondary-container px-lg py-3 flex items-center gap-md font-label-md text-label-md" style={{ color: '#fff', borderLeftColor: '#8fb7fe', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>directions_car</span> My Vehicles
            </Link>
            <Link to="/bookings" className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" style={{ color: '#9ca3af' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>history</span> Booking History
            </Link>
            <Link to="/invoices" className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" style={{ color: '#9ca3af' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span> Payments
            </Link>
            <Link to="/settings" className="px-lg py-3 flex items-center gap-md transition-all font-label-md text-label-md" style={{ color: '#9ca3af' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span> Settings
            </Link>
          </nav>
          <div className="p-lg mt-auto flex flex-col gap-md" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button className="btn btn-primary w-full" onClick={() => setShowForm(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add New Vehicle
            </button>
            <div className="flex flex-col gap-2 pt-md">
              <Link to="/help" className="flex items-center gap-md font-label-md text-label-md" style={{ color: '#9ca3af' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help</span> Help Center
              </Link>
              <a className="flex items-center gap-md font-label-md text-label-md" href="#" style={{ color: '#9ca3af' }} onClick={e => { e.preventDefault(); useAuthStore.getState().logout(); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span> Sign Out
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 xl:pl-lg">
          {/* Header */}
          <section className="bg-[#1A1A1A] rounded-xl px-lg py-xl mb-xl border border-outline-variant">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg mb-1 text-white">My Vehicles</h1>
                <p className="font-body-md text-body-md flex items-center gap-2" style={{ color: '#9ca3af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>directions_car</span>
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span> Add Vehicle
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 px-lg py-3 rounded-lg mb-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
              <span className="font-body-sm text-body-sm">{error}</span>
            </div>
          )}

          {/* Add Vehicle Form */}
          {showForm && (
            <div className="glass-card mb-xl p-lg">
              <div className="flex justify-between items-center mb-lg">
                <h2 className="font-headline-sm text-headline-sm text-white">Register New Vehicle</h2>
                <button className="font-label-md text-label-md hover:underline flex items-center gap-1" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setShowForm(false); setError(null); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="form-group">
                    <label className="form-label" htmlFor="stitch-make">Make / Manufacturer</label>
                    <input
                      id="stitch-make"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Toyota"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="stitch-model">Model</label>
                    <input
                      id="stitch-model"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Camry"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="stitch-year">Year</label>
                    <input
                      id="stitch-year"
                      type="number"
                      className="form-control"
                      placeholder="2022"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="stitch-fuel">Fuel Type</label>
                    <select
                      id="stitch-fuel"
                      className="form-control"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIC">Electric</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="stitch-reg">Registration Plate</label>
                    <input
                      id="stitch-reg"
                      type="text"
                      className="form-control"
                      placeholder="e.g. BA-1-PA-1234"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="stitch-vin">VIN <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                    <input
                      id="stitch-vin"
                      type="text"
                      className="form-control"
                      placeholder="17-character VIN"
                      value={vin}
                      onChange={(e) => setVin(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px' }} disabled={adding}>
                  {adding ? <Spinner size="sm" color="white" /> : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span> Register Vehicle
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Vehicle Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Spinner />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>directions_car</span>
              <p className="font-body-md text-body-md" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No vehicles registered yet.</p>
              <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>Add a vehicle to start booking services.</p>
              <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowForm(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span> Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="glass-card p-lg">
                  <div className="flex items-start gap-md mb-md">
                    <div className="w-14 h-10 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-color)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-muted)' }}>directions_car</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-headline-sm text-headline-sm text-white truncate">{vehicle.make} {vehicle.model}</h3>
                        {vehicle.isPrimary && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/15 text-green-400 flex-shrink-0">Main</span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md font-bold" style={{ color: 'var(--text-secondary)' }}>{vehicle.registrationNumber}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-lg gap-y-1 mb-md">
                    <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-label-md text-label-md text-white">Year:</span> {vehicle.year}
                    </p>
                    <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-label-md text-label-md text-white">Fuel:</span> {vehicle.fuelType}
                    </p>
                    {vehicle.vin && (
                      <p className="font-body-sm text-body-sm" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-label-md text-label-md text-white">VIN:</span> {vehicle.vin}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-md" style={{ borderTop: '1px solid var(--border-color)' }}>
                    {!vehicle.isPrimary && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleSetPrimary(vehicle.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span> Make Primary
                      </button>
                    )}
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.5rem', marginLeft: 'auto' }} onClick={() => handleDeleteVehicle(vehicle.id)} aria-label="Delete vehicle">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
