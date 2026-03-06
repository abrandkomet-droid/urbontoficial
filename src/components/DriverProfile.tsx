import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Upload, 
  Car, 
  Mic, 
  DollarSign, 
  Star, 
  Clock, 
  CheckCircle,
  Map,
  User,
  Settings,
  Camera
} from 'lucide-react';

// --- Types ---
interface Document {
  id: string;
  type: 'License' | 'Insurance' | 'TLC/TCP Permit' | 'Registration';
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  expiryDate: string;
  daysRemaining: number;
}

interface DriverStats {
  earnings: number;
  rating: number;
  acceptanceRate: number;
  hoursOnline: number;
  weeklyEarnings: number[]; // Last 7 days
}

// --- Mock Data ---
const mockDocs: Document[] = [
  { id: '1', type: 'License', status: 'Valid', expiryDate: '2028-05-20', daysRemaining: 750 },
  { id: '2', type: 'Insurance', status: 'Expiring Soon', expiryDate: '2026-03-15', daysRemaining: 15 },
  { id: '3', type: 'TLC/TCP Permit', status: 'Valid', expiryDate: '2027-01-10', daysRemaining: 300 },
  { id: '4', type: 'Registration', status: 'Valid', expiryDate: '2026-11-30', daysRemaining: 240 },
];

const mockStats: DriverStats = {
  earnings: 4250.50,
  rating: 4.98,
  acceptanceRate: 98,
  hoursOnline: 42.5,
  weeklyEarnings: [450, 520, 380, 600, 490, 720, 850] // Sun-Sat
};

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

