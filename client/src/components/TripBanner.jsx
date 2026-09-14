import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bus, 
  Info, 
  CaretUp, 
  CaretDown,
  Coins
} from '@phosphor-icons/react';

export default function TripBanner({ 
  tripInfo, 
  seats = [], 
  hasActiveLock = false,
  onOpenPagoDetails, 
  onScrollToBus 
}) {
  // If user already has a seat locked, collapse by default to put the bus right at top
  const [isCollapsed, setIsCollapsed] = useState(hasActiveLock);

  const availableCount = seats.filter(s => s.status === 'disponible').length;
  const totalSeats = seats.length || 60;
  const priceBs = tripInfo ? Math.round(tripInfo.priceUsd * tripInfo.exchangeRate * 100) / 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1">
      
      {/* Temple Hero Header with Navy tokens */}
      <div className="relative bg-gradient-to-r from-[#0E1E3A] via-[#1B2F52] to-[#0E1E3A] rounded-3xl shadow-xl text-white overflow-hidden border border-white/10 transition-all duration-300">
        
        {/* Background Temple Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/templo_caracas.jpg"
            alt="Templo de Caracas Venezuela"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E1E3A]/95 via-[#1B2F52]/90 to-[#0E1E3A]/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6">
          
          {/* If Collapsed: High density single strip */}
          {isCollapsed ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/10 text-slate-200 border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-display">
                  Estaca Barquisimeto
                </span>
                <span className="font-bold text-white text-sm font-display">Viaje al Santo Templo</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <div className="flex items-center space-x-1 text-slate-300">
                  <Calendar size={13} weight="bold" />
                  <span>{tripInfo?.date} ({tripInfo?.departureTime || '04:30 AM'})</span>
                </div>
                <span className="text-white/30 hidden sm:inline">•</span>
                <div className="flex items-center space-x-1 text-white font-mono font-bold">
                  <Coins size={13} weight="bold" className="text-slate-300" />
                  <span>${tripInfo?.priceUsd || 20} (Bs. {priceBs.toFixed(2)})</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={onScrollToBus}
                  className="inline-flex items-center space-x-1.5 text-xs bg-[#C9962F] hover:bg-[#A97B22] text-white px-3.5 py-1.5 rounded-xl font-bold shadow-sm transition transform active:scale-95"
                >
                  <Bus size={15} weight="bold" />
                  <span>Ver Mapa de Asientos</span>
                </button>

                <button
                  onClick={onOpenPagoDetails}
                  className="inline-flex items-center space-x-1 text-[11px] text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl border border-white/15 font-semibold transition"
                  title="Ver itinerario, normas y datos de pago móvil"
                >
                  <Info size={14} weight="bold" />
                  <span>Detalles del Viaje</span>
                </button>
              </div>
            </div>
          ) : (
            /* If Expanded: Full clean header with collapse option */
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                {/* Left: Title & Purpose */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between md:justify-start space-x-2">
                    {/* Guided flow indicator */}
                    <div className="inline-flex items-center space-x-2 bg-white/10 text-slate-200 border border-white/20 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Paso 1 de 2: Elige tu asiento en el mapa</span>
                    </div>

                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="md:hidden text-[10px] text-slate-300 hover:text-white flex items-center space-x-0.5"
                    >
                      <span>Minimizar</span>
                      <CaretUp size={12} weight="bold" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight font-display">
                    Reserva de Asientos en el Autobús
                  </h2>

                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Estimado hermano(a): Toque el asiento que desea en el mapa para <strong>apartarlo por 35 minutos</strong> y reportar su Pago Móvil con calma.
                  </p>
                </div>

                {/* Right: Key Pills & Action */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
                  
                  {/* Pricing & Free count */}
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-baseline space-x-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">Pasaje</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xl sm:text-2xl font-bold text-white font-display">${tripInfo?.priceUsd || 20}</span>
                        <span className="text-xs text-slate-300 font-mono">/ Bs. {priceBs.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pl-4 border-l border-white/15 text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">Disponibles</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                        {availableCount} de {totalSeats}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (Gold strictly reserved for primary CTA) */}
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <button
                      onClick={onOpenPagoDetails}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl border border-white/15 font-semibold transition"
                    >
                      <Info size={15} weight="bold" />
                      <span>Cuentas & Normas</span>
                    </button>

                    <button
                      onClick={onScrollToBus}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 text-xs bg-[#C9962F] hover:bg-[#A97B22] text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition transform active:scale-95"
                    >
                      <Bus size={16} weight="bold" />
                      <span>Ver Mapa de Asientos</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Quick Schedule Strip */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={14} weight="bold" className="text-slate-300" />
                    <span>{tripInfo?.date || 'Sábado 24 Octubre 2026'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1.5">
                    <Clock size={14} weight="bold" className="text-slate-300" />
                    <span className="font-mono">Salida: {tripInfo?.departureTime || '04:30 AM'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={14} weight="bold" className="text-slate-300" />
                    <span>{tripInfo?.meetingPoint || 'Capilla de Estaca'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className="hidden md:inline-flex items-center space-x-1 text-[10px] text-slate-400 hover:text-white transition"
                >
                  <span>Minimizar resumen</span>
                  <CaretUp size={12} weight="bold" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
