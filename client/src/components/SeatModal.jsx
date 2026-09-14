import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  CreditCard, 
  Copy, 
  Check, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Trash2,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

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
        <div className="bg-[#0f294a] text-white p-4 sm:p-5 flex items-center justify-between border-b-4 border-amber-400 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#0f294a] flex flex-col items-center justify-center font-black shadow-md shrink-0">
              <span className="text-[8px] uppercase tracking-widest text-[#0f294a]/80 font-bold">PUESTO</span>
              <span className="text-xl leading-none">{seat.label}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {seat.floor === 2 ? '🌟 2do Piso (Panorámico)' : '🚪 1er Piso'} • {seat.position || 'Asiento'}
                </span>
                <span className="inline-flex items-center space-x-1 text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/40">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Apartado</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Reportar Pago del Asiento N° {seat.label}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0"
            title="Minimizar (el asiento sigue apartado)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Temporary Lock Notice & Countdown */}
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-950 shrink-0">
          <div className="flex items-center space-x-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Tiempo para completar el reporte:</span>
          </div>
          <div className="font-mono text-xs font-black text-amber-950 bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300">
            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">

          {/* Customer Journey Step-by-step Tabs indicator */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold">
            <div className="bg-blue-50 text-blue-900 border border-blue-200 py-1.5 px-1 rounded-xl">
              1. Sus Datos
            </div>
            <div className="bg-amber-50 text-amber-900 border border-amber-200 py-1.5 px-1 rounded-xl">
              2. Pago Móvil
            </div>
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 py-1.5 px-1 rounded-xl">
              3. Referencia
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
            <div className="bg-gradient-to-br from-blue-950 to-[#0f294a] rounded-2xl p-4 text-white space-y-2.5 border border-amber-400/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Paso 2: Datos para Pago Móvil
                </span>
                <button
                  type="button"
                  onClick={handleCopyPagoMovil}
                  className="inline-flex items-center space-x-1 text-[11px] bg-amber-400 hover:bg-amber-300 text-[#0f294a] px-2.5 py-1 rounded-lg font-black transition shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-800" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Datos</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-blue-200 uppercase block">Banco</span>
                  <span className="font-bold text-white text-xs">{tripInfo?.pagoMovil?.bank || 'Banco Venezuela'}</span>
                </div>
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-blue-200 uppercase block">Cédula</span>
                  <span className="font-bold text-white text-xs font-mono">{tripInfo?.pagoMovil?.idNumber || 'V-18.452.981'}</span>
                </div>
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-blue-200 uppercase block">Teléfono</span>
                  <span className="font-bold text-white text-xs font-mono">{tripInfo?.pagoMovil?.phone || '0414-5551234'}</span>
                </div>
                <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] text-blue-200 uppercase block">Monto a Transferir</span>
                  <span className="font-black text-amber-300 text-xs font-mono">
                    ${tripInfo?.priceUsd} (Bs. {priceBs.toFixed(2)})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-blue-200 italic">
                💡 Puede salir a su aplicación bancaria a transferir. Su asiento se mantiene protegido con el temporizador.
              </p>
            </div>

            {/* SECCIÓN 3: REPORTAR REFERENCIA Y COMPROBANTE */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-black text-[#0f294a] uppercase tracking-wider block border-b border-slate-100 pb-1">
                Paso 3: Reportar Comprobante
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Número de Referencia del Pago Móvil *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej. 654321 (últimos 4 a 6 dígitos)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] transition font-mono font-bold"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Foto o Captura del Comprobante (Opcional pero recomendada)
                </label>
                
                {!receiptFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#0f294a] bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-3.5 text-center cursor-pointer transition flex items-center justify-center space-x-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0f294a] flex items-center justify-center group-hover:scale-105 transition">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-700 block">
                        Toque aquí para adjuntar la foto del pago
                      </span>
                      <span className="text-[10px] text-slate-400">
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
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {receiptFile.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {(receiptFile.size / 1024).toFixed(1)} KB listo
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                      title="Quitar foto"
                    >
                      <Trash2 className="w-4 h-4" />
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
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Observaciones adicionales (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Viajo con un familiar en el asiento de al lado"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#0f294a] font-black text-sm shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Enviando comprobante...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Enviar Reporte de Pago</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-blue-700 hover:text-blue-900 font-bold underline"
                  title="Cierra esta ventana para ir a su banco. Su asiento sigue apartado."
                >
                  Salir a transferir (mantener mi puesto apartado)
                </button>

                <button
                  type="button"
                  onClick={() => onReleaseSeat(seat.id)}
                  className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
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
