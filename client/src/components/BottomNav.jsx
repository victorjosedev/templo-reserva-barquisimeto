import React from 'react';
import { Bus, MagnifyingGlass, ShieldCheck, Ticket } from '@phosphor-icons/react';

export default function BottomNav({
  hasLockedSeat,
  lockedSeatLabel,
  onSelectTab,
  onReportPayment,
  onOpenLookup,
  onOpenTripDetails,
  onOpenAdmin
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1E3A]/95 backdrop-blur-md border-t border-[#1B2F52] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe">
      <div className="grid grid-cols-4 h-16">
        
        {/* Tab 1: Autobús / Asientos */}
        <button
          onClick={onSelectTab}
          className="flex flex-col items-center justify-center space-y-1 text-slate-200 hover:text-white transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200">
            <Bus size={18} weight="bold" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Asientos</span>
        </button>

        {/* Tab 2: Mi Reserva (Gold reserved if user has active lock needing action) */}
        <button
          onClick={onReportPayment}
          className={`flex flex-col items-center justify-center space-y-1 transition relative cursor-pointer ${
            hasLockedSeat ? 'text-[#C9962F]' : 'text-slate-200 hover:text-white'
          }`}
        >
          <div className="relative">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              hasLockedSeat ? 'bg-[#C9962F] text-white shadow-md' : 'bg-white/10 text-slate-200'
            }`}>
              <Ticket size={18} weight="bold" />
            </div>
            {hasLockedSeat && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#C9962F] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0E1E3A] shadow leading-none animate-pulse">
                {lockedSeatLabel}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">
            Mi Reserva
          </span>
        </button>

        {/* Tab 3: Consultar Mi Boleto */}
        <button
          onClick={onOpenLookup}
          className="flex flex-col items-center justify-center space-y-1 text-slate-200 hover:text-white transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200">
            <MagnifyingGlass size={18} weight="bold" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Mi Boleto</span>
        </button>

        {/* Tab 4: Líderes / Admin (Dignified secondary navy/slate, no competing gold) */}
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-300">
            <ShieldCheck size={18} weight="bold" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Líderes</span>
        </button>

      </div>
    </nav>
  );
}
