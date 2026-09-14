import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  DollarSign, 
  Users, 
  FileSpreadsheet, 
  Lock, 
  Settings, 
  RefreshCw,
  ExternalLink,
  Phone,
  AlertCircle
} from 'lucide-react';
import { 
  adminLogin, 
  fetchAdminReservations, 
  updateReservationStatus, 
  updateTripInfo, 
  formatUsd, 
  formatBs 
} from '../utils/api';
import { WARD_COLORS } from './BusMap';

export default function AdminDashboard({ onClose, onDataChanged }) {
  const [pin, setPin] = useState(localStorage.getItem('templo_admin_pin') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dashboard Data
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' | 'wards' | 'settings'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');

  // Receipt Modal Lightbox
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Settings State
  const [tripForm, setTripForm] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Check initial PIN if saved
  useEffect(() => {
    if (pin) {
      handleLogin(null, pin);
    }
  }, []);

  const handleLogin = async (e, pinToUse = pin) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await adminLogin(pinToUse);
      setIsAuthenticated(true);
      localStorage.setItem('templo_admin_pin', pinToUse);
      await loadDashboard(pinToUse);
    } catch (err) {
      setLoginError('PIN de acceso incorrecto.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('templo_admin_pin');
    setIsAuthenticated(false);
    setPin('');
    setData(null);
  };

  const loadDashboard = async (authPin = pin) => {
    setLoading(true);
    try {
      const res = await fetchAdminReservations(authPin);
      setData(res);
      if (res.tripInfo) {
        setTripForm(res.tripInfo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (seatId, newStatus) => {
    if (!window.confirm(`¿Confirmas cambiar el estado a "${newStatus.toUpperCase()}" para el puesto ${seatId}?`)) {
      return;
    }
    try {
      await updateReservationStatus(seatId, newStatus, '', pin);
      await loadDashboard(pin);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const handleExportExcel = () => {
    // Direct link to download xlsx
    window.location.href = `/api/admin/export?adminPin=${encodeURIComponent(pin)}`;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      await updateTripInfo(tripForm, pin);
      setSettingsSuccess('Información del viaje actualizada correctamente');
      await loadDashboard(pin);
      if (onDataChanged) onDataChanged();
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Error al guardar');
    }
  };

  // Filter reservations
  const seatsWithReservations = (data?.seats || []).filter(s => s.reservation);
  const filteredReservations = seatsWithReservations.filter(seat => {
    const res = seat.reservation;
    const matchesSearch = 
      !searchQuery ||
      res.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seat.label.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || seat.status === statusFilter;
    const matchesWard = wardFilter === 'ALL' || res.ward === wardFilter;

    return matchesSearch && matchesStatus && matchesWard;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4 max-h-[92vh]">
        
        {/* Admin Header */}
        <div className="bg-[#0f294a] text-white p-5 sm:p-6 flex items-center justify-between border-b-4 border-amber-400 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-[#0f294a] flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                Estaca Barquisimeto • Presidencia & Tesorería
              </span>
              <h3 className="text-xl sm:text-2xl font-black">Panel de Control de Asientos del Autobús</h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Login Form if not authenticated */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto py-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#0f294a] mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-800">Acceso de Organizador</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa el PIN de seguridad asignado para la Presidencia de Estaca o Tesorero.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN de acceso (ej. 7777)"
                    className="w-full text-center tracking-widest text-2xl font-mono bg-slate-50 border-2 border-slate-300 focus:border-[#0f294a] rounded-2xl p-3 text-slate-800 focus:ring-0 transition"
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">PIN por defecto: 7777</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0f294a] hover:bg-[#163a66] text-amber-300 font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Verificando...' : 'Entrar al Panel'}</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Live Statistics Cards */}
              {data?.stats && (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Puestos</span>
                    <span className="text-2xl font-black text-slate-800">{data.stats.totalSeats}</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Confirmados</span>
                    <span className="text-2xl font-black text-emerald-800">{data.stats.confirmedSeats}</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Apartados / Revisión</span>
                    <span className="text-2xl font-black text-amber-800">{data.stats.pendingSeats}</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Disponibles</span>
                    <span className="text-2xl font-black text-blue-800">{data.stats.availableSeats}</span>
                  </div>

                  <div className="bg-gradient-to-br from-[#0f294a] to-[#163a66] text-white p-3.5 rounded-2xl col-span-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Recaudado (Verificado)</span>
                      <span className="text-[10px] text-blue-200">Tasa: {data.stats.exchangeRate}</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-2xl font-black text-amber-400">${data.stats.totalCollectedUsd}</span>
                      <span className="text-xs font-semibold text-white/90 font-mono">
                        (Bs. {data.stats.totalCollectedBs.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'reservations'
                        ? 'bg-[#0f294a] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bandeja de Reservas ({seatsWithReservations.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('wards')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'wards'
                        ? 'bg-[#0f294a] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Resumen por Barrio
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'settings'
                        ? 'bg-[#0f294a] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Ajustes del Viaje
                  </button>
                </div>

                {/* Excel Export Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadDashboard(pin)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Recargar datos"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Exportar Lista a Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: RESERVATIONS TABLE */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por pasajero, cédula o ref..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a]"
                      />
                    </div>

                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] cursor-pointer"
                      >
                        <option value="ALL">Todos los Estados</option>
                        <option value="apartado">🟡 Apartados (En espera de verificación)</option>
                        <option value="confirmado">🔵 Confirmados (Aprobados)</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={wardFilter}
                        onChange={(e) => setWardFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0f294a] cursor-pointer"
                      >
                        <option value="ALL">Todos los Barrios</option>
                        {Object.keys(data?.stats?.wardBreakdown || {}).map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                            <th className="p-3 text-center">Puesto</th>
                            <th className="p-3">Pasajero</th>
                            <th className="p-3">Barrio</th>
                            <th className="p-3">Contacto</th>
                            <th className="p-3">Pago Móvil Ref</th>
                            <th className="p-3 text-center">Comprobante</th>
                            <th className="p-3 text-center">Estado</th>
                            <th className="p-3 text-right">Acciones de Líder</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredReservations.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                                No se encontraron reservas con los filtros seleccionados.
                              </td>
                            </tr>
                          ) : (
                            filteredReservations.map((seat) => {
                              const res = seat.reservation;
                              const isConfirmed = seat.status === 'confirmado';
                              const wardColor = WARD_COLORS[res.ward];

                              return (
                                <tr key={seat.id} className="hover:bg-slate-50 transition">
                                  {/* Puesto */}
                                  <td className="p-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#0f294a] text-amber-400 font-black text-sm shadow-xs">
                                        {seat.label}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 whitespace-nowrap">
                                        {seat.floor === 2 ? '2do Piso' : '1er Piso'} • {seat.position || 'Asiento'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Pasajero */}
                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 text-sm">{res.fullName}</div>
                                    <div className="text-[11px] text-slate-500 font-mono">CI: {res.cedula}</div>
                                  </td>

                                  {/* Barrio */}
                                  <td className="p-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${wardColor?.badge || 'bg-slate-100 text-slate-800'}`}>
                                      {res.ward}
                                    </span>
                                  </td>

                                  {/* Contacto */}
                                  <td className="p-3">
                                    <a
                                      href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-700 hover:text-emerald-900 font-mono font-medium flex items-center space-x-1"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{res.phone}</span>
                                    </a>
                                  </td>

                                  {/* Ref */}
                                  <td className="p-3">
                                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {res.reference}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      ${res.amountUsd} (Bs. {res.amountBs})
                                    </span>
                                  </td>

                                  {/* Comprobante */}
                                  <td className="p-3 text-center">
                                    {res.receiptUrl ? (
                                      <button
                                        onClick={() => setViewingReceipt(res.receiptUrl)}
                                        className="inline-flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-2.5 py-1 rounded-lg font-bold text-[11px] transition"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>Ver Foto</span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 italic">Sin captura</span>
                                    )}
                                  </td>

                                  {/* Estado */}
                                  <td className="p-3 text-center">
                                    {isConfirmed ? (
                                      <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>CONFIRMADO</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>EN REVISIÓN</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Acciones */}
                                  <td className="p-3 text-right">
                                    <div className="inline-flex items-center space-x-1.5">
                                      {!isConfirmed ? (
                                        <button
                                          onClick={() => handleStatusChange(seat.id, 'confirmado')}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition"
                                          title="Aprobar pago móvil y confirmar puesto"
                                        >
                                          Aprobar Pago
                                        </button>
                                      ) : null}

                                      <button
                                        onClick={() => handleStatusChange(seat.id, 'rechazado')}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-2 py-1.5 rounded-lg font-bold text-xs transition"
                                        title="Rechazar pago y liberar asiento inmediatamente"
                                      >
                                        Liberar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WARD DISTRIBUTION BREAKDOWN */}
              {activeTab === 'wards' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Distribución de Puestos por Barrio (Estaca)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Monitorea cuántos puestos tiene reservados cada uno de los 9 barrios de la estaca.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(data?.stats?.wardBreakdown || {}).map(([wardName, counts]) => {
                      const colors = WARD_COLORS[wardName] || { bg: 'bg-slate-500', badge: 'bg-slate-100 text-slate-800' };
                      const totalSeats = data?.stats?.totalSeats || 48;
                      const percentage = ((counts.total / totalSeats) * 100).toFixed(1);

                      return (
                        <div
                          key={wardName}
                          className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-1 rounded-full font-extrabold text-xs ${colors.badge}`}>
                              {wardName}
                            </span>
                            <span className="text-xs font-bold text-slate-500 font-mono">
                              {counts.total} puestos
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Confirmados</span>
                              <span className="text-lg font-black text-emerald-800">{counts.confirmed}</span>
                            </div>
                            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
                              <span className="text-[10px] uppercase font-bold text-amber-700 block">En Revisión</span>
                              <span className="text-lg font-black text-amber-800">{counts.pending}</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Ocupación en el bus:</span>
                              <span className="font-bold text-slate-700">{percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`${colors.bg} h-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{settingsSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="font-extrabold text-slate-800 text-base">
                      Parámetros de Viaje y Pagos
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Precio por Puesto ($ USD)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={tripForm?.priceUsd || 15}
                          onChange={(e) => setTripForm({ ...tripForm, priceUsd: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Tasa Oficial (Bs por USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={tripForm?.exchangeRate || 42.5}
                          onChange={(e) => setTripForm({ ...tripForm, exchangeRate: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Fecha del Viaje
                        </label>
                        <input
                          type="text"
                          value={tripForm?.date || ''}
                          onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Hora de Salida
                        </label>
                        <input
                          type="text"
                          value={tripForm?.departureTime || ''}
                          onChange={(e) => setTripForm({ ...tripForm, departureTime: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Punto de Encuentro
                      </label>
                      <input
                        type="text"
                        value={tripForm?.meetingPoint || ''}
                        onChange={(e) => setTripForm({ ...tripForm, meetingPoint: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0f294a] hover:bg-[#163a66] text-amber-300 font-bold text-xs rounded-xl shadow-md transition"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

        </div>

        {/* Receipt Lightbox Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-800">Comprobante de Pago Móvil</span>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 overflow-auto max-h-[75vh]">
                <img
                  src={viewingReceipt}
                  alt="Comprobante"
                  className="max-h-[70vh] rounded-xl object-contain border border-slate-200 shadow-sm"
                />
              </div>

              <div className="w-full pt-2 flex justify-end">
                <a
                  href={viewingReceipt}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en nueva pestaña</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
