import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  CreditCard, 
  Copy, 
  Check, 
  UploadSimple, 
  CheckCircle, 
  FileText,
  Trash, 
  LockKey, 
  Lightbulb 
} from '@phosphor-icons/react';

export default function SeatModal({
  seat,
  tripInfo,
  wards = [],
  lockData,
  onClose,
  onSubmitReservation,
  onReleaseSeat
}) {
  // Restore saved passenger data from localStorage if available
  const savedPassenger = JSON.parse(localStorage.getItem('templo_passenger_cache') || '{}');

  const [fullName, setFullName] = useState(savedPassenger.fullName || '');
  const [cedula, setCedula] = useState(savedPassenger.cedula || '');
  const [ward, setWard] = useState(savedPassenger.ward || wards[0] || 'Barrio Acarigua');
  const [phone, setPhone] = useState(savedPassenger.phone || '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Remaining seconds timer
  const [remainingSeconds, setRemainingSeconds] = useState(
    lockData?.remainingSeconds || 35 * 60
  );

  const fileInputRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (!remainingSeconds || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onReleaseSeat(seat.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seat.id]);

  // Handle receipt file change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('El comprobante no debe superar los 10MB.');
      return;
    }

    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    setErrorMsg('');
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Format timer as "34 min 02 seg" for clarity
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} seg`;
  };

  // Copy Pago Móvil info
  const handleCopyPagoMovil = () => {
    if (!tripInfo?.pagoMovil) return;
    const txt = `Banco: ${tripInfo.pagoMovil.bank}\nCédula: ${tripInfo.pagoMovil.idNumber}\nTeléfono: ${tripInfo.pagoMovil.phone}\nTitular: ${tripInfo.pagoMovil.holder}\nMonto: $${tripInfo.priceUsd} (Bs. ${(tripInfo.priceUsd * tripInfo.exchangeRate).toFixed(2)})`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor ingrese su nombre y apellido completo.');
      return;
    }
    if (!cedula.trim()) {
      setErrorMsg('Por favor ingrese su cédula de identidad.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor ingrese su número de WhatsApp o teléfono.');
      return;
    }
    if (!reference.trim()) {
      setErrorMsg('Por favor ingrese el número de referencia del Pago Móvil realizado.');
      return;
    }

    // Save passenger details in cache for convenience
    localStorage.setItem('templo_passenger_cache', JSON.stringify({
      fullName: fullName.trim(),
      cedula: cedula.trim(),
      ward,
      phone: phone.trim()
    }));

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('seatId', seat.id);
      formData.append('fullName', fullName);
      formData.append('cedula', cedula);
      formData.append('ward', ward);
      formData.append('phone', phone);
      formData.append('reference', reference);
      formData.append('notes', notes);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await onSubmitReservation(formData);
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la reserva');
      setSubmitting(false);
    }
  };

  const priceBs = tripInfo ? Math.round(tripInfo.priceUsd * tripInfo.exchangeRate * 100) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Modal Header: Clearly Anchors the Chosen Seat */}
        <div className="bg-[#0E1E3A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#1B2F52] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex flex-col items-center justify-center font-bold border border-white/20 shrink-0">
              <span className="text-[8px] uppercase tracking-widest text-slate-300 font-sans">PUESTO</span>
              <span className="text-xl leading-none font-mono">{seat.label}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                  {seat.floor === 2 ? 'Planta Alta • 2do Piso' : 'Planta Baja • 1er Piso'} • {seat.position || 'Asiento'}
                </span>
                <span className="inline-flex items-center space-x-1 text-[10px] bg-[#7C4DFF]/30 text-purple-200 px-2 py-0.5 rounded-full border border-[#7C4DFF]/40">
                  <LockKey size={12} weight="bold" />
                  <span>Apartado</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight font-display">
                Reportar Pago del Asiento N° {seat.label}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            title="Minimizar (el asiento sigue apartado)"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Temporary Lock Notice with Adaptive Countdown Timer */}
        <div className={`px-4 py-2 flex items-center justify-between text-xs border-b transition-colors ${
          remainingSeconds > 600
            ? 'bg-[#2E9E6D]/10 border-[#2E9E6D]/30 text-[#0E1E3A]'
            : remainingSeconds > 180
            ? 'bg-[#E8A23A]/10 border-[#E8A23A]/30 text-[#0E1E3A]'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center space-x-1.5 font-medium">
            <Clock size={15} weight="bold" className={remainingSeconds <= 180 ? 'text-rose-600 animate-pulse' : 'text-[#6B7280]'} />
            <span>Tiempo reservado para este asiento:</span>
          </div>
          <div className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border ${
            remainingSeconds > 600
              ? 'bg-[#2E9E6D]/20 text-[#2E9E6D] border-[#2E9E6D]/40'
              : remainingSeconds > 180
              ? 'bg-[#E8A23A]/20 text-[#E8A23A] border-[#E8A23A]/40'
              : 'bg-rose-100 text-rose-950 border-rose-300 animate-pulse-slow'
          }`}>
            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

          {/* Discrete progress line replacing generic SaaS pastel tabs */}
          <div className="space-y-1.5 pb-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 font-display">
              <span className="text-[#0f294a] font-bold">1. Pasajero</span>
              <span className="text-slate-600 font-semibold">2. Pago Móvil</span>
              <span className="text-slate-600 font-semibold">3. Referencia</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div className="bg-[#0f294a] h-full rounded-full transition-all duration-500 w-full"></div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* SECCIÓN 1: DATOS DEL PASAJERO */}
            <div className="space-y-3">
              <span className="text-xs font-black text-[#0f294a] uppercase tracking-wider block border-b border-slate-100 pb-1">
                Paso 1: Datos del Pasajero
              </span>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nombre y Apellido Completo *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. María Elena Pérez Rodríguez"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] transition font-medium"
                />
              </div>

              {/* Cédula & Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cédula de Identidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej. V-20.123.456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] transition font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Barrio de Pertenencia *
                  </label>
                  <select
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] transition font-medium cursor-pointer"
                  >
                    {wards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 0412-1234567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] transition font-medium"
                />
                <span className="text-[10px] text-slate-400">Recibirá su confirmación y boleto a este número.</span>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS PARA EL PAGO MÓVIL */}
            <div className="bg-[#0E1E3A] rounded-2xl p-4 text-white space-y-2.5 border border-[#1B2F52]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5 font-display">
                  <CreditCard size={15} weight="bold" />
                  Paso 2: Datos para Pago Móvil
                </span>
                <button
                  type="button"
                  onClick={handleCopyPagoMovil}
                  className="inline-flex items-center space-x-1 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg font-semibold transition border border-white/20 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={13} weight="bold" className="text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} weight="bold" />
                      <span>Copiar Datos</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Banco</span>
                  <span className="font-bold text-white text-xs">{tripInfo?.pagoMovil?.bank || 'Banco Venezuela'}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Cédula</span>
                  <span className="font-bold text-white text-xs font-mono">{tripInfo?.pagoMovil?.idNumber || 'V-18.452.981'}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Teléfono</span>
                  <span className="font-bold text-white text-xs font-mono">{tripInfo?.pagoMovil?.phone || '0414-5551234'}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Monto a Transferir</span>
                  <span className="font-bold text-white text-xs font-mono">
                    ${tripInfo?.priceUsd} (Bs. {priceBs.toFixed(2)})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic flex items-center space-x-1.5">
                <Lightbulb size={14} weight="bold" className="text-slate-300 shrink-0" />
                <span>Puede salir a su aplicación bancaria a transferir. Su asiento se mantiene protegido con el temporizador.</span>
              </p>
            </div>

            {/* SECCIÓN 3: REPORTAR REFERENCIA Y COMPROBANTE */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-[#0E1E3A] uppercase tracking-wider block border-b border-[#E2E5EA] pb-1 font-display">
                Paso 3: Reportar Comprobante
              </span>

              <div>
                <label className="block text-[11px] font-bold text-[#0E1E3A] uppercase mb-1">
                  Número de Referencia del Pago Móvil *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej. 654321 (últimos 4 a 6 dígitos)"
                  className="w-full bg-[#F7F8FA] border border-[#E2E5EA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0E1E3A] focus:bg-white focus:ring-2 focus:ring-[#0E1E3A] transition font-mono font-bold"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-[#0E1E3A] uppercase mb-1">
                  Foto o Captura del Comprobante (Opcional pero recomendada)
                </label>
                
                {!receiptFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E2E5EA] hover:border-[#0E1E3A] bg-[#F7F8FA] hover:bg-slate-100 rounded-2xl p-3.5 text-center cursor-pointer transition flex items-center justify-center space-x-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-[#0E1E3A] flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                      <UploadSimple size={16} weight="bold" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#0E1E3A] block">
                        Toque aquí para adjuntar la foto del pago
                      </span>
                      <span className="text-[10px] text-[#6B7280]">
                        JPG, PNG, WEBP o PDF
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-center space-x-2.5 truncate">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Comprobante" 
                          className="w-10 h-10 object-cover rounded-lg border border-blue-300 shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-200 text-blue-800 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={18} weight="bold" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {receiptFile.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(receiptFile.size / 1024).toFixed(1)} KB listo
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                      title="Quitar foto"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#0E1E3A] uppercase mb-1">
                  Observaciones adicionales (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Viajo con un familiar en el asiento de al lado"
                  className="w-full bg-[#F7F8FA] border border-[#E2E5EA] rounded-xl px-3 py-2 text-xs text-[#0E1E3A] focus:bg-white focus:ring-2 focus:ring-[#0E1E3A] transition"
                />
              </div>
            </div>

            {/* Actions: Strict Gold-600 CTA */}
            <div className="pt-3 border-t border-[#E2E5EA] space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-[#C9962F] hover:bg-[#A97B22] text-white font-bold text-sm shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Enviando comprobante...</span>
                ) : (
                  <>
                    <CheckCircle size={18} weight="fill" />
                    <span>Confirmar y Enviar Reporte de Pago</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#3B6EA5] hover:underline font-bold"
                  title="Cierra esta ventana para ir a su banco. Su asiento sigue apartado."
                >
                  Salir a transferir (mantener mi puesto apartado)
                </button>

                <button
                  type="button"
                  onClick={() => onReleaseSeat(seat.id)}
                  className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] cursor-pointer"
                >
                  Liberar puesto
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
