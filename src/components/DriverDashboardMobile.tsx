import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Map, 
  Wallet, 
  User, 
  Bell, 
  ChevronRight, 
  Star, 
  Clock, 
  Shield, 
  CarFront, 
  LogOut,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  Smartphone,
  Volume2,
  Moon,
  MessageSquare,
  Phone,
  X,
  Camera,
  Upload
} from 'lucide-react';
import DriverModeReimagined from './DriverModeReimagined';

// --- Types ---
type Tab = 'HOME' | 'RIDES' | 'EARNINGS' | 'PROFILE';
type RideStatus = 'NONE' | 'INCOMING' | 'ACCEPTED' | 'ACTIVE';

interface DriverProfileData {
  name: string;
  id: string;
  rating: number;
  photo: string;
  vehicle: {
    model: string;
    plate: string;
    class: string;
  };
}

interface RideRequest {
  id: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: string;
  time: string;
  rating: number;
}

// --- Mock Data ---
const MOCK_REQUEST: RideRequest = {
  id: 'REQ-123',
  passengerName: 'Sarah Connor',
  pickup: 'The Plaza Hotel, 5th Ave',
  dropoff: 'JFK Terminal 4',
  fare: 85.50,
  distance: '14.2 mi',
  time: '45 min',
  rating: 4.9
};

const WEEKLY_EARNINGS = [120, 180, 150, 220, 190, 250, 310];

