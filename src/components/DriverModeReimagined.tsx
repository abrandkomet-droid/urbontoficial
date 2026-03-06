import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  Menu, 
  X, 
  ChevronUp,
  Maximize2,
  Battery,
  Signal,
  Wifi,
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  User,
  Sparkles,
  Star,
  AlertTriangle,
  Loader2,
  XCircle,
  ArrowUpRight,
  ArrowUp,
  ArrowLeft
} from 'lucide-react';
import AnimatedChauffeurMarker from './AnimatedChauffeurMarker';
import SmartChat from './SmartChat';
import { NAVY_SILVER_STYLE } from '../constants';

// --- Types ---
interface TripDetails {
  id: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: string;
  time: string;
  rating: number;
  clientType?: 'Personal' | 'Business';
  amenities?: string[];
  preferences?: string[];
  serviceType?: string;
}

interface DriverModeProps {
  tripDetails: TripDetails;
  onComplete: (fare: number) => void;
  onLogout: () => void;
  onMinimize?: () => void;
}

// --- Constants ---
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const CENTER = {
  lat: 40.7580, // Times Square
  lng: -73.9855
};


export default function DriverModeReimagined({ tripDetails, onComplete, onLogout, onMinimize }: DriverModeProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries: ['places'],
  });

  useEffect(() => {
    console.log('DriverModeReimagined: isLoaded =', isLoaded);
    console.log('DriverModeReimagined: loadError =', loadError);
  }, [isLoaded, loadError]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // Trip State
  const [tripStage, setTripStage] = useState<'PICKUP' | 'IN_PROGRESS' | 'DROPOFF'>('PICKUP');
  const [isArrived, setIsArrived] = useState(false);
  const [tripCompleted, setTripCompleted] = useState(false);
  
  // Telemetry
  const [speed, setSpeed] = useState(0);
  const [carPosition, setCarPosition] = useState(CENTER);
  const [carHeading, setCarHeading] = useState(0);
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [turnInstruction, setTurnInstruction] = useState({
    distance: '200 ft',
    text: 'Turn right on 5th Ave',
    icon: <ArrowRight size={24} strokeWidth={1.5} />
  });
  const [chatHistory, setChatHistory] = useState([
    { role: 'passenger', text: 'I am waiting near the main entrance.' }
  ]);
  
  // Simulate movement along the route
  useEffect(() => {
    if (tripCompleted) return;
    const interval = setInterval(() => {
      setSpeed(prev => {
        const change = Math.random() * 4 - 2;
        return Math.max(0, Math.min(65, prev + change));
      });

      // Simulate turn instructions changing
      if (Math.random() > 0.9) {
        const instructions = [
          { distance: '0.5 mi', text: 'Continue straight', icon: <ArrowUp size={24} strokeWidth={1.5} /> },
          { distance: '300 ft', text: 'Turn left on Broadway', icon: <ArrowLeft size={24} strokeWidth={1.5} /> },
          { distance: '1.2 mi', text: 'Merge onto I-95 N', icon: <ArrowUpRight size={24} strokeWidth={1.5} /> },
          { distance: '50 ft', text: 'Arriving at destination', icon: <MapPin size={24} strokeWidth={1.5} /> }
        ];
        setTurnInstruction(instructions[Math.floor(Math.random() * instructions.length)]);
      }

      // Simulate small position changes
      setCarPosition(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0005,
        lng: prev.lng + (Math.random() - 0.5) * 0.0005,
      }));

      // Simulate heading changes
      setCarHeading(prev => (prev + (Math.random() - 0.5) * 10) % 360);
    }, 2000);
    return () => clearInterval(interval);
  }, [tripCompleted]);

  // Calculate Route (Mock)
  useEffect(() => {
    if (isLoaded && !directionsResponse && !tripCompleted) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: CENTER,
          destination: { lat: 40.6413, lng: -73.7781 }, // JFK
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirectionsResponse(result);
          }
        }
      );
    }
  }, [isLoaded, directionsResponse, tripCompleted]);

  const handleMainAction = () => {
    if (tripStage === 'PICKUP') {
      if (!isArrived) {
        setIsArrived(true);
      } else {
        setTripStage('IN_PROGRESS');
        setIsArrived(false);
      }
    } else if (tripStage === 'IN_PROGRESS') {
      setTripStage('DROPOFF');
    } else {
      setTripCompleted(true);
    }
  };

  const getButtonText = () => {
    if (tripStage === 'PICKUP') {
      return isArrived ? 'Start VIP Trip' : 'Arrived at Pickup';
    } else if (tripStage === 'IN_PROGRESS') {
      return 'Complete Trip';
    }
    return 'Complete Trip';
  };

  if (loadError) return <div className="h-[100dvh] w-full bg-white flex items-center justify-center text-red-500 p-6 text-center">Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div className="h-[100dvh] w-full bg-white flex items-center justify-center text-[#001F3F]">Loading Navigation...</div>;

  if (tripCompleted) {
    return (
      <div className="h-[100dvh] w-full bg-[#001F3F] flex flex-col items-center justify-center p-8 text-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-4xl font-light uppercase tracking-widest">Trip Completed</h2>
          <div className="bg-white/5 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <div className="flex justify-between">
              <span className="opacity-60">Fare</span>
              <span className="font-medium">${tripDetails.fare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Distance</span>
              <span className="font-medium">{tripDetails.distance}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Time</span>
              <span className="font-medium">{tripDetails.time}</span>
            </div>
          </div>
          <button 
            onClick={() => onComplete(tripDetails.fare)}
            className="w-full py-5 bg-white text-[#001F3F] rounded-xl font-medium uppercase tracking-widest text-sm hover:bg-gray-100 transition-all"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-white relative overflow-hidden font-sans text-[#001F3F]">
      
      {/* --- Map Layer --- */}
      <div className="absolute inset-0 z-0">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={carPosition}
          zoom={16}
          options={{
            styles: NAVY_SILVER_STYLE,
            disableDefaultUI: true,
            zoomControl: false,
          }}
          onLoad={setMap}
          onDragStart={() => setIsAutoCenter(false)}
        >
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#6477b9',
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
          
          {/* AnimatedChauffeurMarker requires map instance */}
          {map && (
            <AnimatedChauffeurMarker 
              position={carPosition}
              heading={carHeading}
              autoCenter={isAutoCenter}
              map={map}
            />
          )}

          {/* Destination Marker */}
          <Marker 
            position={{ lat: 40.6413, lng: -73.7781 }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#FFFFFF',
              fillOpacity: 1,
              strokeWeight: 4,
              strokeColor: '#6477b9',
            }}
          />
        </GoogleMap>

        {/* Recenter Button */}
        {!isAutoCenter && (
          <button 
            onClick={() => setIsAutoCenter(true)}
            className="absolute bottom-80 right-6 z-20 bg-white p-3 rounded-full shadow-lg text-[#001F3F] hover:bg-gray-50 transition-all active:scale-95"
          >
            <Navigation size={20} className="rotate-45" />
          </button>
        )}
      </div>

      {/* --- Top Telemetry Bar --- */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none flex flex-col gap-4">
        <div className="flex justify-between items-start">
          {/* Turn Indicator - Compact Pill Design */}
          <div className="bg-white/90 backdrop-blur-md text-[#001F3F] px-4 py-3 rounded-full shadow-lg flex items-center gap-3 pointer-events-auto transition-all duration-500 max-w-[240px] border border-[#001F3F]/10">
            <div className="text-[#001F3F] shrink-0">
              {turnInstruction.icon}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold">{turnInstruction.distance}</span>
              <span className="text-xs font-medium opacity-80 truncate max-w-[120px]">{turnInstruction.text}</span>
            </div>
          </div>

          {/* Minimize Button */}
          {onMinimize && (
            <button 
              onClick={onMinimize}
              className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-[#001F3F] pointer-events-auto border border-[#001F3F]/10 hover:bg-gray-50 transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>

        {/* Speed & Status */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowMenu(true)}
            className="bg-white/90 backdrop-blur-md border border-[#001F3F]/10 p-2.5 rounded-full shadow-sm hover:bg-white transition-colors text-[#001F3F]"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <div className="bg-white/90 backdrop-blur-md border border-[#001F3F]/10 px-3 py-1.5 rounded-full shadow-sm flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#001F3F]">{Math.round(speed)}</span>
            <span className="text-[10px] text-[#001F3F]/60 font-bold uppercase">MPH</span>
          </div>
        </div>
      </div>

      {/* --- Bottom Action Panel (Collapsible) --- */}
      <motion.div 
        layout
        initial={{ height: 'auto' }}
        animate={{ 
          height: 'auto',
          borderTopLeftRadius: '2rem',
          borderTopRightRadius: '2rem'
        }}
        className="absolute bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 overflow-hidden"
      >
        {/* Handle / Toggle Area */}
        <div 
          className="w-full flex justify-center pt-4 pb-2 cursor-pointer active:opacity-50"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
        >
          <div className="w-12 h-1.5 bg-[#001F3F]/10 rounded-full" />
        </div>
        
        <div className="px-6 pb-8">
          {/* Header - Always Visible */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#001F3F]/5 overflow-hidden border border-[#001F3F]/10 shadow-sm shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tripDetails.passengerName}`} alt={tripDetails.passengerName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#001F3F] leading-tight">{tripDetails.passengerName}</h2>
                <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                  <Star size={10} fill="currentColor" />
                  <span className="font-bold text-[#001F3F]">{tripDetails.rating.toFixed(1)}</span>
                  <span className="text-[#001F3F]/60 font-medium ml-1">• {tripDetails.clientType || 'Personal'}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); alert('Calling Sarah...'); }}
                className="w-10 h-10 rounded-full bg-[#001F3F]/5 border border-[#001F3F]/10 flex items-center justify-center text-[#001F3F] hover:bg-[#001F3F]/10 transition-colors"
              >
                <Phone size={18} strokeWidth={1.5} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowChat(true); }}
                className="w-10 h-10 rounded-full bg-[#001F3F]/5 border border-[#001F3F]/10 flex items-center justify-center text-[#001F3F] hover:bg-[#001F3F]/10 transition-colors"
              >
                <MessageSquare size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence initial={false}>
            {isDetailsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {/* Trip Progress / Address */}
                {isArrived && (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-emerald-900 font-bold text-xs uppercase tracking-wide">Passenger Arrived</p>
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-6 pl-1">
                  <div className="flex flex-col items-center gap-1 pt-1.5">
                    <div className={`w-2 h-2 rounded-full ${tripStage === 'PICKUP' ? 'bg-[#001F3F] ring-4 ring-[#001F3F]/5' : 'bg-[#001F3F]/20'}`} />
                    <div className="w-0.5 h-12 bg-[#001F3F]/10" />
                    <div className={`w-2 h-2 rounded-full ${tripStage === 'DROPOFF' ? 'bg-[#001F3F] ring-4 ring-[#001F3F]/5' : 'border-2 border-[#001F3F]/20'}`} />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className={tripStage === 'PICKUP' ? 'opacity-100' : 'opacity-50'}>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/40 font-bold mb-1">Pickup</p>
                      <p className="text-base font-medium text-[#001F3F] leading-tight">{tripDetails.pickup}</p>
                    </div>
                    <div className={tripStage === 'DROPOFF' ? 'opacity-100' : 'opacity-50'}>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/40 font-bold mb-1">Dropoff</p>
                      <p className="text-base font-medium text-[#001F3F] leading-tight">{tripDetails.dropoff}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-[#001F3F]/5">
                   <div>
                      <p className="text-[10px] uppercase text-[#001F3F]/40 font-bold tracking-[0.2em] mb-1">Service</p>
                      <p className="text-sm font-bold text-[#001F3F]">{tripDetails.serviceType || 'Standard'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase text-[#001F3F]/40 font-bold tracking-[0.2em] mb-1">Est. Fare</p>
                      <p className="text-sm font-bold text-[#001F3F]">${tripDetails.fare.toFixed(2)}</p>
                   </div>
                </div>

                {/* Amenities & Preferences */}
                <div className="space-y-4 mb-6">
                  {tripDetails.amenities && tripDetails.amenities.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-[#001F3F]/40 font-bold tracking-[0.2em] mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {tripDetails.amenities.map(item => (
                          <span key={item} className="px-2 py-1 rounded-md border border-[#001F3F]/10 text-[#001F3F] text-xs font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {tripDetails.preferences && tripDetails.preferences.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-[#001F3F]/40 font-bold tracking-[0.2em] mb-2">Preferences</p>
                      <div className="flex flex-wrap gap-2">
                        {tripDetails.preferences.map(item => (
                          <span key={item} className="px-2 py-1 rounded-md bg-[#001F3F]/5 text-[#001F3F] text-xs font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Action Button - Always Visible */}
          <button 
            onClick={handleMainAction}
            className="w-full py-4 bg-[#001F3F] text-white rounded-xl font-bold uppercase tracking-[0.15em] text-sm shadow-xl shadow-[#001F3F]/20 hover:bg-[#003366] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
          >
            <span>{getButtonText()}</span>
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* --- Overlays --- */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-2xl flex flex-col p-8 text-[#001F3F]"
          >
            <div className="flex justify-between items-center mb-12 pt-8">
              <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-[#001F3F]">Trip Menu</h2>
              <button 
                onClick={() => setShowMenu(false)} 
                className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center hover:bg-[#001F3F]/10 transition-colors"
              >
                <X size={20} className="text-[#001F3F]" />
              </button>
            </div>
                        <div className="flex-1 space-y-4">
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowRouteModal(true);
                }}
                className="w-full p-6 bg-[#001F3F]/5 rounded-2xl flex items-center justify-between group hover:bg-[#001F3F]/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#001F3F] shadow-sm group-hover:scale-110 transition-transform">
                    <Maximize2 size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-medium text-[#001F3F]">Full Route Overview</p>
                    <p className="text-sm text-[#001F3F]/60">See the entire path to destination</p>
                  </div>
                </div>
                <ChevronUp size={20} className="text-[#001F3F]/20 rotate-90 group-hover:text-[#001F3F]/60 transition-colors" />
              </button>

              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowEmergencyModal(true);
                }}
                className="w-full p-6 bg-[#001F3F]/5 rounded-2xl flex items-center justify-between group hover:bg-[#001F3F]/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#001F3F] shadow-sm group-hover:scale-110 transition-transform">
                    <ShieldAlert size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-medium text-[#001F3F]">Emergency Assistance</p>
                    <p className="text-sm text-[#001F3F]/60">Immediate help from URBONT safety</p>
                  </div>
                </div>
                <ChevronUp size={20} className="text-[#001F3F]/20 rotate-90 group-hover:text-[#001F3F]/60 transition-colors" />
              </button>

              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowCancelConfirm(true);
                }}
                className="w-full p-6 bg-red-50 rounded-2xl flex items-center justify-between group hover:bg-red-100 transition-all duration-300 border border-red-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                    <XCircle size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-medium text-red-600">Cancel Trip</p>
                    <p className="text-sm text-red-400">Only for valid emergencies</p>
                  </div>
                </div>
                <ChevronUp size={20} className="text-red-300 rotate-90 group-hover:text-red-500 transition-colors" />
              </button>
            </div>

            <button 
              onClick={onLogout}
              className="w-full py-5 border border-[#001F3F]/10 rounded-xl text-xs font-bold uppercase tracking-[0.2em] text-[#001F3F]/40 hover:bg-[#001F3F]/5 hover:text-[#001F3F] transition-all duration-300"
            >
              Log Out Chauffeur Mode
            </button>
          </motion.div>
        )}

        {/* Cancel Confirmation Modal with Penalties */}
        {showCancelConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#001F3F]/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[#001F3F]/10 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-medium text-[#001F3F] text-center mb-2">Cancel this trip?</h3>
              <p className="text-[#001F3F]/60 text-center text-sm mb-8 leading-relaxed">
                Cancelling trips affects your acceptance rate and eligibility for future premium rides.
              </p>

              <div className="space-y-3 mb-8">
                <div className="p-4 bg-[#001F3F]/5 rounded-xl border border-[#001F3F]/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase tracking-widest text-[#001F3F]/40 font-bold">Penalty</span>
                    <span className="text-red-500 font-medium text-sm">High Impact</span>
                  </div>
                  <p className="text-[#001F3F]/80 text-sm">Your rating may decrease by 0.1</p>
                </div>
                
                <div className="p-4 bg-[#001F3F]/5 rounded-xl border border-[#001F3F]/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase tracking-widest text-[#001F3F]/40 font-bold">Fee</span>
                    <span className="text-[#001F3F] font-medium text-sm">$0.00</span>
                  </div>
                  <p className="text-[#001F3F]/80 text-sm">No fee if cancelled within 2 mins</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-4 rounded-xl bg-[#001F3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#003366] transition-colors"
                >
                  Keep Ride
                </button>
                <button 
                  onClick={() => {
                    setShowCancelConfirm(false);
                    onComplete(0); // Cancelled
                  }}
                  className="py-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showChat && (
          <SmartChat 
            rideId={tripDetails.id}
            senderRole="chauffeur"
            passengerName={tripDetails.passengerName}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#001F3F]/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-8 text-center space-y-8 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse border border-red-100">
                <ShieldAlert size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#001F3F] mb-2">Emergency Assistance</h3>
                <p className="text-[#001F3F]/60">Who do you need to contact?</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => alert('Calling 911...')} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors">
                  Call 911
                </button>
                <button onClick={() => alert('Calling Safety Team...')} className="w-full py-4 bg-[#001F3F] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[#001F3F]/30 hover:bg-[#003366] transition-colors">
                  URBONT Safety Team
                </button>
                <button onClick={() => setShowEmergencyModal(false)} className="w-full py-4 text-[#001F3F]/60 font-medium hover:text-[#001F3F] transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Modal */}
      <AnimatePresence>
        {showRouteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="p-6 border-b border-[#001F3F]/10 flex justify-between items-center bg-white shadow-sm z-10">
              <h3 className="text-xl font-medium text-[#001F3F]">Route Overview</h3>
              <button onClick={() => setShowRouteModal(false)} className="p-2 bg-[#001F3F]/5 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-2">
                  <div className="w-4 h-4 rounded-full bg-[#001F3F]" />
                  <div className="w-0.5 flex-1 bg-[#001F3F]/10 my-1" />
                  <div className="w-4 h-4 rounded-full border-2 border-[#001F3F]" />
                </div>
                <div className="flex-1 space-y-8 pb-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/60 mb-1">Pickup</p>
                    <p className="text-lg font-medium text-[#001F3F]">{tripDetails.pickup}</p>
                    <p className="text-sm text-[#001F3F]/60">10:30 AM</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/60 mb-1">Dropoff</p>
                    <p className="text-lg font-medium text-[#001F3F]">{tripDetails.dropoff}</p>
                    <p className="text-sm text-[#001F3F]/60">11:15 AM (Est.)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-[#001F3F]/10">
                <h4 className="font-medium text-[#001F3F]">Turn-by-Turn</h4>
                {[
                  { dist: '0.0 mi', text: 'Start on Main St', icon: <Navigation size={16} /> },
                  { dist: '0.5 mi', text: 'Turn right on 5th Ave', icon: <ArrowRight size={16} /> },
                  { dist: '2.1 mi', text: 'Merge onto I-95 N', icon: <ArrowUpRight size={16} /> },
                  { dist: '5.4 mi', text: 'Take exit 42 towards Airport', icon: <ArrowUpRight size={16} /> },
                  { dist: '1.2 mi', text: 'Arrive at Terminal 4', icon: <MapPin size={16} /> },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#001F3F]/5 transition-colors">
                    <div className="mt-1 text-[#001F3F]">{step.icon}</div>
                    <div>
                      <p className="font-medium text-[#001F3F]">{step.text}</p>
                      <p className="text-xs text-[#001F3F]/60">{step.dist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
