import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  ShareNetwork, 
  CheckCircle, 
  Clock, 
  Scissors 
} from '@phosphor-icons/react';
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
          dark: '#0E1E3A',
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
    const cleanPhone = (reservation.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2E5EA] overflow-hidden my-6">
        
        {/* Actions Bar (Not printed) */}
        <div className="bg-slate-100 px-6 py-3 border-b border-[#E2E5EA] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0E1E3A] uppercase tracking-wider">
            <span className="font-display">Boleto Digital Oficial</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-[#0E1E3A]">{reservation.id}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center space-x-1.5 bg-[#2E9E6D] hover:bg-[#258259] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="Compartir o guardar en WhatsApp"
            >
              <ShareNetwork size={14} weight="bold" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-[#0E1E3A] hover:bg-[#1B2F52] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="Imprimir o guardar como PDF"
            >
              <Printer size={14} weight="bold" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Printable Boarding Pass Body with Perforations */}
        <div id="printable-ticket" className="p-4 sm:p-7 bg-[#F7F8FA]">
          <div className="relative bg-white border border-[#E2E5EA] rounded-3xl overflow-hidden shadow-xl">
            
            {/* Semicircular Perforations (Top & Bottom notches on the stub line) */}
            <div className="hidden md:block absolute -top-3 right-[220px] w-6 h-6 rounded-full bg-[#0E1E3A] z-20 shadow-inner"></div>
            <div className="hidden md:block absolute -bottom-3 right-[220px] w-6 h-6 rounded-full bg-[#0E1E3A] z-20 shadow-inner"></div>

            {/* Top Bar: Airline / Coach Header */}
            <div className="bg-[#0E1E3A] text-white px-6 py-4 relative overflow-hidden border-b border-[#1B2F52]">
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src="/templo_caracas.jpg"
                  alt="Templo Caracas"
                  className="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity"
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-slate-300 uppercase font-display block">
                    ESTACA BARQUISIMETO
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                    PASE DE ABORDAJE • VIAJE AL TEMPLO
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-slate-300 block font-mono">CÓDIGO DE RESERVA</span>
                  <span className="text-sm sm:text-base font-bold text-white font-mono tracking-wider">
                    {reservation.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Boarding Pass Main Area (2 Columns on Desktop: Main Pass + Tear-off Stub) */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-white">
              
              {/* Left: Main Flight / Bus Pass (8 cols) */}
              <div className="md:col-span-8 p-5 sm:p-6 space-y-4">
                
                {/* Status alert with exact tokens: Confirmed = #3B6EA5, Review = #E8A23A */}
                <div className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2.5 font-medium ${
                  isConfirmed 
                    ? 'bg-[#3B6EA5]/15 border-[#3B6EA5]/40 text-[#0E1E3A]' 
                    : 'bg-[#E8A23A]/15 border-[#E8A23A]/40 text-[#0E1E3A]'
                }`}>
                  {isConfirmed ? (
                    <>
                      <CheckCircle size={18} weight="fill" className="text-[#3B6EA5] shrink-0" />
                      <span><strong>BOLETO CONFIRMADO</strong> — Pago verificado por la tesorería de estaca.</span>
                    </>
                  ) : (
                    <>
                      <Clock size={18} weight="bold" className="text-[#E8A23A] shrink-0" />
                      <span><strong>EN REVISIÓN</strong> — Pago móvil recibido, en proceso de validación.</span>
                    </>
                  )}
                </div>

                {/* Passenger Info Grid */}
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Pasajero(a)</span>
                    <span className="font-bold text-[#0E1E3A] text-sm sm:text-base font-display">{reservation.fullName}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Cédula de Identidad</span>
                    <span className="font-bold text-[#0E1E3A] font-mono text-sm">{reservation.cedula}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Barrio</span>
                    <span className="font-bold text-[#0E1E3A] text-xs sm:text-sm font-sans">{reservation.ward}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Teléfono de Contacto</span>
                    <span className="font-bold text-[#0E1E3A] font-mono text-xs sm:text-sm">{reservation.phone}</span>
                  </div>
                </div>

                {/* Route & Schedule */}
                <div className="pt-3 border-t border-[#E2E5EA] grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Fecha</span>
                    <span className="font-bold text-[#0E1E3A] text-xs">{tripInfo?.date || '24 Octubre 2026'}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Salida</span>
                    <span className="font-bold text-[#0E1E3A] text-xs font-mono">{tripInfo?.departureTime || '04:30 AM'}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider block">Destino</span>
                    <span className="font-bold text-[#0E1E3A] text-xs truncate block">Templo Caracas</span>
                  </div>
                </div>

                {/* Financial Summary Strip */}
                <div className="bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E2E5EA] text-[11px] text-[#6B7280] flex items-center justify-between">
                  <div>
                    <span className="text-[#6B7280] text-[9px] uppercase font-bold block">Ref. Pago Móvil</span>
                    <span className="font-mono font-bold text-[#0E1E3A]">{reservation.reference}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6B7280] text-[9px] uppercase font-bold block">Monto Pasaje</span>
                    <span className="font-bold text-[#0E1E3A] font-mono">${reservation.amountUsd} / Bs. {reservation.amountBs}</span>
                  </div>
                </div>

              </div>

              {/* Right: Tear-off Boarding Stub (4 cols) with Perforation Line */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l-2 md:border-dashed md:border-[#E2E5EA] p-5 bg-[#F7F8FA] flex flex-col items-center justify-between text-center relative">
                
                {/* Micro scissors cut indicator using Phosphor Scissors */}
                <div className="hidden md:flex absolute -left-2.5 top-1/2 -translate-y-1/2 flex-col items-center text-slate-400 pointer-events-none select-none">
                  <Scissors size={14} weight="bold" className="rotate-90" />
                </div>

                {/* Seat Pill in Deep Navy */}
                <div className="w-full bg-[#0E1E3A] text-white p-3 rounded-2xl shadow-sm border border-[#1B2F52]">
                  <span className="text-[9px] uppercase font-bold text-slate-300 tracking-wider block font-sans">
                    {reservation.floor === 2 ? 'Planta Alta • 2do Piso' : 'Planta Baja • 1er Piso'} • {reservation.position || 'Asiento'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight my-0.5">
                    {reservation.seatLabel}
                  </div>
                  <span className="text-[9px] text-slate-300 uppercase tracking-widest font-mono">PUESTO ASIGNADO</span>
                </div>

                {/* QR Code */}
                <div className="my-2 flex flex-col items-center">
                  <div className="bg-white p-2 rounded-xl border border-[#E2E5EA] shadow-xs inline-block">
                    <canvas ref={qrCanvasRef} className="rounded-md" />
                  </div>
                  <span className="text-[9px] text-[#6B7280] font-mono mt-1">Control de Abordaje</span>
                </div>

                <span className="text-[8px] text-[#6B7280] font-medium leading-tight">
                  Presentar recomendación vigente al abordar.
                </span>

              </div>

            </div>

            {/* Decorative Barcode Bottom Strip */}
            <div className="bg-slate-100 px-6 py-2 border-t border-[#E2E5EA] text-[9px] text-[#6B7280] flex items-center justify-between font-mono">
              <span>TALÓN DE VIAJE • ESTACA BARQUISIMETO</span>
              <span>EMITIDO: {new Date(reservation.createdAt).toLocaleDateString('es-VE')}</span>
            </div>

          </div>
        </div>

        {/* Footer actions on screen */}
        <div className="bg-slate-50 p-4 border-t border-[#E2E5EA] flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#0E1E3A] text-xs font-bold transition cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
