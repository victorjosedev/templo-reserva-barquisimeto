const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_TRIP_INFO = {
  title: 'Viaje de Estaca Barquisimeto al Santo Templo',
  stakeName: 'Estaca Barquisimeto',
  destination: 'Templo de Caracas, Venezuela',
  templeImage: '/templo_caracas.jpg',
  date: 'Sábado, 24 de Octubre de 2026',
  departureTime: '04:30 AM',
  returnTime: '08:30 PM (Mismo día)',
  meetingPoint: 'Centro de Estaca Barquisimeto (Capilla Principal)',
  priceUsd: 20,
  exchangeRate: 902.50,
  paymentDeadline: '18 de Octubre de 2026 - 11:59 PM',
  contactName: 'Hno. Ricardo Martínez (Tesorero de Estaca)',
  contactPhone: '+58 414-5551234',
  pagoMovil: {
    bank: 'Banco de Venezuela (0102)',
    idNumber: 'V-18.452.981',
    phone: '0414-5551234',
    holder: 'Comité de Viaje al Templo - Estaca Barquisimeto'
  },
  terms: [
    'El asiento se mantendrá reservado temporalmente durante 35 minutos mientras realiza y sube el pago.',
    'La confirmación definitiva es realizada por la tesorería de la estaca al validar la referencia de Pago Móvil.',
    'Se permite reembolso del 100% si se cancela hasta 5 días antes de la fecha de partida.',
    'Por favor presentarse con 25 minutos de anticipación con su boleto digital en el celular o impreso y su recomendación vigente.'
  ]
};

const WARDS = [
  'Barrio Acarigua',
  'Barrio Araure',
  'Barrio Los Pinos',
  'Barrio Cabudare',
  'Barrio Sabana de Parra',
  'Barrio Nueva Segovia',
  'Barrio Concordia',
  'Barrio San Felipe',
  'Barrio La Concordia'
];

function generateDoubleDeckerSeats() {
  const seats = [];

  // ===================== 2DO PISO (44 ASIENTOS) =====================
  // Row 1 (Full row)
  seats.push(
    { id: 1, floor: 2, row: 1, col: 'V_L', label: '01', side: 'left', position: 'Ventana' },
    { id: 2, floor: 2, row: 1, col: 'P_L', label: '02', side: 'left', position: 'Pasillo' },
    { id: 4, floor: 2, row: 1, col: 'P_R', label: '04', side: 'right', position: 'Pasillo' },
    { id: 3, floor: 2, row: 1, col: 'V_R', label: '03', side: 'right', position: 'Ventana' }
  );

  // Row 2: Left 5, 6. Right: Gradas
  seats.push(
    { id: 5, floor: 2, row: 2, col: 'V_L', label: '05', side: 'left', position: 'Ventana' },
    { id: 6, floor: 2, row: 2, col: 'P_L', label: '06', side: 'left', position: 'Pasillo' }
  );

  // Row 3: Left 7, 8. Right: Gradas
  seats.push(
    { id: 7, floor: 2, row: 3, col: 'V_L', label: '07', side: 'left', position: 'Ventana' },
    { id: 8, floor: 2, row: 3, col: 'P_L', label: '08', side: 'left', position: 'Pasillo' }
  );

  // Rows 4 to 12
  for (let r = 4; r <= 12; r++) {
    const base = (r - 4) * 4 + 9;
    const vL = base;
    const pL = base + 1;
    const pR = base + 3;
    const vR = base + 2;

    seats.push(
      { id: vL, floor: 2, row: r, col: 'V_L', label: String(vL).padStart(2, '0'), side: 'left', position: 'Ventana' },
      { id: pL, floor: 2, row: r, col: 'P_L', label: String(pL).padStart(2, '0'), side: 'left', position: 'Pasillo' },
      { id: pR, floor: 2, row: r, col: 'P_R', label: String(pR).padStart(2, '0'), side: 'right', position: 'Pasillo' },
      { id: vR, floor: 2, row: r, col: 'V_R', label: String(vR).padStart(2, '0'), side: 'right', position: 'Ventana' }
    );
  }

  // ===================== 1ER PISO (16 ASIENTOS) =====================
  // Rows 1 to 4:
  for (let r = 1; r <= 4; r++) {
    const base = (r - 1) * 4 + 45;
    const vL = base;
    const pL = base + 1;
    const pR = base + 3;
    const vR = base + 2;

    seats.push(
      { id: vL, floor: 1, row: r, col: 'V_L', label: String(vL).padStart(2, '0'), side: 'left', position: 'Ventana' },
      { id: pL, floor: 1, row: r, col: 'P_L', label: String(pL).padStart(2, '0'), side: 'left', position: 'Pasillo' },
      { id: pR, floor: 1, row: r, col: 'P_R', label: String(pR).padStart(2, '0'), side: 'right', position: 'Pasillo' },
      { id: vR, floor: 1, row: r, col: 'V_R', label: String(vR).padStart(2, '0'), side: 'right', position: 'Ventana' }
    );
  }

  return seats.map(s => ({
    ...s,
    status: 'disponible',
    lockedUntil: null,
    lockedBySession: null,
    reservation: null
  }));
}

