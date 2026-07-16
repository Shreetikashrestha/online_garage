import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/ui/Spinner';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    api.get('/services')
      .then(r => setServices(r.data.data.services || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingServices(false));
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/booking/problem');
    } else {
      navigate('/login');
    }
  };

  const handleScrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full h-[54px] z-50 bg-surface border-b-[1.5px] border-outline-variant flex items-center px-lg transition-all duration-300">
        <div className="flex justify-between items-center w-full max-w-[1440px] mx-auto h-full">
          <div className="flex items-center gap-xl">
            <Link className="font-headline-sm text-headline-sm font-bold text-primary" to="/">Online Garage</Link>
            <div className="hidden md:flex gap-md">
              <a className="font-label-md text-label-md text-primary font-bold border-b-2 border-secondary h-[54px] flex items-center" href="#services">Services</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors h-[54px] flex items-center" href="#">Workshops</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors h-[54px] flex items-center" href="#">Pricing</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors h-[54px] flex items-center" href="#">Fleet</a>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <Link className="font-button-text text-button-text text-on-surface-variant hover:text-primary px-md py-sm transition-all" to="/login">Sign In</Link>
            <Link className="bg-primary text-on-primary font-button-text text-button-text px-lg py-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all" to="/register">Get Started</Link>
            <button className="bg-[#B71C1C] text-white font-button-text text-button-text px-md py-sm rounded-lg flex items-center gap-xs shadow-lg hover:brightness-110 active:scale-[0.95] transition-all">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              SOS Help
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-[54px] bg-[#1A1A1A] relative h-[480px] md:h-[520px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Professional automotive workshop" className="w-full h-full object-cover opacity-40 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaxMpuAP2Fo0Qfs0tTEKbvl3mkOlyniwnDYho-76gEYVrwSF066kRXjseEpp7d7l1P2t1NXzIRlFkPaLl4raS5BEd64wJzlMIGw0uA7IPDRhBUscQmh0b42xEV1im22VEfmv8UsyAM6FRxNicDkW2KbfQ91m328zYjt39gPjUEAmohESwriI9PxkzKQ5agPlVxg2oUx7NSbBEeImW5IwHA3pqxbPrq1dZ5BzgNdTkeD2AOMO4PQ9y33N6xEkHIqn1CM8b4Yz2dBGY" />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-margin h-full flex flex-col justify-center items-start">
          <div className="bg-[#1B5E20]/10 border border-[#1B5E20]/20 rounded-full px-md py-xs flex items-center gap-xs mb-lg">
            <span className="material-symbols-outlined text-[#1B5E20] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-[#1B5E20] font-label-md text-label-md">Verified mechanics only</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-white max-w-2xl mb-md">
            Mechanic · Towing · Spare Parts — <span className="text-secondary-container">on demand, near you.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl mb-xl">
            Instant roadside assistance and mechanical repairs with transparent pricing and real-time technician tracking. No hidden fees, just precision service.
          </p>
          <div className="flex items-center gap-md">
            <button
              className="bg-white text-primary font-button-text text-button-text px-xxl py-md rounded-lg hover:bg-surface-container-high active:scale-[0.98] transition-all"
              onClick={handleGetStarted}
            >
              Get Started Now
            </button>
            <button
              className="text-white border border-white/30 font-button-text text-button-text px-xxl py-md rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all"
              onClick={handleScrollToHowItWorks}
            >
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-surface border-b-[1px] border-outline-variant py-md relative z-20 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-margin flex flex-wrap justify-between items-center gap-md">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#1B5E20] text-[20px]">check_circle</span>
            <span className="font-label-md text-label-md text-on-surface">Price locked</span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#1B5E20] text-[20px]">check_circle</span>
            <span className="font-label-md text-label-md text-on-surface">Live GPS</span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#1B5E20] text-[20px]">check_circle</span>
            <span className="font-label-md text-label-md text-on-surface">Backup mechanic</span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#1B5E20] text-[20px]">check_circle</span>
            <span className="font-label-md text-label-md text-on-surface">7-day dispute</span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#1B5E20] text-[20px]">check_circle</span>
            <span className="font-label-md text-label-md text-on-surface">Money-back guarantee</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="how-it-works" className="bg-[#F7F7F5] py-xxl">
        <div className="max-w-[1440px] mx-auto px-margin">
          <div className="mb-xxl flex justify-between items-end">
            <div>
              <span className="text-secondary font-label-md text-label-md uppercase tracking-widest">Our Expertise</span>
              <h2 className="font-headline-lg text-headline-lg mt-xs text-primary">Comprehensive Roadside Support</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Professional assistance designed for reliability, efficiency, and total peace of mind in every scenario.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Mechanical Service */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant group hover:shadow-xl transition-all duration-300">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-md text-primary">Mechanical Service</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl leading-relaxed">
                From engine diagnostics to minor on-site repairs, our certified mechanics bring the workshop to your location within minutes.
              </p>
              <button
                className="block w-full py-md text-center font-button-text text-button-text bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
                onClick={handleGetStarted}
              >
                Book Mechanic
              </button>
            </div>
            {/* Towing Service */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant group hover:shadow-xl transition-all duration-300">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_towing</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-md text-primary">Towing Service</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl leading-relaxed">
                Secure and flatbed towing services for vehicles of all sizes. 24/7 dispatch available across the entire metropolitan area.
              </p>
              <button
                className="block w-full py-md text-center font-button-text text-button-text bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
                onClick={handleGetStarted}
              >
                Request Tow
              </button>
            </div>
            {/* Spare Parts */}
            <div className="bg-white p-lg rounded-xl border border-outline-variant group hover:shadow-xl transition-all duration-300">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>settings_input_component</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-md text-primary">Spare Parts</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl leading-relaxed">
                Access an extensive inventory of genuine OEM parts delivered directly to your breakdown site or home workshop.
              </p>
              <Link
                className="block w-full py-md text-center font-button-text text-button-text bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
                to="/parts"
              >
                Order Parts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Stats / Promo Section */}
      <section className="py-xxl bg-white border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-margin grid grid-cols-1 lg:grid-cols-2 gap-xxl items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
            <img alt="Technician using tablet for diagnostics" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-36mKz9czXZaC_rpfHu1sRiAbOYURkoid4R799LcnqOP0sAeetTDSgwxAGm1zdULeNr578b8wO1KA2ZRz_KXQVYzM1rS61wEtB3CfLmEMYRnrNBgvGg9hQAz-B7-flrZMpwLlurISGMkB3Vf-t8Sf220zvV6D6yhDbDQqfwdAkpq5Yl38BVhdf0DDOz4s6ax1LeGI5fIQ5R2MdEg_kInskVgAfwlK9mq890aNs7nPFhnhOAY_A6LATAhD-obkAJyLjtL5WCgEz1w" />
            <div className="absolute bottom-lg left-lg bg-primary/90 backdrop-blur-md p-lg rounded-xl text-white">
              <p className="font-headline-md text-headline-md font-bold">18,402+</p>
              <p className="font-label-md text-label-md text-white/70">Repairs Completed This Month</p>
            </div>
          </div>
          <div className="space-y-xl">
            <h2 className="font-display-lg text-display-lg text-primary">Safety and speed are not optional.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              We've re-engineered the breakdown experience from the ground up. By combining professional engineering with modern logistics, we reduce wait times by up to 60%.
            </p>
            <div className="grid grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <span className="font-headline-md text-headline-md text-secondary">22 min</span>
                <span className="font-label-md text-label-md uppercase text-on-surface-variant">Avg. Arrival Time</span>
              </div>
              <div className="flex flex-col gap-xs">
                <span className="font-headline-md text-headline-md text-secondary">4.9/5</span>
                <span className="font-label-md text-label-md uppercase text-on-surface-variant">User Satisfaction</span>
              </div>
            </div>
            <div className="pt-md">
              <button
                className="inline-flex items-center gap-sm font-button-text text-button-text text-primary group"
                onClick={handleGetStarted}
              >
                Learn about our vetting process
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface pt-xxl pb-[40px]">
        <div className="max-w-[1440px] mx-auto px-margin border-t border-outline-variant pt-xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-xxl">
            <div className="max-w-xs">
              <span className="font-headline-sm text-headline-sm font-bold text-primary">Online Garage</span>
              <p className="mt-md font-body-sm text-body-sm text-on-surface-variant">
                The ultimate precision service platform for vehicle owners and logistics operators. High-reliability maintenance, on-demand.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-xxl">
              <div className="flex flex-col gap-md">
                <p className="font-label-md text-label-md font-bold uppercase text-primary">Platform</p>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Services</a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Pricing</a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Fleet Solutions</a>
              </div>
              <div className="flex flex-col gap-md">
                <p className="font-label-md text-label-md font-bold uppercase text-primary">Partners</p>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Become a Mechanic</a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Tow Operators</a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Workshop Network</a>
              </div>
              <div className="flex flex-col gap-md">
                <p className="font-label-md text-label-md font-bold uppercase text-primary">Support</p>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Help Center</a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">Documentation</a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary" href="#">UX Research</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* UX Law Strip */}
      <div className="fixed bottom-0 w-full h-[40px] z-[60] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center px-md">
        <p className="font-body-sm text-body-sm text-tertiary">
          Applied: <span className="font-bold">Hick's Law</span>, <span className="font-bold">Peak-End Rule</span>, <span className="font-bold">Jakob's Law</span>, <span className="font-bold">Heuristic 8</span>
        </p>
      </div>
    </>
  );
}
