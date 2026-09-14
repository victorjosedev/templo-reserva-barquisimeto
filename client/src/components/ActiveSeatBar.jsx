import React from 'react';
import { Clock, ArrowRight } from '@phosphor-icons/react';

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
    <aside aria-label="Alerta de tiempo para reportar pago" className="sticky top-18 sm:top-20 z-25 bg-gradient-to-r from-[#1B2F52] via-[#0E1E3A] to-[#1B2F52] text-white px-4 py-2.5 shadow-lg border-b border-[#E2E5EA]/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Timer display with progressive adaptive colors */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            lockData.remainingSeconds > 600
              ? 'bg-[#2E9E6D]/20 text-[#2E9E6D]'
              : lockData.remainingSeconds > 180
              ? 'bg-[#E8A23A]/20 text-[#E8A23A]'
              : 'bg-rose-500/30 text-rose-300 animate-pulse-slow'
          }`}>
            <Clock size={18} weight="bold" />
          </div>
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-white/90 text-xs">Tiempo para completar su pago:</span>
            <strong className={`font-mono px-2.5 py-0.5 rounded-md font-bold tracking-wide text-xs sm:text-sm border transition-colors ${
              lockData.remainingSeconds > 600
                ? 'bg-slate-900/60 text-[#2E9E6D] border-[#2E9E6D]/40'
                : lockData.remainingSeconds > 180
                ? 'bg-slate-900/60 text-[#E8A23A] border-[#E8A23A]/40'
                : 'bg-rose-950/70 text-rose-300 border-rose-500/50 animate-pulse-slow'
            }`}>
              {formatTimerDetailed(lockData.remainingSeconds)}
            </strong>
          </div>
        </div>

        {/* Action buttons (Gold strictly reserved for primary CTA) */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => onReleaseSeat(seat.id)}
            className="text-[11px] text-white/70 hover:text-white underline px-2 py-1 transition cursor-pointer"
            title="Liberar puesto apartado si no desea continuar"
          >
            Liberar
          </button>

          <button
            onClick={onContinueReservation}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 bg-[#C9962F] hover:bg-[#A97B22] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <span>Reportar Pago Ahora</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>

      </div>
    </aside>
  );
}
