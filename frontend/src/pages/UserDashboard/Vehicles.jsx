import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Car, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

export default function Vehicles() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New vehicle form state
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
      
      // Reset form
      setMake('');
      setModel('');
      setYear(new Date().getFullYear());
      setFuelType('PETROL');
      setRegistrationNumber('');
      setVin('');
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
      // Update local state
      setVehicles(vehicles.map((v) => ({
        ...v,
        isPrimary: v.id === id,
      })));
    } catch (err) {
      setError('Failed to update primary status.');
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <h2 style={styles.pageTitle}>Vehicle Garage</h2>
      <p style={styles.pageSubtitle}>Manage your cars to make booking mechanic services seamless.</p>

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.grid}>
        {/* Vehicles list */}
        <div style={styles.listCol}>
          <div className="glass-card" style={{ height: '100%' }}>
            <h3 style={styles.sectionTitle}>Registered Vehicles</h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Spinner />
              </div>
            ) : vehicles.length === 0 ? (
              <div style={styles.emptyState}>
                <Car size={48} color="var(--text-muted)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>No vehicles registered yet.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add a vehicle on the right to start booking.</p>
              </div>
            ) : (
              <div style={styles.vehicleList}>
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} style={styles.vehicleItem}>
                    <div style={styles.vehicleMeta}>
                      <div style={styles.vehicleHeader}>
                        <h4 style={{ color: '#ffffff' }}>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                        {vehicle.isPrimary && (
                          <span className="badge badge-success" style={{ gap: '0.25rem' }}>
                            <ShieldCheck size={12} /> Primary
                          </span>
                        )}
                      </div>
                      <p style={styles.detailsText}>Plate: {vehicle.registrationNumber}</p>
                      <p style={styles.detailsText}>Fuel: <span className="badge badge-blue">{vehicle.fuelType}</span></p>
                      {vehicle.vin && <p style={styles.detailsText}>VIN: {vehicle.vin}</p>}
                    </div>

                    <div style={styles.actions}>
                      {!vehicle.isPrimary && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => handleSetPrimary(vehicle.id)}
                        >
                          Make Primary
                        </button>
                      )}
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.5rem' }}
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        aria-label="Delete vehicle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add vehicle form */}
        <div style={styles.formCol}>
          <div className="glass-card">
            <h3 style={styles.sectionTitle}>Register New Vehicle</h3>
            
            <form onSubmit={handleAddVehicle} style={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="make">Make / Manufacturer</label>
                <input
                  id="make"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="model">Model</label>
                <input
                  id="model"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="year">Year</label>
                  <input
                    id="year"
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
                  <label className="form-label" htmlFor="fuel-type">Fuel Type</label>
                  <select
                    id="fuel-type"
                    className="form-control"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    style={{ height: '44px' }}
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-number">Registration Plate Number</label>
                <input
                  id="reg-number"
                  type="text"
                  className="form-control"
                  placeholder="e.g. BA-1-PA-1234"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="vin">VIN (Optional)</label>
                <input
                  id="vin"
                  type="text"
                  className="form-control"
                  placeholder="17-character VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={styles.submitBtn} 
                disabled={adding}
              >
                {adding ? <Spinner size="sm" color="white" /> : (
                  <>
                    <Plus size={18} /> Register Vehicle
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '3rem',
    textAlign: 'left',
  },
  pageTitle: {
    fontSize: '2rem',
    marginBottom: '0.25rem',
  },
  pageSubtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
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
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  listCol: {
    flex: '2 1 500px',
  },
  formCol: {
    flex: '1 1 350px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#ffffff',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1.5rem',
    textAlign: 'center',
  },
  vehicleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  vehicleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    gap: '1rem',
  },
  vehicleMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  vehicleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  detailsText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    marginTop: '1.5rem',
    width: '100%',
    height: '46px',
  },
};
