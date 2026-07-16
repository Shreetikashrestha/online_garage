import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

export default function IdentityVerification() {
  const { user, uploadIdentityDoc, fetchProfile, isLoading, error } = useAuthStore();
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      await uploadIdentityDoc(formData);
      setSuccess(true);
      setFile(null);
    } catch (err) {
      // error is already set in the store
    }
  };

  const handleSimulateVerification = async () => {
    setSimulating(true);
    try {
      await api.patch(`/admin/users/${user.id}/verify`);
      await fetchProfile();
      setSuccess(true);
    } catch (err) {
      console.error('Failed simulation:', err);
      alert('Verification simulation failed. Make sure server is running and you have Admin rights, or try again.');
    } finally {
      setSimulating(false);
    }
  };

  if (!user) return <p style={{ textAlign: 'center' }}>Please log in to verify your identity.</p>;

  return (
    <div style={styles.container} className="animate-fade-in">
      <div className="glass-card" style={styles.card}>
        <h2 style={styles.title}>Identity Verification</h2>
        
        {user.isIdentityVerified ? (
          <div style={styles.statusBoxVerified}>
            <CheckCircle size={48} color="var(--success)" />
            <h3 style={{ marginTop: '1rem', color: '#ffffff' }}>Your Identity is Verified!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              You are now eligible for **Post-Pay** (paying after service completion).
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem' }}
              onClick={() => navigate('/')}
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div>
            <div style={styles.statusBoxPending}>
              <AlertCircle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: '#ffffff', textAlign: 'left' }}>Status: Unverified</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'left', marginTop: '0.25rem' }}>
                  Unverified users are required to put funds in **escrow (Pre-Pay)** before a booking is accepted. Verify your ID to pay after service completion.
                </p>
              </div>
            </div>

            {success ? (
              <div style={styles.uploadSuccess}>
                <CheckCircle size={48} color="var(--success)" />
                <h3 style={{ color: '#ffffff', marginTop: '0.75rem' }}>Document Uploaded Successfully</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Our administration team is reviewing your document. This usually takes a few minutes.
                </p>
                <div style={styles.simulateActions}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => navigate('/')}
                  >
                    Go back
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={handleSimulateVerification}
                    disabled={simulating}
                  >
                    {simulating ? <Spinner size="sm" color="white" /> : 'Simulate Admin Approval'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div
                  style={{
                    ...styles.uploadArea,
                    borderColor: dragOver ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: dragOver ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) setFile(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                >
                  {file ? (
                    <>
                      <FileText size={36} color="var(--accent-primary)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginTop: '0.5rem' }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} color="var(--accent-primary)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginTop: '0.5rem' }}>
                        Drag & drop or click to upload
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Passport, Driver's License or National ID
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        JPG, PNG or PDF — up to 10MB
                      </span>
                    </>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                    required
                  />
                </div>

                {error && <p className="error-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                <div style={styles.actions}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading || !file}
                    style={{ flex: 1 }}
                  >
                    {isLoading ? <Spinner size="sm" color="white" /> : 'Upload ID Document'}
                  </button>

                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSimulateVerification}
                    disabled={simulating}
                    style={{ flex: 1 }}
                  >
                    {simulating ? <Spinner size="sm" color="white" /> : 'Simulate Verification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '2.5rem 2rem',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  statusBoxVerified: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    textAlign: 'center',
  },
  statusBoxPending: {
    display: 'flex',
    gap: '1rem',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '2rem',
    alignItems: 'flex-start',
  },
  uploadArea: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '2.5rem 1.5rem',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: '1.5rem',
    transition: 'border-color 0.2s, background-color 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
  },
  uploadSuccess: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    textAlign: 'center',
  },
  simulateActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    width: '100%',
  },
};
