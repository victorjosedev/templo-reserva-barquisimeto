import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import TripBanner from './components/TripBanner';
import BusMap from './components/BusMap';
import SeatModal from './components/SeatModal';
import TicketModal from './components/TicketModal';
import LookupModal from './components/LookupModal';
import TripDetailsModal from './components/TripDetailsModal';
import AdminDashboard from './components/AdminDashboard';
import BottomNav from './components/BottomNav';
import ActiveSeatBar from './components/ActiveSeatBar';
import { 
  fetchSeats, 
  fetchTripInfo, 
  fetchWards, 
  lockSeat, 
  releaseSeat, 
  reserveSeat, 
  getSessionId 
} from './utils/api';
import { Handshake } from '@phosphor-icons/react';

export default function App() {
  const sessionId = getSessionId();

  // State
  const [seats, setSeats] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active user's lock
  const [activeSessionLock, setActiveSessionLock] = useState(null);

  // Filter by Ward
  const [selectedWardFilter, setSelectedWardFilter] = useState('ALL');

  // Modals
  const [selectedSeatForModal, setSelectedSeatForModal] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isTripDetailsOpen, setIsTripDetailsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Feedback banner
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [seatsData, tripData, wardsData] = await Promise.all([
        fetchSeats(sessionId),
        fetchTripInfo(),
        fetchWards()
      ]);
      setSeats(seatsData.seats || []);
      setTripInfo(tripData);
      setWards(wardsData || []);

      // Check if user has an active locked seat
      const myLocked = (seatsData.seats || []).find(s => s.isMyLock);
      if (myLocked) {
        setActiveSessionLock({
          seatId: myLocked.id,
          remainingSeconds: myLocked.remainingSeconds
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Initial load and periodic refresh (every 12 seconds)
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle seat selection
  const handleSelectSeat = async (seat) => {
    if (seat.status === 'confirmado') {
      showNotification(`El Asiento ${seat.label} ya está confirmado por otro pasajero (${seat.ward || 'Estaca'}).`, 'warning');
      return;
    }

    if (seat.status === 'apartado' && !seat.isMyLock) {
      showNotification(`El Asiento ${seat.label} está en proceso de revisión de pago móvil.`, 'warning');
      return;
    }

    try {
      // Lock seat for user session (35 minutes)
      const lockRes = await lockSeat(seat.id, sessionId, 35);
      setActiveSessionLock(lockRes);
      setSelectedSeatForModal(seat);
      await loadData();
      showNotification(`Asiento ${seat.label} apartado por 35 minutos`, 'success');
    } catch (err) {
      showNotification(err.message || 'No se pudo apartar el puesto.', 'error');
    }
  };

  // Release seat
  const handleReleaseSeat = async (seatId) => {
    try {
      await releaseSeat(seatId, sessionId);
      setActiveSessionLock(null);
      setSelectedSeatForModal(null);
      await loadData();
      showNotification(`Asiento liberado correctamente.`, 'info');
    } catch (err) {
      console.error('Error releasing seat:', err);
      setSelectedSeatForModal(null);
    }
  };

  // Submit reservation form
  const handleSubmitReservation = async (formData) => {
    formData.append('sessionId', sessionId);
    const result = await reserveSeat(formData);

    // Trigger celebration confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Close modal & open official ticket
    setSelectedSeatForModal(null);
    setActiveSessionLock(null);
    await loadData();
    setActiveTicket(result.reservation);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Smooth Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-6 z-60 transition-all transform duration-300 ease-out">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold font-display flex items-center space-x-2 ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : notification.type === 'warning'
              ? 'bg-amber-500 text-slate-900 border-amber-600'
              : notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30'
              : 'bg-[#0f294a] text-white border-slate-700'
          }`}>
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        tripInfo={tripInfo}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenTripDetails={() => setIsTripDetailsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Active Seat Lock Reminder Bar (Sticky below header) */}
      {activeSessionLock && (
        <ActiveSeatBar
          lockData={activeSessionLock}
          seat={seats.find(s => s.id === activeSessionLock.seatId)}
          onContinueReservation={() => {
            const s = seats.find(seat => seat.id === activeSessionLock.seatId);
            if (s) setSelectedSeatForModal(s);
          }}
          onReleaseSeat={handleReleaseSeat}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 pb-16">
        
        {/* Compact Banner with Trip details */}
        <TripBanner
          tripInfo={tripInfo}
          seats={seats}
          onOpenPagoDetails={() => setIsTripDetailsOpen(true)}
          onScrollToBus={() => {
            const el = document.getElementById('bus-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Bus Seat Map */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-[#0E1E3A] border-t-[#C9962F] rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-[#0E1E3A]">Cargando autobús y asientos...</p>
          </div>
        ) : (
          <BusMap
            seats={seats}
            wards={wards}
            selectedSeat={selectedSeatForModal}
            onSelectSeat={handleSelectSeat}
            selectedWardFilter={selectedWardFilter}
            setSelectedWardFilter={setSelectedWardFilter}
            activeSessionLock={activeSessionLock}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0E1E3A] text-slate-300 border-t border-[#1B2F52] py-8 px-4 text-center text-xs space-y-2 mb-16 md:mb-0">
        <div className="flex items-center justify-center space-x-2 text-slate-200 font-bold uppercase tracking-wider text-[11px] font-display">
          <Handshake size={16} weight="bold" className="text-slate-300" />
          <span>Comité de Viaje al Templo • Estaca Barquisimeto</span>
        </div>
        <p className="text-slate-400 max-w-lg mx-auto font-sans">
          Sistema de asignación de puestos para los 9 barrios de la estaca: Acarigua, Araure, Los Pinos, Cabudare, Sabana de Parra, Nueva Segovia, Concordia, San Felipe y La Concordia.
        </p>
        <div className="pt-2 text-[10px] text-slate-500 font-mono">
          © {new Date().getFullYear()} • Todos los derechos reservados.
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Apps style) */}
      <BottomNav
        hasLockedSeat={Boolean(activeSessionLock)}
        lockedSeatLabel={activeSessionLock ? seats.find(s => s.id === activeSessionLock.seatId)?.label : ''}
        onSelectTab={() => {
          const el = document.getElementById('bus-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onReportPayment={() => {
          if (activeSessionLock) {
            const s = seats.find(seat => seat.id === activeSessionLock.seatId);
            if (s) setSelectedSeatForModal(s);
          } else {
            const el = document.getElementById('bus-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            showNotification('Toque primero el asiento que desea apartar en el autobús', 'info');
          }
        }}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenTripDetails={() => setIsTripDetailsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* MODALS */}

      {/* 1. Seat Reservation & Payment Form Modal */}
      {selectedSeatForModal && (
        <SeatModal
          seat={selectedSeatForModal}
          tripInfo={tripInfo}
          wards={wards}
          lockData={activeSessionLock}
          onClose={() => setSelectedSeatForModal(null)}
          onSubmitReservation={handleSubmitReservation}
          onReleaseSeat={handleReleaseSeat}
        />
      )}

      {/* 2. Official Ticket Modal with QR & WhatsApp */}
      {activeTicket && (
        <TicketModal
          reservation={activeTicket}
          tripInfo={tripInfo}
          onClose={() => setActiveTicket(null)}
        />
      )}

      {/* 3. Lookup Reservation Modal ("Consultar mi Reserva") */}
      {isLookupOpen && (
        <LookupModal
          onClose={() => setIsLookupOpen(false)}
          onViewTicket={(res) => setActiveTicket(res)}
        />
      )}

      {/* 4. Trip Details & Pago Móvil Modal */}
      {isTripDetailsOpen && (
        <TripDetailsModal
          tripInfo={tripInfo}
          onClose={() => setIsTripDetailsOpen(false)}
        />
      )}

      {/* 5. Stake Leaders & Treasurer Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          onDataChanged={loadData}
        />
      )}

    </div>
  );
}
