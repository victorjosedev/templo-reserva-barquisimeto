import React, { useState } from 'react';
import { Search, X, Ticket, CheckCircle2, Clock, ArrowRight, AlertCircle, Phone, CreditCard } from 'lucide-react';
import { lookupReservation } from '../utils/api';

export default function LookupModal({ onClose, onViewTicket }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await lookupReservation(query.trim());
      setResults(data);
    } catch (err) {
      setErrorMsg(err.message || 'Error al consultar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#0f294a] text-white p-6 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0f294a] flex items-center justify-center font-bold shadow-md">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Consulta Rápida
              </span>
              <h3 className="text-xl font-bold">Buscar mi Reserva de Puesto</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Ingresa tu <strong>número de cédula</strong>, <strong>teléfono</strong> o <strong>código de boleto</strong> para ver el estado de tu asiento o volver a descargar tu boleto digital.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej. V-18452981 o 04145551234"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] focus:border-[#0f294a] transition font-medium"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResults(null); }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-[#0f294a] hover:bg-[#163a66] text-amber-300 font-bold text-sm rounded-xl transition shadow-md flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Buscando...' : 'Consultar'}</span>
            </button>
          </form>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Resultados encontrados: {results.length}</span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No se encontraron reservas</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Verifica si escribiste bien el número de cédula o teléfono, o realiza una nueva reserva seleccionando un asiento en el autobús.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((res) => {
                    const isConfirmed = res.status === 'confirmado';
                    return (
                      <div
                        key={res.id}
                        className="bg-white border-2 border-slate-200 hover:border-[#0f294a] rounded-2xl p-4 shadow-sm transition space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-[#0f294a] text-amber-400 flex flex-col items-center justify-center font-black text-lg shadow-sm">
                              <span className="text-[9px] uppercase tracking-widest text-blue-200 font-normal">Puesto</span>
                              <span>{res.seatLabel}</span>
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-base">{res.fullName}</h4>
                              <p className="text-xs text-slate-500 font-medium">
                                {res.ward} • CI: <span className="font-mono">{res.cedula}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isConfirmed ? (
                              <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirmado</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
                                <Clock className="w-3.5 h-3.5" />
                                <span>En Revisión</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex flex-wrap justify-between gap-2 border border-slate-200">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Código Boleto</span>
                            <span className="font-mono font-bold text-slate-800">{res.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Ref. Pago Móvil</span>
                            <span className="font-mono font-bold text-slate-800">{res.reference}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Fecha Viaje</span>
                            <span className="font-semibold text-slate-800">{res.tripDate}</span>
                          </div>
                        </div>

                        {/* View Ticket Action */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => {
                              onViewTicket(res);
                              onClose();
                            }}
                            className="inline-flex items-center space-x-1.5 bg-[#0f294a] hover:bg-[#163a66] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                          >
                            <Ticket className="w-3.5 h-3.5 text-amber-300" />
                            <span>Ver y Descargar Boleto Oficial</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
