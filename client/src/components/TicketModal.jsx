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

        {/* Printable Boarding Pass Body with Perforations */}
        <div id="printable-ticket" className="p-4 sm:p-7 bg-slate-200/60">
          <div className="relative bg-white border border-slate-300 rounded-3xl overflow-hidden shadow-xl">
            
            {/* Semicircular Perforations (Top & Bottom notches on the stub line) */}
            <div className="hidden md:block absolute -top-3 right-[220px] w-6 h-6 rounded-full bg-black/75 z-20 shadow-inner"></div>
            <div className="hidden md:block absolute -bottom-3 right-[220px] w-6 h-6 rounded-full bg-black/75 z-20 shadow-inner"></div>

            {/* Top Bar: Airline / Coach Header */}
            <div className="bg-[#0f294a] text-white px-6 py-4 relative overflow-hidden border-b-2 border-amber-400/80">
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src="/templo_caracas.jpg"
                  alt="Templo Caracas"
                  className="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity"
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase font-display block">
                    ESTACA BARQUISIMETO
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-display">
                    PASE DE ABORDAJE • VIAJE AL TEMPLO
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-blue-200 block font-mono">CÓDIGO DE RESERVA</span>
                  <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-wider">
                    {reservation.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Boarding Pass Main Area (2 Columns on Desktop: Main Pass + Tear-off Stub) */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-white">
              
              {/* Left: Main Flight / Bus Pass (8 cols) */}
              <div className="md:col-span-8 p-5 sm:p-6 space-y-4">
                
                {/* Status alert */}
                <div className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2.5 font-medium ${
                  isConfirmed 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  {isConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>BOLETO CONFIRMADO</strong> — Pago verificado por la tesorería de estaca.</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>EN REVISIÓN</strong> — Pago móvil recibido, en proceso de validación.</span>
                    </>
                  )}
                </div>

                {/* Passenger Info Grid */}
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Pasajero(a)</span>
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base font-display">{reservation.fullName}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Cédula de Identidad</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">{reservation.cedula}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Barrio</span>
                    <span className="font-bold text-blue-900 text-xs sm:text-sm">{reservation.ward}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Teléfono de Contacto</span>
                    <span className="font-bold text-slate-800 font-mono text-xs sm:text-sm">{reservation.phone}</span>
                  </div>
                </div>

                {/* Route & Schedule */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Fecha</span>
                    <span className="font-bold text-slate-800 text-xs">{tripInfo?.date || '24 Octubre 2026'}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Salida</span>
                    <span className="font-bold text-slate-800 text-xs font-mono">{tripInfo?.departureTime || '04:30 AM'}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Destino</span>
                    <span className="font-bold text-slate-800 text-xs truncate block">Templo Caracas</span>
                  </div>
                </div>

                {/* Financial Summary Strip */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase font-bold block">Ref. Pago Móvil</span>
                    <span className="font-mono font-bold text-slate-900">{reservation.reference}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[9px] uppercase font-bold block">Monto Pasaje</span>
                    <span className="font-bold text-slate-900 font-mono">${reservation.amountUsd} / Bs. {reservation.amountBs}</span>
                  </div>
                </div>

              </div>

              {/* Right: Tear-off Boarding Stub (4 cols) with Perforation Line */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l-2 md:border-dashed md:border-slate-300 p-5 bg-slate-50/70 flex flex-col items-center justify-between text-center relative">
                
                {/* Micro scissors cut indicator */}
                <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 flex-col items-center text-[8px] text-slate-400 font-mono tracking-widest pointer-events-none select-none">
                  <span>✂</span>
                </div>

                {/* Giant Seat Pill */}
                <div className="w-full bg-[#0f294a] text-white p-3 rounded-2xl shadow-sm border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-amber-300 tracking-wider block">
                    {reservation.floor === 2 ? '🌟 2do Piso' : '🚪 1er Piso'} • {reservation.position || 'Asiento'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 font-display tracking-tight my-0.5">
                    {reservation.seatLabel}
                  </div>
                  <span className="text-[9px] text-blue-200 uppercase tracking-widest font-mono">PUESTO ASIGNADO</span>
                </div>

                {/* QR Code */}
                <div className="my-2 flex flex-col items-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs inline-block">
                    <canvas ref={qrCanvasRef} className="rounded-md" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Control de Abordaje</span>
                </div>

                <span className="text-[8px] text-slate-400 font-medium leading-tight">
                  Presentar recomendación vigente al abordar.
                </span>

              </div>

            </div>

            {/* Decorative Barcode Bottom Strip */}
            <div className="bg-slate-100 px-6 py-2 border-t border-slate-200 text-[9px] text-slate-500 flex items-center justify-between">
              <span className="font-mono">TALÓN DE VIAJE • ESTACA BARQUISIMETO</span>
              <span className="font-mono">EMITIDO: {new Date(reservation.createdAt).toLocaleDateString('es-VE')}</span>
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
