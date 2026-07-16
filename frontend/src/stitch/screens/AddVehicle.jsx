// Stitch-generated: AddVehicle
export default function AddVehicle() {
  return (
    <>
<!-- Top Navigation Bar (Partial Implementation for Flow) -->
<header className="fixed top-0 w-full h-[54px] z-50 bg-surface border-b-[1.5px] border-outline-variant flex justify-between items-center px-lg max-w-[1440px] mx-auto left-0 right-0">
<div className="font-headline-sm text-headline-sm font-bold text-primary">MechHub</div>
<div className="flex items-center gap-md">
<button className="bg-error text-on-error px-md py-1.5 rounded-[5px] font-button-text text-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">emergency</span>
            Get Help Now
        </button>
</div>
</header>
<main className="flex-grow pt-[54px] pb-[40px] max-w-[1440px] mx-auto w-full flex">
<!-- Main Content Area -->
<div className="flex-grow px-xxl py-xl overflow-y-auto">
<!-- Progress Bar -->
<div className="mb-xl">
<div className="flex justify-between items-center mb-xs">
<span className="font-label-md text-label-md text-on-surface-variant">Step 2 of 3: Vehicle Profile</span>
<span className="font-label-md text-label-md text-secondary font-bold">66% Complete</span>
</div>
<div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-full step-progress-glow transition-all duration-700" style="width: 66%"></div>
</div>
</div>
<div className="max-w-[720px]">
<h1 className="font-headline-lg text-headline-lg mb-lg">Add New Vehicle</h1>
<form className="space-y-xl">
<!-- Basic Information Section -->
<section className="p-lg bg-surface-container-lowest border border-outline-variant rounded-lg">
<h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Basic Information</h2>
<div className="grid grid-cols-2 gap-md">
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Make</label>
<select className="h-10 px-md border border-outline-variant rounded-[5px] bg-white focus:border-secondary outline-none font-body-md">
<option value="">Select Make</option>
<option>Toyota</option>
<option>BMW</option>
<option>Mercedes-Benz</option>
<option>Ford</option>
</select>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Model</label>
<select className="h-10 px-md border border-outline-variant rounded-[5px] bg-white focus:border-secondary outline-none font-body-md">
<option value="">Select Model</option>
</select>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Year</label>
<select className="h-10 px-md border border-outline-variant rounded-[5px] bg-white focus:border-secondary outline-none font-body-md">
<option value="">Select Year</option>
<option>2024</option>
<option>2023</option>
<option>2022</option>
</select>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Fuel Type</label>
<select className="h-10 px-md border border-outline-variant rounded-[5px] bg-white focus:border-secondary outline-none font-body-md">
<option value="">Select Fuel</option>
<option>Petrol</option>
<option>Diesel</option>
<option>Electric</option>
<option>Hybrid</option>
</select>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Vehicle Type</label>
<select className="h-10 px-md border border-outline-variant rounded-[5px] bg-white focus:border-secondary outline-none font-body-md">
<option value="">Select Type</option>
<option>Sedan</option>
<option>SUV</option>
<option>Hatchback</option>
<option>Truck</option>
</select>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Color</label>
<input className="h-10 px-md border border-outline-variant rounded-[5px] focus:border-secondary outline-none font-body-md" placeholder="e.g. Midnight Blue" type="text"/>
</div>
</div>
</section>
<!-- Registration Details Section -->
<section className="p-lg bg-surface-container-lowest border border-outline-variant rounded-lg">
<h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Registration Details</h2>
<div className="space-y-md">
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">Number Plate</label>
<input className="h-10 px-md border border-outline-variant rounded-[5px] focus:border-secondary outline-none font-body-md" placeholder="ABC-1234" type="text"/>
</div>
<div className="flex flex-col gap-xs">
<label className="font-label-md text-label-md">VIN / Chassis Number <span className="text-on-surface-variant font-normal opacity-60">(Optional)</span></label>
<input className="h-10 px-md border border-outline-variant rounded-[5px] focus:border-secondary outline-none font-body-md" placeholder="17-digit code" type="text"/>
</div>
</div>
</section>
<!-- Options -->
<div className="flex items-center gap-md">
<label className="flex items-center gap-sm cursor-pointer group">
<div className="relative flex items-center">
<input className="peer h-5 w-5 border-2 border-outline-variant rounded-[4px] checked:bg-secondary checked:border-secondary transition-all appearance-none cursor-pointer" type="checkbox"/>
<span className="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 text-[16px] left-1/2 -translate-x-1/2 pointer-events-none" style="font-variation-settings: 'wght' 700;">check</span>
</div>
<span className="font-body-md select-none group-hover:text-secondary transition-colors">Set as primary vehicle</span>
</label>
</div>
<!-- Actions -->
<div className="pt-md flex flex-col gap-md">
<a className="w-full bg-primary text-on-primary h-[54px] rounded-[5px] font-button-text text-button-text hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center justify-center" href="identity-verification.html">
                        Continue to identity verification
                    </a>
<a className="text-center font-body-md text-on-surface-variant hover:text-primary underline underline-offset-4 decoration-outline-variant transition-colors" href="dashboard.html">
                        Skip for now
                    </a>
</div>
</form>
</div>
</div>
<!-- Sidebar (Trust Signals) -->
<aside className="w-[380px] bg-white border-l border-outline-variant p-xl flex flex-col gap-lg sticky top-[54px] h-[calc(100vh-94px)] overflow-y-auto">
<div>
<h3 className="font-headline-sm text-headline-sm mb-md">Why add your vehicle?</h3>
<ul className="space-y-sm">
<li className="flex items-start gap-sm">
<span className="material-symbols-outlined text-[#1B5E20] mt-1" style="font-variation-settings: 'wght' 600;">check_circle</span>
<span className="font-body-sm text-on-surface-variant">Access precise digital service logs specifically for your model's engineering standards.</span>
</li>
<li className="flex items-start gap-sm">
<span className="material-symbols-outlined text-[#1B5E20] mt-1" style="font-variation-settings: 'wght' 600;">check_circle</span>
<span className="font-body-sm text-on-surface-variant">Receive automated safety recall alerts and preventative maintenance notifications.</span>
</li>
<li className="flex items-start gap-sm">
<span className="material-symbols-outlined text-[#1B5E20] mt-1" style="font-variation-settings: 'wght' 600;">check_circle</span>
<span className="font-body-sm text-on-surface-variant">Unlock 'Certified Fleet' status for higher resale valuation in the MechHub marketplace.</span>
</li>
</ul>
</div>
<!-- Encryption Info Box -->
<div className="bg-secondary-fixed text-on-secondary-fixed-variant p-md rounded-lg flex gap-md">
<span className="material-symbols-outlined text-[24px]">lock</span>
<div>
<h4 className="font-label-md text-label-md mb-1 uppercase">End-to-End Encryption</h4>
<p className="font-body-sm opacity-90">Your VIN and registration details are encrypted using AES-256 bank-grade security. MechHub never shares data with third-party advertisers.</p>
</div>
</div>
<!-- Privacy Note -->
<div className="flex items-center gap-xs py-sm border-t border-b border-outline-variant">
<span className="material-symbols-outlined text-[20px] text-on-surface-variant">shield</span>
<span className="font-body-sm text-on-surface-variant italic">GDPR &amp; CCPA Compliant Data Handling</span>
</div>
<!-- Bottom Image/Badge -->
<div className="mt-auto">
<div className="rounded-xl overflow-hidden mb-sm border border-outline-variant shadow-sm group">
<img alt="Precision Workshop Tools" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A macro close-up of high-end mechanical diagnostic tools and engine components in a professional, ultra-clean automotive workshop. The lighting is crisp and cool, reflecting off polished chrome surfaces and carbon fiber parts. The atmosphere communicates professional-grade precision and engineering excellence, using a palette of silver, deep blacks, and subtle technical blue glows. The image style is sharp, modern, and trustworthy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXo52ATf7NmlnSDQX5V_QQjVnb7JbSvHHnRzzHo608Wa_v-xIpX2XahNZN_vapoFLzWHi2nvNt2LGmnNNtaLnDmmqdsaRwpaIQZtwL1be7SyCDOeTgwbRbEWyBCydH1nqJyddOXhBE3neeRosbSB67rS48gjZRlNh4F-nCDXG-UoFw7OfQawWLplp-fzuaQLTx9vjSK4-Uu2p5BseyW4MOEfldJRQetuV2cQiSZ-L2UaEzDAJFZZdVGqfcfIkX6KjVyXxURiK-awY"/ />
</div>
<div className="flex flex-col items-center">
<span className="font-label-md text-label-md text-on-surface-variant opacity-70 tracking-tighter">WORKSHOP GRADE PRECISION</span>
<div className="w-12 h-[2px] bg-secondary mt-1"></div>
</div>
</div>
</aside>
</main>
<!-- Footer / UX Law Strip -->
<footer className="fixed bottom-0 w-full h-[40px] z-[60] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-between px-md">
<div className="font-label-md text-label-md text-tertiary">MechHub Design System v2.0</div>
<div className="font-body-sm text-body-sm text-tertiary">
        Applied: <span className="font-bold">Hick's Law</span> - Reducing choices for faster decision making.
    </div>
<div className="flex gap-md">
<a className="font-body-sm text-body-sm text-tertiary hover:underline opacity-80" href="#">Documentation</a>
<a className="font-body-sm text-body-sm text-tertiary hover:underline opacity-80" href="#">UX Research</a>
</div>
</footer>
<!-- Interactive Micro-Interactions -->


    </>
  );
}

