import React from 'react';
import { Bus, Search, Info, ShieldCheck, Calendar, Clock, Sparkles } from 'lucide-react';

export default function Navbar({
  tripInfo,
  onOpenLookup,
  onOpenTripDetails,
  onOpenAdmin
}) {
  return (
    <header className="bg-[#0f294a] text-white shadow-xl sticky top-0 z-30 border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Institutional Wordmark */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-amber-400 uppercase font-display leading-tight">
              ESTACA BARQUISIMETO
            </span>
            <div className="w-10 h-[1.5px] bg-gradient-to-r from-amber-400 via-amber-300 to-transparent my-1"></div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-white font-display">
                Viaje al Santo Templo
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-blue-200 border border-white/15">
                Templo Caracas
              </span>
            </div>
          </div>

          {/* Center Info Badge (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center space-x-1.5 text-blue-100">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>{tripInfo?.date || 'Sábado 24 de Octubre'}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center space-x-1.5 text-blue-100">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>Salida: {tripInfo?.departureTime || '04:30 AM'}</span>
            </div>
          </div>

          {/* Desktop Navigation Buttons (Gold reserved for primary action!) */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Consultar Reserva */}
            <button
              onClick={onOpenLookup}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/15 text-white px-3 py-2 rounded-xl text-xs font-semibold transition border border-white/15 shadow-xs"
              title="Buscar mi asiento con mi cédula o teléfono"
            >
              <Search className="w-3.5 h-3.5 text-blue-200" />
              <span>Consultar Boleto</span>
            </button>

            {/* Info & Pago Móvil */}
            <button
              onClick={onOpenTripDetails}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/15 text-white px-3 py-2 rounded-xl text-xs font-semibold transition border border-white/15 shadow-xs"
            >
              <Info className="w-3.5 h-3.5 text-blue-200" />
              <span>Info de Viaje</span>
            </button>

            {/* Admin / Tesorero (Secondary dignified styling, no competing gold) */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-blue-200 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-600/50 shadow-xs transition"
              title="Panel de verificación para líderes y tesorero"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>Líderes</span>
            </button>
          </div>

          {/* Mobile Right: Single clean destination badge */}
          <div className="md:hidden flex items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-blue-200 border border-white/20 px-2.5 py-1 rounded-full font-display">
              Templo Caracas
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
