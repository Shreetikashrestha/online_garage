// Stitch-generated: RemoteInspection
export default function RemoteInspection() {
  return (
    <>
<!-- TopNavBar (Simulated Shell) -->
<header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
<div className="flex items-center gap-md">
<span className="font-headline-lg text-headline-lg font-bold text-primary">Online Garage</span>
<div className="h-6 w-[1px] bg-outline-variant mx-sm"></div>
<span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Live SOS: Abnormal Grinding</span>
</div>
<div className="flex items-center gap-md">
<button className="flex items-center gap-xs px-md py-sm bg-[#B71C1C] text-white font-button-text text-button-text rounded-[5px] shadow-lg">
<span className="material-symbols-outlined text-[20px]">emergency</span>
                🚨 SOS Help
            </button>
<div className="flex gap-sm">
<span className="material-symbols-outlined text-on-surface-variant p-sm hover:bg-surface-container rounded-full transition-colors cursor-pointer">notifications</span>
<span className="material-symbols-outlined text-on-surface-variant p-sm hover:bg-surface-container rounded-full transition-colors cursor-pointer">support_agent</span>
</div>
</div>
</header>
<!-- Main Workspace -->
<main className="flex flex-1 pt-16 pb-10 overflow-hidden">
<!-- Left Section: Video Feed -->
<section className="flex-1 relative bg-black flex flex-col items-center justify-center m-lg rounded-xl overflow-hidden shadow-xl">
<div className="absolute inset-0 w-full h-full">
<img className="w-full h-full object-cover" data-alt="A cinematic, high-definition portrait of a professional mechanic named Marcus Chen wearing a clean dark grey workshop uniform with 'Online Garage' branding. He is looking directly into the camera with a reassuring, calm expression in a brightly lit, high-tech automotive service center. The background features blurred diagnostic screens and precision tool racks, maintaining a modern corporate and trustworthy aesthetic with soft ambient lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVRN9owNJSuhbcOZZ_UfPQbt_ubeACSZVeLxAsMTJqMCCh5ETO4iamdszBEzzy_PRcYZRLDLqpEoQtIgHa_h6vDBD_nXUm6tAsFSj4XjXByBFjRwpKfMQmlxGfyWHVnOcD84LG5uqjk-pyvSML97L-XiEbi6lnnwB69zD4ntwOy38PWehE-PM7yAYpm0uHD9_aRx7vKZZzQi_ggAq-Uc-svVF5hnfnUzWc_6k8psw4IgzY0-N3d3ZfWLsjZjexHHMHJDnOcTgqTM8"/ />
</div>
<!-- Video UI Overlays -->
<div className="absolute top-lg left-lg bg-black/40 backdrop-blur-md px-md py-sm rounded-lg flex items-center gap-sm border border-white/20">
<div className="w-3 h-3 bg-red-600 rounded-full pulse-red"></div>
<span className="text-white font-label-md text-label-md uppercase tracking-wider">Live Connection • Marcus Chen</span>
</div>
<div className="absolute bottom-0 left-0 w-full h-1/3 mechanic-video-overlay flex items-end p-xl">
<div className="flex items-center gap-xl w-full justify-between">
<div className="flex flex-col gap-xs">
<h2 className="text-white font-headline-md text-headline-md">Visual Inspection Required</h2>
<p className="text-white/80 font-body-sm text-body-sm max-w-md">"Please point your camera towards the front left wheel assembly. I need to check for mechanical interference."</p>
</div>
<!-- Call Controls -->
<div className="flex gap-md items-center">
<button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all">
<span className="material-symbols-outlined">mic</span>
</button>
<button className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white/10 group">
<span className="material-symbols-outlined text-[32px]">photo_camera</span>
<div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-md py-xs rounded text-xs whitespace-nowrap">Start Visual Scan</div>
</button>
<button className="w-14 h-14 rounded-full bg-[#B71C1C] text-white flex items-center justify-center shadow-lg hover:bg-red-800 transition-all">
<span className="material-symbols-outlined">call_end</span>
</button>
</div>
</div>
</div>
</section>
<!-- Right Panel: Data & Chat -->
<aside className="w-[420px] h-full pr-lg py-lg flex flex-col gap-lg">
<!-- Active Diagnostic Data -->
<div className="bg-white rounded-xl border border-outline-variant p-lg shadow-sm">
<div className="flex justify-between items-center mb-md">
<h3 className="font-headline-sm text-headline-sm text-primary">Active Diagnostics</h3>
<span className="px-sm py-xs bg-red-100 text-[#B71C1C] rounded-full font-label-md text-label-md uppercase">Criticality: High</span>
</div>
<div className="space-y-md">
<!-- Thermal Meter -->
<div className="space-y-sm">
<div className="flex justify-between text-on-surface-variant">
<span className="font-label-md">Engine Thermal Load</span>
<span className="font-label-md text-error">102°C</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-error rounded-full" style="width: 88%;"></div>
</div>
</div>
<!-- Battery Health -->
<div className="space-y-sm">
<div className="flex justify-between text-on-surface-variant">
<span className="font-label-md">Battery Output Stability</span>
<span className="font-label-md text-secondary">94%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full" style="width: 94%;"></div>
</div>
</div>
<div className="grid grid-cols-2 gap-md pt-sm">
<div className="bg-surface-container-low p-md rounded-lg">
<p className="font-label-md text-on-surface-variant mb-xs">Acoustic Signal</p>
<p className="font-headline-sm text-primary">Grinding</p>
</div>
<div className="bg-surface-container-low p-md rounded-lg">
<p className="font-label-md text-on-surface-variant mb-xs">Wheel RPM</p>
<p className="font-headline-sm text-primary">0 km/h</p>
</div>
</div>
</div>
</div>
<!-- Chat Window -->
<div className="flex-1 bg-white rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
<div className="p-md border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
<span className="font-headline-sm text-[16px] text-primary">Remote Troubleshooting</span>
<span className="material-symbols-outlined text-outline cursor-pointer">settings</span>
</div>
<div className="flex-1 p-md space-y-md overflow-y-auto bg-background">
<!-- Message -->
<div className="flex flex-col items-start max-w-[85%]">
<div className="bg-white border border-outline-variant p-md rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm">
<p className="font-body-sm text-body-sm">I've received your diagnostic packet. The grinding sound you noted at low speeds is likely the brake pad sensor or a seized caliper.</p>
</div>
<span className="mt-xs font-label-md text-[10px] text-outline">MARCUS • 14:22</span>
</div>
<!-- User Message -->
<div className="flex flex-col items-end w-full">
<div className="bg-primary text-white p-md rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm max-w-[85%]">
<p className="font-body-sm text-body-sm">Got it. I'm standing by the front wheel now. Initiating visual scan.</p>
</div>
<span className="mt-xs font-label-md text-[10px] text-outline">YOU • 14:23</span>
</div>
<!-- System Event -->
<div className="flex justify-center">
<div className="bg-secondary/10 px-md py-xs rounded-full border border-secondary/20">
<p className="font-label-md text-secondary">Diagnostic Stream Active</p>
</div>
</div>
</div>
<div className="p-md bg-white border-t border-outline-variant">
<div className="relative flex items-center">
<input className="w-full pl-md pr-xl py-md bg-surface-container-low border-outline-variant rounded-[5px] focus:ring-1 focus:ring-secondary focus:border-secondary font-body-sm text-body-sm transition-all outline-none" placeholder="Type a message..." type="text"/>
<button className="absolute right-md text-primary hover:text-secondary transition-colors">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
</div>
<!-- Primary Action -->
<button className="w-full bg-primary text-white font-button-text text-button-text py-xl rounded-[5px] shadow-xl hover:bg-[#333] transition-all flex items-center justify-center gap-md active:scale-[0.98]">
<span className="material-symbols-outlined">center_focus_strong</span>
                START VISUAL SCAN
            </button>
</aside>
</main>
<!-- UX Law Strip -->
<div className="ux-law-strip">
<p className="font-body-sm text-body-sm text-[#856404]">Applied: Fitts's Law (Sized &amp; positioned 'Start Visual Scan' for rapid acquisition) &amp; Aesthetic-Usability Effect</p>
</div>


    </>
  );
}

