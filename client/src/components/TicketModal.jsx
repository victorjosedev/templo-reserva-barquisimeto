import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Bus, 
  QrCode,
  Download,
  AlertCircle
} from 'lucide-react';
import { generateWhatsAppMessage } from '../utils/api';

export default function TicketModal({ reservation, tripInfo, onClose }) {
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (reservation && qrCanvasRef.current) {
      const qrData = JSON.stringify({
        id: reservation.id,
        seat: reservation.seatLabel,
        passenger: reservation.fullName,
        cedula: reservation.cedula,
        ward: reservation.ward,
        date: tripInfo?.date
      });

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f294a',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error('Error generating QR:', err);
      });
    }
  }, [reservation, tripInfo]);

  if (!reservation) return null;

  const isConfirmed = reservation.status === 'confirmado';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const encodedMsg = generateWhatsAppMessage(reservation, tripInfo);
    // If phone number is available, or general link
    const cleanPhone = (reservation.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Actions Bar (Not printed) */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <span>Boleto Digital Oficial</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-blue-900">{reservation.id}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
              title="Compartir o guardar en WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-[#0f294a] hover:bg-[#163a66] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Boarding Pass Body */}
        <div id="printable-ticket" className="p-6 sm:p-8 bg-white">
          <div className="border-2 border-slate-300 rounded-3xl overflow-hidden shadow-inner">
            
            {/* Header with Temple Image Background */}
            <div className="bg-[#0f294a] text-white p-6 relative overflow-hidden border-b-4 border-amber-400">
              <div className="absolute inset-0 z-0">
                <img
                  src="/templo_caracas.jpg"
                  alt="Templo"
                  className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f294a]/95 via-[#0f294a]/85 to-[#0f294a]/90" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                
                <div className="flex items-center space-x-3">
                  <div className="w-13 h-13 rounded-2xl bg-amber-400 text-[#0f294a] flex items-center justify-center shadow-lg shrink-0">
                    <Bus className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      Estaca Barquisimeto
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      BOLETO DE VIAJE AL TEMPLO
                    </h2>
                    <span className="text-xs text-blue-200">
                      Destino: Santo Templo de Caracas, Venezuela
                    </span>
                  </div>
                </div>

                {/* Seat Number Badge */}
                <div className="text-right sm:border-l sm:border-white/20 sm:pl-6">
                  <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">
                    {reservation.floor === 2 ? '🌟 2do Piso' : '🚪 1er Piso'} • {reservation.position || 'Asiento'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                    {reservation.seatLabel}
                  </div>
                </div>

              </div>
            </div>

            {/* Ticket Body Details */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/60">
              
              {/* Left Column: Passenger Info */}
              <div className="md:col-span-2 space-y-4">
                
                {/* Status alert */}
                <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 font-medium ${
                  isConfirmed 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  {isConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>ESTADO: CONFIRMADO</strong> — Pago verificado por la tesorería. Puesto asegurado.</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>ESTADO: APARTADO (EN REVISIÓN)</strong> — Comprobante en proceso de validación.</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pasajero</span>
                    <span className="font-extrabold text-slate-800 text-sm">{reservation.fullName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cédula de Identidad</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">{reservation.cedula}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Barrio de Pertenencia</span>
                    <span className="font-bold text-blue-900 text-sm">{reservation.ward}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Teléfono / WhatsApp</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">{reservation.phone}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha del Viaje</span>
                    <span className="font-semibold text-slate-700">{tripInfo?.date || 'Sábado 24 de Octubre'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Hora de Salida</span>
                    <span className="font-semibold text-slate-700">{tripInfo?.departureTime || '04:30 AM'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Punto de Partida</span>
                    <span className="font-semibold text-slate-700 truncate block" title={tripInfo?.meetingPoint}>
                      {tripInfo?.meetingPoint || 'Capilla de Estaca'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Referencia Pago Móvil:</span>
                    <span className="font-mono font-bold text-slate-800">{reservation.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto registrado:</span>
                    <span className="font-bold text-slate-800">${reservation.amountUsd} (Bs. {reservation.amountBs})</span>
                  </div>
                </div>

              </div>

              {/* Right Column: QR Code & Validation Stub */}
              <div className="border-t md:border-t-0 md:border-l border-dashed border-slate-300 pt-4 md:pt-0 md:pl-6 flex flex-col items-center justify-between text-center space-y-4">
                
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Código QR de Control
                  </span>
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-block">
                    <canvas ref={qrCanvasRef} className="rounded-lg" />
                  </div>
                  <span className="font-mono text-xs font-black text-slate-700 block mt-1">
                    {reservation.id}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 leading-tight">
                  <p>Muestra este boleto desde tu teléfono o impreso al abordar el autobús.</p>
                </div>

              </div>

            </div>

            {/* Ticket Footer Rules */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
              <span>Presentar recomendación para el templo vigente al viajar.</span>
              <span className="font-mono">Emitido: {new Date(reservation.createdAt).toLocaleDateString('es-VE')}</span>
            </div>

          </div>
        </div>

        {/* Footer actions on screen */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
