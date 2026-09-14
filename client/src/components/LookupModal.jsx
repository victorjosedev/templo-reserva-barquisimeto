import React, { useState } from 'react';
import { 
  MagnifyingGlass, 
  X, 
  Ticket, 
  CheckCircle, 
  Clock, 
  ArrowRight 
} from '@phosphor-icons/react';
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
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E2E5EA] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#0E1E3A] text-white p-6 flex items-center justify-between border-b border-[#1B2F52]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold border border-white/20 shadow-xs">
              <MagnifyingGlass size={20} weight="bold" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                Consulta Rápida
              </span>
              <h3 className="text-xl font-bold font-display text-white">Buscar mi Reserva de Puesto</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-[#6B7280] leading-relaxed">
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
                className="w-full bg-[#F7F8FA] border border-[#E2E5EA] rounded-xl pl-4 pr-10 py-3 text-sm text-[#0E1E3A] focus:bg-white focus:ring-2 focus:ring-[#0E1E3A] transition font-medium"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResults(null); }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} weight="bold" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-[#0E1E3A] hover:bg-[#1B2F52] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <MagnifyingGlass size={16} weight="bold" />
              <span>{loading ? 'Buscando...' : 'Consultar'}</span>
            </button>
          </form>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                <span>Resultados encontrados: {results.length}</span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 bg-[#F7F8FA] rounded-2xl border border-[#E2E5EA] space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                    <Ticket size={24} weight="bold" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0E1E3A]">No se encontraron reservas</h4>
                  <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
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
                        className="bg-white border-2 border-[#E2E5EA] hover:border-[#0E1E3A] rounded-2xl p-4 shadow-sm transition space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-[#0E1E3A] text-white flex flex-col items-center justify-center font-mono font-bold text-lg shadow-sm border border-[#1B2F52]">
                              <span className="text-[9px] uppercase tracking-widest text-slate-300 font-sans font-normal">Puesto</span>
                              <span>{res.seatLabel}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-[#0E1E3A] text-base font-display">{res.fullName}</h4>
                              <p className="text-xs text-[#6B7280] font-medium">
                                {res.ward} • CI: <span className="font-mono">{res.cedula}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isConfirmed ? (
                              <span className="inline-flex items-center space-x-1.5 bg-[#3B6EA5]/15 text-[#0E1E3A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#3B6EA5]/40">
                                <CheckCircle size={14} weight="fill" className="text-[#3B6EA5]" />
                                <span>Confirmado</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 bg-[#E8A23A]/15 text-[#0E1E3A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#E8A23A]/40">
                                <Clock size={14} weight="bold" className="text-[#E8A23A]" />
                                <span>En Revisión</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-[#F7F8FA] p-2.5 rounded-xl text-xs text-[#6B7280] flex flex-wrap justify-between gap-2 border border-[#E2E5EA]">
                          <div>
                            <span className="text-[#6B7280] text-[10px] block uppercase font-bold">Código Boleto</span>
                            <span className="font-mono font-bold text-[#0E1E3A]">{res.id}</span>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-[10px] block uppercase font-bold">Ref. Pago Móvil</span>
                            <span className="font-mono font-bold text-[#0E1E3A]">{res.reference}</span>
                          </div>
                          <div>
                            <span className="text-[#6B7280] text-[10px] block uppercase font-bold">Fecha Viaje</span>
                            <span className="font-semibold text-[#0E1E3A]">{res.tripDate}</span>
                          </div>
                        </div>

                        {/* View Ticket Action */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => {
                              onViewTicket(res);
                              onClose();
                            }}
                            className="inline-flex items-center space-x-1.5 bg-[#0E1E3A] hover:bg-[#1B2F52] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            <Ticket size={16} weight="bold" />
                            <span>Ver y Descargar Boleto Oficial</span>
                            <ArrowRight size={14} weight="bold" />
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
