// Stitch-generated: VehicleSelection
export default function VehicleSelection() {
  return (
    <>
<!-- TopNavBar -->
<header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
<div className="flex items-center gap-md">
<span className="font-headline-lg text-headline-lg font-bold text-primary">Online Garage</span>
</div>
<div className="hidden md:flex flex-1 max-w-md mx-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-md py-xs focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="Search vehicle history..." type="text" />
</div>
</div>
<div className="flex items-center gap-md">
<div className="flex items-center gap-sm mr-md">
<button className="p-xs hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
</button>
<button className="p-xs hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="support_agent">support_agent</span>
</button>
</div>
<button className="bg-[#B71C1C] text-white px-md py-xs rounded-lg font-bold text-label-md flex items-center gap-xs hover:opacity-90 transition-opacity">
                🚨 SOS Help
            </button>
<button className="hidden md:block bg-primary text-on-primary px-md py-xs rounded-lg font-bold text-label-md hover:bg-primary-container transition-colors">
                Book Now
            </button>
</div>
</header>
<main className="flex-grow pt-24 pb-xxl px-gutter max-w-[1440px] mx-auto w-full">
<!-- Progress Stepper -->
<div className="mb-xl max-w-2xl mx-auto flex items-center justify-between">
<div className="flex flex-col items-center gap-xs">
<div className="w-8 h-8 rounded-full border-2 flex items-center justify-center bg-primary text-on-primary border-primary">
<span className="material-symbols-outlined text-[18px]" style="font-variation-settings: 'wght' 700;">check</span>
</div>
<span className="font-label-md text-label-md text-primary">Problem</span>
</div>
<div className="flex-grow h-[1px] bg-outline-variant mx-sm mb-6"></div>
<div className="flex flex-col items-center gap-xs">
<div className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-primary bg-primary text-on-primary">
<span className="font-bold">2</span>
</div>
<span className="font-label-md text-label-md text-primary">Vehicle</span>
</div>
<div className="flex-grow h-[1px] bg-outline-variant mx-sm mb-6"></div>
<div className="flex flex-col items-center gap-xs">
<div className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-outline-variant text-on-surface-variant">
<span className="">3</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant">mechanic</span>
</div>
<div className="flex-grow h-[1px] bg-outline-variant mx-sm mb-6"></div>
<div className="flex flex-col items-center gap-xs">
<div className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-outline-variant text-on-surface-variant">
<span className="">4</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant">Confirm</span>
</div>
</div>
<!-- Header -->
<div className="max-w-4xl mx-auto mb-xl">
<h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Select Vehicle</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Which vehicle needs attention today? Choose from your fleet or add a new one.</p>
</div>
<!-- Bento Grid Selection -->
<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
<!-- Vehicle Card 1 -->
<div className="group relative bg-white border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ring-2 ring-transparent vehicle-card-selected" onclick="selectVehicle(this)">
<div className="flex justify-between items-start mb-md">
<div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[28px]" data-icon="directions_car">directions_car</span>
</div>
<span className="bg-[#1B5E20]/10 text-[#1B5E20] px-3 py-1 rounded-full font-label-md text-label-md">Main</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-primary mb-xs">Toyota Hilux</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-md">KBS 892X • 2021 Double Cab</p>
<div className="space-y-sm">
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">history</span>
<span className="font-label-md text-label-md">Last Service: Oct 2023</span>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">speed</span>
<span className="font-label-md text-label-md">42,500 KM</span>
</div>
</div>
</div>
<div className="mt-lg flex justify-end">
<div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-[16px]" style="font-variation-settings: 'wght' 700;">done</span>
</div>
</div>
</div>
<!-- Vehicle Card 2 -->
<div className="group relative bg-white border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ring-2 ring-transparent" onclick="selectVehicle(this)">
<div className="flex justify-between items-start mb-md">
<div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[28px]" data-icon="directions_car">directions_car</span>
</div>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-primary mb-xs">Volkswagen Golf</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-md">KCW 112L • 2019 GTI</p>
<div className="space-y-sm">
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">history</span>
<span className="font-label-md text-label-md">Last Service: Jan 2024</span>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">speed</span>
<span className="font-label-md text-label-md">68,100 KM</span>
</div>
</div>
</div>
<div className="mt-lg flex justify-end">
<div className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center group-hover:border-primary">
<span className="material-symbols-outlined text-transparent group-hover:text-primary/20 text-[16px]" style="font-variation-settings: 'wght' 700;">done</span>
</div>
</div>
</div>
<!-- Add New Vehicle -->
<div className="group border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center gap-md hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer h-full min-h-[250px]">
<div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span className="material-symbols-outlined text-[32px]">add</span>
</div>
<div className="text-center">
<p className="font-headline-sm text-headline-sm text-primary">Add Vehicle</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Register a new car</p>
</div>
</div>
</div>
<!-- Sticky Footer Action -->
<div className="max-w-4xl mx-auto mt-xxl flex flex-col sm:flex-row justify-between items-center gap-md pt-xl border-t border-outline-variant">
<button className="flex items-center gap-xs font-button-text text-button-text text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">arrow_back</span>
                Back to Problem
            </button>
<div className="flex items-center gap-md w-full sm:w-auto">
<button className="flex-1 sm:flex-none border border-outline px-xl py-md rounded-lg font-button-text text-button-text hover:bg-surface-container transition-colors">
                    Save for Later
                </button>
<button className="flex-1 sm:flex-none bg-primary text-on-primary px-xxl py-md rounded-lg font-button-text text-button-text hover:bg-primary-container transition-all active:scale-95 shadow-md">
                    Continue to Services
                </button>
</div>
</div>
</main>
<!-- Footer -->
<footer className="w-full py-lg px-margin flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-low border-t border-outline-variant mt-auto">
<div className="flex flex-col items-center md:items-start gap-xs">
<span className="font-headline-sm text-headline-sm font-bold text-primary">Online Garage</span>
<p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">© 2024 Online Garage. All rights reserved. Precision Service &amp; Safety First.</p>
</div>
<div className="flex gap-xl">
<a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Safety Protocols</a>
<a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms of Service</a>
<a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy Policy</a>
<a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Partner With Us</a>
</div>
</footer>
<!-- UX Law Strip -->
<div className="fixed bottom-0 left-0 w-full h-[40px] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center z-50">
<span className="font-body-sm text-body-sm text-[#5C4D14]">Applied: Fitts's Law – Priority actions are large and strategically positioned for rapid acquisition.</span>
</div>




    </>
  );
}

