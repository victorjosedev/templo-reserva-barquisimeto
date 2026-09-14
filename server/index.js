const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const XLSX = require('xlsx');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer storage for payment receipts
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = 'comprobante_' + Date.now() + '_' + Math.round(Math.random() * 1e4) + ext;
    cb(null, cleanName);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Sube una imagen (JPG, PNG, WEBP) o PDF.'));
    }
  }
});

// Admin auth middleware (simple PIN based for ease of use by stake leaders)
function adminAuth(req, res, next) {
  const pin = req.headers['x-admin-pin'] || req.query.adminPin;
  if (!pin || !storage.verifyAdminPin(pin)) {
    return res.status(401).json({ error: 'PIN de administrador inválido o no suministrado.' });
  }
  next();
}

// ---------------- API ROUTES ----------------

// 1. Get Trip Info & Payment details
app.get('/api/trip-info', (req, res) => {
  res.json(storage.getTripInfo());
});

// 2. Get list of wards
app.get('/api/wards', (req, res) => {
  res.json(storage.getWards());
});

// 3. Get Seats (Public view with status, timer, masked names)
app.get('/api/seats', (req, res) => {
  const sessionId = req.query.sessionId || null;
  const seats = storage.getSeats(sessionId);
  res.json({ seats });
});

// 4. Temporary Seat Lock (35 min)
app.post('/api/seats/lock', (req, res) => {
  try {
    const { seatId, sessionId, durationMinutes } = req.body;
    if (!seatId || !sessionId) {
      return res.status(400).json({ error: 'Se requiere seatId y sessionId' });
    }
    const result = storage.lockSeat(seatId, sessionId, durationMinutes || 35);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Release Lock
app.post('/api/seats/release', (req, res) => {
  try {
    const { seatId, sessionId } = req.body;
    if (!seatId || !sessionId) {
      return res.status(400).json({ error: 'Se requiere seatId y sessionId' });
    }
    const result = storage.releaseSeat(seatId, sessionId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Submit Reservation (with receipt upload)
app.post('/api/seats/reserve', upload.single('receipt'), (req, res) => {
  try {
    const { seatId, sessionId, fullName, cedula, ward, phone, reference, notes } = req.body;
    if (!seatId || !fullName || !cedula || !phone || !reference) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (asiento, nombre, cédula, teléfono, referencia)' });
    }

    const reservation = storage.reserveSeat(
      seatId,
      sessionId,
      { fullName, cedula, ward, phone, reference, notes },
      req.file
    );

    res.json({ success: true, reservation });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Lookup reservation (by ID, cédula or phone)
app.get('/api/reservations/lookup', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Debes ingresar cédula, teléfono o código de reserva.' });
  }
  const results = storage.lookupReservation(query);
  res.json({ results });
});

// 8. Admin login verification
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (storage.verifyAdminPin(pin)) {
    res.json({ success: true, message: 'Autenticación exitosa' });
  } else {
    res.status(401).json({ success: false, error: 'PIN de acceso incorrecto' });
  }
});

// 9. Admin: Get all seats & complete reservations
app.get('/api/admin/reservations', adminAuth, (req, res) => {
  const seats = storage.getAdminSeats();
  const tripInfo = storage.getTripInfo();

  // Compute live stats
  const totalSeats = seats.length;
  const confirmedSeats = seats.filter(s => s.status === 'confirmado').length;
  const pendingSeats = seats.filter(s => s.status === 'apartado').length;
  const availableSeats = seats.filter(s => s.status === 'disponible').length;

  const totalCollectedUsd = confirmedSeats * tripInfo.priceUsd;
  const totalCollectedBs = Math.round(totalCollectedUsd * tripInfo.exchangeRate * 100) / 100;
  const potentialTotalUsd = (confirmedSeats + pendingSeats) * tripInfo.priceUsd;
  const potentialTotalBs = Math.round(potentialTotalUsd * tripInfo.exchangeRate * 100) / 100;

  // Ward breakdown
  const wardBreakdown = {};
  for (const w of storage.getWards()) {
    wardBreakdown[w] = { confirmed: 0, pending: 0, total: 0 };
  }
  for (const s of seats) {
    if (s.reservation && s.reservation.ward) {
      const w = s.reservation.ward;
      if (!wardBreakdown[w]) wardBreakdown[w] = { confirmed: 0, pending: 0, total: 0 };
      if (s.status === 'confirmado') wardBreakdown[w].confirmed++;
      if (s.status === 'apartado') wardBreakdown[w].pending++;
      wardBreakdown[w].total++;
    }
  }

  res.json({
    seats,
    stats: {
      totalSeats,
      confirmedSeats,
      pendingSeats,
      availableSeats,
      totalCollectedUsd,
      totalCollectedBs,
      potentialTotalUsd,
      potentialTotalBs,
      priceUsd: tripInfo.priceUsd,
      exchangeRate: tripInfo.exchangeRate,
      wardBreakdown
    }
  });
});

// 10. Admin: Update Reservation Status (Confirm or Reject/Release)
app.patch('/api/admin/reservations/:seatId', adminAuth, (req, res) => {
  try {
    const { seatId } = req.params;
    const { status, adminNotes } = req.body;
    if (!['confirmado', 'rechazado', 'disponible'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const updatedSeat = storage.updateReservationStatus(seatId, status, adminNotes);
    res.json({ success: true, seat: updatedSeat });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 11. Admin: Update Trip Info
app.put('/api/admin/trip-info', adminAuth, (req, res) => {
  try {
    const updated = storage.updateTripInfo(req.body);
    res.json({ success: true, tripInfo: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 12. Admin: Change PIN
app.post('/api/admin/change-pin', adminAuth, (req, res) => {
  try {
    const { newPin } = req.body;
    storage.setAdminPin(newPin);
    res.json({ success: true, message: 'PIN actualizado exitosamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 13. Admin: Export to Excel (.xlsx)
app.get('/api/admin/export', adminAuth, (req, res) => {
  try {
    const seats = storage.getAdminSeats();
    const tripInfo = storage.getTripInfo();

    const dataRows = seats.map(s => {
      const res = s.reservation;
      return {
        'N° Asiento': s.label,
        'Piso': s.floor === 2 ? '2do Piso (Panorámico)' : '1er Piso',
        'Ubicación': s.position || (s.col.startsWith('V') ? 'Ventana' : 'Pasillo'),
        'Fila': `Fila ${s.row}`,
        'Estado': s.status.toUpperCase(),
        'Nombre del Pasajero': res ? res.fullName : 'DISPONIBLE',
        'Cédula': res ? res.cedula : '',
        'Barrio': res ? res.ward : '',
        'Teléfono / WhatsApp': res ? res.phone : '',
        'Referencia Pago': res ? res.reference : '',
        'Monto USD': res ? `$${res.amountUsd}` : '',
        'Monto Bs': res ? `Bs. ${res.amountBs}` : '',
        'Fecha Reserva': res ? new Date(res.createdAt).toLocaleString('es-VE') : '',
        'Comprobante': res && res.receiptUrl ? `http://${req.headers.host}${res.receiptUrl}` : '',
        'Notas': res ? (res.notes || '') : ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    // Adjust column widths
    const colWidths = [
      { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 28 },
      { wch: 16 }, { wch: 24 }, { wch: 20 }, { wch: 20 },
      { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 35 }, { wch: 25 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pasajeros Templo');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `Pasajeros_Viaje_Templo_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Error generando archivo Excel' });
  }
});

// Serve frontend build in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
console.log('📁 Verificando directorio frontend:', clientDist, '| Existe:', fs.existsSync(clientDist));

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Explicit root handler
  app.get('/', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  // SPA fallback for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.error('⚠️ ALERTA: No se encontró la carpeta client/dist');
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f294a; color: white;">
        <h2>🚌 Servidor Activo (Estaca Barquisimeto)</h2>
        <p>El backend está en línea pero la compilación del frontend aún se está procesando.</p>
      </div>
    `);
  });
}

// Health check for Render load balancer
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server (explicit 0.0.0.0 binding for Render / cloud containers)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚌 Servidor de Reserva Templo activo en http://0.0.0.0:${PORT}`);
});