class Storage {
  constructor() {
    this.ensureDir();
    this.data = this.loadData();
    this.cleanExpiredLocks();
    setInterval(() => this.cleanExpiredLocks(), 15 * 1000);
  }

  ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // If DB had old 48 seats layout, upgrade to 60 double-decker seats layout
        if (parsed.seats && parsed.seats.length === 60) {
          parsed.tripInfo.stakeName = 'Estaca Barquisimeto';
          parsed.tripInfo.templeImage = '/templo_caracas.jpg';
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading DB, creating default:', e);
    }

    const defaultData = {
      tripInfo: INITIAL_TRIP_INFO,
      wards: WARDS,
      seats: generateDoubleDeckerSeats(),
      adminPin: '7777',
      history: []
    };
    this.saveData(defaultData);
    return defaultData;
  }

  saveData(data = this.data) {
    try {
      this.ensureDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Error saving DB:', e);
    }
  }

  cleanExpiredLocks() {
    const now = Date.now();
    let changed = false;

    for (const seat of this.data.seats) {
      if (seat.lockedUntil && new Date(seat.lockedUntil).getTime() < now) {
        if (seat.status === 'apartado' && !seat.reservation?.reference) {
          seat.status = 'disponible';
          seat.lockedUntil = null;
          seat.lockedBySession = null;
          seat.reservation = null;
          changed = true;
        } else if (seat.status === 'disponible') {
          seat.lockedUntil = null;
          seat.lockedBySession = null;
          changed = true;
        }
      }
    }

    if (changed) {
      this.saveData();
    }
  }

  getSeats(sessionId = null) {
    this.cleanExpiredLocks();
    const now = Date.now();

    return this.data.seats.map(s => {
      let effectiveStatus = s.status;
      let isMyLock = false;
      let remainingSeconds = 0;

      if (s.lockedUntil) {
        const diffMs = new Date(s.lockedUntil).getTime() - now;
        if (diffMs > 0) {
          remainingSeconds = Math.floor(diffMs / 1000);
          if (sessionId && s.lockedBySession === sessionId) {
            isMyLock = true;
          }
        }
      }

      return {
        id: s.id,
        floor: s.floor,
        row: s.row,
        col: s.col,
        side: s.side,
        position: s.position,
        label: s.label,
        status: effectiveStatus,
        remainingSeconds,
        isMyLock,
        ward: s.reservation ? s.reservation.ward : null,
        passengerNameMasked: s.reservation ? maskName(s.reservation.fullName) : null
      };
    });
  }

  getAdminSeats() {
    this.cleanExpiredLocks();
    return this.data.seats;
  }

  getTripInfo() {
    return this.data.tripInfo;
  }

  updateTripInfo(newInfo) {
    this.data.tripInfo = { ...this.data.tripInfo, ...newInfo };
    this.saveData();
    return this.data.tripInfo;
  }

  getWards() {
    return this.data.wards;
  }

  lockSeat(seatId, sessionId, durationMinutes = 35) {
    this.cleanExpiredLocks();
    const seat = this.data.seats.find(s => s.id === Number(seatId));
    if (!seat) {
      throw new Error('Asiento no encontrado');
    }

    const now = Date.now();
    const isLocked = seat.lockedUntil && new Date(seat.lockedUntil).getTime() > now;

    if (seat.status === 'confirmado') {
      throw new Error('Este asiento ya está confirmado por otro pasajero.');
    }

    if (seat.status === 'apartado' && seat.reservation?.reference) {
      throw new Error('Este asiento ya tiene una reserva con comprobante en revisión.');
    }

    if (isLocked && seat.lockedBySession !== sessionId) {
      throw new Error('Este asiento está siendo reservado temporalmente por otro hermano en este momento.');
    }

    // Lock for duration
    const expiration = new Date(now + durationMinutes * 60 * 1000);
    seat.lockedUntil = expiration.toISOString();
    seat.lockedBySession = sessionId;
    if (seat.status === 'disponible') {
      seat.status = 'apartado';
    }

    this.saveData();
    return {
      seatId: seat.id,
      lockedUntil: seat.lockedUntil,
      remainingSeconds: Math.floor((expiration.getTime() - now) / 1000)
    };
  }

  releaseSeat(seatId, sessionId, forceAdmin = false) {
    const seat = this.data.seats.find(s => s.id === Number(seatId));
    if (!seat) throw new Error('Asiento no encontrado');

    if (!forceAdmin && seat.lockedBySession && seat.lockedBySession !== sessionId) {
      throw new Error('No tienes permiso para liberar este asiento.');
    }

    if (!forceAdmin && seat.status === 'confirmado') {
      throw new Error('Solo un administrador puede liberar un asiento confirmado.');
    }

    seat.status = 'disponible';
    seat.lockedUntil = null;
    seat.lockedBySession = null;
    seat.reservation = null;

    this.saveData();
    return { success: true, seatId };
  }

  reserveSeat(seatId, sessionId, data, receiptFile) {
    const seat = this.data.seats.find(s => s.id === Number(seatId));
    if (!seat) throw new Error('Asiento no encontrado');

    const now = Date.now();
    const isLockedByOther = seat.lockedUntil && new Date(seat.lockedUntil).getTime() > now && seat.lockedBySession !== sessionId;

    if (isLockedByOther) {
      throw new Error('El asiento está reservado por otra persona.');
    }
    if (seat.status === 'confirmado') {
      throw new Error('El asiento ya fue confirmado previamente.');
    }

    const reservationId = 'TMP-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const reservation = {
      id: reservationId,
      seatId: seat.id,
      seatLabel: seat.label,
      floor: seat.floor,
      position: seat.position,
      fullName: (data.fullName || '').trim(),
      cedula: (data.cedula || '').trim(),
      ward: data.ward || 'Barrio Acarigua',
      phone: (data.phone || '').trim(),
      reference: (data.reference || '').trim(),
      receiptUrl: receiptFile ? `/uploads/${receiptFile.filename}` : (data.existingReceiptUrl || null),
      notes: data.notes || '',
      amountUsd: this.data.tripInfo.priceUsd,
      amountBs: Math.round(this.data.tripInfo.priceUsd * this.data.tripInfo.exchangeRate * 100) / 100,
      createdAt: new Date().toISOString(),
      status: 'apartado',
      confirmedAt: null
    };

    seat.status = 'apartado';
    seat.lockedUntil = null;
    seat.lockedBySession = null;
    seat.reservation = reservation;

    this.saveData();
    return reservation;
  }

  updateReservationStatus(seatId, newStatus, adminNotes = '') {
    const seat = this.data.seats.find(s => s.id === Number(seatId));
    if (!seat || !seat.reservation) {
      throw new Error('No existe una reserva en este asiento.');
    }

    if (newStatus === 'confirmado') {
      seat.status = 'confirmado';
      seat.reservation.status = 'confirmado';
      seat.reservation.confirmedAt = new Date().toISOString();
      if (adminNotes) seat.reservation.adminNotes = adminNotes;
    } else if (newStatus === 'rechazado' || newStatus === 'disponible') {
      seat.status = 'disponible';
      seat.lockedUntil = null;
      seat.lockedBySession = null;
      const oldRes = { ...seat.reservation, status: 'rechazado', rejectedAt: new Date().toISOString(), adminNotes };
      this.data.history.push(oldRes);
      seat.reservation = null;
    }

    this.saveData();
    return seat;
  }

  lookupReservation(query) {
    if (!query) return [];
    const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const matches = [];
    for (const seat of this.data.seats) {
      if (seat.reservation) {
        const res = seat.reservation;
        const cClean = (res.cedula || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pClean = (res.phone || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const idClean = (res.id || '').toLowerCase();

        if (cClean.includes(q) || pClean.includes(q) || idClean.includes(q)) {
          matches.push({
            ...res,
            tripDate: this.data.tripInfo.date,
            departureTime: this.data.tripInfo.departureTime,
            meetingPoint: this.data.tripInfo.meetingPoint
          });
        }
      }
    }
    return matches;
  }

  verifyAdminPin(pin) {
    return String(pin).trim() === String(this.data.adminPin);
  }

  setAdminPin(newPin) {
    if (!newPin || String(newPin).trim().length < 4) {
      throw new Error('El PIN debe tener al menos 4 caracteres');
    }
    this.data.adminPin = String(newPin).trim();
    this.saveData();
    return true;
  }
}

function maskName(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return parts.map((p, idx) => {
    if (idx === 0) return p;
    return p[0] + '***';
  }).join(' ');
}

module.exports = new Storage();
