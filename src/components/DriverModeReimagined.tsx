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
  Loader2,
  XCircle,
  ArrowUpRight,
  AlertTriangle,
  ArrowUp,
  ArrowLeft
} from 'lucide-react';
import AnimatedChauffeurMarker from './AnimatedChauffeurMarker';
import SmartChat from './SmartChat';

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
}

interface DriverModeProps {
  tripDetails: TripDetails;
  onComplete: (fare: number) => void;
  onLogout: () => void;
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

// Navy & Silver Premium Map Style
const NAVY_SILVER_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#1a1c2c" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8e9297" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a1c2c" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b4e6d" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#6477b9" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e7c" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d5a" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c4591" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ff" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d3d3d3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
];

export default function DriverModeReimagined({ tripDetails, onComplete, onLogout }: DriverModeProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // Trip State
  const [tripStage, setTripStage] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
  const [isArrived, setIsArrived] = useState(false);
  
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
  const [turnInstruction, setTurnInstruction] = useState({
    distance: '200 ft',
    text: 'Turn right on 5th Ave',
    icon: <ArrowRight size={32} strokeWidth={1.5} />
  });
  const [chatHistory, setChatHistory] = useState([
    { role: 'passenger', text: 'I am waiting near the main entrance.' }
  ]);
  
  // Simulate movement along the route
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const change = Math.random() * 4 - 2;
        return Math.max(0, Math.min(65, prev + change));
      });

      // Simulate turn instructions changing
      if (Math.random() > 0.9) {
        const instructions = [
          { distance: '0.5 mi', text: 'Continue straight', icon: <ArrowUp size={32} strokeWidth={1.5} /> },
          { distance: '300 ft', text: 'Turn left on Broadway', icon: <ArrowLeft size={32} strokeWidth={1.5} /> },
          { distance: '1.2 mi', text: 'Merge onto I-95 N', icon: <ArrowUpRight size={32} strokeWidth={1.5} /> },
          { distance: '50 ft', text: 'Arriving at destination', icon: <MapPin size={32} strokeWidth={1.5} /> }
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
  }, []);

  // Calculate Route (Mock)
  useEffect(() => {
    if (isLoaded && !directionsResponse) {
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
  }, [isLoaded, directionsResponse]);

  const handleMainAction = () => {
    if (tripStage === 'PICKUP') {
      if (!isArrived) {
        setIsArrived(true);
      } else {
        setTripStage('DROPOFF');
        setIsArrived(false);
      }
    } else {
      onComplete(tripDetails.fare);
    }
  };

  const getButtonText = () => {
    if (tripStage === 'PICKUP') {
      return isArrived ? 'Start Trip' : 'Arrived at Pickup';
    }
    return 'Complete Trip';
  };

  if (!isLoaded) return <div className="h-[100dvh] w-full bg-white flex items-center justify-center text-[#001F3F]">Loading Navigation...</div>;

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
          
          {/* Animated Chauffeur Marker */}
          <AnimatedChauffeurMarker 
            position={carPosition}
            heading={carHeading}
            autoCenter={isAutoCenter}
            map={map}
          />

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
      <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Turn Indicator */}
          <div className="bg-[#001F3F] text-white p-4 rounded-xl shadow-lg flex items-center gap-4 pointer-events-auto min-w-[200px] transition-all duration-500">
            {turnInstruction.icon}
            <div>
              <p className="text-2xl font-medium">{turnInstruction.distance}</p>
              <p className="text-sm opacity-80 font-light">{turnInstruction.text}</p>
            </div>
          </div>

          {/* Speed & Status */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <button 
              onClick={() => setShowMenu(true)}
              className="bg-white/90 backdrop-blur-md border border-[#001F3F]/10 p-3 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <div className="bg-white/90 backdrop-blur-md border border-[#001F3F]/10 px-4 py-2 rounded-full shadow-sm">
              <span className="text-2xl font-medium text-[#001F3F]">{Math.round(speed)}</span>
              <span className="text-xs text-[#001F3F]/60 ml-1 font-medium">MPH</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Bottom Action Panel --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30 p-6 pb-12">
        <div className="w-12 h-1 bg-[#001F3F]/10 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-medium text-[#001F3F] mb-1">
              {tripStage === 'PICKUP' ? 'Picking up Sarah' : 'Dropping off Sarah'}
            </h2>
            <div className="flex items-center gap-2 text-[#001F3F]/60 text-sm">
              <Clock size={14} strokeWidth={1.5} />
              <span>{tripDetails.time} remaining</span>
              <span>•</span>
              <span>{tripDetails.distance}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => alert('Calling Sarah...')}
              className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F] hover:bg-[#001F3F]/10 transition-colors"
            >
              <Phone size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F] hover:bg-[#001F3F]/10 transition-colors"
            >
              <MessageSquare size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => alert('SOS Alert triggered. Safety team notified.')}
              className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F] hover:bg-[#001F3F]/10 transition-colors"
            >
              <ShieldAlert size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Trip Progress / Address */}
        <div className="flex items-start gap-4 mb-8">
          <div className="flex flex-col items-center gap-1 pt-1.5">
            <div className={`w-3 h-3 rounded-full ${tripStage === 'PICKUP' ? 'bg-[#001F3F]' : 'bg-[#001F3F]/20'}`} />
            <div className="w-px h-8 bg-[#001F3F]/10" />
            <div className={`w-3 h-3 rounded-full ${tripStage === 'DROPOFF' ? 'bg-[#001F3F]' : 'border-2 border-[#001F3F]/20'}`} />
          </div>
          <div className="flex-1 space-y-6">
            <div className={tripStage === 'PICKUP' ? 'opacity-100' : 'opacity-70'}>
              <p className="text-xs uppercase tracking-widest text-[#001F3F]/90 font-medium mb-1">Pickup</p>
              <p className="text-lg font-medium text-[#001F3F]">{tripDetails.pickup}</p>
            </div>
            <div className={tripStage === 'DROPOFF' ? 'opacity-100' : 'opacity-70'}>
              <p className="text-xs uppercase tracking-widest text-[#001F3F]/90 font-medium mb-1">Dropoff</p>
              <p className="text-lg font-medium text-[#001F3F]">{tripDetails.dropoff}</p>
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <button 
          onClick={handleMainAction}
          className="w-full py-4 bg-[#001F3F] text-white rounded-xl font-medium uppercase tracking-widest text-sm shadow-xl shadow-[#001F3F]/20 hover:bg-[#001F3F]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>{getButtonText()}</span>
          <ArrowRight size={18} strokeWidth={1.5} />
        </button>

      </div>

      {/* --- Overlays --- */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#001F3F]/95 backdrop-blur-xl flex flex-col p-8 text-white"
          >
            <div className="flex justify-between items-center mb-12 pt-8">
              <h2 className="text-3xl font-light uppercase tracking-widest">Trip Menu</h2>
              <button onClick={() => setShowMenu(false)} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
            </div>
                       <div className="flex-1 space-y-4">
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowRouteModal(true);
                }}
                className="w-full p-6 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group"
              >
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-[#001F3F] transition-all">
                  <Maximize2 size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-medium">Full Route Overview</p>
                  <p className="text-sm opacity-60">See the entire path to destination</p>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowEmergencyModal(true);
                }}
                className="w-full p-6 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group"
              >
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-[#001F3F] transition-all">
                  <ShieldAlert size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-medium">Emergency Assistance</p>
                  <p className="text-sm opacity-60">Immediate help from URBONT safety</p>
                </div>
              </button>
 
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowCancelConfirm(true);
                }}
                className="w-full p-6 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group"
              >
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-[#001F3F] transition-all">
                  <X size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-medium text-red-400">Cancel Trip</p>
                  <p className="text-sm opacity-60">Only for valid emergencies</p>
                </div>
              </button>
            </div>

            <button 
              onClick={onLogout}
              className="w-full py-5 border border-white/20 rounded-2xl font-medium uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
            >
              Log Out Chauffeur Mode
            </button>
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
            className="absolute inset-0 z-[60] bg-red-900/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-8 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShieldAlert size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Emergency Assistance</h3>
                <p className="text-gray-600">Who do you need to contact?</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => alert('Calling 911...')} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-600/30">
                  Call 911
                </button>
                <button onClick={() => alert('Calling Safety Team...')} className="w-full py-4 bg-[#001F3F] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[#001F3F]/30">
                  URBONT Safety Team
                </button>
                <button onClick={() => setShowEmergencyModal(false)} className="w-full py-4 text-gray-500 font-medium">
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
      {/* Cancel Confirm Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#001F3F] border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-light text-white mb-2">Cancel Trip?</h3>
                <p className="text-white/60 text-sm">Are you sure you want to cancel this trip? This action cannot be undone.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-4 rounded-xl border border-white/10 text-white font-medium uppercase tracking-widest text-xs hover:bg-white/5"
                >
                  Keep Trip
                </button>
                <button 
                  onClick={() => {
                    setShowCancelConfirm(false);
                    onLogout();
                  }}
                  className="py-4 rounded-xl bg-red-500 text-white font-medium uppercase tracking-widest text-xs hover:bg-red-600 shadow-lg shadow-red-500/20"
                >
                  Cancel Trip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
