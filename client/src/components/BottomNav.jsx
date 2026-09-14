import React from 'react';
import { Bus, Search, CreditCard, ShieldCheck, CheckSquare } from 'lucide-react';

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f294a]/95 backdrop-blur-md border-t border-amber-500/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe">
      <div className="grid grid-cols-4 h-16">
        
        {/* Tab 1: Autobús / Asientos */}
        <button
          onClick={onSelectTab}
          className="flex flex-col items-center justify-center space-y-1 text-white hover:text-amber-300 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
            <Bus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Asientos</span>
        </button>

        {/* Tab 2: Mi Reserva (Badge sobre el ícono si tiene asiento apartado) */}
        <button
          onClick={onReportPayment}
          className={`flex flex-col items-center justify-center space-y-1 transition relative ${
            hasLockedSeat ? 'text-amber-300' : 'text-blue-100 hover:text-amber-300'
          }`}
        >
          <div className="relative">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              hasLockedSeat ? 'bg-amber-400 text-[#0f294a] shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-white/10 text-blue-200'
            }`}>
              <CheckSquare className="w-4 h-4" />
            </div>
            {hasLockedSeat && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-400 text-[#0f294a] text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#0f294a] shadow leading-none animate-pulse">
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
          className="flex flex-col items-center justify-center space-y-1 text-blue-100 hover:text-amber-300 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Mi Boleto</span>
        </button>

        {/* Tab 4: Líderes / Admin */}
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center space-y-1 text-amber-300 hover:text-amber-200 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Líderes</span>
        </button>

      </div>
    </nav>
  );
}
