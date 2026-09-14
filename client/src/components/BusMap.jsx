import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Layers, 
  Sparkles,
  Compass,
  ArrowUpRight,
  Luggage,
  Coffee,
  HelpCircle
} from 'lucide-react';

// Distinct colors for the 9 wards
export const WARD_COLORS = {
  'Barrio Acarigua': { bg: 'bg-blue-600', border: 'border-blue-400', badge: 'bg-blue-100 text-blue-800' },
  'Barrio Araure': { bg: 'bg-emerald-600', border: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
  'Barrio Los Pinos': { bg: 'bg-teal-600', border: 'border-teal-400', badge: 'bg-teal-100 text-teal-800' },
  'Barrio Cabudare': { bg: 'bg-purple-600', border: 'border-purple-400', badge: 'bg-purple-100 text-purple-800' },
  'Barrio Sabana de Parra': { bg: 'bg-amber-600', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-800' },
  'Barrio Nueva Segovia': { bg: 'bg-indigo-600', border: 'border-indigo-400', badge: 'bg-indigo-100 text-indigo-800' },
  'Barrio Concordia': { bg: 'bg-rose-600', border: 'border-rose-400', badge: 'bg-rose-100 text-rose-800' },
  'Barrio San Felipe': { bg: 'bg-orange-600', border: 'border-orange-400', badge: 'bg-orange-100 text-orange-800' },
  'Barrio La Concordia': { bg: 'bg-cyan-600', border: 'border-cyan-400', badge: 'bg-cyan-100 text-cyan-800' },
};

export default function BusMap({
  seats = [],
  wards = [],
  selectedSeat,
  onSelectSeat,
  selectedWardFilter,
  setSelectedWardFilter,
  activeSessionLock
}) {
  const [activeFloor, setActiveFloor] = useState('2'); // '2' (2do piso), '1' (1er piso), 'both' (ambos)
  const [viewMode, setViewMode] = useState('status'); // 'status' or 'ward'

  // Format countdown mm:ss
  const formatTimer = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filter seats by floor
  const floor2Seats = seats.filter(s => s.floor === 2);
  const floor1Seats = seats.filter(s => s.floor === 1);

  // Metrics by floor
  const floor2Available = floor2Seats.filter(s => s.status === 'disponible').length;
  const floor1Available = floor1Seats.filter(s => s.status === 'disponible').length;

  const getWardOccupiedCount = (wardName) => {
    return seats.filter(s => s.ward === wardName).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Compact Controls: Floor Selector, Filter & Legend */}
      <div id="bus-section" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-3 sm:p-5 mb-5">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Floor Navigation Tabs (Front & Center!) */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {/* 2do Piso */}
            <button
              onClick={() => setActiveFloor('2')}
              className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                activeFloor === '2'
                  ? 'bg-[#0f294a] text-white shadow-md'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              <span>🌟 2do Piso</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeFloor === '2' ? 'bg-amber-400 text-[#0f294a]' : 'bg-slate-200 text-slate-700'
              }`}>
                {floor2Available} libres
              </span>
            </button>

            {/* 1er Piso */}
            <button
              onClick={() => setActiveFloor('1')}
              className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                activeFloor === '1'
                  ? 'bg-[#0f294a] text-white shadow-md'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              <span>🚪 1er Piso</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeFloor === '1' ? 'bg-amber-400 text-[#0f294a]' : 'bg-slate-200 text-slate-700'
              }`}>
                {floor1Available} libres
              </span>
            </button>

            {/* Ambos Pisos (Desktop) */}
            <button
              onClick={() => setActiveFloor('both')}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition ${
                activeFloor === 'both'
                  ? 'bg-[#0f294a] text-white shadow-md'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              <span>Ambos Pisos</span>
            </button>
          </div>

          {/* Right: Ward Filter & View Mode */}
          <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
            
            {/* Ward selector */}
            <div className="flex items-center space-x-1.5">
              <select
                value={selectedWardFilter}
                onChange={(e) => setSelectedWardFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl py-2 px-2.5 cursor-pointer focus:ring-2 focus:ring-[#0f294a]"
              >
                <option value="ALL">📍 Filtrar por Barrio (Todos)</option>
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward} ({getWardOccupiedCount(ward)})
                  </option>
                ))}
              </select>

              {selectedWardFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedWardFilter('ALL')}
                  className="text-[10px] text-rose-600 font-extrabold underline"
                >
                  Quitar
                </button>
              )}
            </div>

            {/* View Mode Segmented Control (High Contrast) */}
            <div className="inline-flex bg-slate-200 p-1 rounded-xl border border-slate-300 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('status')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'status'
                    ? 'bg-[#0f294a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Estado
              </button>
              <button
                type="button"
                onClick={() => setViewMode('ward')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'ward'
                    ? 'bg-[#0f294a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Barrio
              </button>
            </div>

          </div>

        </div>

        {/* Compact Legend Strip */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 inline-block"></span>
              <span className="font-semibold text-slate-800">Verde: Libre</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400 inline-block"></span>
              <span className="font-medium text-slate-700">Ámbar: En revisión</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-md bg-[#0f294a] inline-block"></span>
              <span className="font-medium text-slate-700">Azul: Confirmado</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-600 inline-block"></span>
              <span className="font-bold text-purple-800">Púrpura: Su selección</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 italic hidden sm:inline">
            Bloqueo protegido de 35 minutos al tocar un asiento
          </span>
        </div>

      </div>

      {/* Main Bus Deck Visualization Grid */}
      <div className={`grid gap-8 justify-center ${activeFloor === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* ==================== 2DO PISO (44 Asientos) ==================== */}
        {(activeFloor === '2' || activeFloor === 'both') && (
          <div className="flex flex-col items-center">
            
            {/* Floor Title Pill */}
            <div className="mb-3 px-5 py-2 bg-[#0f294a] text-white rounded-2xl shadow-md border-2 border-amber-400 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                Planta Alta • Vista Panorámica
              </span>
              <h4 className="text-lg font-black tracking-tight">2do Piso (Asientos 01 al 44)</h4>
            </div>

            {/* Bus Chassis Container */}
            <div className="w-full max-w-md bg-white rounded-[40px] p-5 sm:p-7 shadow-2xl border-4 border-slate-300 relative">
              
              {/* Front Windshield (Road View) */}
              <div className="bg-gradient-to-b from-sky-950 via-slate-900 to-slate-800 rounded-3xl p-4 mb-5 text-white text-center relative shadow-inner border border-slate-700">
                <div className="absolute top-2 left-6 right-6 h-2.5 bg-white/20 rounded-full blur-[1px]"></div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 block pt-1">
                  PARABRISAS DELANTERO • VISTA PANORÁMICA
                </span>
                <span className="text-[10px] text-slate-300">Frente del Autobús</span>
              </div>

              {/* Column Labels: Perfectly aligned above seat columns without central PASILLO label */}
              <div className="flex items-center justify-between gap-2 px-1 pb-2.5 mb-3 border-b-2 border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                <div className="flex space-x-2">
                  <span className="w-12 sm:w-14 text-center">Ventana</span>
                  <span className="w-12 sm:w-14 text-center">Pasillo</span>
                </div>
                <div className="w-4 sm:w-6 text-center text-slate-200 text-[10px] font-mono">
                  •
                </div>
                <div className="flex space-x-2">
                  <span className="w-12 sm:w-14 text-center">Pasillo</span>
                  <span className="w-12 sm:w-14 text-center">Ventana</span>
                </div>
              </div>

              {/* 2nd Floor Rows */}
              <div className="space-y-3">
                {renderFloor2Rows()}
              </div>

              {/* Rear of 2nd Floor */}
              <div className="mt-6 pt-3 border-t-2 border-slate-200 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Parte Trasera del 2do Piso
              </div>

            </div>
          </div>
        )}

        {/* ==================== 1ER PISO (16 Asientos) ==================== */}
        {(activeFloor === '1' || activeFloor === 'both') && (
          <div className="flex flex-col items-center">
            
            {/* Floor Title Pill */}
            <div className="mb-3 px-5 py-2 bg-[#0f294a] text-white rounded-2xl shadow-md border-2 border-amber-400 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                Planta Baja • Cerca del Baño y Salida
              </span>
              <h4 className="text-lg font-black tracking-tight">1er Piso (Asientos 45 al 60)</h4>
            </div>

            {/* Bus Chassis Container */}
            <div className="w-full max-w-md bg-white rounded-[40px] p-5 sm:p-7 shadow-2xl border-4 border-slate-300 relative">
              
              {/* Front Area: Baños & Escaleras (Minimalist Navy Chips) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                
                {/* Baño Chip */}
                <div className="bg-[#0f294a] text-white border border-slate-700/50 rounded-2xl p-2.5 flex items-center space-x-2.5 shadow-xs select-none">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">Sanitarios</span>
                    <span className="text-[8px] text-blue-200">A bordo</span>
                  </div>
                </div>

                {/* Escalera Chip */}
                <div className="bg-[#0f294a] text-white border border-slate-700/50 rounded-2xl p-2.5 flex items-center space-x-2.5 shadow-xs select-none">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">Escalera</span>
                    <span className="text-[8px] text-blue-200">Al 2do Piso</span>
                  </div>
                </div>

              </div>

              {/* Column Labels */}
              <div className="flex items-center justify-between gap-2 px-1 pb-2.5 mb-3 border-b-2 border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                <div className="flex space-x-2">
                  <span className="w-12 sm:w-14 text-center">Ventana</span>
                  <span className="w-12 sm:w-14 text-center">Pasillo</span>
                </div>
                <div className="w-4 sm:w-6 text-center text-slate-200 text-[10px] font-mono">
                  •
                </div>
                <div className="flex space-x-2">
                  <span className="w-12 sm:w-14 text-center">Pasillo</span>
                  <span className="w-12 sm:w-14 text-center">Ventana</span>
                </div>
              </div>

              {/* 1st Floor Rows (Rows 1 to 4) */}
              <div className="space-y-3">
                {renderFloor1Rows()}
              </div>

              {/* Large Luggage / Equipaje Compartment at the Bottom */}
              <div className="mt-6 bg-slate-100 border-2 border-slate-300 rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-1 select-none">
                <Luggage className="w-8 h-8 text-slate-600 mb-0.5" />
                <span className="text-sm font-black uppercase text-slate-800 tracking-wider">
                  EQUIPAJE / MALETERO
                </span>
                <span className="text-xs text-slate-500">
                  Espacio amplio para maletas y bolsos de mano
                </span>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );

  // ===================== HELPER FOR FLOOR 2 ROWS =====================
  function renderFloor2Rows() {
    const rendered = [];

    // Row 1: Left [1, 2] | Right [4, 3]
    const s1 = floor2Seats.find(s => s.id === 1);
    const s2 = floor2Seats.find(s => s.id === 2);
    const s4 = floor2Seats.find(s => s.id === 4);
    const s3 = floor2Seats.find(s => s.id === 3);

    rendered.push(
      <div key="f2-r1" className="flex items-center justify-between gap-2">
        <div className="flex space-x-2">
          {renderSeat(s1)}
          {renderSeat(s2)}
        </div>
        <div className="w-4 sm:w-6 text-center text-slate-200 text-[9px] font-mono select-none">·</div>
        <div className="flex space-x-2">
          {renderSeat(s4)}
          {renderSeat(s3)}
        </div>
      </div>
    );

    // Row 2: Left [5, 6] | Right: Gradas (Stairs with architectural tread pattern)
    const s5 = floor2Seats.find(s => s.id === 5);
    const s6 = floor2Seats.find(s => s.id === 6);
    rendered.push(
      <div key="f2-r2" className="flex items-center justify-between gap-2">
        <div className="flex space-x-2">
          {renderSeat(s5)}
          {renderSeat(s6)}
        </div>
        <div className="w-4 sm:w-6 text-center text-slate-200 text-[9px] font-mono select-none">·</div>
        {/* Escalera Chip 2do Piso */}
        <div className="w-[104px] sm:w-[120px] h-14 sm:h-16 rounded-2xl bg-[#0f294a] border border-slate-700/50 text-white flex flex-col items-center justify-center p-1 relative select-none shadow-xs">
          <div className="flex items-center space-x-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-bold uppercase text-white font-display tracking-wider">Escalera</span>
          </div>
          <span className="text-[8px] text-blue-200 font-medium tracking-tight mt-0.5">Acceso 2do Piso</span>
        </div>
      </div>
    );

    // Row 3: Left [7, 8] | Right: Gradas (Stairs continue)
    const s7 = floor2Seats.find(s => s.id === 7);
    const s8 = floor2Seats.find(s => s.id === 8);
    rendered.push(
      <div key="f2-r3" className="flex items-center justify-between gap-2">
        <div className="flex space-x-2">
          {renderSeat(s7)}
          {renderSeat(s8)}
        </div>
        <div className="w-4 sm:w-6 text-center text-slate-200 text-[9px] font-mono select-none">·</div>
        {/* Escalera Chip 2do Piso */}
        <div className="w-[104px] sm:w-[120px] h-14 sm:h-16 rounded-2xl bg-[#0f294a] border border-slate-700/50 text-white flex flex-col items-center justify-center p-1 relative select-none shadow-xs">
          <div className="flex items-center space-x-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-bold uppercase text-white font-display tracking-wider">Escalera</span>
          </div>
          <span className="text-[8px] text-blue-200 font-medium tracking-tight mt-0.5">Acceso 2do Piso</span>
        </div>
      </div>
    );

    // Rows 4 to 12
    for (let r = 4; r <= 12; r++) {
      const base = (r - 4) * 4 + 9;
      const vL = floor2Seats.find(s => s.id === base);
      const pL = floor2Seats.find(s => s.id === base + 1);
      const pR = floor2Seats.find(s => s.id === base + 3);
      const vR = floor2Seats.find(s => s.id === base + 2);

      rendered.push(
        <div key={`f2-r${r}`} className="flex items-center justify-between gap-2">
          <div className="flex space-x-2">
            {renderSeat(vL)}
            {renderSeat(pL)}
          </div>
          <div className="w-4 sm:w-6 text-center text-slate-200 text-[9px] font-mono select-none">·</div>
          <div className="flex space-x-2">
            {renderSeat(pR)}
            {renderSeat(vR)}
          </div>
        </div>
      );
    }

    return rendered;
  }

  // ===================== HELPER FOR FLOOR 1 ROWS =====================
  function renderFloor1Rows() {
    const rendered = [];

    // Rows 1 to 3
    for (let r = 1; r <= 3; r++) {
      const base = (r - 1) * 4 + 45;
      const vL = floor1Seats.find(s => s.id === base);
      const pL = floor1Seats.find(s => s.id === base + 1);
      const pR = floor1Seats.find(s => s.id === base + 3);
      const vR = floor1Seats.find(s => s.id === base + 2);

      rendered.push(
        <div key={`f1-r${r}`} className="flex items-center justify-between gap-2">
          <div className="flex space-x-2">
            {renderSeat(vL)}
            {renderSeat(pL)}
          </div>
          <div className="w-4 sm:w-6 text-center text-slate-200 text-[9px] font-mono select-none">·</div>
          <div className="flex space-x-2">
            {renderSeat(pR)}
            {renderSeat(vR)}
          </div>
        </div>
      );
    }

    // Row 4 (Seats 57, 58 on left, mini Bar in center, Seats 60, 59 on right)
    const s57 = floor1Seats.find(s => s.id === 57);
    const s58 = floor1Seats.find(s => s.id === 58);
    const s60 = floor1Seats.find(s => s.id === 60);
    const s59 = floor1Seats.find(s => s.id === 59);

    rendered.push(
      <div key="f1-r4" className="flex items-center justify-between gap-2">
        <div className="flex space-x-2">
          {renderSeat(s57)}
          {renderSeat(s58)}
        </div>
        
        <div className="px-1.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[9px] font-black uppercase flex items-center space-x-1 shrink-0 select-none">
          <span>☕</span>
          <span className="hidden sm:inline">Bar</span>
        </div>

        <div className="flex space-x-2">
          {renderSeat(s60)}
          {renderSeat(s59)}
        </div>
      </div>
    );

    return rendered;
  }

  // ===================== LUXURY SEAT BUTTON RENDERER =====================
  function renderSeat(seat) {
    if (!seat) return <div className="w-12 sm:w-14 h-14 sm:h-16" />;

    const isSelected = selectedSeat && selectedSeat.id === seat.id;
    const isMyLock = seat.isMyLock || (activeSessionLock && activeSessionLock.seatId === seat.id);
    const isAvailable = seat.status === 'disponible';
    const isPending = seat.status === 'apartado';
    const isConfirmed = seat.status === 'confirmado';

    const matchesFilter = selectedWardFilter === 'ALL' || seat.ward === selectedWardFilter;
    const isDimmed = selectedWardFilter !== 'ALL' && !matchesFilter;
    const wardColor = seat.ward ? WARD_COLORS[seat.ward] : null;

    // Ultra-pro coach seat styling with full-border state coloring
    let seatClasses = "relative w-12 sm:w-14 h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all duration-200 transform cursor-pointer select-none font-sans font-bold shadow-xs active:scale-95 ";

    if (isSelected || isMyLock) {
      seatClasses += "bg-purple-600 text-white border-[2.5px] border-purple-400 ring-4 ring-purple-300/70 ring-offset-1 scale-105 shadow-md z-20 animate-pulse";
    } else if (viewMode === 'ward' && seat.ward && wardColor) {
      seatClasses += `${wardColor.bg} text-white border-[2.5px] ${wardColor.border} hover:scale-105`;
    } else if (isConfirmed) {
      seatClasses += "bg-[#0f294a] text-blue-100 border-[2.5px] border-[#0f294a] shadow-xs hover:scale-105";
    } else if (isPending) {
      seatClasses += "bg-amber-50 text-amber-950 border-[2.5px] border-amber-500 hover:bg-amber-100 hover:border-amber-600 hover:scale-105 shadow-xs";
    } else {
      // Emerald available with high-contrast full-card border
      seatClasses += "bg-emerald-50 text-emerald-950 border-[2.5px] border-emerald-500 hover:bg-emerald-100 hover:border-emerald-600 hover:scale-105 shadow-xs";
    }

    if (isDimmed) {
      seatClasses += " opacity-20 grayscale hover:opacity-80 transition";
    }

    return (
      <button
        key={seat.id}
        onClick={() => onSelectSeat(seat)}
        className={seatClasses}
        title={`Asiento ${seat.label} (${seat.position || 'Asiento'}) - ${seat.status.toUpperCase()} ${seat.ward ? `[${seat.ward}]` : ''}`}
      >
        {/* Seat Headrest / Cabecera con relieve */}
        <div className="w-8 sm:w-9 h-1.5 rounded-t-md bg-current opacity-30 shadow-xs"></div>

        {/* Seat Number in Sora Font Display */}
        <div className="flex flex-col items-center leading-none">
          <span className="text-sm sm:text-base font-extrabold tracking-tight font-display">{seat.label}</span>
          <span className="text-[8px] uppercase tracking-wider font-bold opacity-75">
            {seat.position === 'Ventana' ? 'VENT' : 'PASI'}
          </span>
        </div>

        {/* Status Indicator Icon or Dot */}
        <div className="w-full flex items-center justify-center">
          {isMyLock ? (
            <span className="text-[8px] font-black bg-white text-purple-950 px-1 rounded-sm">
              TUYO
            </span>
          ) : isConfirmed ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          ) : isPending ? (
            seat.remainingSeconds > 0 ? (
              <span className="text-[8px] font-mono font-black text-amber-950">
                {formatTimer(seat.remainingSeconds)}
              </span>
            ) : (
              <Clock className="w-3 h-3 text-amber-800" />
            )
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </div>

        {/* Ward Badge tag if reserved */}
        {seat.ward && (
          <div 
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-white shadow-xs"
            style={{ backgroundColor: wardColor?.bg ? undefined : '#2563eb' }}
            title={seat.ward}
          />
        )}
      </button>
    );
  }
}
