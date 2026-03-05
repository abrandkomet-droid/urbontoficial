import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Mic, 
  X, 
  Clock,
  Plane,
  AlertTriangle,
  Maximize2,
  Menu
} from 'lucide-react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

// --- Types ---
type TripStatus = 'en_route' | 'arrived' | 'in_progress' | 'completed';

interface FlightInfo {
  number: string;
  status: 'Landed' | 'Delayed' | 'On Time' | 'Scheduled';
  gate: string;
  terminal: string;
}

interface DriverModeProps {
  rideId: string;
  passengerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  notes?: string;
  flightInfo?: FlightInfo; // Optional flight data
  initialGracePeriodMinutes?: number;
}

// --- Dark Mode Map Style (Deep Black) ---
const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#121212" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

export default function DriverMode({ 
  rideId, 
  passengerName, 
  pickupAddress, 
  dropoffAddress,
  notes,
  flightInfo = { number: "AA123", status: "Landed", gate: "B12", terminal: "4" }, // Default mock
  initialGracePeriodMinutes = 15
}: DriverModeProps) {
  
  const [tripStatus, setTripStatus] = useState<TripStatus>('en_route');
  const [isBridgeActive, setIsBridgeActive] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [timeLeft, setTimeLeft] = useState(initialGracePeriodMinutes * 60);
  const [overtimeCost, setOvertimeCost] = useState(0);
  const [isVipSignVisible, setIsVipSignVisible] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // --- Dynamic Timer Logic ---
  useEffect(() => {
    if (tripStatus === 'completed') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          // Overtime logic: Add $2.50 per minute (approx $0.04 per second)
          setOvertimeCost(c => c + 0.04);
          return prev - 1;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tripStatus]);

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${seconds < 0 ? '+' : ''}${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Language Bridge Simulation ---
  const toggleBridge = () => {
    if (isBridgeActive) {
      setIsBridgeActive(false);
      setTranscription("");
    } else {
      setIsBridgeActive(true);
      // Simulate transcription appearing
      setTimeout(() => setTranscription("Hola, estoy llegando al..."), 1000);
      setTimeout(() => setTranscription("Hola, estoy llegando al punto de recogida."), 2500);
      setTimeout(() => setTranscription("Hello, I am arriving at the pickup point."), 4000); // Translated
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] font-barlow overflow-hidden flex flex-col relative">
      
      {/* --- 1. Live Navigation Module (70%) --- */}
      <div className="h-[70%] w-full relative z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 40.6413, lng: -73.7781 }} // JFK Airport Mock
            zoom={14}
            options={{
              styles: mapStyle,
              disableDefaultUI: true,
              zoomControl: false,
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#121212] flex items-center justify-center">
            <p className="text-[#C0C0C4] text-xl font-medium tracking-widest animate-pulse">LOADING NAVIGATION...</p>
          </div>
        )}

        {/* Top Bar: Status & Menu */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent h-32">
          <div className="bg-[#1A1A1B] border border-[#C0C0C4] px-4 py-2 rounded-lg shadow-xl">
             <span className="text-[#E0E0E0] text-lg font-bold tracking-wider uppercase">
               {tripStatus.replace('_', ' ')}
             </span>
          </div>
          <button 
            onClick={() => setIsVipSignVisible(true)}
            className="bg-[#1A1A1B] border border-[#C0C0C4] p-3 rounded-full text-white shadow-xl active:scale-95 transition-transform"
          >
            <Maximize2 size={24} />
          </button>
        </div>

        {/* Flight Widget (Live) */}
        {flightInfo && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-24 left-6 z-10"
          >
            <div className="bg-[#1A1A1B] border border-[#C0C0C4] rounded-xl p-4 shadow-2xl w-64">
              <div className="flex items-center justify-between mb-2 border-b border-[#C0C0C4]/20 pb-2">
                <div className="flex items-center gap-2 text-[#E0E0E0]">
                  <Plane size={20} />
                  <span className="text-xl font-bold">{flightInfo.number}</span>
                </div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${flightInfo.status === 'Landed' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>
                  {flightInfo.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-[#E0E0E0]">
                <div className="flex flex-col">
                  <span className="text-xs uppercase opacity-60">Terminal</span>
                  <span className="text-lg font-bold">{flightInfo.terminal}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase opacity-60">Gate</span>
                  <span className="text-lg font-bold">{flightInfo.gate}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Language Bridge FAB */}
        <div className="absolute bottom-6 right-6 z-20">
          <button
            onClick={toggleBridge}
            className="w-20 h-20 rounded-full bg-[#C0C0C4] text-black shadow-[0_0_30px_rgba(192,192,196,0.3)] flex items-center justify-center active:scale-95 transition-all border-4 border-white/10"
          >
            <Mic size={32} strokeWidth={2.5} />
          </button>
        </div>

        {/* Language Bridge Status Bar */}
        <AnimatePresence>
          {isBridgeActive && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-6 left-6 right-32 z-20"
            >
              <div className="bg-[#1A1A1B] border border-[#C0C0C4] rounded-xl p-4 shadow-2xl flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-[#C0C0C4] text-xs font-bold tracking-widest uppercase mb-1">LISTENING...</p>
                  <p className="text-white text-xl font-medium leading-none">
                    {transcription || "..."}
                  </p>
                </div>
                <button onClick={toggleBridge} className="p-2 text-[#C0C0C4]">
                  <X size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- 2. Operational Brain (30%) --- */}
      <div className="h-[30%] bg-[#050505] border-t border-[#C0C0C4]/30 relative z-30 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        
        {/* Info Row */}
        <div className="flex-1 p-6 flex justify-between items-start">
          
          {/* Passenger Details */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
              {passengerName}
            </h1>
            <div className="flex items-center gap-2 text-[#E0E0E0]">
              <MapPin size={20} className="text-[#C0C0C4]" />
              <span className="text-xl font-medium tracking-wide">
                {tripStatus === 'en_route' ? pickupAddress : dropoffAddress}
              </span>
            </div>
            {notes && (
              <p className="text-[#C0C0C4] text-lg italic opacity-80 mt-1">
                "{notes}"
              </p>
            )}
          </div>

          {/* Dynamic Timer */}
          <div className={`flex flex-col items-end p-3 rounded-lg border ${timeLeft < 0 ? 'bg-amber-900/20 border-amber-500/50' : 'bg-[#1A1A1B] border-[#C0C0C4]/30'}`}>
            <span className="text-[#C0C0C4] text-xs font-bold uppercase tracking-widest mb-1">
              {timeLeft < 0 ? 'OVERTIME' : 'WAITING TIME'}
            </span>
            <div className="flex items-baseline gap-1">
              <Clock size={18} className={timeLeft < 0 ? 'text-amber-500' : 'text-white'} />
              <span className={`text-3xl font-extrabold tabular-nums ${timeLeft < 0 ? 'text-amber-500' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            {timeLeft < 0 && (
              <span className="text-amber-400 text-sm font-bold mt-1">
                +${overtimeCost.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button Row */}
        <div className="p-6 pt-0">
          <button
            onClick={() => {
              if (tripStatus === 'en_route') setTripStatus('arrived');
              else if (tripStatus === 'arrived') setTripStatus('in_progress');
              else if (tripStatus === 'in_progress') setTripStatus('completed');
            }}
            className="w-full bg-white text-black h-16 rounded-xl text-2xl font-extrabold uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-[#E0E0E0] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Navigation size={28} strokeWidth={3} />
            {tripStatus === 'en_route' && "ARRIVED AT PICKUP"}
            {tripStatus === 'arrived' && "START VIP TRIP"}
            {tripStatus === 'in_progress' && "COMPLETE RIDE"}
            {tripStatus === 'completed' && "RIDE COMPLETED"}
          </button>
        </div>
      </div>

      {/* --- VIP Sign Overlay --- */}
      <AnimatePresence>
        {isVipSignVisible && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setIsVipSignVisible(false)}
          >
            <div className="text-center space-y-12 px-4">
              <p className="text-[#C0C0C4] text-2xl uppercase tracking-[0.5em] font-medium">Urbont Chauffeur</p>
              <h1 className="text-white text-[15vw] leading-none font-extrabold uppercase tracking-tighter">
                {passengerName.split(' ')[0]}
              </h1>
              <h1 className="text-[#404040] text-[10vw] leading-none font-bold uppercase tracking-tighter">
                {passengerName.split(' ').slice(1).join(' ')}
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
