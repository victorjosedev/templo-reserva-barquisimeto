import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles,
  Bus,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowDown
} from 'lucide-react';

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
      
      {/* Compact Temple Hero Header */}
      <div className="relative bg-gradient-to-r from-[#0a1c33] via-[#0f294a] to-[#143966] rounded-3xl shadow-xl text-white overflow-hidden border border-amber-400/30 transition-all duration-300">
        
        {/* Background Temple Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/templo_caracas.jpg"
            alt="Templo de Caracas Venezuela"
            className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1c33]/95 via-[#0f294a]/90 to-[#0f294a]/85" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-3.5 sm:p-5">
          
          {/* If Collapsed: High density single strip */}
          {isCollapsed ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                  Estaca Barquisimeto
                </span>
                <span className="font-extrabold text-white text-sm">Viaje al Santo Templo</span>
                <span className="text-white/40 hidden sm:inline">•</span>
                <span className="text-blue-200">📅 {tripInfo?.date} (04:30 AM)</span>
                <span className="text-white/40 hidden sm:inline">•</span>
                <span className="text-amber-300 font-bold font-mono">💵 ${tripInfo?.priceUsd || 20} (Bs. {priceBs.toFixed(2)})</span>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={onScrollToBus}
                  className="inline-flex items-center space-x-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-[#0f294a] px-3 py-1.5 rounded-xl font-black shadow-xs transition"
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Ver Mapa de Asientos</span>
                </button>

                <button
                  onClick={onOpenPagoDetails}
                  className="inline-flex items-center space-x-1 text-[11px] text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl border border-white/15 font-bold transition"
                  title="Ver itinerario, normas y datos de pago móvil"
                >
                  <Info className="w-3.5 h-3.5 text-amber-300" />
                  <span>Detalles del Viaje</span>
                </button>
              </div>
            </div>
          ) : (
            /* If Expanded: Full clean header with collapse option */
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                {/* Left: Title & Purpose */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between md:justify-start space-x-2">
                    <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Estaca Barquisimeto • Viaje al Santo Templo</span>
                    </div>

                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="md:hidden text-[10px] text-blue-200 hover:text-white flex items-center space-x-0.5"
                    >
                      <span>Minimizar</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    Reserva de Asientos en el Autobús
                  </h2>

                  <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                    Estimado hermano(a): Toque el asiento que desea en el mapa para <strong>apartarlo por 35 minutos</strong> y reportar su Pago Móvil con calma.
                  </p>
                </div>

                {/* Right: Key Pills & Action */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
                  
                  {/* Pricing & Free count */}
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 flex items-baseline space-x-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Pasaje</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xl sm:text-2xl font-black text-amber-400">${tripInfo?.priceUsd || 20}</span>
                        <span className="text-xs text-white/80 font-mono">/ Bs. {priceBs.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pl-3 border-l border-white/15 text-right">
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Disponibles</span>
                      <span className="text-sm sm:text-base font-black text-emerald-400">
                        {availableCount} de {totalSeats}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <button
                      onClick={onOpenPagoDetails}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl border border-white/15 font-bold transition"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-300" />
                      <span>Cuentas & Términos</span>
                    </button>

                    <button
                      onClick={onScrollToBus}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0f294a] px-3.5 py-2 rounded-xl font-black shadow-md transition transform active:scale-95"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span>Ver Mapa de Asientos</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Quick Schedule Strip with minimize link */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-200">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tripInfo?.date || 'Sábado 24 Octubre 2026'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Salida: {tripInfo?.departureTime || '04:30 AM'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tripInfo?.meetingPoint || 'Capilla de Estaca'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className="hidden md:inline-flex items-center space-x-1 text-[10px] text-blue-300 hover:text-white transition"
                >
                  <span>Minimizar resumen</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
