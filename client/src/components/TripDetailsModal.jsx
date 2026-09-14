import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Info,
  FileText
} from '@phosphor-icons/react';

export default function TripDetailsModal({ tripInfo, onClose }) {
  const [copied, setCopied] = useState(false);

  const pagoMovilText = tripInfo?.pagoMovil
    ? `Banco: ${tripInfo.pagoMovil.bank}\nCédula: ${tripInfo.pagoMovil.idNumber}\nTeléfono: ${tripInfo.pagoMovil.phone}\nTitular: ${tripInfo.pagoMovil.holder}\nMonto: $${tripInfo.priceUsd} (Bs. ${(tripInfo.priceUsd * tripInfo.exchangeRate).toFixed(2)})`
    : '';

  const copyToClipboard = () => {
    if (!pagoMovilText) return;
    navigator.clipboard.writeText(pagoMovilText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const priceBs = tripInfo ? Math.round(tripInfo.priceUsd * tripInfo.exchangeRate * 100) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2E5EA] overflow-hidden my-6">
        
        {/* Header with Temple Image */}
        <div className="bg-[#0E1E3A] text-white p-6 relative overflow-hidden border-b border-[#1B2F52]">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/templo_caracas.jpg"
              alt="Templo"
              className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E1E3A]/95 via-[#0E1E3A]/90 to-[#0E1E3A]/85" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold border border-white/20 shadow-xs shrink-0">
                <Info size={20} weight="bold" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-sans">
                  Estaca Barquisimeto • Información Oficial
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">Detalles del Viaje, Pago Móvil y Términos</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Key Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E2E5EA] flex items-start space-x-3">
              <Calendar size={20} weight="bold" className="text-[#0E1E3A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-[#6B7280] block">Fecha de Salida</span>
                <span className="font-bold text-[#0E1E3A] text-sm">{tripInfo?.date}</span>
                <span className="text-xs text-[#6B7280] block mt-0.5">Retorno el mismo día ({tripInfo?.returnTime})</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E2E5EA] flex items-start space-x-3">
              <Clock size={20} weight="bold" className="text-[#0E1E3A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-[#6B7280] block">Hora de Concentración</span>
                <span className="font-bold text-[#0E1E3A] text-sm font-mono">{tripInfo?.departureTime} puntual</span>
                <span className="text-xs text-[#6B7280] block mt-0.5">Llegar 25 minutos antes</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E2E5EA] flex items-start space-x-3">
              <MapPin size={20} weight="bold" className="text-[#0E1E3A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-[#6B7280] block">Lugar de Partida</span>
                <span className="font-bold text-[#0E1E3A] text-sm">{tripInfo?.meetingPoint}</span>
                <span className="text-xs text-[#6B7280] block mt-0.5">Barquisimeto, Edo. Lara</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E2E5EA] flex items-start space-x-3">
              <ShieldCheck size={20} weight="bold" className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-[#6B7280] block">Fecha Límite de Pago</span>
                <span className="font-bold text-rose-700 text-sm">{tripInfo?.paymentDeadline}</span>
                <span className="text-xs text-[#6B7280] block mt-0.5">Cupos sujetos a disponibilidad</span>
              </div>
            </div>
          </div>

          {/* Official Pago Móvil Box */}
          <div className="bg-[#0E1E3A] rounded-3xl p-6 text-white shadow-lg space-y-4 border border-[#1B2F52]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CreditCard size={20} weight="bold" className="text-slate-300" />
                <h4 className="font-bold text-base text-white font-display">Datos Oficiales de Pago Móvil</h4>
              </div>

              <button
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border border-white/20 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} weight="bold" className="text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} weight="bold" />
                    <span>Copiar Todos los Datos</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Banco Receptor</span>
                <span className="font-bold text-white text-sm">{tripInfo?.pagoMovil?.bank}</span>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cédula / RIF</span>
                <span className="font-bold text-white text-sm font-mono">{tripInfo?.pagoMovil?.idNumber}</span>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Teléfono Pago Móvil</span>
                <span className="font-bold text-white text-sm font-mono">{tripInfo?.pagoMovil?.phone}</span>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Monto Oficial</span>
                <span className="font-bold text-white text-sm font-mono">
                  ${tripInfo?.priceUsd} • Bs. {priceBs.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 italic border-t border-white/10 pt-2">
              Titular de la cuenta: <strong className="text-white">{tripInfo?.pagoMovil?.holder}</strong>
            </p>
          </div>

          {/* Clear Terms & Cancellation Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0E1E3A] text-sm uppercase tracking-wider flex items-center gap-2 font-display">
              <FileText size={16} weight="bold" className="text-[#0E1E3A]" />
              Términos de Reserva y Políticas de Reembolso
            </h4>

            <div className="space-y-2 text-xs text-[#6B7280] bg-[#F7F8FA] p-4 rounded-2xl border border-[#E2E5EA]">
              {tripInfo?.terms?.map((term, i) => (
                <div key={i} className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-[#0E1E3A] font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{term}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Person */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#0E1E3A] text-white flex items-center justify-center font-bold">
                <Phone size={16} weight="bold" />
              </div>
              <div>
                <span className="font-bold block text-sm">{tripInfo?.contactName}</span>
                <span className="text-slate-600">Dudas sobre pagos, cambios de puesto o consultas</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${(tripInfo?.contactPhone || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-[#2E9E6D] hover:bg-[#258259] text-white font-bold rounded-xl shadow-xs transition"
            >
              Contactar por WhatsApp
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-[#E2E5EA] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0E1E3A] hover:bg-[#1B2F52] text-white text-xs font-bold transition cursor-pointer"
          >
            Entendido, Volver al Autobús
          </button>
        </div>

      </div>
    </div>
  );
}
