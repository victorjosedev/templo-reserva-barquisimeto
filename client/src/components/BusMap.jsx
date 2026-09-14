import React, { useState } from 'react';
import { 
  Toilet, 
  Stairs, 
  Stack, 
  SuitcaseRolling, 
  Coffee, 
  Clock, 
  CheckCircle, 
  MapPin, 
  SlidersHorizontal 
} from '@phosphor-icons/react';

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
      <div id="bus-section" className="bg-white rounded-3xl shadow-sm border border-[#E2E5EA] p-3 sm:p-5 mb-5">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Floor Navigation Tabs (Clean Phosphor Icons, Zero Emojis) */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-[#E2E5EA]">
            {/* 2do Piso */}
            <button
              onClick={() => setActiveFloor('2')}
              className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                activeFloor === '2'
                  ? 'bg-[#0E1E3A] text-white shadow-md'
                  : 'text-[#0E1E3A] hover:bg-white/60'
              }`}
            >
              <Stack size={18} weight="bold" />
              <span>2do Piso</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeFloor === '2' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {floor2Available} libres
              </span>
            </button>

            {/* 1er Piso */}
            <button
              onClick={() => setActiveFloor('1')}
              className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                activeFloor === '1'
                  ? 'bg-[#0E1E3A] text-white shadow-md'
                  : 'text-[#0E1E3A] hover:bg-white/60'
              }`}
            >
              <Stack size={18} weight="bold" />
              <span>1er Piso</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeFloor === '1' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {floor1Available} libres
              </span>
            </button>

            {/* Ambos Pisos (Desktop) */}
            <button
              onClick={() => setActiveFloor('both')}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition ${
                activeFloor === 'both'
                  ? 'bg-[#0E1E3A] text-white shadow-md'
                  : 'text-[#0E1E3A] hover:bg-white/60'
              }`}
            >
              <span>Ambos Pisos</span>
            </button>
          </div>

          {/* Right: Ward Filter & View Mode */}
          <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
            
            {/* Ward selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-[#E2E5EA] rounded-xl px-2.5 py-1">
              <MapPin size={15} weight="bold" className="text-[#6B7280] shrink-0" />
              <select
                value={selectedWardFilter}
                onChange={(e) => setSelectedWardFilter(e.target.value)}
                className="bg-transparent border-none text-[#0E1E3A] text-xs font-bold py-1 px-1 cursor-pointer focus:outline-none"
              >
                <option value="ALL">Filtrar por Barrio (Todos)</option>
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward} ({getWardOccupiedCount(ward)})
                  </option>
                ))}
              </select>

              {selectedWardFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedWardFilter('ALL')}
                  className="text-[10px] text-rose-600 font-extrabold underline shrink-0"
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
                    ? 'bg-[#0E1E3A] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0E1E3A]'
                }`}
              >
                Por Estado
              </button>
              <button
                type="button"
                onClick={() => setViewMode('ward')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'ward'
                    ? 'bg-[#0E1E3A] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0E1E3A]'
                }`}
              >
                Por Barrio
              </button>
            </div>

          </div>

        </div>

        {/* Compact Legend Strip */}
        <div className="mt-2.5 pt-2.5 border-t border-[#E2E5EA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-[#2E9E6D] inline-block shadow-2xs"></span>
              <span className="font-semibold text-[#0E1E3A]">Verde: Libre</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-[#E8A23A] inline-block shadow-2xs"></span>
              <span className="font-medium text-[#0E1E3A]">Ámbar: En revisión</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-[#3B6EA5] inline-block shadow-2xs"></span>
              <span className="font-medium text-[#0E1E3A]">Azul: Confirmado</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-[#7C4DFF] inline-block shadow-2xs"></span>
              <span className="font-bold text-[#7C4DFF]">Púrpura: Tu selección</span>
            </div>
          </div>

          <span className="text-[10px] text-[#6B7280] italic hidden sm:inline font-mono">
            Bloqueo protegido de 35 min al tocar asiento
          </span>
        </div>

      </div>

      {/* Main Bus Deck Visualization Grid */}
      <div className={`grid gap-8 justify-center ${activeFloor === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* ==================== 2DO PISO (44 Asientos) ==================== */}
        {(activeFloor === '2' || activeFloor === 'both') && (
          <div className="flex flex-col items-center">
            
            {/* Floor Title Pill */}
            <div className="mb-3 px-5 py-2.5 bg-[#0E1E3A] text-white rounded-2xl shadow-md border border-[#1B2F52] text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 block font-mono">
                Planta Alta • Vista Panorámica
              </span>
              <h4 className="text-lg font-bold tracking-tight font-display">2do Piso (Asientos 01 al 44)</h4>
            </div>

            {/* Bus Chassis Container */}
            <div className="w-full max-w-md bg-white rounded-[40px] p-5 sm:p-7 shadow-2xl border-4 border-[#E2E5EA] relative">
              
              {/* Front Windshield (Road View) */}
              <div className="bg-gradient-to-b from-[#0E1E3A] via-[#1B2F52] to-[#0E1E3A] rounded-3xl p-4 mb-5 text-white text-center relative shadow-inner border border-slate-700">
                <div className="absolute top-2 left-6 right-6 h-2 bg-white/20 rounded-full blur-[1px]"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-200 block pt-1 font-display">
                  PARABRISAS DELANTERO • VISTA PANORÁMICA
                </span>
                <span className="text-[10px] text-slate-300">Frente del Autobús</span>
              </div>

              {/* Column Labels */}
              <div className="flex items-center justify-between gap-2 px-1 pb-2.5 mb-3 border-b-2 border-[#E2E5EA] text-[10px] font-black uppercase tracking-wider text-[#6B7280] select-none">
                <div className="flex space-x-2">
                  <span className="w-12 sm:w-14 text-center">Ventana</span>
                  <span className="w-12 sm:w-14 text-center">Pasillo</span>
                </div>
                <div className="w-4 sm:w-6 text-center text-slate-300 text-[10px] font-mono">
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
              <div className="mt-6 pt-3 border-t-2 border-[#E2E5EA] text-center text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                Parte Trasera del 2do Piso
              </div>

            </div>
          </div>
        )}

        {/* ==================== 1ER PISO (16 Asientos) ==================== */}
        {(activeFloor === '1' || activeFloor === 'both') && (
          <div className="flex flex-col items-center">
            
            {/* Floor Title Pill */}
            <div className="mb-3 px-5 py-2.5 bg-[#0E1E3A] text-white rounded-2xl shadow-md border border-[#1B2F52] text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 block font-mono">
                Planta Baja • Cerca de Sanitarios y Salida
              </span>
              <h4 className="text-lg font-bold tracking-tight font-display">1er Piso (Asientos 45 al 60)</h4>
            </div>

            {/* Bus Chassis Container */}
            <div className="w-full max-w-md bg-white rounded-[40px] p-5 sm:p-7 shadow-2xl border-4 border-[#E2E5EA] relative">
              
              {/* Front Area: Baños & Escaleras (Minimalist Navy Chips with Phosphor Icons) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                
                {/* Baño Chip */}
                <div className="bg-[#0E1E3A] text-white border border-[#1B2F52] rounded-2xl p-2.5 flex items-center space-x-2.5 shadow-xs select-none">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
                    <Toilet size={20} weight="duotone" className="text-blue-300" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">Sanitarios</span>
                    <span className="text-[9px] text-blue-200">A bordo</span>
                  </div>
                </div>

                {/* Escalera Chip */}
                <div className="bg-[#0E1E3A] text-white border border-[#1B2F52] rounded-2xl p-2.5 flex items-center space-x-2.5 shadow-xs select-none">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shrink-0">
                    <Stairs size={20} weight="duotone" className="text-slate-200" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">Escalera</span>
                    <span className="text-[9px] text-blue-200">Al 2do Piso</span>
                  </div>
                </div>

              </div>

              {/* Column Labels */}
              <div className="flex items-center justify-between gap-2 px-1 pb-2.5 mb-3 border-b-2 border-[#E2E5EA] text-[10px] font-black uppercase tracking-wider text-[#6B7280] select-none">
                <div className="flex space-x-2">
                  <span className="w-12 sm:w-14 text-center">Ventana</span>
                  <span className="w-12 sm:w-14 text-center">Pasillo</span>
                </div>
                <div className="w-4 sm:w-6 text-center text-slate-300 text-[10px] font-mono">
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

              {/* Large Luggage / Equipaje Compartment at the Bottom with Phosphor SuitcaseRolling */}
              <div className="mt-6 bg-[#F7F8FA] border-2 border-[#E2E5EA] rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-1 select-none">
                <SuitcaseRolling size={28} weight="duotone" className="text-[#0E1E3A] mb-0.5" />
                <span className="text-sm font-bold uppercase text-[#0E1E3A] tracking-wider font-display">
                  Equipaje / Maletero
                </span>
                <span className="text-xs text-[#6B7280]">
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
        <div className="w-4 sm:w-6 text-center text-slate-300 text-[9px] font-mono select-none">·</div>
        {/* Escalera Chip 2do Piso */}
        <div className="w-[104px] sm:w-[120px] h-14 sm:h-16 rounded-2xl bg-[#0E1E3A] border border-[#1B2F52] text-white flex flex-col items-center justify-center p-1 relative select-none shadow-xs">
          <div className="flex items-center space-x-1.5">
            <Stairs size={18} weight="duotone" className="text-slate-200" />
            <span className="text-[11px] font-bold uppercase text-white font-display tracking-wider">Escalera</span>
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
        <div className="w-4 sm:w-6 text-center text-slate-300 text-[9px] font-mono select-none">·</div>
        {/* Escalera Chip 2do Piso */}
        <div className="w-[104px] sm:w-[120px] h-14 sm:h-16 rounded-2xl bg-[#0E1E3A] border border-[#1B2F52] text-white flex flex-col items-center justify-center p-1 relative select-none shadow-xs">
          <div className="flex items-center space-x-1.5">
            <Stairs size={18} weight="duotone" className="text-slate-200" />
            <span className="text-[11px] font-bold uppercase text-white font-display tracking-wider">Escalera</span>
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
          <div className="w-4 sm:w-6 text-center text-slate-300 text-[9px] font-mono select-none">·</div>
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
          <div className="w-4 sm:w-6 text-center text-slate-300 text-[9px] font-mono select-none">·</div>
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
        
        <div className="px-2 py-1 bg-slate-100 text-[#0E1E3A] border border-[#E2E5EA] rounded-lg text-[9px] font-bold uppercase flex items-center space-x-1 shrink-0 select-none">
          <Coffee size={14} weight="duotone" className="text-[#0E1E3A]" />
          <span className="hidden sm:inline font-sans">Cafetín</span>
        </div>

        <div className="flex space-x-2">
          {renderSeat(s60)}
          {renderSeat(s59)}
        </div>
      </div>
    );

    return rendered;
  }

  // ===================== SEAT BUTTON RENDERER WITH BRAND TOKENS =====================
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

    // Design Tokens for seat states:
    // --color-status-free: #2E9E6D (green)
    // --color-status-review: #E8A23A (amber)
    // --color-status-confirmed: #3B6EA5 (blue)
    // --color-status-selected: #7C4DFF (purple)
    let seatClasses = "relative w-12 sm:w-14 h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all duration-200 transform cursor-pointer select-none font-sans font-bold shadow-xs active:scale-95 ";

    if (isSelected || isMyLock) {
      seatClasses += "bg-[#7C4DFF] text-white border-[2.5px] border-[#7C4DFF] ring-4 ring-[#7C4DFF]/40 ring-offset-1 scale-105 shadow-md z-20 animate-pulse";
    } else if (viewMode === 'ward' && seat.ward && wardColor) {
      seatClasses += `${wardColor.bg} text-white border-[2.5px] ${wardColor.border} hover:scale-105`;
    } else if (isConfirmed) {
      seatClasses += "bg-[#3B6EA5] text-white border-[2.5px] border-[#3B6EA5] shadow-xs hover:scale-105";
    } else if (isPending) {
      seatClasses += "bg-[#E8A23A]/15 text-[#0E1E3A] border-[2.5px] border-[#E8A23A] hover:bg-[#E8A23A]/25 hover:scale-105 shadow-xs";
    } else {
      seatClasses += "bg-[#2E9E6D]/15 text-[#0E1E3A] border-[2.5px] border-[#2E9E6D] hover:bg-[#2E9E6D]/25 hover:scale-105 shadow-xs";
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
        <div className="w-8 sm:w-9 h-1.5 rounded-t-md bg-current opacity-30 shadow-2xs"></div>

        {/* Seat Number in JetBrains Mono */}
        <div className="flex flex-col items-center leading-none">
          <span className="text-sm sm:text-base font-extrabold tracking-tight font-mono">{seat.label}</span>
          <span className="text-[8px] uppercase tracking-wider font-bold opacity-75">
            {seat.position === 'Ventana' ? 'VENT' : 'PASI'}
          </span>
        </div>

        {/* Status Indicator Icon or Dot */}
        <div className="w-full flex items-center justify-center">
          {isMyLock ? (
            <span className="text-[8px] font-black bg-white text-[#7C4DFF] px-1 rounded-sm font-mono">
              TUYO
            </span>
          ) : isConfirmed ? (
            <CheckCircle size={15} weight="fill" className="text-white" />
          ) : isPending ? (
            seat.remainingSeconds > 0 ? (
              <span className="text-[8px] font-mono font-black text-[#0E1E3A]">
                {formatTimer(seat.remainingSeconds)}
              </span>
            ) : (
              <Clock size={13} weight="bold" className="text-[#E8A23A]" />
            )
          ) : (
            <span className="w-2 h-2 rounded-full bg-[#2E9E6D]"></span>
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
