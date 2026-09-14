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
  HelpCircle, 
  Info,
  DollarSign,
  AlertCircle,
  FileCheck
} from 'lucide-react';

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
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header with Temple Image */}
        <div className="bg-[#0f294a] text-white p-6 relative overflow-hidden border-b border-amber-400/30">
          <div className="absolute inset-0 z-0">
            <img
              src="/templo_caracas.jpg"
              alt="Templo"
              className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f294a]/95 via-[#0f294a]/90 to-[#0f294a]/85" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0f294a] flex items-center justify-center font-bold shadow-md shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Estaca Barquisimeto • Información Oficial
                </span>
                <h3 className="text-lg sm:text-xl font-black">Detalles del Viaje, Pago Móvil y Términos</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Key Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Fecha de Salida</span>
                <span className="font-extrabold text-slate-800 text-sm">{tripInfo?.date}</span>
                <span className="text-xs text-slate-500 block mt-0.5">Retorno el mismo día ({tripInfo?.returnTime})</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Hora de Concentración</span>
                <span className="font-extrabold text-slate-800 text-sm">{tripInfo?.departureTime} puntual</span>
                <span className="text-xs text-slate-500 block mt-0.5">Llegar 25 minutos antes</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Lugar de Partida</span>
                <span className="font-extrabold text-slate-800 text-sm">{tripInfo?.meetingPoint}</span>
                <span className="text-xs text-slate-500 block mt-0.5">Barquisimeto, Edo. Lara</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Fecha Límite de Pago</span>
                <span className="font-extrabold text-rose-700 text-sm">{tripInfo?.paymentDeadline}</span>
                <span className="text-xs text-slate-500 block mt-0.5">Cupos sujetos a disponibilidad</span>
              </div>
            </div>
          </div>

          {/* Official Pago Móvil Box */}
          <div className="bg-gradient-to-br from-blue-900 to-[#0f294a] rounded-3xl p-6 text-white shadow-lg space-y-4 border border-amber-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-base text-white">Datos Oficiales de Pago Móvil</h4>
              </div>

              <button
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-[#0f294a] px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-800" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Todos los Datos</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Banco Receptor</span>
                <span className="font-bold text-white text-sm">{tripInfo?.pagoMovil?.bank}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Cédula / RIF</span>
                <span className="font-bold text-white text-sm font-mono">{tripInfo?.pagoMovil?.idNumber}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Teléfono Pago Móvil</span>
                <span className="font-bold text-white text-sm font-mono">{tripInfo?.pagoMovil?.phone}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <span className="text-blue-200 block text-[10px] uppercase font-semibold">Monto Oficial</span>
                <span className="font-black text-amber-300 text-sm font-mono">
                  ${tripInfo?.priceUsd} • Bs. {priceBs.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-200 italic border-t border-white/10 pt-2">
              Titular de la cuenta: <strong className="text-white">{tripInfo?.pagoMovil?.holder}</strong>
            </p>
          </div>

          {/* Clear Terms & Cancellation Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#0f294a]" />
              Términos de Reserva y Políticas de Reembolso
            </h4>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {tripInfo?.terms?.map((term, i) => (
                <div key={i} className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
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
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-sm">{tripInfo?.contactName}</span>
                <span className="text-blue-700">Dudas sobre pagos, cambios de puesto o consultas</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${(tripInfo?.contactPhone || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              Contactar por WhatsApp
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0f294a] hover:bg-[#163a66] text-white text-xs font-bold transition"
          >
            Entendido, Volver al Autobús
          </button>
        </div>

      </div>
    </div>
  );
}
