// Stitch-generated: OrderHistory
export default function OrderHistory() {
  return (
    <>
<!-- SideNavBar (Shared Component) -->
<aside className="fixed left-0 top-0 h-full w-[280px] bg-tertiary dark:bg-tertiary-container border-r border-outline-variant flex flex-col h-full overflow-y-auto px-4 py-8 z-50">
<div className="mb-xxl flex items-center gap-3">
<div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
<span className="material-symbols-outlined text-on-secondary" style="font-variation-settings: 'FILL' 1;">garage</span>
</div>
<div>
<h1 className="font-headline-md text-headline-md font-bold text-on-tertiary">Online Garage</h1>
<p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant">Professional Workshop</p>
</div>
</div>
<nav className="flex-1 space-y-2">
<!-- Navigation Items Mapping -->
<a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span>Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200" href="#">
<span className="material-symbols-outlined">directions_car</span>
<span>My Vehicles</span>
</a>
<!-- Active State: Order History -->
<a className="flex items-center gap-3 px-4 py-3 border-l-4 border-secondary text-on-tertiary font-bold bg-surface-variant/10 transition-colors duration-200" href="#">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">history</span>
<span>Order History</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200" href="#">
<span className="material-symbols-outlined">extension</span>
<span>Compatibility</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span>Invoices</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-tertiary-fixed-variant hover:bg-surface-variant/20 hover:text-on-tertiary transition-colors duration-200" href="#">
<span className="material-symbols-outlined">settings</span>
<span>Account Settings</span>
</a>
</nav>
<div className="mt-auto pt-8 border-t border-outline-variant/20 flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-variant/30 overflow-hidden">
<img alt="Workshop Manager Profile" className="w-full h-full object-cover" data-alt="A professional portrait of a workshop manager in a modern garage environment. He is wearing a clean charcoal grey mechanic's uniform with a professional embroidered logo. The lighting is bright and clear, reflecting a high-end corporate workshop style with soft shadows and a focused, reliable expression." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGefNmPTyxW2Nmjkf4NtrJ5viMHGj815loHlqX54ir4GloZ2tNJ4oEt0YXkuYWHYQ1J_TPDaHxZqkccTcMrtMGA7UgNbtHM4jUBUx9qxd9r2iHavMo0BWuQ1gTfRuT3ML3gt_yLJItPCjjsUYglonWPlnjOBW7P3QAuzFtnSSnEptVjdvWxTne1jMrBDqM52JsHJ5GJSp1Y9M43_fbjSh2pMweUT29_41evKidNOGqO0Ubm0Vk_oDfa4_-rru5vAv-tHu9TPwSxVU"/ />
</div>
<div>
<p className="text-on-tertiary font-bold text-body-sm">Alex Rivera</p>
<p className="text-on-tertiary-fixed-variant text-label-md">Manager ID: #9942</p>
</div>
</div>
</aside>
<!-- TopNavBar (Shared Component) -->
<header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface dark:bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-lg z-40">
<div className="flex items-center gap-md">
<h2 className="font-headline-sm text-headline-sm font-bold text-primary">Order History</h2>
<div className="hidden md:flex gap-md ml-lg">
<a className="text-on-surface-variant font-label-md hover:text-secondary transition-all" href="#">Dashboard</a>
<a className="text-on-surface-variant font-label-md hover:text-secondary transition-all" href="#">Vehicles</a>
<a className="text-on-surface-variant font-label-md hover:text-secondary transition-all" href="#">Support</a>
</div>
</div>
<div className="flex items-center gap-lg">
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-sm focus:border-secondary focus:ring-0 transition-all" placeholder="Search orders..." type="text"/>
</div>
<button className="bg-[#B71C1C] text-white px-md py-2 rounded-[5px] font-button-text text-button-text hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">emergency_home</span> SOS Help
            </button>
</div>
</header>
<!-- Main Content -->
<main className="ml-[280px] mt-16 p-lg h-[calc(100vh-104px)] overflow-y-auto custom-scrollbar">
<!-- Filter Bar -->
<div className="bg-white border border-outline-variant rounded-lg p-md mb-lg flex flex-wrap items-center justify-between gap-md shadow-sm">
<div className="flex flex-wrap items-center gap-md">
<div className="flex flex-col gap-1">
<span className="font-label-md text-on-surface-variant">SERVICE TYPE</span>
<select className="bg-surface-container-low border border-outline-variant rounded-[5px] px-md py-2 text-body-sm min-w-[160px] focus:border-secondary outline-none">
<option>All Services</option>
<option>Mechanical</option>
<option>Towing</option>
<option>Spare Parts</option>
</select>
</div>
<div className="flex flex-col gap-1">
<span className="font-label-md text-on-surface-variant">DATE RANGE</span>
<div className="flex items-center gap-2">
<input className="bg-surface-container-low border border-outline-variant rounded-[5px] px-md py-2 text-body-sm focus:border-secondary outline-none" type="date"/>
<span className="text-on-surface-variant">to</span>
<input className="bg-surface-container-low border border-outline-variant rounded-[5px] px-md py-2 text-body-sm focus:border-secondary outline-none" type="date"/>
</div>
</div>
<div className="flex flex-col gap-1">
<span className="font-label-md text-on-surface-variant">VEHICLE</span>
<select className="bg-surface-container-low border border-outline-variant rounded-[5px] px-md py-2 text-body-sm min-w-[160px] focus:border-secondary outline-none">
<option>All Vehicles</option>
<option>Toyota Hilux (MH-12-8822)</option>
<option>Mahindra Thar (KA-01-4433)</option>
</select>
</div>
</div>
<button className="mt-4 sm:mt-0 flex items-center gap-2 px-lg py-2 border border-outline-variant rounded-[5px] hover:bg-surface-container transition-colors text-body-md font-semibold">
<span className="material-symbols-outlined text-[18px]">filter_list</span> Apply Filters
            </button>
</div>
<!-- Orders Table Card -->
<div className="bg-white border border-outline-variant rounded-lg overflow-hidden shadow-sm">
<div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
<h3 className="font-headline-sm text-headline-sm text-primary">Service Logs</h3>
<button className="text-secondary font-label-md flex items-center gap-1 hover:underline">
<span className="material-symbols-outlined text-[16px]">download</span> Export CSV
                </button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant">
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Service Type</th>
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Vehicle Details</th>
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Service Provider</th>
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Amount</th>
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
<th className="px-lg py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
<!-- Entry 1 -->
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="px-lg py-4">
<div className="text-body-md font-semibold">Oct 12, 2023</div>
<div className="text-label-md text-on-surface-variant">10:45 AM</div>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">build</span>
<span className="text-body-md">Mechanical</span>
</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-medium">Toyota Hilux</div>
<div className="text-label-md text-on-surface-variant">White • MH-12-AE-8822</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md">Apex Auto Solutions</div>
<div className="text-label-md text-on-surface-variant">Verified Workshop</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-bold">₹14,500.00</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-[#1B5E20]/10 text-[#1B5E20] rounded-full text-label-md font-bold uppercase tracking-tight">Completed</span>
</td>
<td className="px-lg py-4 text-right">
<button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">visibility</span>
</button>
</td>
</tr>
<!-- Entry 2 -->
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="px-lg py-4">
<div className="text-body-md font-semibold">Oct 08, 2023</div>
<div className="text-label-md text-on-surface-variant">02:15 PM</div>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">art_track</span>
<span className="text-body-md">Towing</span>
</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-medium">Mahindra Thar</div>
<div className="text-label-md text-on-surface-variant">Black • KA-01-MT-4433</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md">Rapid Rescue Towing</div>
<div className="text-label-md text-on-surface-variant">Emergency Unit</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-bold">₹4,200.00</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-[#1B5E20]/10 text-[#1B5E20] rounded-full text-label-md font-bold uppercase tracking-tight">Completed</span>
</td>
<td className="px-lg py-4 text-right">
<button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">visibility</span>
</button>
</td>
</tr>
<!-- Entry 3 -->
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="px-lg py-4">
<div className="text-body-md font-semibold">Sep 28, 2023</div>
<div className="text-label-md text-on-surface-variant">11:30 AM</div>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">settings_input_component</span>
<span className="text-body-md">Spare Parts</span>
</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-medium">Toyota Hilux</div>
<div className="text-label-md text-on-surface-variant">White • MH-12-AE-8822</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md">Genuine Motors Hub</div>
<div className="text-label-md text-on-surface-variant">Retail Partner</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-bold">₹8,900.00</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-[#B71C1C]/10 text-[#B71C1C] rounded-full text-label-md font-bold uppercase tracking-tight">Refunded</span>
</td>
<td className="px-lg py-4 text-right">
<button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">visibility</span>
</button>
</td>
</tr>
<!-- Entry 4 -->
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="px-lg py-4">
<div className="text-body-md font-semibold">Sep 15, 2023</div>
<div className="text-label-md text-on-surface-variant">09:00 AM</div>
</td>
<td className="px-lg py-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">build</span>
<span className="text-body-md">Mechanical</span>
</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-medium">Mahindra Thar</div>
<div className="text-label-md text-on-surface-variant">Black • KA-01-MT-4433</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md">Precision Gearbox Works</div>
<div className="text-label-md text-on-surface-variant">Verified Workshop</div>
</td>
<td className="px-lg py-4">
<div className="text-body-md font-bold">₹22,100.00</div>
</td>
<td className="px-lg py-4">
<span className="px-3 py-1 bg-[#1B5E20]/10 text-[#1B5E20] rounded-full text-label-md font-bold uppercase tracking-tight">Completed</span>
</td>
<td className="px-lg py-4 text-right">
<button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">visibility</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
<p className="text-body-sm text-on-surface-variant">Showing 4 of 128 orders</p>
<div className="flex items-center gap-2">
<button className="px-3 py-1 border border-outline-variant rounded-[5px] disabled:opacity-50" disabled="">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="px-3 py-1 bg-primary text-white border border-primary rounded-[5px]">1</button>
<button className="px-3 py-1 border border-outline-variant rounded-[5px]">2</button>
<button className="px-3 py-1 border border-outline-variant rounded-[5px]">3</button>
<span className="px-2">...</span>
<button className="px-3 py-1 border border-outline-variant rounded-[5px]">32</button>
<button className="px-3 py-1 border border-outline-variant rounded-[5px]">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Featured Breakdown (Bento Style) -->
<div className="mt-lg grid grid-cols-1 md:grid-cols-3 gap-lg">
<div className="bg-white border border-outline-variant rounded-lg p-lg shadow-sm">
<div className="flex items-center justify-between mb-md">
<span className="font-label-md text-on-surface-variant">TOTAL SPENT (Q3)</span>
<span className="material-symbols-outlined text-secondary">payments</span>
</div>
<div className="text-headline-lg font-bold">₹49,700</div>
<div className="text-body-sm text-[#1B5E20] mt-2 flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[16px]">trending_up</span> 12% from last quarter
                </div>
</div>
<div className="bg-white border border-outline-variant rounded-lg p-lg shadow-sm">
<div className="flex items-center justify-between mb-md">
<span className="font-label-md text-on-surface-variant">MOST USED SERVICE</span>
<span className="material-symbols-outlined text-secondary">build</span>
</div>
<div className="text-headline-lg font-bold">Mechanical</div>
<div className="text-body-sm text-on-surface-variant mt-2">64% of total orders</div>
</div>
<div className="bg-primary text-white border border-primary rounded-lg p-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="relative z-10">
<div className="flex items-center justify-between mb-md">
<span className="font-label-md text-primary-fixed">UPCOMING SERVICE</span>
<span className="material-symbols-outlined text-secondary-fixed">event</span>
</div>
<div className="text-headline-sm font-bold">Toyota Hilux Oil Change</div>
<div className="text-body-sm text-primary-fixed mt-2">Scheduled for Oct 25, 2023</div>
</div>
<button className="mt-lg relative z-10 w-full py-2 bg-secondary text-white rounded-[5px] font-button-text hover:brightness-110 transition-all">Reschedule</button>
<!-- Decorative element -->
<div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
<span className="material-symbols-outlined text-[120px]">garage</span>
</div>
</div>
</div>
</main>
<!-- UX Law Strip -->
<div className="fixed bottom-0 left-0 w-full h-[40px] bg-[#FFF9E6] border-t border-[#E0C040] flex items-center justify-center z-[60]">
<span className="text-body-sm text-[#856404] font-medium uppercase tracking-widest">Applied: Serial Position Effect (Key actions at edges of lists)</span>
</div>
<!-- Micro-interaction Script -->


    </>
  );
}

