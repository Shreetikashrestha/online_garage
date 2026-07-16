import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'];
const VEHICLE_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Other'];

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [fuelType, setFuelType] = useState('PETROL');
  const [plateNumber, setPlateNumber] = useState('');
  const [vin, setVin] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehicleColor, setVehicleColor] = useState('');
  const [setPrimary, setSetPrimary] = useState(true);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [skipVehicle, setSkipVehicle] = useState(false);

  const alreadyLoggedIn = useRef(isAuthenticated);
  useEffect(() => {
    if (alreadyLoggedIn.current && isAuthenticated && user) {
      navigate(user.role === 'MECHANIC' ? '/mechanic-dashboard' : '/dashboard', { replace: true });
    }
  }, []);

  const progressWidth = step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full';

  const handleStep1 = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (!name || !email || !password || !phone) {
      setValidationError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    try {
      await register({ name, email, phone, password, role });
      navigate('/login', { replace: true });
    } catch (err) {
      setValidationError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!make || !model || !plateNumber) { setValidationError('Make, model and plate number are required.'); return; }
    setAddingVehicle(true);
    setValidationError('');
    try {
      await api.post('/user/vehicles', {
        make, model,
        year: parseInt(year, 10),
        fuelType,
        registrationNumber: plateNumber,
        vin: vin || undefined,
        isPrimary: true,
      });
      setStep(3);
    } catch (err) {
      setValidationError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleSkipVehicle = () => {
    setSkipVehicle(true);
    setStep(3);
  };

  const handleFinish = () => {
    navigate('/verify-identity', { replace: true });
  };

  const displayError = error || validationError;

  const steps = [
    { num: 1, label: 'Personal Information', desc: 'Basic details' },
    { num: 2, label: 'Vehicle Profile', desc: 'Vehicle details' },
    { num: 3, label: 'Verify Identity', desc: 'Identity verification' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full h-[54px] z-50 bg-surface border-b-[1.5px] border-outline-variant flex justify-between items-center px-lg max-w-[1440px] mx-auto left-0 right-0">
        <div className="font-headline-sm text-headline-sm font-bold text-primary">Online Garage</div>
        <div className="flex items-center gap-md">
          <span className="font-body-sm text-on-surface-variant">Already have an account?</span>
          <Link className="font-label-md text-label-md text-secondary hover:underline" to="/login">Sign In</Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-[54px] pb-[40px] px-margin max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-12 gap-gutter w-full">
          {/* Left Info Panel */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-xl">
            <header className="space-y-sm">
              <h2 className="font-headline-lg text-headline-lg text-primary">Create your online garage account</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">Join the most trusted network of specialized mechanics and vehicle fleet managers.</p>
            </header>

            <div className="bg-white p-lg border-l-4 border-primary shadow-sm rounded-lg flex gap-md items-start">
              <span className="material-symbols-outlined text-primary text-[32px]">verified_user</span>
              <div className="space-y-xs">
                <h4 className="font-headline-sm text-headline-sm">Identity Verification</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">To ensure safety across our platform, all new members must provide a valid government-issued ID. This data is encrypted and used only for compliance.</p>
              </div>
            </div>

            <div className="space-y-md">
              {steps.map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <div
                    key={s.num}
                    className={`flex items-center gap-md p-md rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-surface-container-high border-outline-variant'
                        : isCompleted
                        ? 'bg-surface-container-low border-outline-variant'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isActive || isCompleted
                          ? 'bg-primary text-white'
                          : 'border border-outline text-on-surface-variant'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      ) : (
                        s.num
                      )}
                    </span>
                    <div className="flex flex-col flex-1">
                      {isActive && (
                        <span className="font-label-md text-label-md uppercase tracking-wider text-primary">Active Step</span>
                      )}
                      <span className={`font-body-md font-bold ${isActive || isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {s.label}
                      </span>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined ml-auto text-primary">chevron_right</span>
                    )}
                    {isCompleted && (
                      <span className="material-symbols-outlined ml-auto text-[#2E7D32]">check_circle</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Form Card */}
          <div className="col-span-12 lg:col-span-5 flex justify-end">
            <div className="w-full max-w-[460px] bg-white border border-outline-variant rounded-xl shadow-lg p-xxl space-y-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-surface-container">
                <div className={`h-full bg-secondary ${progressWidth} transition-all duration-500`}></div>
              </div>

              <div className="space-y-sm">
                <h3 className="font-headline-md text-headline-md">
                  {step === 1 ? 'Get Started' : step === 2 ? 'Vehicle Profile' : 'Verify Identity'}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Step {step} of 3: {step === 1 ? 'Basic details' : step === 2 ? 'Vehicle details' : 'Identity verification'}
                </p>
              </div>

              {displayError && (
                <div className="bg-[#FFEBEE] border border-[#EF5350] p-md rounded-lg flex gap-sm items-start">
                  <span className="material-symbols-outlined text-[#C62828] text-[20px]">error</span>
                  <p className="font-body-sm text-body-sm text-[#C62828]">{displayError}</p>
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <form onSubmit={handleStep1} className="space-y-md">
                  <div className="flex border border-outline-variant rounded-[5px] overflow-hidden">
                    <button
                      type="button"
                      className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-all ${
                        role === 'USER'
                          ? 'bg-primary text-white'
                          : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                      onClick={() => setRole('USER')}
                    >
                      I need assistance
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 text-sm font-semibold cursor-pointer transition-all ${
                        role === 'MECHANIC'
                          ? 'bg-primary text-white'
                          : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                      onClick={() => setRole('MECHANIC')}
                    >
                      I am a Mechanic
                    </button>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">FULL NAME</label>
                    <input
                      className="w-full h-[48px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
                      placeholder="Johnathan Doe"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      required
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">MOBILE PHONE</label>
                    <input
                      className="w-full h-[48px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      required
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">EMAIL ADDRESS</label>
                    <input
                      className="w-full h-[48px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
                      placeholder="john@company.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      required
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">PASSWORD</label>
                    <input
                      className="w-full h-[48px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
                      placeholder="••••••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      required
                    />
                  </div>

                  {role === 'MECHANIC' && (
                    <div className="bg-[#F3E5F5] border border-[#CE93D8] p-md rounded-lg flex gap-sm items-start">
                      <span className="material-symbols-outlined text-[#7B1FA2] text-[20px]">handyman</span>
                      <p className="font-body-sm text-body-sm text-[#4A148C]">
                        After registering, set up your skills, specialties, and bio in the Jobs Panel.
                      </p>
                    </div>
                  )}

                  <div className="bg-[#FFF9E6] border border-[#E0C040] p-md rounded-lg flex gap-sm items-start">
                    <span className="material-symbols-outlined text-[#856404] text-[20px]">info</span>
                    <p className="font-body-sm text-body-sm text-[#856404]">
                      You'll need your <strong>Driving License</strong> or <strong>Passport</strong> ready for the next step.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[56px] bg-primary text-white font-button-text text-button-text rounded-[5px] hover:bg-tertiary transition-all active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        Continue to vehicle profile
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Vehicle Profile */}
              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-md">
                  <div className="bg-[#E8F5E9] border border-[#A5D6A7] p-lg rounded-lg space-y-xs">
                    <p className="font-label-md text-label-md text-[#1B5E20] font-bold">Why add your vehicle?</p>
                    {[
                      'Auto-fill service history for future repairs',
                      'Match with mechanics certified for your brand',
                      'Precise parts filtering for accurate quotes',
                    ].map((w) => (
                      <p key={w} className="font-body-sm text-body-sm text-[#2E7D32] flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        {w}
                      </p>
                    ))}
                  </div>

                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">BASIC INFORMATION</p>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md">Make *</label>
                      <input className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="e.g. Toyota" value={make} onChange={(e) => setMake(e.target.value)} required />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md">Model *</label>
                      <input className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="e.g. Corolla" value={model} onChange={(e) => setModel(e.target.value)} required />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md">Year *</label>
                      <select className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all bg-white" value={year} onChange={(e) => setYear(e.target.value)}>
                        {Array.from({ length: 30 }, (_, i) => 2025 - i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md">Fuel Type *</label>
                      <select className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all bg-white" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                        {FUEL_TYPES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md">Vehicle Type *</label>
                      <select className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all bg-white" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                        {VEHICLE_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md">Color</label>
                      <input className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="e.g. Midnight Black" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} />
                    </div>
                  </div>

                  <div className="border-t border-outline-variant pt-md">
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">REGISTRATION DETAILS</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-md italic">Your vehicle details are only shared with mechanics after you confirm a booking. We never sell your data.</p>
                    <div className="grid grid-cols-2 gap-md">
                      <div className="space-y-xs">
                        <label className="font-label-md text-label-md">Number Plate *</label>
                        <input className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="ABC-1234" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
                      </div>
                      <div className="space-y-xs">
                        <label className="font-label-md text-label-md">VIN / Chassis Number <span className="text-on-surface-variant font-normal opacity-60">(Optional)</span></label>
                        <input className="w-full h-[44px] px-md border border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="17-digit alphanumeric code" value={vin} onChange={(e) => setVin(e.target.value)} />
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">VIN is optional but helps us find exact compatible parts for your specific engine variant.</p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-sm cursor-pointer group p-md border border-outline-variant rounded-[5px]">
                    <div className="relative flex items-center">
                      <input
                        className="peer h-5 w-5 border-2 border-outline-variant rounded-[4px] checked:bg-secondary checked:border-secondary transition-all appearance-none cursor-pointer"
                        type="checkbox" checked={setPrimary} onChange={(e) => setSetPrimary(e.target.checked)}
                      />
                      <span className="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 text-[16px] left-1/2 -translate-x-1/2 pointer-events-none" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md select-none group-hover:text-secondary transition-colors">Set as primary vehicle</span>
                      <span className="font-body-sm text-on-surface-variant">This vehicle will be auto-selected for every new booking</span>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white h-[54px] rounded-[5px] font-button-text text-button-text hover:bg-tertiary transition-all active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={addingVehicle}
                  >
                    {addingVehicle ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <>
                        Save vehicle & continue
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="w-full text-center font-body-md text-on-surface-variant hover:text-primary underline underline-offset-4 decoration-outline-variant transition-colors py-md"
                    onClick={handleSkipVehicle}
                  >
                    Skip for now, I'll add details later
                  </button>
                </form>
              )}

              {/* Step 3: Verify Identity */}
              {step === 3 && (
                <div className="space-y-md">
                  <div className="flex flex-col items-center p-lg border-2 border-dashed border-outline-variant rounded-lg text-center bg-[rgba(255,255,255,0.01)]">
                    <span className="material-symbols-outlined text-[48px] text-secondary">badge</span>
                    <p className="font-body-md font-bold text-on-surface mt-sm">Upload your ID (Driving License or Passport)</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">or click to upload</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">JPG, PNG or PDF — up to 10MB</p>
                    <button className="mt-md px-lg py-sm bg-primary text-white rounded-[5px] font-button-text text-sm hover:bg-tertiary transition-all">
                      Choose File
                    </button>
                  </div>

                  <div className="bg-[#FAFAFA] border border-outline-variant rounded-lg p-lg space-y-sm">
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">WHAT HAPPENS NEXT</p>
                    {[
                      'Personal agent assignment for your account.',
                      '4-hour manual review of submitted documents.',
                      'Confirmation ticket generated via email.',
                    ].map((w, i) => (
                      <div key={i} className="flex items-start gap-sm">
                        <span className="w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{w}</span>
                      </div>
                    ))}
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">Verification time: &lt; 4 hours · Need immediate help? Our emergency verification line is open 24/7.</p>
                  </div>

                  <button
                    className="w-full bg-primary text-white h-[54px] rounded-[5px] font-button-text text-button-text hover:bg-tertiary transition-all active:scale-[0.98] flex items-center justify-center gap-sm"
                    onClick={handleFinish}
                  >
                    Continue to Identity Verification
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button
                    className="w-full text-center font-body-md text-on-surface-variant hover:text-primary underline underline-offset-4 decoration-outline-variant transition-colors py-md"
                    onClick={() => navigate('/dashboard', { replace: true })}
                  >
                    Verify later (Note: Unverified accounts pay at booking)
                  </button>
                </div>
              )}

              <p className="text-center font-body-sm text-body-sm text-on-surface-variant px-md">
                By continuing, you agree to our <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full h-[40px] z-[60] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center px-md">
        <p className="font-body-sm text-body-sm text-on-tertiary-container">
          Applied: Heuristic 1, Heuristic 5, Proximity, Zeigarnik Effect, Fitts's Law
        </p>
      </footer>

      <div className="fixed top-20 right-[-100px] w-[500px] h-[500px] bg-secondary opacity-[0.03] rounded-full blur-[100px] -z-10"></div>
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary opacity-[0.03] rounded-full blur-[80px] -z-10"></div>
    </>
  );
}
