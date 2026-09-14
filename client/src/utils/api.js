// Utility for handling API requests and session ID
const SESSION_KEY = 'templo_session_id';

export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export async function fetchTripInfo() {
  const res = await fetch('/api/trip-info');
  if (!res.ok) throw new Error('Error al obtener información del viaje');
  return res.json();
}

export async function fetchWards() {
  const res = await fetch('/api/wards');
  if (!res.ok) throw new Error('Error al obtener lista de barrios');
  return res.json();
}

export async function fetchSeats(sessionId) {
  const url = sessionId ? `/api/seats?sessionId=${encodeURIComponent(sessionId)}` : '/api/seats';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar mapa de asientos');
  return res.json();
}

export async function lockSeat(seatId, sessionId, durationMinutes = 35) {
  const res = await fetch('/api/seats/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatId, sessionId, durationMinutes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No se pudo apartar el asiento');
  return data;
}

export async function releaseSeat(seatId, sessionId) {
  const res = await fetch('/api/seats/release', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatId, sessionId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al liberar asiento');
  return data;
}

export async function reserveSeat(formData) {
  const res = await fetch('/api/seats/reserve', {
    method: 'POST',
    body: formData // multipart/form-data
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al procesar reserva');
  return data;
}

export async function lookupReservation(query) {
  const res = await fetch(`/api/reservations/lookup?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al buscar reserva');
  return data.results || [];
}

// Admin API
export async function adminLogin(pin) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'PIN incorrecto');
  return data;
}

export async function fetchAdminReservations(pin) {
  const res = await fetch('/api/admin/reservations', {
    headers: { 'x-admin-pin': pin }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Acceso no autorizado');
  return data;
}

export async function updateReservationStatus(seatId, status, adminNotes, pin) {
  const res = await fetch(`/api/admin/reservations/${seatId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin
    },
    body: JSON.stringify({ status, adminNotes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar reserva');
  return data;
}

export async function updateTripInfo(info, pin) {
  const res = await fetch('/api/admin/trip-info', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': pin
    },
    body: JSON.stringify(info)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar viaje');
  return data;
}

export function formatBs(amount) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
}

export function formatUsd(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export function generateWhatsAppMessage(reservation, tripInfo) {
  const msg = `🚌 *COMPROBANTE DE RESERVA - VIAJE AL TEMPLO* 🏛️
-----------------------------------
*Pasajero:* ${reservation.fullName}
*Cédula:* ${reservation.cedula}
*Barrio:* ${reservation.ward}
*Puesto N°:* ${reservation.seatLabel}
*Ref. Pago Móvil:* ${reservation.reference}
*Monto:* $${reservation.amountUsd} (Bs. ${reservation.amountBs})
*Estado:* ${reservation.status === 'confirmado' ? '✅ CONFIRMADO' : '⏳ EN REVISIÓN'}
-----------------------------------
*Salida:* ${tripInfo?.date || 'Sábado 24 de Octubre'} a las ${tripInfo?.departureTime || '04:30 AM'}
*Punto de Encuentro:* ${tripInfo?.meetingPoint || 'Capilla de Estaca'}
*Código Boleto:* ${reservation.id}

_Presenta este boleto digital al abordar el autobús._`;
  return encodeURIComponent(msg);
}
