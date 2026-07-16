import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PROBLEMS = [
  { id: 'MECHANICAL', icon: 'handyman', label: 'Mechanical', desc: 'Engine noise, transmission issues, or strange vibrations while driving.' },
  { id: 'TYRE', icon: 'tire_repair', label: 'Tyre', desc: 'Puncture, flat tyre, or alignment problems requiring immediate attention.' },
  { id: 'TOWING', icon: 'auto_towing', label: 'Towing', desc: 'Vehicle breakdown requiring transport to a nearby workshop or home.' },
  { id: 'PART', icon: 'settings_input_component', label: 'Part', desc: 'Replacement of specific components like batteries, filters, or belts.' },
  { id: 'LEAK', icon: 'water_drop', label: 'Leak', desc: 'Visible fluid leaks including oil, coolant, or brake fluid from the chassis.' },
  { id: 'OTHER', icon: 'more_horiz', label: 'Other', desc: 'Electrical issues, software glitches, or unlisted concerns requiring diagnosis.' },
];

export default function ProblemPicker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    navigate('/booking/mechanics', { state: { problemType: selected } });
  };

  return (
    <>
      {/* TopNavBar (Fixed) */}
      <nav className="fixed top-0 w-full h-[54px] z-50 bg-surface dark:bg-tertiary border-b-[1.5px] border-outline-variant dark:border-outline">
        <div className="flex justify-between items-center px-lg h-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-xl">
            <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">Online Garage</span>
            <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to dashboard
            </button>
          </div>
          <div className="flex items-center gap-md">
            <button className="bg-[#B71C1C] text-white font-button-text text-button-text px-lg py-sm rounded-[5px] flex items-center gap-xs hover:brightness-110 active:scale-[0.98] transition-all" onClick={() => navigate('/sos')}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              🚨 SOS Help
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-[54px] pb-[40px] max-w-[1440px] mx-auto w-full px-margin">
        {/* Breadcrumb & Progress */}
        <div className="mt-xl flex justify-between items-end">
          <div>
            <nav className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md mb-sm">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-bold">What's wrong?</span>
            </nav>
            <h2 className="font-headline-lg text-headline-lg text-primary">What's the problem?</h2>
          </div>

          {/* Stepper (Zeigarnik Effect) */}
          <div className="flex items-center gap-md">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-label-md">1</div>
              <span className="font-label-md text-label-md mt-xs text-primary">Issue</span>
            </div>
            <div className="w-12 h-[2px] bg-outline-variant mb-6"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-label-md border border-outline-variant">2</div>
              <span className="font-label-md text-label-md mt-xs text-on-surface-variant">Vehicle</span>
            </div>
            <div className="w-12 h-[2px] bg-outline-variant mb-6"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-label-md border border-outline-variant">3</div>
              <span className="font-label-md text-label-md mt-xs text-on-surface-variant">Confirm</span>
            </div>
          </div>
        </div>

        {/* Problem Picker Grid (Hick's Law - Categorized Choice) */}
        <div className="mt-xxl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {PROBLEMS.map(p => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                className={`problem-card flex flex-col items-start p-lg border rounded-[8px] hover:shadow-md transition-all text-left group ${
                  isSelected
                    ? 'border-2 border-primary bg-surface-container-low'
                    : 'bg-surface-container-lowest border-outline-variant'
                }`}
                onClick={() => setSelected(p.id)}
              >
                <div className={`w-xxl h-xxl mb-md rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-primary-container text-white group-hover:scale-110 transition-transform'
                    : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary-container group-hover:text-white'
                }`}>
                  <span className="material-symbols-outlined text-[32px]" style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}>{p.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-xs">{p.label}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{p.desc}</p>
                {isSelected && (
                  <div className="mt-lg self-end">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-xxl flex justify-between items-center border-t border-outline-variant pt-lg">
          <p className="font-body-md text-body-md text-on-surface-variant italic max-w-[400px]">
            Not sure? Use the <span className="text-primary font-bold">SOS button</span> for a direct call to our response team.
          </p>
          <button
            className="bg-primary text-white font-button-text text-button-text px-[48px] py-md rounded-[5px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue to Vehicle Selection
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </main>

      {/* Footer / UX Law Strip */}
      <footer className="fixed bottom-0 w-full h-[40px] z-[60] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center px-md">
        <p className="font-body-sm text-body-sm text-tertiary">
          Applied: <span className="font-bold">Hick's Law</span>, <span className="font-bold">Heuristic 2</span> (Match between system and real world), <span className="font-bold">Heuristic 6</span> (Recognition rather than recall), <span className="font-bold">Similarity</span>, <span className="font-bold">Zeigarnik</span>
        </p>
      </footer>
    </>
  );
}
