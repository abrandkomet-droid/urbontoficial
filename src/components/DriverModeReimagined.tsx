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
  User
} from 'lucide-react';

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

// Clean, Light Map Style
const LIGHT_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

export default function DriverModeReimagined({ tripDetails, onComplete, onLogout }: DriverModeProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // Trip State
  const [tripStage, setTripStage] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
  const [isArrived, setIsArrived] = useState(false);
  
  // Telemetry
  const [speed, setSpeed] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'passenger', text: 'I am waiting near the main entrance.' }
  ]);
  
  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const change = Math.random() * 4 - 2;
        return Math.max(0, Math.min(65, prev + change));
      });
    }, 1000);
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

  if (!isLoaded) return <div className="h-screen w-full bg-white flex items-center justify-center text-[#1A1A1A]">Loading Navigation...</div>;

  return (
    <div className="h-screen w-full bg-white relative overflow-hidden font-sans text-[#1A1A1A]">
      
      {/* --- Map Layer --- */}
      <div className="absolute inset-0 z-0">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={CENTER}
          zoom={13}
          options={{
            styles: LIGHT_MAP_STYLE,
            disableDefaultUI: true,
            zoomControl: false,
          }}
          onLoad={setMap}
        >
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#001F3F',
                  strokeWeight: 4,
                },
              }}
            />
          )}
          {/* Car Marker */}
          <Marker
            position={CENTER}
            icon={{
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#001F3F',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              rotation: 0,
            }}
          />
        </GoogleMap>
      </div>

      {/* --- Top Telemetry Bar --- */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Turn Indicator */}
          <div className="bg-[#001F3F] text-white p-4 rounded-xl shadow-lg flex items-center gap-4 pointer-events-auto min-w-[200px]">
            <ArrowRight size={32} strokeWidth={1.5} />
            <div>
              <p className="text-2xl font-medium">200 ft</p>
              <p className="text-sm opacity-80 font-light">Turn right on 5th Ave</p>
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
              <span className="text-2xl font-medium text-[#1A1A1A]">{Math.round(speed)}</span>
              <span className="text-xs text-[#1A1A1A]/60 ml-1 font-medium">MPH</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Bottom Action Panel --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30 p-6 pb-10">
        <div className="w-12 h-1 bg-[#001F3F]/10 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-medium text-[#1A1A1A] mb-1">
              {tripStage === 'PICKUP' ? 'Picking up Sarah' : 'Dropping off Sarah'}
            </h2>
            <div className="flex items-center gap-2 text-[#1A1A1A]/60 text-sm">
              <Clock size={14} strokeWidth={1.5} />
              <span>{tripDetails.time} remaining</span>
              <span>•</span>
              <span>{tripDetails.distance}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#001F3F]/10 transition-colors">
              <Phone size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#001F3F]/10 transition-colors"
            >
              <MessageSquare size={20} strokeWidth={1.5} />
            </button>
            <button className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#001F3F]/10 transition-colors">
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
            <div className={tripStage === 'PICKUP' ? 'opacity-100' : 'opacity-40'}>
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-1">Pickup</p>
              <p className="text-lg font-medium text-[#1A1A1A]">{tripDetails.pickup}</p>
            </div>
            <div className={tripStage === 'DROPOFF' ? 'opacity-100' : 'opacity-40'}>
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-1">Dropoff</p>
              <p className="text-lg font-medium text-[#1A1A1A]">{tripDetails.dropoff}</p>
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
            <div className="flex justify-between items-center mb-8 pt-8">
              <h2 className="text-3xl font-light uppercase tracking-widest">Trip Menu</h2>
              <button onClick={() => setShowMenu(false)} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="flex-1 space-y-4">
              <button className="w-full p-6 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group">
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-[#1A1A1A] transition-all">
                  <Maximize2 size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-medium">Full Route Overview</p>
                  <p className="text-sm opacity-60">See the entire path to destination</p>
                </div>
              </button>
              
              <button className="w-full p-6 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group">
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-[#1A1A1A] transition-all">
                  <ShieldAlert size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-medium">Emergency Assistance</p>
                  <p className="text-sm opacity-60">Immediate help from URBONT safety</p>
                </div>
              </button>

              <button className="w-full p-6 bg-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group">
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-[#1A1A1A] transition-all">
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
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-x-0 bottom-0 top-20 z-50 bg-white rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-[#001F3F]/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#1A1A1A]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{tripDetails.passengerName}</p>
                  <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 bg-[#001F3F]/5 rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'driver' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'driver' ? 'bg-[#001F3F] text-white rounded-tr-none' : 'bg-[#001F3F]/5 text-[#1A1A1A] rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#001F3F]/5 flex gap-3">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#001F3F]/5 rounded-xl px-4 py-3 text-sm outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    setChatHistory([...chatHistory, { role: 'driver', text: chatMessage }]);
                    setChatMessage('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (chatMessage.trim()) {
                    setChatHistory([...chatHistory, { role: 'driver', text: chatMessage }]);
                    setChatMessage('');
                  }
                }}
                className="p-3 bg-[#001F3F] text-white rounded-xl"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