export default function DriverProfile() {
  const [activeTab, setActiveTab] = useState<'profile' | 'map'>('profile');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Helper to calculate bar height percentage
  const maxEarning = Math.max(...mockStats.weeklyEarnings);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-barlow pb-24 relative overflow-y-auto">
      
      {activeTab === 'profile' ? (
        <>
          {/* --- Header: Driver Identity --- */}
          <header className="p-6 pt-12 bg-gradient-to-b from-[#121212] to-[#050505] border-b border-[#C0C0C4]/10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-[#C0C0C4] overflow-hidden bg-[#1A1A1B]">
                  <img 
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60" 
                    alt="Driver" 
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-[#C0C0C4] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Elite
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold uppercase tracking-wide text-white">James Bond</h1>
                <p className="text-[#C0C0C4] text-lg font-medium tracking-wider">ID: 007-URB</p>
                
                {/* Language Bridge Status */}
                <div className="flex items-center gap-2 mt-2 bg-[#121212] border border-[#C0C0C4]/30 px-3 py-1 rounded-full w-fit">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Mic size={12} className="text-[#C0C0C4]" />
                  <span className="text-[#C0C0C4] text-xs font-bold uppercase tracking-widest">Bridge Active</span>
                </div>
              </div>
            </div>
          </header>

          {/* --- 1. Analytics Dashboard --- */}
          <section className="p-6 space-y-6">
            <h2 className="text-[#C0C0C4] text-sm font-bold uppercase tracking-[0.2em] mb-4">Performance</h2>
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="bg-[#121212] border border-[#C0C0C4]/20 p-4 rounded-xl flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <DollarSign size={20} className="text-[#C0C0C4]" />
                  <span className="text-[#C0C0C4]/50 text-[10px] uppercase tracking-widest">This Week</span>
                </div>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  ${mockStats.earnings.toLocaleString()}
                </span>
              </div>

              {/* Rating */}
              <div className="bg-[#121212] border border-[#C0C0C4]/20 p-4 rounded-xl flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <Star size={20} className="text-[#C0C0C4]" />
                  <span className="text-[#C0C0C4]/50 text-[10px] uppercase tracking-widest">Rating</span>
                </div>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {mockStats.rating}
                </span>
              </div>

              {/* Acceptance */}
              <div className="bg-[#121212] border border-[#C0C0C4]/20 p-4 rounded-xl flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <CheckCircle size={20} className="text-[#C0C0C4]" />
                  <span className="text-[#C0C0C4]/50 text-[10px] uppercase tracking-widest">Acceptance</span>
                </div>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {mockStats.acceptanceRate}%
                </span>
              </div>

              {/* Hours */}
              <div className="bg-[#121212] border border-[#C0C0C4]/20 p-4 rounded-xl flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <Clock size={20} className="text-[#C0C0C4]" />
                  <span className="text-[#C0C0C4]/50 text-[10px] uppercase tracking-widest">Online</span>
                </div>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {mockStats.hoursOnline}h
                </span>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-[#121212] border border-[#C0C0C4]/20 p-6 rounded-xl">
              <div className="flex justify-between items-end h-32 gap-2">
                {mockStats.weeklyEarnings.map((amount, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group">
                    <div 
                      className="w-full bg-[#C0C0C4]/20 rounded-t-sm group-hover:bg-[#C0C0C4] transition-all duration-500 relative"
                      style={{ height: `${(amount / maxEarning) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        ${amount}
                      </div>
                    </div>
                    <span className="text-[#C0C0C4]/40 text-[10px] font-bold text-center uppercase">
                      {['S','M','T','W','T','F','S'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- 2. Compliance & Documents --- */}
          <section className="p-6 pt-0 space-y-6">
            <h2 className="text-[#C0C0C4] text-sm font-bold uppercase tracking-[0.2em] mb-4">Compliance</h2>
            
            <div className="space-y-4">
              {mockDocs.map((doc) => {
                const isExpiring = doc.daysRemaining < 30;
                const progress = Math.min(100, (doc.daysRemaining / 365) * 100);
                
                return (
                  <div 
                    key={doc.id} 
                    className={`
                      bg-[#121212] p-5 rounded-xl border transition-all
                      ${isExpiring ? 'border-[#C0C0C4] shadow-[0_0_15px_rgba(192,192,196,0.1)]' : 'border-[#C0C0C4]/10'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isExpiring ? 'bg-amber-900/30 text-amber-500' : 'bg-[#C0C0C4]/10 text-[#C0C0C4]'}`}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-wide">{doc.type}</h3>
                          <p className={`text-sm font-medium ${isExpiring ? 'text-amber-500' : 'text-[#C0C0C4]/60'}`}>
                            {isExpiring ? `Expiring in ${doc.daysRemaining} days` : 'Valid & Active'}
                          </p>
                        </div>
                      </div>
                      {isExpiring && (
                        <AlertTriangle size={20} className="text-amber-500 animate-pulse" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[#050505] rounded-full overflow-hidden mb-4">
                      <div 
                        className={`h-full rounded-full ${isExpiring ? 'bg-amber-500' : 'bg-[#C0C0C4]'}`} 
                        style={{ width: `${isExpiring ? 100 : progress}%` }}
                      />
                    </div>

                    {/* Action */}
                    {isExpiring && (
                      <button className="w-full flex items-center justify-center gap-2 bg-[#C0C0C4] text-black py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors">
                        <Camera size={16} />
                        Update Document
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* --- 3. My Vehicle --- */}
          <section className="p-6 pt-0 pb-32">
            <h2 className="text-[#C0C0C4] text-sm font-bold uppercase tracking-[0.2em] mb-4">My Vehicle</h2>
            <div className="bg-[#121212] border border-[#C0C0C4]/20 rounded-xl overflow-hidden">
              <div className="h-40 bg-gray-800 relative">
                <img 
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60" 
                  alt="Mercedes S-Class" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#121212] to-transparent h-20" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-extrabold text-white uppercase italic">Mercedes-Benz S-Class</h3>
                  <p className="text-[#C0C0C4] font-mono text-sm tracking-widest">PLATE: URB-007</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center border-t border-[#C0C0C4]/10">
                <div className="flex items-center gap-2 text-[#C0C0C4]">
                  <Settings size={16} />
                  <span className="text-sm font-medium uppercase tracking-wider">Next Service</span>
                </div>
                <span className="text-white font-bold text-sm">In 1,200 miles</span>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="h-[calc(100vh-80px)] w-full relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 40.7128, lng: -74.0060 }}
              zoom={13}
              options={{
                styles: mapStyle,
                disableDefaultUI: true,
                zoomControl: false,
              }}
            >
              <Marker position={{ lat: 40.7128, lng: -74.0060 }} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-[#121212] flex items-center justify-center">
              <p className="text-[#C0C0C4] animate-pulse">LOADING MAP...</p>
            </div>
          )}
          <div className="absolute top-6 left-6 right-6 bg-[#1A1A1B]/90 backdrop-blur-md border border-[#C0C0C4]/20 p-4 rounded-xl shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#C0C0C4] mb-1">Current Zone</h3>
            <p className="text-lg font-medium text-white">Manhattan Elite District</p>
          </div>
        </div>
      )}

      {/* --- 4. Persistent Bottom Navigation --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-[#C0C0C4]/20 h-20 flex items-center justify-around z-50 pb-4">
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'map' ? 'text-white' : 'text-[#C0C0C4]/40'}`}
        >
          <Map size={24} strokeWidth={activeTab === 'map' ? 2.5 : 1.5} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Trip Map</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-[#C0C0C4]/40'}`}
        >
          <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 1.5} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>

    </div>
  );
}