export default function DriverDashboardMobile({ onLogout }: { onLogout?: () => void, key?: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [isOnline, setIsOnline] = useState(false);
  const [rideStatus, setRideStatus] = useState<RideStatus>('NONE');
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  
  const [driverProfile, setDriverProfile] = useState<DriverProfileData>({
    name: 'Alexander Boyer',
    id: '007-URB',
    rating: 4.98,
    photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60',
    vehicle: {
      model: 'Mercedes-Benz S-Class',
      plate: 'URB-007',
      class: 'Signature Luxe'
    }
  });

  // Session Data
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [completedTrips, setCompletedTrips] = useState(0);
  const [selectedRide, setSelectedRide] = useState<any>(null);

  // Toggle Online Flow
  const handleToggleOnline = () => {
    if (!isOnline) {
      setShowComplianceModal(true);
    } else {
      setIsOnline(false);
      setRideStatus('NONE');
    }
  };

  const confirmGoOnline = () => {
    setShowComplianceModal(false);
    setIsOnline(true);
    // Simulate incoming ride
    setTimeout(() => {
      setRideStatus('INCOMING');
      setShowIncomingModal(true);
    }, 3000);
  };

  const handleAcceptRide = () => {
    setRideStatus('ACTIVE');
    setShowIncomingModal(false);
  };

  const handleDeclineRide = () => {
    setRideStatus('NONE');
    setShowIncomingModal(false);
  };

  const handleTripComplete = (fare: number) => {
    setRideStatus('NONE');
    setSessionEarnings(prev => prev + fare);
    setCompletedTrips(prev => prev + 1);
    // Ideally show a summary modal here, for now just return to dashboard
    alert(`Trip Completed! You earned $${fare.toFixed(2)}`);
  };

  // If Ride is Active, show the full Driver Mode (Map/Navigation)
  if (rideStatus === 'ACTIVE') {
    return (
      <DriverModeReimagined 
        tripDetails={MOCK_REQUEST}
        onComplete={handleTripComplete}
        onLogout={() => setRideStatus('NONE')} 
      />
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-white text-[#001F3F] font-sans flex flex-col overflow-hidden relative">
      
      {/* --- 1. Top Bar (Common) --- */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white z-10 border-b border-[#001F3F]/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#001F3F]/5 border border-[#001F3F]/10 overflow-hidden">
            <img 
              src={driverProfile.photo} 
              alt="Driver" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-medium leading-none tracking-wide text-[#001F3F]">{driverProfile.name.split(' ')[0]}</h1>
            <div className="flex items-center gap-1 text-xs text-[#001F3F] font-medium mt-1">
              <Star size={12} strokeWidth={1.5} className="text-[#001F3F] fill-[#001F3F]" />
              <span>{driverProfile.rating} Rating</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleToggleOnline}
          className={`
            px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300
            ${isOnline ? 'bg-[#001F3F] text-white shadow-md' : 'bg-white border border-[#001F3F]/20 text-[#001F3F]'}
          `}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-[#001F3F]/40'}`} />
          <span className="font-medium text-xs uppercase tracking-widest">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </button>
      </header>

      {/* --- Main Content Area (Switchable) --- */}
      <main className="flex-1 overflow-y-auto pb-24 px-6 pt-6 space-y-6 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'HOME' && (
            <HomeTab 
              key="home" 
              isOnline={isOnline} 
              rideStatus={rideStatus} 
              onRequestOpen={() => setShowIncomingModal(true)}
              sessionEarnings={sessionEarnings}
              completedTrips={completedTrips}
            />
          )}
          {activeTab === 'RIDES' && <RidesTab key="rides" onSelectRide={setSelectedRide} />}
          {activeTab === 'EARNINGS' && <EarningsTab key="earnings" />}
          {activeTab === 'PROFILE' && (
            <ProfileTab 
              key="profile" 
              onLogout={onLogout} 
              profile={driverProfile}
              onUpdateProfile={setDriverProfile}
            />
          )}
        </AnimatePresence>
      </main>

      {/* --- Bottom Navigation --- */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#001F3F]/5 pb-12 pt-4 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <NavButton icon={<Home />} label="Home" active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} />
        <NavButton icon={<Map />} label="Rides" active={activeTab === 'RIDES'} onClick={() => setActiveTab('RIDES')} />
        <NavButton icon={<Wallet />} label="Earnings" active={activeTab === 'EARNINGS'} onClick={() => setActiveTab('EARNINGS')} />
        <NavButton icon={<User />} label="Profile" active={activeTab === 'PROFILE'} onClick={() => setActiveTab('PROFILE')} />
      </nav>

      {/* --- Ride Detail Modal --- */}
      <AnimatePresence>
        {selectedRide && (
          <RideDetailModal 
            ride={selectedRide} 
            onClose={() => setSelectedRide(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- Compliance Modal --- */}
      <AnimatePresence>
        {showComplianceModal && (
          <ComplianceModal 
            onClose={() => setShowComplianceModal(false)} 
            onConfirm={confirmGoOnline} 
          />
        )}
      </AnimatePresence>

      {/* --- Incoming Request Modal (Clean & Friendly) --- */}
      <AnimatePresence>
        {showIncomingModal && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-0 z-50 bg-white flex flex-col p-6 pt-24"
          >
            <div className="flex-1 flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-full bg-[#001F3F]/5 flex items-center justify-center border border-[#001F3F]/10">
                <CarFront size={40} strokeWidth={1} className="text-[#001F3F]" />
              </div>
              
              <div>
                <h2 className="text-3xl font-light text-[#001F3F] mb-2 tracking-wide uppercase">New Request</h2>
                <p className="text-[#001F3F] text-sm font-medium uppercase tracking-widest">Premium Sedan • 4 min away</p>
              </div>

              <div className="w-full bg-[#001F3F]/[0.02] rounded-2xl p-8 border border-[#001F3F]/5 space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-[#001F3F]/10">
                  <div className="text-left">
                    <p className="text-xs uppercase text-[#001F3F]/90 font-medium tracking-widest mb-1">Fare</p>
                    <p className="text-3xl font-medium text-[#001F3F]">${MOCK_REQUEST.fare}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-[#001F3F]/90 font-medium tracking-widest mb-1">Distance</p>
                    <p className="text-3xl font-medium text-[#001F3F]">{MOCK_REQUEST.distance}</p>
                  </div>
                </div>
                
                <div className="space-y-6 text-left">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="w-2 h-2 rounded-full bg-[#001F3F]" />
                      <div className="w-px h-10 bg-[#001F3F]/10" />
                      <div className="w-2 h-2 rounded-full border border-[#001F3F]" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-xs text-[#001F3F]/90 font-medium uppercase tracking-wider mb-1">Pickup</p>
                        <p className="text-lg font-medium text-[#001F3F]">{MOCK_REQUEST.pickup}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#001F3F]/90 font-medium uppercase tracking-wider mb-1">Dropoff</p>
                        <p className="text-lg font-medium text-[#001F3F]">{MOCK_REQUEST.dropoff}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
              <button 
                onClick={handleDeclineRide}
                className="py-5 rounded-xl border border-[#001F3F]/20 text-[#001F3F] font-medium uppercase tracking-widest text-sm hover:bg-[#001F3F]/5 transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={handleAcceptRide}
                className="py-5 rounded-xl bg-[#001F3F] text-white font-medium uppercase tracking-widest text-sm shadow-xl shadow-[#001F3F]/20 hover:bg-[#001F3F]/90 transition-colors"
              >
                Accept
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- TAB COMPONENTS ---

function HomeTab({ 
  isOnline, 
  rideStatus, 
  onRequestOpen,
  sessionEarnings,
  completedTrips
}: { 
  isOnline: boolean, 
  rideStatus: string, 
  onRequestOpen: () => void,
  sessionEarnings: number,
  completedTrips: number,
  key?: string 
}) {
  const [showRatingBreakdown, setShowRatingBreakdown] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          icon={<Wallet size={20} strokeWidth={1.5} />} 
          label="Earnings" 
          value={`$${sessionEarnings.toFixed(0)}`} 
        />
        <StatCard 
          icon={<CarFront size={20} strokeWidth={1.5} />} 
          label="Trips" 
          value={completedTrips.toString()} 
        />
        <button 
          onClick={() => setShowRatingBreakdown(!showRatingBreakdown)}
          className="bg-white border border-[#001F3F]/10 rounded-xl p-4 flex flex-col justify-between h-28 shadow-sm hover:bg-[#001F3F]/5 transition-colors text-left"
        >
          <div className="p-2 rounded-full w-fit bg-[#001F3F]/5 text-[#001F3F]">
            <Star size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[#001F3F]/90 mb-1">Rating</p>
            <p className="text-2xl font-medium tracking-tight text-[#001F3F]">4.98</p>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {showRatingBreakdown && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#001F3F] text-white rounded-2xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase tracking-widest font-bold">Rating Breakdown</h4>
              <button onClick={() => setShowRatingBreakdown(false)}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-[10px] w-4">{star}★</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full" 
                      style={{ width: star === 5 ? '92%' : star === 4 ? '6%' : '1%' }} 
                    />
                  </div>
                  <span className="text-[10px]">{star === 5 ? '482' : star === 4 ? '12' : '1'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Card */}
      <div className="bg-[#001F3F]/[0.02] border border-[#001F3F]/5 rounded-2xl p-8 text-center space-y-4">
        {rideStatus === 'INCOMING' ? (
           <div className="space-y-4">
             <div className="w-16 h-16 bg-[#001F3F]/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
               <Bell size={32} strokeWidth={1.5} className="text-[#001F3F]" />
             </div>
             <div>
               <h3 className="text-xl font-medium text-[#001F3F]">Incoming Request</h3>
               <button onClick={onRequestOpen} className="text-sm text-[#001F3F] mt-2 font-medium border-b border-[#001F3F] pb-0.5">View Details</button>
             </div>
           </div>
        ) : isOnline ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#001F3F]/5 rounded-full flex items-center justify-center mx-auto border border-[#001F3F]/10">
              <Navigation size={32} strokeWidth={1.5} className="text-[#001F3F]" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#001F3F]">You are Online</h3>
              <p className="text-sm text-[#001F3F]/90 font-medium mt-1">Finding rides near you...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#001F3F]/5 rounded-full flex items-center justify-center mx-auto border border-[#001F3F]/10">
              <LogOut size={32} strokeWidth={1.5} className="text-[#001F3F]/90" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#001F3F]">You are Offline</h3>
              <p className="text-sm text-[#001F3F]/90 font-medium mt-1">Go online to start earning.</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity List */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#001F3F]/90 mb-4 pl-1">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityItem 
            title="JFK Airport Transfer" 
            time="10:30 AM" 
            amount="$85.00" 
            status="Completed"
          />
          <ActivityItem 
            title="Downtown to Brooklyn" 
            time="08:45 AM" 
            amount="$45.00" 
            status="Completed"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ComplianceModal({ onClose, onConfirm }: { onClose: () => void, onConfirm: () => void }) {
  const [checks, setChecks] = useState({
    license: true,
    insurance: true,
    vehicle: true,
    health: true
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col p-6 text-[#001F3F]"
    >
      <div className="flex justify-between items-center mb-8 pt-12">
        <h2 className="text-2xl font-light uppercase tracking-wide">Pre-Ride Check</h2>
        <button onClick={onClose} className="p-2 bg-[#001F3F]/5 rounded-full hover:bg-[#001F3F]/10 transition-colors">
          <XCircle size={24} strokeWidth={1.5} className="text-[#001F3F]" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        <ComplianceItem 
          label="Driver's License" 
          status="Valid" 
          checked={checks.license} 
          onChange={() => setChecks(prev => ({ ...prev, license: !prev.license }))} 
        />
        <ComplianceItem 
          label="Vehicle Insurance" 
          status="Valid" 
          checked={checks.insurance} 
          onChange={() => setChecks(prev => ({ ...prev, insurance: !prev.insurance }))} 
        />
        <ComplianceItem 
          label="Vehicle Inspection" 
          status="Passed" 
          checked={checks.vehicle} 
          onChange={() => setChecks(prev => ({ ...prev, vehicle: !prev.vehicle }))} 
        />
        <ComplianceItem 
          label="Health & Safety" 
          status="Compliant" 
          checked={checks.health} 
          onChange={() => setChecks(prev => ({ ...prev, health: !prev.health }))} 
        />
      </div>

      <div className="mt-8 mb-8">
        <button 
          onClick={onConfirm}
          disabled={!allChecked}
          className={`
            w-full py-5 rounded-xl font-medium uppercase tracking-widest text-sm transition-all shadow-xl
            ${allChecked ? 'bg-[#001F3F] text-white' : 'bg-[#001F3F]/10 text-[#001F3F]/90 cursor-not-allowed'}
          `}
        >
          Confirm & Go Online
        </button>
      </div>
    </motion.div>
  );
}

function ComplianceItem({ label, status, checked, onChange }: any) {
  return (
    <div 
      onClick={onChange}
      className={`
        p-5 rounded-xl border flex justify-between items-center cursor-pointer transition-all
        ${checked ? 'bg-[#001F3F]/[0.02] border-[#001F3F]/10' : 'bg-white border-[#001F3F]/5'}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${checked ? 'bg-[#001F3F]/10 text-[#001F3F]' : 'bg-[#001F3F]/5 text-[#001F3F]/90'}`}>
          <Shield size={20} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-[#001F3F]">{label}</p>
          <p className={`text-xs ${checked ? 'text-[#001F3F]' : 'text-[#001F3F]'}`}>{status}</p>
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${checked ? 'bg-[#001F3F] border-[#001F3F]' : 'border-[#001F3F]/20'}`}>
        {checked && <CheckCircle2 size={14} className="text-white" />}
      </div>
    </div>
  );
}

function RidesTab({ onSelectRide }: { onSelectRide: (ride: any) => void, key?: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'COMPLETED' | 'SCHEDULED' | 'CANCELLED'>('COMPLETED');
  
  const completedRides = [
    { 
      id: 'R-101',
      date: "Today, 10:30 AM",
      from: "The Plaza Hotel",
      to: "JFK Terminal 4",
      price: "$85.00",
      rating: 5,
      passenger: "Sarah Connor",
      distance: "14.2 mi",
      duration: "45 min"
    },
    { 
      id: 'R-102',
      date: "Today, 08:45 AM",
      from: "SoHo House",
      to: "Brooklyn Bridge Park",
      price: "$45.00",
      rating: 5,
      passenger: "John Wick",
      distance: "6.8 mi",
      duration: "22 min"
    },
    { 
      id: 'R-103',
      date: "Yesterday, 06:15 PM",
      from: "Wall Street",
      to: "Upper East Side",
      price: "$32.50",
      rating: 4,
      passenger: "Bruce Wayne",
      distance: "4.5 mi",
      duration: "18 min"
    },
  ];

  const scheduledRides = [
    {
      id: 'S-201',
      date: "Tomorrow, 09:00 AM",
      from: "Central Park West",
      to: "LaGuardia Airport",
      price: "$65.00",
      rating: 5,
      passenger: "Diana Prince",
      distance: "8.5 mi",
      duration: "30 min"
    }
  ];

  const cancelledRides = [
    {
      id: 'C-301',
      date: "Feb 24, 02:00 PM",
      from: "Times Square",
      to: "Penn Station",
      price: "$25.00",
      rating: 0,
      passenger: "Clark Kent",
      reason: "Passenger no-show"
    }
  ];

  const getRides = () => {
    switch (activeSubTab) {
      case 'COMPLETED': return completedRides;
      case 'SCHEDULED': return scheduledRides;
      case 'CANCELLED': return cancelledRides;
      default: return [];
    }
  };

  const currentRides = getRides();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-light uppercase tracking-wide text-[#001F3F]">My Rides</h2>
      
      <div className="flex gap-6 border-b border-[#001F3F]/10 pb-1">
        <button 
          onClick={() => setActiveSubTab('COMPLETED')}
          className={`text-sm font-medium pb-3 px-2 transition-all ${activeSubTab === 'COMPLETED' ? 'text-[#001F3F] border-b-2 border-[#001F3F]' : 'text-[#001F3F]/60'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveSubTab('SCHEDULED')}
          className={`text-sm font-medium pb-3 px-2 transition-all ${activeSubTab === 'SCHEDULED' ? 'text-[#001F3F] border-b-2 border-[#001F3F]' : 'text-[#001F3F]/60'}`}
        >
          Scheduled
        </button>
        <button 
          onClick={() => setActiveSubTab('CANCELLED')}
          className={`text-sm font-medium pb-3 px-2 transition-all ${activeSubTab === 'CANCELLED' ? 'text-[#001F3F] border-b-2 border-[#001F3F]' : 'text-[#001F3F]/60'}`}
        >
          Cancelled
        </button>
      </div>

      <div className="space-y-4">
        {currentRides.length > 0 ? currentRides.map(ride => (
          <button 
            key={ride.id} 
            onClick={() => onSelectRide(ride)}
            className="w-full text-left"
          >
            <RideCard 
              date={ride.date}
              from={ride.from}
              to={ride.to}
              price={ride.price}
              rating={ride.rating}
            />
          </button>
        )) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#001F3F]/5 rounded-full flex items-center justify-center mx-auto">
              <Clock size={24} className="text-[#001F3F]/40" />
            </div>
            <p className="text-sm text-[#001F3F]/60">No rides found in this category</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EarningsTab({}: { key?: string } = {}) {
  const [isCashingOut, setIsCashingOut] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2 py-6">
        <p className="text-xs font-medium text-[#001F3F] uppercase tracking-widest">Total Balance</p>
        <h2 className="text-5xl font-light tracking-tight text-[#001F3F]">$1,450.00</h2>
        <button 
          onClick={() => {
            setIsCashingOut(true);
            setTimeout(() => {
              setIsCashingOut(false);
              alert('Payout initiated! Funds will arrive in 1-3 business days.');
            }, 2000);
          }}
          disabled={isCashingOut}
          className="mt-4 px-8 py-3 border border-[#001F3F]/20 rounded-full text-xs font-medium text-[#001F3F] uppercase tracking-widest hover:bg-[#001F3F]/5 transition-colors disabled:opacity-50"
        >
          {isCashingOut ? 'Processing...' : 'Cash Out'}
        </button>
      </div>

      {/* Chart */}
      <div className="bg-[#001F3F]/[0.02] border border-[#001F3F]/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-medium text-lg text-[#001F3F]">Weekly Summary</h3>
          <span className="text-xs font-medium bg-[#001F3F]/5 text-[#001F3F] px-2 py-1 rounded">+12% vs last week</span>
        </div>
        <div className="flex justify-between items-end h-32 gap-3">
          {WEEKLY_EARNINGS.map((amount, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-3 group">
              <div 
                className="w-full bg-[#001F3F]/10 rounded-t-sm group-hover:bg-[#001F3F] transition-all duration-300 relative"
                style={{ height: `${(amount / 350) * 100}%` }}
              >
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#001F3F] text-white text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   ${amount}
                 </div>
              </div>
              <span className="text-[10px] text-center text-[#001F3F]/90 font-medium">
                {['M','T','W','T','F','S','S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[#001F3F]/90 mb-4 pl-1">Recent Transactions</h3>
        <div className="space-y-1">
          <TransactionItem label="Weekly Payout" date="Feb 26" amount="+$1,240.00" type="payout" />
          <TransactionItem label="Trip Payment" date="Feb 26" amount="+$85.00" type="income" />
          <TransactionItem label="Trip Payment" date="Feb 26" amount="+$45.00" type="income" />
        </div>
      </div>
    </motion.div>
  );
}

type ProfileView = 'MAIN' | 'DOCUMENTS' | 'PAYMENTS' | 'PREFERENCES' | 'SUPPORT' | 'EDIT_PROFILE' | 'VEHICLE' | 'CHAT';

function ProfileTab({ onLogout, profile, onUpdateProfile }: { 
  onLogout?: () => void, 
  profile: DriverProfileData,
  onUpdateProfile: (p: DriverProfileData) => void,
  key?: string 
}) {
  const [view, setView] = useState<ProfileView>('MAIN');
  const [editName, setEditName] = useState(profile.name);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'support', text: 'Hello Alexander! How can we help you today?' }
  ]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({
    limoPermit: 'verified',
    airportPermit: 'verified',
    inspection: 'verified',
    portPermit: 'verified',
    insurance: 'verified',
    registration: 'verified',
    corpFiles: 'verified',
    w9: 'verified',
    taxId: 'verified',
    license: 'verified',
    photo: 'verified'
  });

  const renderContent = () => {
    switch (view) {
      case 'CHAT':
        return (
          <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-[#001F3F]/10 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#001F3F] text-white rounded-tr-none' : 'bg-[#001F3F]/5 text-[#001F3F] rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#001F3F]/5 flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[#001F3F]/5 rounded-xl px-4 py-2 text-sm outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    setChatHistory([...chatHistory, { role: 'user', text: chatMessage }]);
                    setChatMessage('');
                    setTimeout(() => {
                      setChatHistory(prev => [...prev, { role: 'support', text: 'Thank you for your message. An agent will be with you shortly.' }]);
                    }, 1000);
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (chatMessage.trim()) {
                    setChatHistory([...chatHistory, { role: 'user', text: chatMessage }]);
                    setChatMessage('');
                    setTimeout(() => {
                      setChatHistory(prev => [...prev, { role: 'support', text: 'Thank you for your message. An agent will be with you shortly.' }]);
                    }, 1000);
                  }
                }}
                className="p-2 bg-[#001F3F] text-white rounded-xl"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );
      case 'EDIT_PROFILE':
        return (
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#001F3F]/10">
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#001F3F] text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>
              <p className="text-xs text-[#001F3F]/90 uppercase tracking-widest font-medium">Tap to change photo</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/90 font-bold ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-[#001F3F]/10 rounded-xl p-4 text-[#001F3F] outline-none focus:ring-1 focus:ring-[#001F3F]/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/90 font-bold ml-1">Driver ID</label>
                <input 
                  type="text" 
                  value={profile.id}
                  disabled
                  className="w-full bg-[#001F3F]/[0.02] border border-[#001F3F]/10 rounded-xl p-4 text-[#001F3F]/90 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                onUpdateProfile({ ...profile, name: editName });
                setView('MAIN');
              }}
              className="w-full py-4 bg-[#001F3F] text-white rounded-xl font-medium uppercase tracking-widest text-xs shadow-lg shadow-[#001F3F]/10 hover:bg-[#001F3F]/90 transition-all active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        );
      case 'VEHICLE':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-[#001F3F]/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                  <CarFront size={32} strokeWidth={1} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#001F3F]">{profile.vehicle.model}</h3>
                  <p className="text-sm text-[#001F3F]">{profile.vehicle.class}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#001F3F]/5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#001F3F]/90 font-bold mb-1">License Plate</p>
                  <p className="text-sm font-medium text-[#001F3F]">{profile.vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#001F3F]/90 font-bold mb-1">Status</p>
                  <p className="text-sm font-medium text-emerald-600">Active</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full py-4 rounded-xl border border-[#001F3F]/10 text-[#001F3F] font-medium uppercase tracking-widest text-[10px] hover:bg-[#001F3F]/5 transition-colors">
                View Vehicle Documents
              </button>
              <button className="w-full py-4 rounded-xl border border-[#001F3F]/10 text-[#001F3F] font-medium uppercase tracking-widest text-[10px] hover:bg-[#001F3F]/5 transition-colors">
                Change Vehicle
              </button>
            </div>
          </div>
        );
      case 'DOCUMENTS':
        return (
          <div className="space-y-4 pb-24">
            <div className="bg-[#001F3F]/5 p-4 rounded-xl flex items-center gap-3 mb-4">
              <Shield size={20} className="text-[#001F3F]" />
              <p className="text-xs text-[#001F3F] font-medium">Keep your documents up to date to stay online.</p>
            </div>
            
            {[
              { id: 'limoPermit', label: 'Miami Dade County Limo Permit' },
              { id: 'airportPermit', label: 'Miami Airport Permit' },
              { id: 'inspection', label: 'Miami Dade Inspection' },
              { id: 'portPermit', label: 'Port of Miami Permit' },
              { id: 'insurance', label: 'Commercial Insurance' },
              { id: 'registration', label: 'CAR, SUV, or VAN Registration' },
              { id: 'corpFiles', label: 'Corporations Files' },
              { id: 'w9', label: 'W-9 Form' },
              { id: 'taxId', label: 'Tax ID' },
              { id: 'license', label: 'Chauffeur License' },
              { id: 'photo', label: 'Professional Photo (Black suit, black tie, white shirt)' }
            ].map(doc => (
              <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${uploadedDocs[doc.id] === 'verified' ? 'bg-green-100 text-green-600' : uploadedDocs[doc.id] === 'uploaded' ? 'bg-blue-100 text-blue-600' : 'bg-[#001F3F]/5 text-[#001F3F]/90'}`}>
                    {uploadedDocs[doc.id] === 'verified' ? <CheckCircle2 size={20} /> : uploadedDocs[doc.id] === 'uploaded' ? <Clock size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.label}</p>
                    {uploadedDocs[doc.id] === 'verified' ? (
                      <p className="text-[10px] text-green-600 uppercase tracking-widest mt-1">Verified</p>
                    ) : uploadedDocs[doc.id] === 'uploaded' ? (
                      <p className="text-[10px] text-blue-600 uppercase tracking-widest mt-1">Under Review</p>
                    ) : (
                      <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">Action Required</p>
                    )}
                  </div>
                </div>
                
                <div className="relative shrink-0">
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setUploadedDocs(prev => ({ ...prev, [doc.id]: 'uploaded' }));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={`px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-colors ${uploadedDocs[doc.id] ? 'bg-black/5 text-[#001F3F]' : 'bg-[#001F3F] text-white'}`}>
                    {uploadedDocs[doc.id] ? 'Update' : 'Upload'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'PAYMENTS':
        return (
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-[#001F3F]/10 bg-[#001F3F]/[0.02] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-[#001F3F]/10 text-[#001F3F]">
                  <CreditCard size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#001F3F]">Chase Sapphire</p>
                  <p className="text-xs text-[#001F3F]">**** 4242</p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#001F3F] bg-[#001F3F]/5 px-2 py-1 rounded">Primary</span>
            </div>
             <button className="w-full py-4 rounded-xl border border-dashed border-[#001F3F]/20 text-[#001F3F] font-medium uppercase tracking-widest text-xs hover:bg-[#001F3F]/5 transition-colors">
              + Add Payment Method
            </button>
          </div>
        );
      case 'PREFERENCES':
        return (
          <div className="space-y-4">
            <MenuItem icon={<Navigation size={20} strokeWidth={1.5} />} label="Navigation App" subLabel="Google Maps" />
            <MenuItem icon={<Volume2 size={20} strokeWidth={1.5} />} label="Voice Navigation" subLabel="On" />
            <MenuItem icon={<Moon size={20} strokeWidth={1.5} />} label="Dark Mode" subLabel="System Default" />
            <MenuItem icon={<Smartphone size={20} strokeWidth={1.5} />} label="Screen Always On" subLabel="Enabled" />
          </div>
        );
      case 'SUPPORT':
        return (
          <div className="space-y-4">
            <MenuItem 
              icon={<MessageSquare size={20} strokeWidth={1.5} />} 
              label="Chat with Support" 
              subLabel="Average wait: 2 min" 
              onClick={() => setView('CHAT')}
            />
            <MenuItem icon={<Phone size={20} strokeWidth={1.5} />} label="Call Support" subLabel="Emergency only" />
            <MenuItem icon={<HelpCircle size={20} strokeWidth={1.5} />} label="Help Center" subLabel="FAQs and Guides" />
          </div>
        );
      default:
        return (
          <>
            <div className="flex items-center gap-4 py-4">
              <div className="w-20 h-20 rounded-full bg-[#001F3F]/5 overflow-hidden border border-[#001F3F]/10">
                <img 
                  src={profile.photo} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-medium text-[#001F3F]">{profile.name}</h2>
                <p className="text-sm text-[#001F3F] font-light">Elite Chauffeur • ID: {profile.id}</p>
                <button 
                  onClick={() => setView('EDIT_PROFILE')}
                  className="text-xs text-[#001F3F] mt-2 font-medium border-b border-[#001F3F] pb-0.5"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <MenuItem 
                icon={<CarFront size={20} strokeWidth={1.5} />} 
                label="Vehicle" 
                subLabel={profile.vehicle.model} 
                onClick={() => setView('VEHICLE')}
              />
              <MenuItem 
                icon={<FileText size={20} strokeWidth={1.5} />} 
                label="Documents" 
                subLabel="All valid" 
                onClick={() => setView('DOCUMENTS')}
              />
              <MenuItem 
                icon={<CreditCard size={20} strokeWidth={1.5} />} 
                label="Payment Methods" 
                subLabel="Visa ending 4242" 
                onClick={() => setView('PAYMENTS')}
              />
              <MenuItem 
                icon={<Settings size={20} strokeWidth={1.5} />} 
                label="Preferences" 
                onClick={() => setView('PREFERENCES')}
              />
              <MenuItem 
                icon={<HelpCircle size={20} strokeWidth={1.5} />} 
                label="Support" 
                onClick={() => setView('SUPPORT')}
              />
            </div>

            <div className="pt-6">
              <button 
                onClick={onLogout}
                className="w-full py-4 rounded-xl border border-[#001F3F]/10 text-[#001F3F] font-medium uppercase tracking-widest text-xs hover:bg-[#001F3F]/5 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Log Out
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-20"
    >
      {view !== 'MAIN' && (
        <button 
          onClick={() => setView('MAIN')}
          className="flex items-center gap-2 text-[#001F3F] hover:text-[#001F3F] transition-colors mb-2"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="text-sm font-medium">Back to Profile</span>
        </button>
      )}
      
      {view !== 'MAIN' && (
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#001F3F] mb-6">
          {view.charAt(0) + view.slice(1).toLowerCase()}
        </h2>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// --- SHARED SUBCOMPONENTS ---

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white border border-[#001F3F]/10 rounded-xl p-4 flex flex-col justify-between h-28 shadow-sm">
      <div className="p-2 rounded-full w-fit bg-[#001F3F]/5 text-[#001F3F]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#001F3F]/90 mb-1">{label}</p>
        <p className="text-2xl font-medium tracking-tight text-[#001F3F]">{value}</p>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-[#001F3F] scale-105' : 'text-[#001F3F]/90 hover:text-[#001F3F]'}`}
    >
      {React.cloneElement(icon, { strokeWidth: active ? 2 : 1.5, size: 24 })}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
}

function ActivityItem({ title, time, amount, status }: any) {
  return (
    <div className="bg-white border border-[#001F3F]/5 rounded-xl p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#001F3F]/5 rounded-full text-[#001F3F]">
          <CarFront size={16} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-[#001F3F]">{title}</p>
          <p className="text-xs text-[#001F3F]/90 font-light">{time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-[#001F3F]">{amount}</p>
        <p className="text-[10px] text-[#001F3F] font-medium uppercase tracking-wider">{status}</p>
      </div>
    </div>
  );
}

function RideCard({ date, from, to, price, rating }: any) {
  return (
    <div className="bg-white border border-[#001F3F]/5 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-xs text-[#001F3F] font-medium">
          <Calendar size={12} strokeWidth={1.5} />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1 bg-[#001F3F]/5 px-2 py-1 rounded text-xs text-[#001F3F]">
          <Star size={10} strokeWidth={1.5} className="text-[#001F3F] fill-[#001F3F]" />
          <span>{rating}.0</span>
        </div>
      </div>
      
      <div className="space-y-3 relative pl-4">
        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#001F3F]/10" />
        <div>
          <p className="text-[10px] uppercase text-[#001F3F]/90 font-medium tracking-wider mb-0.5">Pickup</p>
          <p className="text-sm font-medium text-[#001F3F]">{from}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[#001F3F]/90 font-medium tracking-wider mb-0.5">Dropoff</p>
          <p className="text-sm font-medium text-[#001F3F]">{to}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#001F3F]/5 flex justify-between items-center">
        <span className="text-xs font-medium text-[#001F3F]">Premium Sedan</span>
        <span className="text-lg font-medium text-[#001F3F]">{price}</span>
      </div>
    </div>
  );
}

function TransactionItem({ label, date, amount, type }: any) {
  return (
    <div className="py-4 border-b border-[#001F3F]/5 flex justify-between items-center last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${type === 'payout' ? 'bg-[#001F3F]/5 text-[#001F3F]' : 'bg-[#001F3F]/5 text-[#001F3F]'}`}>
          {type === 'payout' ? <CheckCircle2 size={16} strokeWidth={1.5} /> : <Wallet size={16} strokeWidth={1.5} />}
        </div>
        <div>
          <p className="text-sm font-medium text-[#001F3F]">{label}</p>
          <p className="text-xs text-[#001F3F]/90 font-light">{date}</p>
        </div>
      </div>
      <span className={`text-sm font-medium ${type === 'payout' ? 'text-[#001F3F]' : 'text-[#001F3F]'}`}>
        {amount}
      </span>
    </div>
  );
}

function MenuItem({ icon, label, subLabel, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white border border-[#001F3F]/5 rounded-xl p-4 flex justify-between items-center hover:bg-[#001F3F]/5 transition-colors mb-3"
    >
      <div className="flex items-center gap-3">
        <div className="text-[#001F3F]">{icon}</div>
        <div className="text-left">
          <p className="text-sm font-medium text-[#001F3F]">{label}</p>
          {subLabel && <p className="text-xs text-[#001F3F]/90 font-light">{subLabel}</p>}
        </div>
      </div>
      {onClick && <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/90" />}
    </button>
  );
}

function RideDetailModal({ ride, onClose }: { ride: any, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full bg-white rounded-t-[32px] p-8 pb-12 space-y-8"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-light uppercase tracking-wide text-[#001F3F]">Ride Details</h3>
          <button onClick={onClose} className="p-2 bg-[#001F3F]/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#001F3F]/90 font-bold mb-1">Passenger</p>
              <p className="text-lg font-medium text-[#001F3F]">{ride.passenger}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-[#001F3F]/90 font-bold mb-1">Fare</p>
              <p className="text-lg font-medium text-[#001F3F]">{ride.price}</p>
            </div>
          </div>

          <div className="space-y-4 relative pl-4">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#001F3F]/10" />
            <div>
              <p className="text-[10px] uppercase text-[#001F3F]/90 font-medium tracking-wider mb-0.5">Pickup</p>
              <p className="text-sm font-medium text-[#001F3F]">{ride.from}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#001F3F]/90 font-medium tracking-wider mb-0.5">Dropoff</p>
              <p className="text-sm font-medium text-[#001F3F]">{ride.to}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#001F3F]/5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#001F3F]/90 font-bold mb-1">Distance</p>
              <p className="text-sm font-medium text-[#001F3F]">{ride.distance}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#001F3F]/90 font-bold mb-1">Duration</p>
              <p className="text-sm font-medium text-[#001F3F]">{ride.duration}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#001F3F] text-white rounded-xl font-medium uppercase tracking-widest text-xs"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
