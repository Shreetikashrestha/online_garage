import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      await uploadIdentityDoc(formData);
      setSuccess(true);
      setFile(null);
    } catch (err) {
      console.error(err);
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

  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center pt-[54px] pb-[40px] min-h-screen bg-[#f7f7f5]">
        <p className="font-body-lg text-body-lg text-on-surface-variant">Please log in to verify your identity.</p>
      </main>
    );
  }

  return (
    <>
      <div className="flex flex-1 pt-0 pb-[40px]">
        <aside className="fixed left-0 top-0 h-full w-[280px] bg-primary flex flex-col py-xl shadow-md z-40">
          <div className="px-lg mb-xxl">
            <h1 className="font-headline-lg text-headline-lg text-on-primary">Online Garage</h1>
          </div>
          <div className="px-lg mb-xl">
            <p className="font-headline-sm text-headline-sm text-on-primary">Registration</p>
            <p className="font-body-sm text-body-sm text-primary-fixed-dim opacity-70">Step 3 of 3</p>
          </div>
          <nav className="flex-1 space-y-xs px-md">
            <div className="flex items-center gap-md px-md py-sm opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-body-md text-body-md">Dashboard</span>
            </div>
            <div className="flex items-center gap-md px-md py-sm opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined">calendar_today</span>
              <span className="font-body-md text-body-md">Bookings</span>
            </div>
            <div className="flex items-center gap-md px-md py-sm opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined">directions_car</span>
              <span className="font-body-md text-body-md">Vehicles</span>
            </div>
            <div className="flex items-center gap-md px-md py-sm border-l-4 border-secondary text-on-primary font-bold bg-white/10 translate-x-1 duration-200">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="font-body-md text-body-md">Identity</span>
            </div>
          </nav>
          <div className="mt-auto px-lg">
            <button className="w-full py-md bg-[#B71C1C] text-white font-button-text text-button-text rounded-[5px] flex items-center justify-center gap-sm hover:opacity-90 transition-opacity">
              <span>SOS Help</span>
            </button>
          </div>
        </aside>

        <main className="ml-[280px] flex-1 flex flex-row gap-gutter p-xxl max-w-[1440px] mx-auto w-full min-h-screen bg-[#f7f7f5]">
          <div className="flex-[2] space-y-xl">
            <header>
              {user.isIdentityVerified ? (
                <div className="bg-[#E8F5E9] border border-[#4CAF50] p-md rounded-lg flex items-center gap-md mb-md">
                  <span className="material-symbols-outlined text-[#2E7D32]">check_circle</span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-[#1B5E20]">Identity Verified</h3>
                    <p className="font-body-sm text-body-sm text-[#388E3C]">You are eligible for Pay After Service.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFF8E1] border border-[#FFC107] p-md rounded-lg flex items-center gap-md mb-md">
                  <span className="material-symbols-outlined text-[#F57F17]">info</span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-[#E65100]">Status: Unverified</h3>
                    <p className="font-body-sm text-body-sm text-[#795548]">Unverified accounts pay at booking. Verify your ID to unlock post-payment.</p>
                  </div>
                </div>
              )}
              <h2 className="font-headline-lg text-headline-lg mb-sm">Verify Identity</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Upload a government-issued ID to verify your identity. This is required for post-service payments and ensuring workshop security.
              </p>
            </header>

            {success ? (
              <div className="flat-card p-xxl flex flex-col items-center text-center space-y-md">
                <span className="material-symbols-outlined text-[64px] text-[#2E7D32]">check_circle</span>
                <h3 className="font-headline-md text-headline-md">Document Uploaded Successfully</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Our administration team is reviewing your document. This usually takes a few minutes.
                </p>
                <div className="flex gap-md pt-lg">
                  <button
                    className="py-md px-lg bg-primary text-on-primary font-button-text text-button-text rounded-[5px] hover:bg-tertiary transition-all active:scale-[0.98]"
                    onClick={() => navigate('/')}
                  >
                    Go to Home
                  </button>
                  <button
                    className="py-md px-lg bg-[#2E7D32] text-white font-button-text text-button-text rounded-[5px] hover:bg-green-700 transition-all active:scale-[0.98] flex items-center gap-sm disabled:opacity-60"
                    onClick={handleSimulateVerification}
                    disabled={simulating}
                  >
                    {simulating ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        Simulate Admin Approval
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`flat-card p-xxl border-dashed border-2 flex flex-col items-center justify-center text-center group cursor-pointer transition-all upload-zone ${dragOver ? 'bg-secondary/5 border-secondary' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    id="fileInput"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[40px] text-secondary">
                      {file ? 'description' : 'cloud_upload'}
                    </span>
                  </div>
                  <p className="font-headline-sm text-headline-sm mb-xs">
                    {file ? file.name : 'Drag and drop your ID'}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'or click to browse from your device'}
                  </p>
                  <div className="flex gap-md text-label-md font-label-md">
                    <span className="px-md py-xs bg-surface-container rounded-full text-on-surface-variant">JPG, PNG, PDF</span>
                    <span className="px-md py-xs bg-surface-container rounded-full text-on-surface-variant">Up to 10MB</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-[#FFEBEE] border border-[#EF5350] p-md rounded-lg flex gap-sm items-start">
                    <span className="material-symbols-outlined text-[#C62828] text-[20px]">error</span>
                    <p className="font-body-sm text-body-sm text-[#C62828]">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-md pt-xl">
                  <button
                    className="w-full max-w-md py-md bg-[#222222] text-white font-button-text text-button-text rounded-[5px] hover:bg-black transition-colors active:scale-[0.98] text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
                    onClick={handleSubmit}
                    disabled={isLoading || !file}
                  >
                    {isLoading ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        Complete registration
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <div className="flex flex-col gap-xs">
                    <button
                      className="text-secondary font-bold text-left hover:underline w-fit bg-transparent border-none cursor-pointer"
                      onClick={handleSimulateVerification}
                      disabled={simulating}
                    >
                      {simulating ? <Spinner size="sm" color="#335e9f" /> : 'Verify later'}
                    </button>
                    <p className="font-body-sm text-body-sm text-on-surface-variant italic">Unverified accounts pay at booking</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 space-y-lg">
            <section className="flat-card p-lg space-y-md">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-sm">
                <span className="material-symbols-outlined">timeline</span>
                What happens next
              </h3>
              <ul className="space-y-md">
                <li className="flex gap-md">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Instant Action</p>
                    <p className="font-body-md text-body-md">Personal agent assignment to your profile.</p>
                  </div>
                </li>
                <li className="flex gap-md">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Verification</p>
                    <p className="font-body-md text-body-md">4-hour manual review by our security team.</p>
                  </div>
                </li>
                <li className="flex gap-md">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="font-label-md text-label-md uppercase text-on-surface-variant">Completion</p>
                    <p className="font-body-md text-body-md">Confirmation ticket sent to your email.</p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="flat-card p-lg border-error/30 bg-error-container/5 space-y-md">
              <div className="flex items-center gap-sm text-error">
                <span className="material-symbols-outlined">contact_support</span>
                <h3 className="font-headline-sm text-headline-sm">Need immediate help?</h3>
              </div>
              <p className="font-body-md text-body-md">Our emergency verification line is open 24/7 for urgent mechanical assistance.</p>
              <button className="w-full py-md bg-[#B71C1C] text-white font-button-text text-button-text rounded-[5px] flex items-center justify-center gap-sm hover:opacity-90 shadow-lg">
                <span className="material-symbols-outlined">phone_in_talk</span>
                Call SOS Help
              </button>
            </section>

            <div className="relative h-[240px] rounded-xl overflow-hidden shadow-md">
              <img
                className="w-full h-full object-cover"
                alt="Professional mechanic's workbench with precision tools and biometric security scanner"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHDVHvnTQ2QK2z2lxS6ngy1zWMax0V2X3V0LCoDCaVumxptSbfOL3iDkT3VPU1Sz3SimcZ8jEq0QmNfqotUzxioMLTV2RamzpjPZR2vk7PQG1JJDyKem3OV82vX1Xy75tdcZQBJbk5vPybg_xrCPG-wsavPuANIXh2KiW5quVjGEUDXcVSXKU5Tz0JUj7Todz-69Tcs9z8e3QNy-qKL_SFq4O5g8nSxMMITlNB09k4zVQ7fYBY8UE4XHvm-NDXGQbamfuxrJEtdLc"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-md">
                <span className="px-md py-xs bg-white/20 backdrop-blur-md rounded-full text-white text-label-md border border-white/20">
                  Secure Data Encryption Enabled
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 w-full z-50 h-[40px] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center gap-md px-lg">
        <span className="font-body-sm text-body-sm text-[#E0C040] font-bold">Applied: Hick's Law</span>
        <div className="flex gap-md">
          <a className="font-body-sm text-body-sm text-on-tertiary-fixed-variant hover:opacity-80 transition-opacity" href="#">Privacy Policy</a>
          <a className="font-body-sm text-body-sm text-on-tertiary-fixed-variant hover:opacity-80 transition-opacity" href="#">Help Center</a>
        </div>
      </footer>
    </>
  );
}
