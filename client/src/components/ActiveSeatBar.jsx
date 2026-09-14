import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export default function ActiveSeatBar({
  lockData,
  seat,
  onContinueReservation,
  onReleaseSeat
}) {
  if (!lockData || !seat) return null;

  // Format countdown as "34 min 02 seg" for unambiguous readability
  const formatTimerDetailed = (seconds) => {
    if (!seconds || seconds <= 0) return '00 min 00 seg';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')} min ${String(secs).padStart(2, '0')} seg`;
  };

  return (
    <aside aria-label="Alerta de tiempo para reportar pago" className="sticky top-18 sm:top-20 z-25 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white px-4 py-2.5 shadow-lg border-b-2 border-amber-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Timer display with progressive adaptive colors */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            lockData.remainingSeconds > 600
              ? 'bg-emerald-400/20 text-emerald-300'
              : lockData.remainingSeconds > 180
              ? 'bg-amber-400/20 text-amber-300'
              : 'bg-rose-500/30 text-rose-300 animate-pulse-slow'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-white/90 text-xs">Tiempo para completar su pago:</span>
            <strong className={`font-mono px-2.5 py-0.5 rounded-md font-black tracking-wide text-xs sm:text-sm border transition-colors ${
              lockData.remainingSeconds > 600
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                : lockData.remainingSeconds > 180
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                : 'bg-rose-950/70 text-rose-300 border-rose-500/50 animate-pulse-slow'
            }`}>
              {formatTimerDetailed(lockData.remainingSeconds)}
            </strong>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => onReleaseSeat(seat.id)}
            className="text-[11px] text-white/70 hover:text-white underline px-2 py-1 transition"
            title="Liberar puesto apartado si no desea continuar"
          >
            Liberar
          </button>

          <button
            onClick={onContinueReservation}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0f294a] px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md transition transform active:scale-95"
          >
            <span>Reportar Pago Ahora</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </aside>
  );
}
