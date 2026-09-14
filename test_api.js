const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf-8');
        let json = null;
        try { json = JSON.parse(text); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json || text,
          buffer
        });
      });
    });

    req.on('error', reject);
    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- INICIANDO PRUEBAS DEL SISTEMA ---');

  // 1. Check Trip Info
  const tripRes = await request('http://localhost:5000/api/trip-info');
  console.log('1. Trip Info status:', tripRes.statusCode, '| Title:', tripRes.data.title);
  if (!tripRes.data.pagoMovil?.phone) throw new Error('Pago Móvil data missing');

  // 2. Check Wards
  const wardsRes = await request('http://localhost:5000/api/wards');
  console.log('2. Wards count:', wardsRes.data.length, '| Sample:', wardsRes.data.slice(0, 3));
  if (wardsRes.data.length !== 9) throw new Error('Expected 9 wards');

  // 3. Check Seats
  const seatsRes = await request('http://localhost:5000/api/seats');
  console.log('3. Seats count:', seatsRes.data.seats.length, '| First seat:', seatsRes.data.seats[0].label);
  if (seatsRes.data.seats.length !== 60) throw new Error('Expected 60 seats');

  // 4. Temporary Seat Lock
  const testSession = 'sess_test_123';
  const lockRes = await request('http://localhost:5000/api/seats/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    seatId: 5,
    sessionId: testSession,
    durationMinutes: 35
  });
  console.log('4. Lock seat 5 status:', lockRes.statusCode, '| LockedUntil:', lockRes.data.lockedUntil);

  // 5. Another session trying to lock the same seat
  const otherSession = 'sess_other_456';
  const lockOtherRes = await request('http://localhost:5000/api/seats/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    seatId: 5,
    sessionId: otherSession,
    durationMinutes: 35
  });
  console.log('5. Other session lock blocked as expected:', lockOtherRes.statusCode === 400, '| Msg:', lockOtherRes.data.error);

  // 6. Complete Reservation for seat 5
  // We can use multipart/form-data or simple JSON if we construct boundary, or test JSON
  // Let's create a boundary for multipart
  const boundary = '----WebKitFormBoundaryTest12345';
  const fields = {
    seatId: '5',
    sessionId: testSession,
    fullName: 'Hermano Carlos Mendoza',
    cedula: 'V-15.890.123',
    ward: 'Barrio Los Pinos',
    phone: '0414-9876543',
    reference: '984521',
    notes: 'Asiento para viaje de templo'
  };

  let body = '';
  for (const [k, v] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${k}"\r\n\r\n`;
    body += `${v}\r\n`;
  }
  body += `--${boundary}--\r\n`;

  const reserveRes = await request('http://localhost:5000/api/seats/reserve', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);
  console.log('6. Reserve seat 5 status:', reserveRes.statusCode, '| Reservation ID:', reserveRes.data.reservation?.id);

  // 7. Lookup reservation by Cédula
  const lookupRes = await request('http://localhost:5000/api/reservations/lookup?q=15890123');
  console.log('7. Lookup status:', lookupRes.statusCode, '| Results found:', lookupRes.data.results.length);
  if (lookupRes.data.results.length === 0) throw new Error('Reservation lookup failed');

  // 8. Admin login verification
  const adminLoginRes = await request('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { pin: '7777' });
  console.log('8. Admin login status:', adminLoginRes.statusCode, '| Success:', adminLoginRes.data.success);

  // 9. Admin reservations list
  const adminRes = await request('http://localhost:5000/api/admin/reservations', {
    headers: { 'x-admin-pin': '7777' }
  });
  console.log('9. Admin reservations status:', adminRes.statusCode, '| Pending seats:', adminRes.data.stats.pendingSeats);

  // 10. Admin confirms payment
  const confirmRes = await request('http://localhost:5000/api/admin/reservations/5', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': '7777'
    }
  }, { status: 'confirmado', adminNotes: 'Pago verificado en BDV' });
  console.log('10. Admin confirm status:', confirmRes.statusCode, '| Seat status:', confirmRes.data.seat?.status);

  // 11. Admin Export to Excel (.xlsx)
  const exportRes = await request('http://localhost:5000/api/admin/export?adminPin=7777');
  console.log('11. Export Excel status:', exportRes.statusCode, '| Bytes received:', exportRes.buffer.length);
  if (exportRes.buffer.length < 1000) throw new Error('Excel export payload too small');

  // 12. Frontend SPA index.html served
  const frontendRes = await request('http://localhost:5000/');
  console.log('12. Frontend SPA status:', frontendRes.statusCode, '| Contains root div:', typeof frontendRes.data === 'string' && frontendRes.data.includes('id="root"'));

  console.log('\n✅ ¡TODAS LAS PRUEBAS AUTOMATIZADAS PASARON CON ÉXITO!');
}

runTests().catch(err => {
  console.error('❌ Error en prueba:', err);
  process.exit(1);
});
