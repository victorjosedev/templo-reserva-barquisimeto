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
          
          {/* Logo & Stake Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30 text-[#0f294a] shrink-0">
              <Bus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  Estaca Barquisimeto
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-[11px] text-blue-200 hidden sm:inline font-medium">9 Barrios</span>
              </div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Viaje al Santo Templo</span>
              </h1>
            </div>
          </div>

          {/* Center Info Badge (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center space-x-1.5 text-blue-100">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{tripInfo?.date || 'Sábado 24 de Octubre'}</span>
            </div>
            <span className="text-white/40">|</span>
            <div className="flex items-center space-x-1.5 text-blue-100">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Salida: {tripInfo?.departureTime || '04:30 AM'}</span>
            </div>
          </div>

          {/* Desktop Navigation Buttons (Hidden on mobile to avoid clutter; mobile uses bottom app bar) */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Consultar Reserva */}
            <button
              onClick={onOpenLookup}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition duration-150 border border-white/15 shadow-xs"
              title="Buscar mi asiento con mi cédula o teléfono"
            >
              <Search className="w-3.5 h-3.5 text-amber-300" />
              <span>Consultar Boleto</span>
            </button>

            {/* Info & Pago Móvil */}
            <button
              onClick={onOpenTripDetails}
              className="flex items-center space-x-1.5 bg-blue-900/60 hover:bg-blue-800/80 text-blue-100 px-3.5 py-2 rounded-xl text-xs font-semibold transition duration-150 border border-blue-400/30 shadow-xs"
            >
              <Info className="w-3.5 h-3.5 text-amber-300" />
              <span>Info & Pago Móvil</span>
            </button>

            {/* Admin / Tesorero */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0f294a] px-3.5 py-2 rounded-xl text-xs font-black shadow-md transition duration-150"
              title="Panel de verificación para líderes y tesorero"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Líderes</span>
            </button>
          </div>

          {/* Mobile Right: Quick Temple destination badge */}
          <div className="md:hidden flex items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
              Templo Caracas
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
