import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    try {
      const user = await login(email, password);
      if (user.role === 'MECHANIC') {
        navigate('/mechanic-dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Error handled by store
    }
  };

  const displayError = error || validationError;

  return (
    <>
      <nav className="fixed top-0 w-full h-[54px] z-50 bg-surface border-b-[1.5px] border-outline-variant flex justify-between items-center px-lg max-w-[1440px] mx-auto left-0 right-0">
        <div className="font-headline-sm text-headline-sm font-bold text-primary">Online Garage</div>
        <div className="flex items-center gap-md">
          <span className="font-body-sm text-on-surface-variant">Don't have an account?</span>
          <Link className="font-label-md text-label-md text-secondary hover:underline" to="/register">Register</Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center pt-[54px] pb-[40px] px-margin max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-12 gap-gutter w-full">
          {/* Left Info Panel */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-xl">
            <header className="space-y-sm">
              <h2 className="font-headline-lg text-headline-lg text-primary">Welcome back to Online Garage</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">Access your trusted network of specialized mechanics and vehicle fleet management tools.</p>
            </header>

            <div className="bg-white p-lg border-l-4 border-primary shadow-sm rounded-lg flex gap-md items-start">
              <span className="material-symbols-outlined text-primary text-[32px]">lock</span>
              <div className="space-y-xs">
                <h4 className="font-headline-sm text-headline-sm">Secure Access</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">Your account is protected with industry-standard encryption. We prioritize your privacy and data security at every step.</p>
              </div>
            </div>

            <div className="space-y-md">
              <div className="flex items-center gap-md p-md bg-surface-container-high rounded-lg border border-outline-variant">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">build</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-body-md font-bold text-primary">Book Trusted Mechanics</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Connect with verified specialists in your area</span>
                </div>
              </div>
              <div className="flex items-center gap-md p-md hover:bg-surface-container-low rounded-lg transition-all">
                <span className="w-8 h-8 rounded-full border border-outline flex items-center justify-center font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">pace</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-body-md text-on-surface-variant">Track Repairs in Real-Time</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Live updates from booking to completion</span>
                </div>
              </div>
              <div className="flex items-center gap-md p-md opacity-50 grayscale">
                <span className="w-8 h-8 rounded-full border border-outline flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-body-md text-on-surface-variant">Digital Service History</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Every repair logged and accessible</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="col-span-12 lg:col-span-5 flex justify-end">
            <div className="w-full max-w-[460px] bg-white border border-outline-variant rounded-xl shadow-lg p-xxl space-y-lg relative overflow-hidden">
              <div className="space-y-sm">
                <h3 className="font-headline-md text-headline-md">Sign In</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Access your account</p>
              </div>

              {displayError && (
                <div className="bg-[#FFEBEE] border border-[#EF5350] p-md rounded-lg flex gap-sm items-start">
                  <span className="material-symbols-outlined text-[#C62828] text-[20px]">error</span>
                  <p className="font-body-sm text-body-sm text-[#C62828]">{displayError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-md">
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

                <div className="flex justify-end">
                  <Link className="font-body-sm text-body-sm text-secondary hover:underline" to="/forgot-password">Forgot password?</Link>
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
                      Sign In
                      <span className="material-symbols-outlined">login</span>
                    </>
                  )}
                </button>
              </form>

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
