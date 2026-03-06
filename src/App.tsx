import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Navigation,
  Menu,
  User,
  Phone,
  Search,
  History,
  CreditCard,
  Settings,
  LogOut,
  Users,
  Briefcase,
  CheckCircle2,
  X,
  ChevronRight,
  Camera,
  Home,
  Plus,
  Music,
  Sun,
  DoorOpen,
  Info,
  Plane,
  Train,
  MessageCircle,
  Crown,
  Zap,
  Bell,
  ArrowRight,
  Gift,
  Percent,
  CheckCheck,
  BellOff,
  Share2,
  Smartphone,
  Check,
  FileText,
  Mail,
  AlertTriangle,
  MessageSquare,
  Thermometer,
  Building2,
  UserPlus,
  Calendar,
  Heart,
  Loader2,
  Droplets,
  Wifi,
  Wine,
  Package,
  ShoppingBag,
  Shirt,
  UserCheck
} from 'lucide-react';
import { Screen, VEHICLES, CHAUFFEUR, Vehicle, UserProfile } from './types';
import { COUNTRIES, COMMON_COUNTRIES } from './constants';
import DriverDashboardMobile from './components/DriverDashboardMobile';
import SuggestionsScreen from './components/SuggestionsScreen';
import SmartChat from './components/SmartChat';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Angel',
    lastName: 'Boyer',
    phone: '+58 424-5661220',
    email: 'angelelisx@gmail.com',
    accountType: 'personal',
    otherAddresses: [],
    ridePreferences: {
      temperature: 'Neutral',
      music: 'Silence',
      conversation: 'Minimal'
    },
    loyalty: {
      level: 'Gold',
      points: 2450,
      nextLevelPoints: 5000,
      ridesThisMonth: 12
    }
  });
  
  const [editingAddressType, setEditingAddressType] = useState<'home' | 'work' | 'other' | null>(null);
  const [returnToMenu, setReturnToMenu] = useState(false);
  const [activeTrip, setActiveTrip] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries: ['places']
  });

  const navigate = (screen: Screen, fromMenu = false) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
    if (fromMenu) {
      setReturnToMenu(true);
    } else {
      setReturnToMenu(false);
    }
  };

  const handleBack = () => {
    if (returnToMenu) {
      navigate('booking');
      setIsMenuOpen(true);
      setReturnToMenu(false);
    } else {
      navigate('booking');
    }
  };

  const handleUpdateProfile = (updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updatedProfile }));
    navigate('profile');
  };

  const handleUpdateAddress = (address: string) => {
    if (editingAddressType === 'home') {
      setUserProfile(prev => ({ ...prev, homeAddress: address }));
    } else if (editingAddressType === 'work') {
      setUserProfile(prev => ({ ...prev, workAddress: address }));
    } else if (editingAddressType === 'other') {
      setUserProfile(prev => ({ 
        ...prev, 
        otherAddresses: [...prev.otherAddresses, { id: Date.now().toString(), label: 'Other', address }] 
      }));
    }
    navigate('profile');
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="app-container">
      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 1 }}
              className="absolute inset-y-0 left-0 w-full bg-[#FFFFFF] z-50 flex flex-col text-[#001F3F] shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full overflow-y-auto px-6 py-10 scrollbar-hide">
                {/* Header with Close Button and Large Logo */}
                <div className="flex justify-between items-center mb-10 shrink-0 relative">
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors z-10">
                    <X size={28} strokeWidth={1.5} />
                  </button>
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1eQeW4NAEtlRUwxyDpObf5acpd1ZNCB1_" 
                      alt="URBONT" 
                      className="h-16 object-contain brightness-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Greeting */}
                <div className="mb-12 px-2">
                  <div className="flex items-center gap-3 mb-2">
                    {userProfile.accountType === 'business' && (
                      <span className="px-2 py-1 bg-[#001F3F] text-white text-[10px] font-medium uppercase tracking-widest rounded-md flex items-center gap-1">
                        <Briefcase size={10} />
                        Business
                      </span>
                    )}
                  </div>
                  <h2 className="font-sans text-3xl font-light text-[#001F3F] leading-tight">
                    {(() => {
                      const hour = new Date().getHours();
                      let greeting = 'Good Morning';
                      if (hour >= 12) greeting = 'Good Afternoon';
                      if (hour >= 18) greeting = 'Good Evening';
                      
                      const nameDisplay = userProfile.lastName 
                        ? `${userProfile.title || ''} ${userProfile.lastName}`.trim() 
                        : '';
                      
                      return nameDisplay ? `${greeting}, ${nameDisplay}` : greeting;
                    })()}
                  </h2>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 flex flex-col justify-center space-y-8 mb-20 px-2">
                  <button onClick={() => navigate('services', true)} className="group flex flex-col items-start">
                    <span className="font-sans text-4xl leading-none font-light uppercase tracking-tight text-left text-[#001F3F] group-hover:text-[#001F3F]/80 transition-colors">SIGNATURE</span>
                  </button>
                  <button onClick={() => navigate('membership', true)} className="group flex flex-col items-start">
                    <span className="font-sans text-4xl leading-none font-light uppercase tracking-tight text-left text-[#001F3F] group-hover:text-[#001F3F]/80 transition-colors">CLUB</span>
                  </button>
                  <button onClick={() => navigate('customer-service', true)} className="group flex flex-col items-start">
                    <span className="font-sans text-4xl leading-none font-light uppercase tracking-tight text-left text-[#001F3F] group-hover:text-[#001F3F]/80 transition-colors">ASSISTANCE</span>
                  </button>
                </div>

                {/* Secondary Navigation (Profile, etc.) */}
                <div className="border-t border-[#001F3F]/20 pt-2 shrink-0">
                  <button onClick={() => navigate('profile', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#001F3F]/60 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">ACCOUNT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm font-normal text-[#001F3F]/80">Angel Boyer</span>
                      <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/60" />
                    </div>
                  </button>
                  <button onClick={() => navigate('preferences', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-[#001F3F]/60 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">PREFERENCES</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/60" />
                  </button>
                  <button onClick={() => navigate('ride-history', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-[#001F3F]/60 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">JOURNEYS</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/60" />
                  </button>
                  <button onClick={() => navigate('payment-methods', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-[#001F3F]/60 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">WALLET</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/60" />
                  </button>
                  <button onClick={() => navigate('gift-ride', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <Gift size={18} className="text-[#001F3F]/60 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">SEND RIDE</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/60" />
                  </button>
                  <button onClick={() => navigate('suggestions', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={18} className="text-[#001F3F]/60 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">FEEDBACK</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/60" />
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-12 flex justify-between items-center font-sans text-[10px] uppercase tracking-[0.1em] font-medium shrink-0 pb-4 text-[#001F3F]/80">
                  <span>© 2026 URBONT</span>
                  <button onClick={() => navigate('booking')} className="flex items-center gap-1 hover:text-[#001F3F] transition-colors">
                    <span>TIME REDEFINED</span>
                    <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <WelcomeScreen 
            onStart={() => navigate('auth-phone')} 
            onChauffeurStart={() => navigate('chauffeur-login')}
          />
        )}
        {currentScreen === 'chauffeur-login' && (
          <ChauffeurLoginScreen 
            onBack={() => navigate('welcome')}
            onLogin={() => navigate('chauffeur-dashboard')}
            onRegister={() => navigate('chauffeur-registration')}
          />
        )}
        {currentScreen === 'chauffeur-registration' && (
          <ChauffeurRegistrationScreen 
            onBack={() => navigate('chauffeur-login')}
            onComplete={() => navigate('chauffeur-login')}
          />
        )}
        {currentScreen === 'chauffeur-dashboard' && (
          <DriverDashboardMobile 
            onLogout={() => navigate('welcome')}
          />
        )}
        {currentScreen === 'auth-phone' && (
          <PhoneAuthScreen 
            countryCode={countryCode}
            onBack={() => navigate('welcome')}
            onSelectCountry={() => navigate('country-selector')}
            onContinue={(num) => {
              setPhoneNumber(num);
              navigate('auth-otp');
            }} 
            onChauffeurStart={() => navigate('chauffeur-login')}
          />
        )}
        {currentScreen === 'country-selector' && (
          <CountrySelectorScreen 
            onBack={() => navigate('auth-phone')}
            onSelect={(code) => {
              setCountryCode(code);
              navigate('auth-phone');
            }}
          />
        )}
        {currentScreen === 'auth-otp' && (
          <OtpScreen 
            phoneNumber={phoneNumber}
            onBack={() => navigate('auth-phone')}
            onVerify={() => navigate('booking')} 
          />
        )}
        {currentScreen === 'booking' && (
          <BookingScreen 
            onOpenMenu={() => setIsMenuOpen(true)}
            onSelectVehicle={() => navigate('vehicle-selection')} 
            onNotifications={() => navigate('notifications')}
            onPaymentMethods={() => navigate('payment-methods')}
            activeTrip={activeTrip}
            onReturnToTrip={() => navigate('tracking')}
            isLoaded={isLoaded}
            loadError={loadError}
          />
        )}
        {currentScreen === 'notifications' && (
          <NotificationsScreen 
            onBack={() => navigate('booking')} 
          />
        )}
        {currentScreen === 'vehicle-selection' && (
          <VehicleSelectionScreen 
            onBack={() => navigate('booking')}
            onConfirm={(v) => {
              setSelectedVehicle(v);
              navigate('payment-confirmation');
            }}
          />
        )}
        {currentScreen === 'payment-confirmation' && (
          <PaymentConfirmationScreen 
            vehicle={selectedVehicle || VEHICLES[1]}
            onBack={() => navigate('vehicle-selection')}
            onConfirm={() => navigate('searching')}
            onPaymentMethods={() => navigate('payment-methods')}
          />
        )}
        {currentScreen === 'searching' && (
          <SearchingScreen 
            onFound={() => {
              setActiveTrip(true);
              navigate('confirmed');
            }} 
          />
        )}
        {currentScreen === 'confirmed' && (
          <ConfirmedScreen 
            onContinue={() => navigate('tracking')} 
          />
        )}
        {currentScreen === 'tracking' && (
          <TrackingScreen 
            vehicle={selectedVehicle || VEHICLES[1]}
            onBack={() => navigate('booking')}
            onEndTrip={() => {
              setActiveTrip(false);
              navigate('booking');
            }}
            onCompleteTrip={() => {
              setActiveTrip(false);
              navigate('trip-completed');
            }}
            isLoaded={isLoaded}
            loadError={loadError}
          />
        )}
        {currentScreen === 'trip-completed' && (
          <TripCompletedScreen 
            onBack={() => navigate('booking')} 
          />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen 
            key="profile-screen" 
            userProfile={userProfile}
            onBack={handleBack} 
            onEditProfile={() => navigate('edit-profile', returnToMenu)}
            onEditAddress={(type) => {
              setEditingAddressType(type);
              navigate('address-edit', returnToMenu);
            }}
            onSignOut={() => navigate('welcome')}
            onLegal={() => navigate('legal', returnToMenu)}
            onRidePreferences={() => navigate('ride-preferences', returnToMenu)}
            onUpdateProfile={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
          />
        )}
        {currentScreen === 'edit-profile' && (
          <EditProfileScreen 
            userProfile={userProfile}
            onBack={() => navigate('profile', true)}
            onSave={(updated) => handleUpdateProfile(updated)}
          />
        )}
        {currentScreen === 'address-edit' && (
          <AddressEditScreen 
            type={editingAddressType || 'other'}
            onBack={() => navigate('profile', true)}
            onSave={(addr) => handleUpdateAddress(addr)}
          />
        )}
        {currentScreen === 'legal' && (
          <LegalScreen 
            onBack={() => navigate('profile', true)}
          />
        )}
        {currentScreen === 'preferences' && (
          <MyPreferencesScreen 
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'customer-service' && (
          <CustomerServiceScreen 
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'services' && (
          <ServicesScreen 
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'membership' && (
          <MembershipScreen 
            userProfile={userProfile}
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'ride-history' && (
          <RideHistoryScreen 
            onBack={handleBack} 
            onSchedule={() => navigate('schedule-ride', true)}
          />
        )}
        {currentScreen === 'payment-methods' && (
          <PaymentMethodsScreen 
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'gift-ride' && (
          <GiftRideScreen 
            onBack={handleBack} 
            isLoaded={isLoaded}
          />
        )}
        {currentScreen === 'schedule-ride' && (
          <ScheduleRideScreen 
            onBack={handleBack} 
            isLoaded={isLoaded}
          />
        )}
        {currentScreen === 'suggestions' && (
          <SuggestionsScreen 
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen 
            onBack={handleBack} 
          />
        )}
        {currentScreen === 'ride-preferences' && (
          <RidePreferencesScreen 
            preferences={userProfile.ridePreferences!}
            onBack={handleBack}
            onSave={(prefs) => setUserProfile(prev => ({ ...prev, ridePreferences: prefs }))}
          />
        )}
      </AnimatePresence>
    </div>
    </Elements>
  );
}

function WelcomeScreen({ onStart, onChauffeurStart }: { onStart: () => void, onChauffeurStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative h-full w-full flex flex-col p-8 overflow-hidden bg-black"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="https://res.cloudinary.com/dgzysyl8g/video/upload/v1/banner_xzwanc.mp4" type="video/mp4" />
          <div className="w-full h-full bg-[#001F3F]" />
        </video>
        {/* Softer, more elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Top Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-20 flex justify-center mt-8"
      >
        <img 
          src="https://lh3.googleusercontent.com/d/1eQeW4NAEtlRUwxyDpObf5acpd1ZNCB1_" 
          alt="URBONT Logo" 
          className="h-32 object-contain brightness-0 invert opacity-100"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Bottom Content */}
      <div className="flex-1" />
      
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-20 w-full mb-20 flex flex-col items-center text-center space-y-8"
      >
        <div className="space-y-1 px-4">
          <p className="text-white/90 text-[12px] font-light tracking-[0.4em] uppercase leading-relaxed">
            Time Redefined
          </p>
          <h2 className="text-white text-2xl font-light tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">Excellence in Motion</h2>
        </div>

        <button 
          onClick={onStart} 
          className="group relative px-8 py-2 text-white text-[9px] font-light uppercase tracking-[0.4em] transition-all duration-700 flex items-center justify-center gap-3"
        >
          <span className="relative z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-500">Discover Urbont</span>
          <span className="relative z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4H11M11 4L8 1M11 4L8 7" stroke="white" strokeWidth="0.5"/>
            </svg>
          </span>
          <span className="absolute bottom-1 left-0 right-0 h-[0.5px] bg-white/30 group-hover:bg-white transition-colors duration-500" />
        </button>
      </motion.div>
    </motion.div>
  );
}

function ChauffeurLoginScreen({ onBack, onLogin, onRegister }: { onBack: () => void, onLogin: () => void, onRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col p-8 pt-24 navy-gradient-bg text-white relative"
    >
      <button onClick={onBack} className="absolute top-8 left-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center">
        <img 
          src="https://lh3.googleusercontent.com/d/1eQeW4NAEtlRUwxyDpObf5acpd1ZNCB1_" 
          alt="URBONT Logo" 
          className="h-16 object-contain mb-12 brightness-0 invert"
          referrerPolicy="no-referrer"
        />
        
        <h1 className="font-sans text-3xl font-light uppercase tracking-widest mb-12 text-center text-white">
          Chauffeur Portal
        </h1>

        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="font-sans text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">Email ID</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 bg-transparent border-b border-white/10 outline-none text-white focus:border-white transition-colors text-lg font-light"
              placeholder="Enter your ID"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-sans text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 bg-transparent border-b border-white/10 outline-none text-white focus:border-white transition-colors text-lg font-light"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button 
          onClick={() => alert("Password reset link sent to your email.")}
          className="mt-8 font-sans text-xs text-white/60 uppercase tracking-widest hover:text-white transition-colors font-medium"
        >
          Forgot Password?
        </button>
      </div>

      <button 
        disabled={!email || !password}
        onClick={onLogin} 
        className="w-full h-14 bg-white text-[#001F3F] text-sm font-bold uppercase tracking-widest rounded-xl disabled:opacity-20 hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
      >
        Login
      </button>
      
      <div className="mt-6 text-center">
        <span className="text-white/60 text-xs uppercase tracking-widest">Not a chauffeur yet? </span>
        <button onClick={onRegister} className="text-white text-xs font-medium uppercase tracking-widest hover:underline">
          Apply Here
        </button>
      </div>
    </motion.div>
  );
}

function ChauffeurRegistrationScreen({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  const REQUIRED_DOCS = [
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
    { id: 'photo', label: 'Professional Photo (Black suit, black tie, white shirt)', isPhoto: true }
  ];

  const handleFileUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setDocuments(prev => ({ ...prev, [id]: url }));
  };

  const allDocsUploaded = REQUIRED_DOCS.every(doc => documents[doc.id]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col navy-gradient-bg text-white relative"
    >
      <div className="p-6 pt-12 pb-8 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={step === 1 ? onBack : step === 3 ? onComplete : () => setStep(step - 1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-sans text-xl font-light uppercase tracking-widest text-white">
            {step === 1 ? 'Create Account' : step === 2 ? 'Upload Documents' : 'Application Sent'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-light text-white">Join URBONT</h3>
              <p className="text-sm text-white/60 max-w-xs mx-auto">
                Sign up with your Google account to start your application process as a professional chauffeur.
              </p>
            </div>

            <button 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setStep(2);
                }, 1500);
              }}
              disabled={isLoading}
              className="w-full max-w-sm py-4 bg-white border border-black/10 rounded-xl shadow-sm flex items-center justify-center gap-3 hover:bg-black/5 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-[#001F3F]" />
              ) : (
                <>
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
                  <span className="font-medium">Continue with Google (Gmail)</span>
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 pb-24">
            <p className="text-sm text-white/80">
              Please upload clear, legible copies of the following required documents. Your application will be reviewed once all documents are submitted.
            </p>

            <div className="space-y-4">
              {REQUIRED_DOCS.map(doc => (
                <div key={doc.id} className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${documents[doc.id] ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                      {documents[doc.id] ? <CheckCircle2 size={20} /> : (doc.isPhoto ? <Camera size={20} /> : <FileText size={20} />)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{doc.label}</p>
                      {documents[doc.id] && <p className="text-[10px] text-green-400 uppercase tracking-widest mt-1">Uploaded</p>}
                    </div>
                  </div>
                  
                  <div className="relative shrink-0">
                    <input 
                      type="file" 
                      accept={doc.isPhoto ? "image/*" : "image/*,.pdf"}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(doc.id, e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className={`px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-colors ${documents[doc.id] ? 'bg-white/10 text-white' : 'bg-white text-[#001F3F]'}`}>
                      {documents[doc.id] ? 'Replace' : 'Upload'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#001F3F] border-t border-white/10 z-20">
              <button 
                onClick={() => setStep(3)}
                disabled={!allDocsUploaded}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${allDocsUploaded ? 'bg-[#001F3F] text-white shadow-[#001F3F]/20' : 'bg-black/10 text-black/40 cursor-not-allowed'}`}
              >
                Submit Application
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-light">Application Received</h3>
              <p className="text-sm opacity-60 max-w-xs mx-auto">
                Thank you for applying to be an URBONT chauffeur. Our team will review your documents and contact you within 2-3 business days.
              </p>
            </div>
            <button 
              onClick={onComplete}
              className="w-full max-w-sm py-4 bg-[#001F3F] text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-[#001F3F]/20"
            >
              Back to Welcome
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChauffeurDashboardScreen({ onLogout }: { onLogout: () => void }) {
  const [isOnline, setIsOnline] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [name, setName] = useState('Alexander Sterling');
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col bg-[#001F3F]"
    >
      {/* Header */}
      <div className="bg-[#001F3F] text-white p-6 pb-12 rounded-b-[2rem] shadow-xl z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowEditProfile(true)}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden relative group"
            >
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={24} />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={16} />
              </div>
            </button>
            <div onClick={() => setShowEditProfile(true)} className="cursor-pointer">
              <h2 className="text-sm font-medium">{name}</h2>
              <div className="flex items-center gap-1 text-xs text-[#001F3F]/60">
                <Star size={10} className="fill-white text-white" />
                <span>4.98 Rating</span>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs text-[#001F3F]/60 uppercase tracking-widest mb-1">Today's Earnings</div>
            <div className="text-3xl font-light">$245.50</div>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest ${isOnline ? 'bg-white text-[#001F3F]' : 'bg-[#001F3F] text-white'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 -mt-6 pt-10 space-y-6">
        {/* Toggle Online */}
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-6 rounded-xl shadow-sm border flex items-center justify-center gap-3 transition-all ${
            isOnline 
              ? 'bg-black/10 border-black/20 text-[#001F3F]' 
              : 'bg-white/10 border-white/20 text-white'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-black' : 'bg-white'}`} />
          <span className="font-medium uppercase tracking-widest text-sm">
            {isOnline ? 'Go Offline' : 'Go Online'}
          </span>
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm">
            <div className="opacity-60 mb-2"><Clock size={20} /></div>
            <div className="text-2xl font-light mb-1">6.5h</div>
            <div className="text-[10px] text-[#001F3F]/60 uppercase tracking-widest">Online Hours</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm">
            <div className="opacity-60 mb-2"><Navigation size={20} /></div>
            <div className="text-2xl font-light mb-1">12</div>
            <div className="text-[10px] text-[#001F3F]/60 uppercase tracking-widest">Trips</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-widest opacity-60">Recent Trips</h3>
          
          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium">JFK Airport Transfer</div>
              <div className="text-sm font-medium text-white">$85.00</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#001F3F]/60">
              <Clock size={12} />
              <span>10:30 AM - 11:15 AM</span>
            </div>
            <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Completed</span>
              <ChevronRight size={14} className="opacity-60" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm space-y-3 opacity-60">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium">Downtown to Brooklyn</div>
              <div className="text-sm font-medium text-white">$45.00</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#001F3F]/60">
              <Clock size={12} />
              <span>08:45 AM - 09:15 AM</span>
            </div>
            <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Completed</span>
              <ChevronRight size={14} className="opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-[#001F3F]">Edit Profile</h3>
                <button onClick={() => setShowEditProfile(false)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center border-2 border-dashed border-black/10 relative overflow-hidden">
                    {photo ? (
                      <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-black/20" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPhoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-[#001F3F]/60 uppercase tracking-widest">Change Photo</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/60 font-medium">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none" 
                  />
                </div>
              </div>
              <button onClick={() => setShowEditProfile(false)} className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all">
                Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhoneAuthScreen({ onBack, onContinue, onSelectCountry, countryCode, onChauffeurStart }: { onBack: () => void, onContinue: (num: string) => void, onSelectCountry: () => void, countryCode: string, onChauffeurStart: () => void }) {
  const [value, setValue] = useState('');
  
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || { placeholder: '000 000 0000', maxLength: 10 };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col p-8 pt-24 navy-gradient-bg text-white relative"
    >
      <div className="flex-1 flex flex-col items-center overflow-y-auto w-full px-2 no-scrollbar">
        <h1 className="text-3xl font-medium text-center leading-tight mb-16 max-w-[280px] uppercase tracking-widest text-white mt-12">
          SIGN IN OR CREATE YOUR ACCOUNT
        </h1>

        <div className="w-full flex items-center border border-white/10 p-4 bg-white/5 rounded-xl">
          <button 
            onClick={onSelectCountry}
            className="flex items-center gap-2 pr-4 border-r border-white/10 mr-4 text-white"
          >
            <span className="text-lg font-medium">{countryCode}</span>
            <ChevronRight size={16} className="rotate-90 text-white/60" />
          </button>
          <input 
            type="tel" 
            placeholder={selectedCountry.placeholder}
            autoFocus
            value={value}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= selectedCountry.maxLength) {
                setValue(val);
              }
            }}
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-white/30 text-white"
          />
        </div>

        <p className="mt-4 text-[11px] text-center text-white/40 uppercase tracking-wider">
          By signing up, I agree to the <span className="underline cursor-pointer">Terms & Conditions</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <button 
          onClick={onChauffeurStart}
          className="mt-12 group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Acces Chauffeur</span>
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <button 
        disabled={value.length < 5}
        onClick={() => onContinue(value)} 
        className="w-full h-14 bg-white text-[#001F3F] text-sm font-bold uppercase tracking-widest rounded-xl disabled:opacity-20 hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 mt-8 mb-20"
      >
        CONTINUE
      </button>
    </motion.div>
  );
}

function OtpScreen({ phoneNumber, onBack, onVerify }: { phoneNumber: string, onBack: () => void, onVerify: () => void }) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    // Logic to resend code would go here
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full w-full flex flex-col p-8 pt-20 navy-gradient-bg text-white"
    >
      <button onClick={onBack} className="p-2 -ml-2 mb-8 text-white hover:bg-white/10 rounded-full transition-colors w-fit">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 p-8 space-y-12 overflow-y-auto pb-24 no-scrollbar">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Verification</span>
          <h2 className="font-sans text-4xl font-light uppercase tracking-tight text-white">Enter Code</h2>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Sent to {phoneNumber}
          </p>
        </div>

        <div className="flex gap-4">
          <input 
            type="tel" 
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000" 
            autoFocus
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 6) setOtp(val);
              if (val.length === 6) {
                setTimeout(onVerify, 500);
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-light tracking-[0.5em] outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10 text-white"
          />
        </div>

        <div className="text-center">
          {canResend ? (
            <button 
              onClick={handleResend}
              className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-1"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-xs text-white/40 font-medium uppercase tracking-widest">
              Resend code in {timer}s
            </p>
          )}
        </div>

        <button 
          onClick={onVerify}
          disabled={otp.length !== 6}
          className="w-full h-14 bg-white text-[#001F3F] text-sm font-bold uppercase tracking-widest rounded-xl disabled:opacity-20 hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
        >
          Verify Code
        </button>
      </div>
    </motion.div>
  );
}

function BookingScreen({ onOpenMenu, onSelectVehicle, onNotifications, onPaymentMethods, activeTrip, onReturnToTrip, isLoaded, loadError }: { onOpenMenu: () => void, onSelectVehicle: () => void, onNotifications: () => void, onPaymentMethods: () => void, activeTrip: boolean, onReturnToTrip: () => void, isLoaded: boolean, loadError: Error | undefined }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [scheduledTime, setScheduledTime] = useState<{date: string, time: string} | null>(null);
  const [hourlyDuration, setHourlyDuration] = useState<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [destination, setDestination] = useState('');
  const [pickup, setPickup] = useState('Detecting location...');
  const [extraDestinations, setExtraDestinations] = useState<string[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [flightNumber, setFlightNumber] = useState('');
  const [isAirportPickup, setIsAirportPickup] = useState(false);
  const places = ['Times Square', 'Beverly Hills', 'Miami Beach', 'Las Vegas', 'Grand Canyon', 'Central Park'];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % places.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setPickup('Current Location');
          map?.panTo({ lat: latitude, lng: longitude });
        },
        () => {
          setPickup('London, UK'); // Fallback
        }
      );
    }
  }, [map]);

  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white text-[#001F3F] p-8 text-center space-y-4">
        <div className="p-4 bg-red-50 rounded-full text-red-500">
          <MapPin size={32} />
        </div>
        <h3 className="text-xl font-medium">Map Error</h3>
        <p className="text-sm opacity-80 max-w-xs">{loadError.message}</p>
        <p className="text-xs opacity-60 max-w-xs">
          Please ensure your Google Maps API Key is valid and has the "Maps JavaScript API" and "Places API" enabled in the Google Cloud Console.
        </p>
      </div>
    );
  }

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const handleAddStop = () => {
    if (extraDestinations.length < 3) {
      setExtraDestinations([...extraDestinations, '']);
    }
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...extraDestinations];
    newStops.splice(index, 1);
    setExtraDestinations(newStops);
  };

  const handleUpdateStop = (index: number, value: string) => {
    const newStops = [...extraDestinations];
    newStops[index] = value;
    setExtraDestinations(newStops);
  };

  const mapStyles = [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [{"color": "#f5f5f5"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#616161"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#f5f5f5"}]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#bdbdbd"}]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#eeeeee"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#e5e5e5"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#dadada"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#616161"}]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{"color": "#e5e5e5"}]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{"color": "#eeeeee"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#c9c9c9"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col bg-white overflow-hidden"
    >
      {/* Custom Styles for Map & Autocomplete */}
      <style>{`
        .gmnoprint, .gm-style-cc, a[href^="http://maps.google.com/maps"] {
          display: none !important;
        }
      `}</style>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-4 bg-white z-20">
        <button onClick={onOpenMenu} className="flex flex-col gap-1.5 p-2 -ml-2">
          <div className="w-6 h-[1.5px] bg-black" />
          <div className="w-6 h-[1.5px] bg-black" />
        </button>
        
        {activeTrip && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onReturnToTrip}
            className="absolute left-1/2 -translate-x-1/2 bg-[#001F3F] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Active Trip
          </motion.button>
        )}

        <img 
          src="https://lh3.googleusercontent.com/d/1eQeW4NAEtlRUwxyDpObf5acpd1ZNCB1_" 
          alt="URBONT" 
          className="h-24 object-contain"
          referrerPolicy="no-referrer"
        />
        <button onClick={onNotifications} className="p-2 -mr-2 relative group flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 10, 0],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut"
            }}
            style={{ originX: 0.5, originY: 0.2 }}
          >
            <Bell size={22} strokeWidth={1.5} className="text-[#001F3F] transition-transform group-hover:scale-110" />
          </motion.div>
          <div className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-[#001F3F] rounded-full border-[1.5px] border-white z-10 shadow-sm" />
          <div className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-[#001F3F] rounded-full animate-ping opacity-75" />
        </button>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-[#001F3F]">Schedule Journey</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-[#001F3F]/80">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none" 
                    onChange={(e) => setScheduledTime(prev => ({ ...prev, date: e.target.value, time: prev?.time || '' }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-[#001F3F]/80">Time</label>
                  <input 
                    type="time" 
                    className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none" 
                    onChange={(e) => setScheduledTime(prev => ({ ...prev, time: e.target.value, date: prev?.date || '' }))}
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)} 
                className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all"
              >
                Confirm Schedule
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hourly Modal */}
      <AnimatePresence>
        {showHourlyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-[#001F3F]">Hourly Booking</h3>
                <button onClick={() => setShowHourlyModal(false)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#001F3F]/80">Keep a chauffeur at your disposal for multiple stops or errands.</p>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[#001F3F]/80">Duration (Hours)</label>
                <select 
                  className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none"
                  onChange={(e) => setHourlyDuration(parseInt(e.target.value))}
                >
                  {[2, 3, 4, 5, 6, 8, 12, 24].map(h => (
                    <option key={h} value={h}>{h} Hours</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setShowHourlyModal(false)} className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all">
                Confirm Duration
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-[#001F3F]">Add Comment</h3>
                <button onClick={() => setShowCommentModal(false)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#001F3F]/80">Leave a note for your chauffeur (e.g., flight number, gate, special requests).</p>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none min-h-[120px] resize-none" 
              />
              <button onClick={() => setShowCommentModal(false)} className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all">
                Save Comment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Area */}
      <div className="absolute inset-0 bg-[#FFFFFF] overflow-hidden">
        <div className="absolute inset-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={15}
              onLoad={onLoad}
              options={{
                disableDefaultUI: true,
                styles: mapStyles,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                clickableIcons: false,
              }}
            >
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-[#FFFFFF] animate-pulse" />
          )}
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/80 via-white/20 to-transparent pointer-events-none z-10" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ marginTop: '-40px' }}>
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative flex flex-col items-center">
              {/* Outer glowing ring */}
              <div className="w-16 h-16 bg-[#001F3F]/10 rounded-full animate-pulse absolute -top-3 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#001F3F]/20 rounded-full" />
              </div>
              
              {/* Main Pin Body */}
              <div className="relative z-20 w-10 h-10 bg-[#001F3F] rounded-xl rotate-45 flex items-center justify-center shadow-[0_12px_30px_rgba(0,31,63,0.4)] border-[1.5px] border-white overflow-hidden">
                {/* Inner reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                {/* Center dot */}
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] -rotate-45" />
              </div>
              
              {/* Stem */}
              <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#001F3F] to-transparent z-10 -mt-2" />
              
              {/* Base shadow/dot */}
              <div className="w-5 h-1.5 bg-black/20 rounded-[100%] blur-[1px] -mt-1" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Bottom Content */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px] z-20 transition-all duration-500 flex flex-col ${destination ? 'h-[55%] max-h-[65vh]' : 'h-auto p-6 pb-8'}`}>
        {!destination ? (
          <div className="space-y-4 overflow-y-auto no-scrollbar max-h-[35vh]">
            <div className="space-y-1 px-1">
              <h2 className="text-2xl font-light text-[#001F3F]">Where to next?</h2>
              <p className="text-sm text-[#001F3F] font-light">Enter your destination to see available rides</p>
            </div>

            <div className="space-y-0 border-t border-black/[0.04] pt-2">
              <div 
                onClick={() => { 
                  setDestination('Heathrow Airport'); 
                  setIsAirportPickup(true);
                }}
                className="flex items-center gap-4 w-full py-5 border-b border-black/[0.04] cursor-pointer hover:bg-black/[0.02] rounded-xl px-2 transition-colors -mx-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                  <Plane size={16} />
                </div>
                <div className="flex-1">
                  <span className="text-base font-light text-[#001F3F]">Airport Pickup</span>
                </div>
                <ChevronRight size={18} className="text-[#001F3F] group-hover:text-[#001F3F] transition-colors" />
              </div>

              <div 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-4 w-full py-5 border-b border-black/[0.04] cursor-pointer hover:bg-black/[0.02] rounded-xl px-2 transition-colors -mx-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                  <Search size={16} />
                </div>
                <div className="flex items-center gap-2 text-base font-light text-[#001F3F]">
                  <span>Search</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.5 }}
                      className="text-[#001F3F]"
                    >
                      {places[placeholderIndex]}...
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-y-auto no-scrollbar pb-8">
            {/* Address Section */}
            <div className="px-6 pt-6 pb-4 border-b border-black/[0.03]">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-black flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-[#001F3F]">{pickup}</p>
                    <p className="text-xs text-[#001F3F] mt-0.5">Current Location</p>
                  </div>
                </div>

                {/* Extra Stops */}
                {extraDestinations.map((stop, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={index} 
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-black/30 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-black/30" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text"
                        value={stop}
                        onChange={(e) => handleUpdateStop(index, e.target.value)}
                        placeholder="Add stop..."
                        className="text-base font-medium text-[#001F3F] bg-transparent outline-none w-full border-b border-black/5 pb-1"
                      />
                    </div>
                    <button onClick={() => handleRemoveStop(index)} className="p-1 text-red-400">
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}

                {/* Flight Number Input */}
                {isAirportPickup && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-[#001F3F] flex items-center justify-center">
                        <Plane size={8} className="text-[#001F3F]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        placeholder="Flight Number (e.g. AA123)"
                        className="text-base font-medium text-[#001F3F] bg-transparent outline-none w-full border-b border-black/5 pb-1"
                      />
                      <p className="text-xs text-[#001F3F]/50 mt-0.5">We track your flight for delays</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-start gap-4">
                  <div className="mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-[#001F3F]">{destination}</p>
                    <p className="text-xs text-[#001F3F] mt-0.5">Destination Address</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddStop} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                      <Plus size={20} className="text-[#001F3F]/80" />
                    </button>
                    <button onClick={() => { setDestination(''); setExtraDestinations([]); }} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                      <X size={20} className="text-[#001F3F]/80" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="py-4 border-b border-black/[0.03]">
              <div className="px-6 flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/80 font-medium">Options</span>
                <button className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/80 font-medium">See All</button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-6 no-scrollbar">
                <button onClick={() => setShowScheduleModal(true)} className="shrink-0 px-4 py-2 bg-[#001F3F]/5 rounded-lg text-xs font-medium text-[#001F3F] hover:bg-black/10 transition-colors">
                  Schedule a Journey
                </button>
                <button onClick={() => setShowHourlyModal(true)} className="shrink-0 px-4 py-2 bg-[#001F3F]/5 rounded-lg text-xs font-medium text-[#001F3F] hover:bg-black/10 transition-colors">
                  Hourly Booking
                </button>
                <button onClick={() => setShowCommentModal(true)} className="shrink-0 px-4 py-2 bg-[#001F3F]/5 rounded-lg text-xs font-medium text-[#001F3F] hover:bg-black/10 transition-colors">
                  Add a Comment
                </button>
              </div>
            </div>

            {/* Class & Payment Section */}
            <div className="px-6 py-4 pb-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium uppercase tracking-widest text-[#001F3F]">Business Class</span>
                    <ChevronRight size={14} className="text-[#001F3F]" />
                  </div>
                  <span className="text-xs text-[#001F3F]/80 mt-1">$85–$120</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onPaymentMethods(); }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#001F3F]/5 rounded-lg hover:bg-[#001F3F]/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md border border-dashed border-black/20 flex items-center justify-center">
                    <Plus size={12} className="text-[#001F3F]/80" />
                  </div>
                  <span className="text-[10px] font-medium text-[#001F3F]/80 uppercase tracking-wider">Add Card</span>
                </button>
              </div>

              <button 
                onClick={onSelectVehicle}
                className="w-full h-14 bg-[#001F3F] text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#001F3F]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#001F3F]/10"
              >
                Request a Chauffeur
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Address Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 pt-12 pb-6 shrink-0 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setIsSearchOpen(false)} className="p-2 -ml-2">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                {/* Pickup Input */}
                <div className="flex items-center gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-black/[0.03]">
                  <MapPin size={20} className="text-[#001F3F]" />
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Pickup"
                    className="flex-1 bg-transparent outline-none text-base font-light text-[#001F3F] placeholder:text-[#001F3F]/80"
                  />
                </div>

                {/* Destination Input */}
                <div className="flex items-center gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-black/[0.03]">
                  <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                  <Autocomplete
                    onLoad={(ac) => {}}
                    onPlaceChanged={() => {
                      setIsSearchOpen(false);
                      setDestination('Selected Address');
                    }}
                    className="flex-1"
                  >
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="Where To"
                      className="w-full bg-transparent outline-none text-base font-light text-[#001F3F] placeholder:text-[#001F3F]/80"
                    />
                  </Autocomplete>
                  <button onClick={handleAddStop} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    <Plus size={20} className="text-[#001F3F]/80" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center gap-16 py-8 border-b border-black/[0.03]">
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setDestination('Heathrow Airport');
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <Plane size={32} className="text-[#001F3F]" />
                  <span className="text-[11px] font-medium text-center text-[#001F3F]">Airport<br/>Pickup</span>
                </button>

                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setDestination('Paddington Station');
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <Train size={32} className="text-[#001F3F]" />
                  <span className="text-[11px] font-medium text-center text-[#001F3F]">Railway<br/>Stations</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 py-12 flex flex-col items-center justify-start">
              <p className="text-sm text-[#001F3F]/80 font-light text-center max-w-[280px]">
                Previous and favorite addresses will appear here.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('All');

  const notifications = [
    {
      id: 1,
      type: 'promo',
      title: 'Summer Escape',
      description: 'Enjoy 20% off all airport transfers this weekend. Use code SUMMER20.',
      time: '2h ago',
      read: false,
      icon: <Percent size={18} />,
    },
    {
      id: 2,
      type: 'system',
      title: 'New Service Area',
      description: 'We are now operating in the Hamptons. Book your weekend getaway ride today.',
      time: '5h ago',
      read: true,
      icon: <MapPin size={18} />,
    },
    {
      id: 3,
      type: 'ride',
      title: 'Ride Completed',
      description: 'Your ride to JFK Airport has been completed. Receipt sent to email.',
      time: '1d ago',
      read: true,
      icon: <CheckCircle2 size={18} />,
    },
    {
      id: 4,
      type: 'system',
      title: 'Security Update',
      description: 'We have updated our privacy policy to better protect your data.',
      time: '2d ago',
      read: true,
      icon: <ShieldCheck size={18} />,
    }
  ];

  const filteredNotifications = activeTab === 'All' 
    ? notifications 
    : activeTab === 'Offers' 
      ? notifications.filter(n => n.type === 'promo')
      : notifications.filter(n => n.type !== 'promo');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full bg-[#F5F7FA] text-[#001F3F] flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6 z-10 bg-[#F5F7FA]">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-[#001F3F]/5 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-[#001F3F]" />
          </button>
        </div>
        
        <h2 className="font-sans text-4xl font-light uppercase tracking-widest text-[#001F3F] mb-8">News</h2>

        {/* Featured News */}
        <div className="mb-10 group cursor-pointer relative overflow-hidden rounded-3xl">
          <img 
            src="https://res.cloudinary.com/dgzysyl8g/image/upload/v1772700483/bc588d28-fb78-45c7-a380-faaf80c7e958_lqvzy9.png" 
            alt="Urbont News" 
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F]/90 to-transparent flex flex-col justify-end p-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Featured Story</span>
            <h3 className="text-xl font-light text-white leading-tight">The Future of Luxury Mobility</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#001F3F]/10">
          {['All', 'Offers', 'Activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium uppercase tracking-widest transition-all relative ${
                activeTab === tab ? 'text-[#001F3F]' : 'text-[#001F3F]/40 hover:text-[#001F3F]/60'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#001F3F]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredNotifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#001F3F]/40 space-y-4">
            <BellOff size={48} strokeWidth={1} />
            <p className="text-sm font-medium uppercase tracking-widest">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#001F3F]/5">
            {filteredNotifications.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`py-6 group flex gap-4 items-start ${!item.read ? 'bg-[#001F3F]/[0.02] -mx-6 px-6' : ''}`}
              >
                {/* Icon Column */}
                <div className="pt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    !item.read 
                      ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                      : 'bg-white border-[#001F3F]/10 text-[#001F3F]/40'
                  }`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm tracking-wide ${!item.read ? 'font-bold text-[#001F3F]' : 'font-medium text-[#001F3F]/70'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/30 whitespace-nowrap ml-2 mt-0.5">
                      {item.time}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#001F3F]/60 font-light leading-relaxed">
                    {item.description}
                  </p>
                  
                  {item.type === 'promo' && (
                    <div className="pt-3">
                      <button className="text-[10px] font-medium uppercase tracking-widest text-[#001F3F] border-b border-[#001F3F] pb-0.5 hover:opacity-70 transition-opacity">
                        View Offer
                      </button>
                    </div>
                  )}
                </div>

                {/* Unread Indicator (Right Side) */}
                {!item.read && (
                  <div className="pt-2">
                    <div className="w-1.5 h-1.5 bg-[#001F3F] rounded-full" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="pt-12 pb-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#001F3F]/20">
            End of list
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function VehicleSelectionScreen({ onBack, onConfirm }: { onBack: () => void, onConfirm: (v: Vehicle) => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [preferences, setPreferences] = useState({
    climate: '72°F',
    music: 'Classical',
    conversation: 'Quiet'
  });
  const vehicle = VEHICLES[selectedIdx];

  const PREF_OPTIONS = {
    climate: ['68°F', '70°F', '72°F', '74°F'],
    music: ['Classical', 'Jazz', 'Deep House', 'None'],
    conversation: ['Quiet', 'Friendly', 'Business']
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full w-full bg-white flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2">
          <X size={24} className="text-[#001F3F]" />
        </button>
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[#001F3F]">
          {vehicle.name.toUpperCase()}
        </h2>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Vehicle Image */}
        <div className="w-full aspect-[21/9] relative overflow-hidden bg-black/5">
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {VEHICLES.map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === selectedIdx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Title & Description */}
          <div className="text-center space-y-0.5">
            <h3 className="text-2xl font-light text-[#001F3F]">{vehicle.name}</h3>
            <p className="text-sm text-[#001F3F]/60 font-light">{vehicle.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-[#001F3F]">
            <span>From {vehicle.price}</span>
            {vehicle.id !== 'concierge' && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
                <span className="flex items-center gap-1"><Users size={16} /> {vehicle.id === 'suv' ? '6' : '4'}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
                <span className="flex items-center gap-1"><Briefcase size={16} /> {vehicle.id === 'suv' ? '4-6' : '1–3'}</span>
              </>
            )}
            {vehicle.id === 'concierge' && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
                <span className="flex items-center gap-1"><Clock size={16} /> Hourly</span>
              </>
            )}
          </div>

          {/* Price Comparison */}
          {vehicle.competitorPrice && (
            <div className="bg-[#001F3F]/5 rounded-xl p-2.5 flex items-center justify-between border border-[#001F3F]/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/60 font-medium">Urbont</span>
                <span className="text-base font-medium text-[#001F3F]">{vehicle.price}</span>
              </div>
              <div className="h-8 w-px bg-[#001F3F]/10" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/60 font-medium">Competitors</span>
                <span className="text-base font-light text-[#001F3F]/60 line-through decoration-red-500/50">{vehicle.competitorPrice}</span>
              </div>
            </div>
          )}

          <p className="text-sm text-[#001F3F] font-light text-center leading-relaxed">
            {vehicle.id === 'concierge' 
              ? "Our chauffeurs are at your service to handle your daily tasks with discretion and efficiency. From shopping to deliveries, we've got you covered."
              : "An elevated, professional service for all your business needs. Finely crafted interiors and exquisite personal service."
            }
          </p>

          {/* Amenities */}
          <div className="py-6 border-t border-black/[0.03]">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#001F3F]/40 mb-4">
              {vehicle.id === 'concierge' ? 'Services' : 'Amenities'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {(vehicle.id === 'concierge' 
                ? [
                    { name: 'Package Delivery', icon: <Package size={14} /> },
                    { name: 'Personal Shopping', icon: <ShoppingBag size={14} /> },
                    { name: 'Dry Cleaning', icon: <Shirt size={14} /> },
                    { name: 'Wait Service', icon: <UserCheck size={14} /> }
                  ]
                : [
                    { name: 'Fiji Water', icon: <Droplets size={14} /> },
                    { name: 'Vintage Wine', icon: <Wine size={14} /> },
                    { name: 'WiFi', icon: <Wifi size={14} /> },
                    { name: 'Tablet', icon: <Smartphone size={14} /> }
                  ]
              ).map(item => (
                <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#001F3F]/[0.02] border border-[#001F3F]/5">
                  <div className="text-[#001F3F]/60">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-[#001F3F]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Climate Control - Modern Selector */}
          {vehicle.id !== 'concierge' && (
            <div className="py-6 border-t border-black/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#001F3F]/40">Climate</h4>
                <span className="text-2xl font-light text-[#001F3F]">{preferences.climate}</span>
              </div>
              <div className="relative h-12 bg-[#001F3F]/[0.03] rounded-2xl p-1 flex items-center justify-between">
                {PREF_OPTIONS.climate.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setPreferences({...preferences, climate: opt})}
                    className={`relative z-10 flex-1 h-full rounded-xl text-xs font-medium transition-all duration-300 ${preferences.climate === opt ? 'text-white' : 'text-[#001F3F]/40 hover:text-[#001F3F]/60'}`}
                  >
                    {opt.replace('°F', '')}°
                  </button>
                ))}
                <motion.div 
                  className="absolute top-1 bottom-1 bg-[#001F3F] rounded-xl shadow-sm"
                  layoutId="climate-indicator"
                  initial={false}
                  animate={{
                    left: `${(PREF_OPTIONS.climate.indexOf(preferences.climate) / PREF_OPTIONS.climate.length) * 100}%`,
                    width: `${100 / PREF_OPTIONS.climate.length}%`,
                    x: 4 // small offset for padding
                  }}
                  style={{ width: `calc(${100 / PREF_OPTIONS.climate.length}% - 8px)` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Selector */}
      <div className="shrink-0 bg-white border-t border-black/[0.03] pb-10">
        <div className="flex gap-8 overflow-x-auto px-6 py-4 no-scrollbar justify-center">
          {VEHICLES.map((v, i) => (
            <button 
              key={v.id}
              onClick={() => setSelectedIdx(i)}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <span className={`text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${i === selectedIdx ? 'text-[#001F3F]' : 'text-[#001F3F]/40'}`}>
                {v.id.toUpperCase()}
              </span>
              {i === selectedIdx && (
                <div className="w-1 h-1 rounded-full bg-[#001F3F]" />
              )}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">
          <button 
            onClick={() => onConfirm(vehicle)}
            className="w-full h-14 bg-[#001F3F] text-white rounded-xl flex flex-col items-center justify-center active:scale-[0.98] transition-all shadow-lg shadow-[#001F3F]/10"
          >
            <span className="text-sm font-bold uppercase tracking-widest">Select {vehicle.id.toUpperCase()}</span>
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">3 min away</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PaymentConfirmationScreen({ vehicle, onBack, onConfirm, onPaymentMethods }: { vehicle: Vehicle, onBack: () => void, onConfirm: () => void, onPaymentMethods: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const priceNum = parseInt(vehicle.price.replace(/\D/g, '')) || 0;
    const totalAmount = priceNum + 5;

    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalAmount })
    })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setClientSecret('mock_secret_' + Math.random().toString(36).substring(7));
        }
      })
      .catch(() => {
        setClientSecret('mock_secret_' + Math.random().toString(36).substring(7));
      });
  }, [vehicle.price]);

  const handlePay = async () => {
    if (!clientSecret) return;
    setIsProcessing(true);
    
    if (clientSecret.startsWith('mock_')) {
      setTimeout(() => {
        setIsProcessing(false);
        onConfirm();
      }, 2000);
      return;
    }

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: 'if_required'
      });

      if (error) {
        setIsProcessing(false);
      } else {
        onConfirm();
      }
    } catch (e) {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-white text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center px-6 py-4 border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-semibold">Payment Confirmation</h2>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Journey Summary</h1>
          <p className="text-base text-gray-500">Review the details before confirming.</p>
        </div>

        {/* Summary Section */}
        <div className="bg-[#F5F7FA] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-widest text-[#001F3F]/40">Total Fare</span>
            <span className="text-2xl font-light">{vehicle.price}</span>
          </div>
          <div className="border-t border-[#001F3F]/10 pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#001F3F]/60">Vehicle</span>
              <span className="font-medium">{vehicle.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#001F3F]/60">Service Fee</span>
              <span className="font-medium">$5.00</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payment Method</h3>
            <button onClick={onPaymentMethods} className="text-sm font-bold text-[#001F3F]">Change</button>
          </div>
          
          {clientSecret && !clientSecret.startsWith('mock_') ? (
            <div className="p-1">
              <PaymentElement options={{ layout: 'tabs' }} />
            </div>
          ) : (
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-[#001F3F] rounded-lg flex items-center justify-center text-white">
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Visa ending in 4242</p>
                <p className="text-xs text-gray-400">Expires 12/28</p>
              </div>
              <Check size={16} className="text-emerald-500" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-[#001F3F]/40">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Secure Payment</span>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
        <button 
          onClick={handlePay}
          disabled={isProcessing || !clientSecret}
          className="w-full h-14 bg-[#001F3F] text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#001F3F]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#001F3F]/10 disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              <span>Confirm & Pay</span>
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">Secure & Encrypted Transaction</p>
      </div>
    </motion.div>
  );
}

function SearchingScreen({ onFound }: { onFound: () => void }) {
  const [status, setStatus] = useState('Connecting to elite fleet...');

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus('Locating nearby chauffeurs...'), 1000);
    const timer2 = setTimeout(() => setStatus('Securing your journey...'), 2000);
    const timer3 = setTimeout(onFound, 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFound]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#F5F7FA]"
    >
      <div className="relative mb-12">
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#001F3F] rounded-full"
        />
        <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#001F3F]/10">
          <Search size={32} className="text-[#001F3F] animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="font-sans text-2xl font-light uppercase tracking-wider">Finding your Chauffeur</h2>
        <p className="text-xs text-[#001F3F]/60 tracking-[0.2em] uppercase font-bold">{status}</p>
      </div>
    </motion.div>
  );
}

function ChauffeurProfileScreen({ onBack, onConfirm }: { onBack: () => void, onConfirm: () => void }) {
  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className="h-full w-full bg-white text-[#001F3F] flex flex-col overflow-hidden"
    >
      <div className="relative h-2/5 shrink-0">
        <img 
          src={CHAUFFEUR.portrait} 
          alt={CHAUFFEUR.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
          <ArrowLeft size={24} />
        </button>
        <button className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
          <Crown size={24} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Available Now</span>
          </div>
          <h2 className="text-3xl font-bold">{CHAUFFEUR.name}</h2>
          <p className="text-xs opacity-80">Elite Chauffeur • {CHAUFFEUR.experience} experience</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</div>
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                {CHAUFFEUR.rating} <Star size={14} className="fill-[#001F3F] text-[#001F3F]" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trips</div>
              <div className="text-lg font-bold">2.4k+</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Safety</div>
              <div className="text-lg font-bold">100%</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {CHAUFFEUR.languages.map(lang => (
                <span key={lang} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">{lang}</span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-[#001F3F]">
            <p className="text-sm text-gray-600 italic">
              "My commitment is to provide you with a safe, punctual, and discreet journey. It will be a pleasure to serve you."
            </p>
          </div>
        </div>

        <button 
          onClick={onConfirm} 
          className="w-full py-4 bg-[#001F3F] text-white font-bold rounded-xl shadow-lg hover:bg-navy-dark transition-all mt-6"
        >
          Confirm Chauffeur
        </button>
      </div>
    </motion.div>
  );
}

function ConfirmedScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-full w-full flex flex-col items-center justify-center p-8 bg-white text-[#001F3F]"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8"
      >
        <Check size={48} className="text-emerald-500" />
      </motion.div>
      
      <div className="text-center space-y-3 mb-12">
        <h2 className="text-4xl font-light uppercase tracking-widest">Journey Confirmed</h2>
        <p className="text-sm text-[#001F3F]/60">Your chauffeur is on the way to your location.</p>
      </div>

      <button 
        onClick={onContinue}
        className="w-full py-4 bg-[#001F3F] text-white font-bold rounded-xl shadow-lg hover:bg-navy-dark transition-all"
      >
        View Trip Details
      </button>
    </motion.div>
  );
}

function TripCompletedScreen({ onBack }: { onBack: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full w-full flex flex-col bg-white text-[#001F3F] overflow-hidden"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        
        <h2 className="text-2xl font-light text-[#001F3F] mb-2">Trip Completed</h2>
        <p className="text-sm text-gray-500 mb-8">Your ride has been successfully completed.</p>

        <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-[#001F3F] text-lg">{CHAUFFEUR.name}</h4>
              <p className="text-xs text-gray-500">URB-2026 • Black</p>
            </div>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-amber-100 text-amber-600' : 'bg-white text-gray-300 hover:text-amber-500'}`}
            >
              <Crown size={20} className={isFavorite ? 'fill-amber-500' : ''} />
            </button>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Rate your experience</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star 
                    size={32} 
                    className={`${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Add a comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#001F3F] transition-colors resize-none h-24"
          />
        </div>

        <div className="w-full space-y-4">
          <div className="flex justify-between items-center px-4">
            <span className="text-sm text-gray-500">Total Fare</span>
            <span className="text-xl font-bold text-[#001F3F]">$85.00</span>
          </div>
          
          <button 
            onClick={onBack}
            className="w-full py-4 bg-[#001F3F] text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg hover:bg-[#001F3F]/90 active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TrackingScreen({ vehicle, onBack, onEndTrip, onCompleteTrip, isLoaded, loadError }: { vehicle: Vehicle, onBack: () => void, onEndTrip: () => void, onCompleteTrip: () => void, isLoaded: boolean, loadError: Error | undefined }) {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am 5 minutes away from your location.", sender: 'chauffeur' }
  ]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [carPos, setCarPos] = useState({ lat: 40.7128, lng: -74.0060 });
  const [userPos, setUserPos] = useState({ lat: 40.7150, lng: -74.0080 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserPos({ lat: latitude, lng: longitude });
        setCarPos({ lat: latitude + 0.005, lng: longitude + 0.005 });
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarPos(prev => ({
        lat: prev.lat - 0.0001,
        lng: prev.lng - 0.0001
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const mapStyles = [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [{"color": "#f5f5f5"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#616161"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#f5f5f5"}]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#bdbdbd"}]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#eeeeee"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#e5e5e5"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#dadada"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#616161"}]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{"color": "#e5e5e5"}]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{"color": "#eeeeee"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#c9c9c9"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    }
  ];

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMessage = { id: Date.now(), text: chatMessage, sender: 'user' };
    setMessages([...messages, newMessage]);
    setChatMessage('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col bg-white text-[#001F3F] overflow-hidden"
    >
      {/* Map Area */}
      <div className="flex-1 relative bg-gray-100">
        <div className="absolute inset-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={userPos}
              zoom={14}
              onLoad={setMap}
              options={{
                disableDefaultUI: true,
                styles: mapStyles,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                clickableIcons: false,
              }}
            >
              <Marker 
                position={userPos}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: '#001F3F',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                }}
              />
              <Marker 
                position={carPos}
                icon={{
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: '#001F3F',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#FFFFFF',
                  rotation: 45
                }}
              />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-gray-100 animate-pulse" />
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-10 left-6 right-6 flex justify-between items-center z-20">
          <button onClick={onBack} className="p-3 bg-white rounded-full shadow-lg text-[#001F3F] hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                // Mock share functionality
                const shareText = `I'm on my way with Urbont! Track my trip here: ${window.location.href}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Urbont Trip',
                    text: shareText,
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  alert('Trip link copied to clipboard!');
                  navigator.clipboard.writeText(shareText);
                }
              }}
              className="p-3 bg-white rounded-full shadow-lg text-[#001F3F] hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
            >
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setShowSOS(true)}
              className="p-3 bg-red-600 rounded-full shadow-lg text-white hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center"
            >
              <AlertTriangle size={20} />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Panel */}
      <motion.div 
        animate={{ height: isPanelExpanded ? '85%' : '280px' }}
        className="bg-white rounded-t-[40px] shadow-2xl border-t border-gray-100 z-30 relative overflow-hidden flex flex-col"
      >
        {/* Drag Handle */}
        <div 
          className="w-full py-4 flex justify-center cursor-pointer"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
          {/* Quick Info Row */}
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Estimated Arrival</p>
              <h3 className="text-4xl font-light text-[#001F3F]">8 <span className="text-lg font-normal text-gray-400">min</span></h3>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Distance</p>
              <h3 className="text-2xl font-light text-[#001F3F]">2.4 <span className="text-sm font-normal text-gray-400">km</span></h3>
            </div>
          </div>

          {/* Chauffeur Card */}
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[24px] border border-gray-100 mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#001F3F] text-lg">{CHAUFFEUR.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 bg-[#001F3F]/5 px-2 py-0.5 rounded-full">
                  <Star size={10} className="fill-[#001F3F] text-[#001F3F]" />
                  <span className="text-[10px] font-bold text-[#001F3F]">{CHAUFFEUR.rating}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">URB-2026 • Black</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowChat(true)}
                className="w-12 h-12 flex items-center justify-center bg-[#001F3F] text-white rounded-2xl shadow-lg hover:bg-[#001F3F]/90 active:scale-95 transition-all"
              >
                <MessageSquare size={20} />
              </button>
              <button 
                onClick={() => setShowCall(true)}
                className="w-12 h-12 flex items-center justify-center bg-white text-[#001F3F] rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Phone size={20} />
              </button>
            </div>
          </div>

          {/* Trip Timeline (Always visible if space allows, or at least top of expanded) */}
          <div className="mb-6">
            <div className="flex justify-between mb-4">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="h-0.5 w-full bg-emerald-500" />
                <span className="text-[8px] font-bold uppercase text-emerald-600 mt-1">Confirmed</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="h-0.5 w-full bg-emerald-500" />
                <span className="text-[8px] font-bold uppercase text-emerald-600 mt-1">En Route</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-100" />
                <span className="text-[8px] font-bold uppercase text-gray-400 mt-1">Arrived</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-100" />
                <span className="text-[8px] font-bold uppercase text-gray-400 mt-1">Trip</span>
              </div>
            </div>
          </div>

          {/* Quick Cancel Button (Visible in collapsed view) */}
          {!isPanelExpanded && (
            <div className="flex gap-2 mb-4">
              <button 
                onClick={onEndTrip}
                className="flex-1 py-3 text-red-600 text-[10px] font-bold uppercase tracking-[0.2em] border border-red-100 rounded-xl hover:bg-red-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={onCompleteTrip}
                className="flex-1 py-3 bg-[#001F3F] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#001F3F]/90 transition-all"
              >
                Complete Trip
              </button>
            </div>
          )}

          {/* Expanded Details */}
          <div className="space-y-8">
            {/* Vehicle Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle</p>
                <p className="text-sm font-bold text-[#001F3F]">{vehicle.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Mercedes-Benz E-Class</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plate Number</p>
                <p className="text-sm font-bold text-[#001F3F]">URB-2026</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Midnight Black</p>
              </div>
            </div>

            {/* Journey Path */}
            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100" />
              
              <div className="flex items-start gap-4 relative">
                <div className="w-4 h-4 mt-1 bg-emerald-500 rounded-full border-4 border-white shadow-sm z-10" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup Location</p>
                  <p className="text-sm font-medium text-[#001F3F] mt-0.5">The Ritz-Carlton, South Beach</p>
                  <p className="text-[10px] text-gray-500">1 Lincoln Rd, Miami Beach, FL 33139</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className="w-4 h-4 mt-1 bg-[#001F3F] rounded-full border-4 border-white shadow-sm z-10" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
                  <p className="text-sm font-medium text-[#001F3F] mt-0.5">Miami International Airport (MIA)</p>
                  <p className="text-[10px] text-gray-500">2100 NW 42nd Ave, Miami, FL 33142</p>
                </div>
              </div>
            </div>

            {/* Payment & Price */}
            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <CreditCard size={18} className="text-[#001F3F]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-bold text-[#001F3F]">Visa •••• 4242</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Fare</p>
                <p className="text-xl font-bold text-[#001F3F]">{vehicle.price}</p>
              </div>
            </div>

            {/* Safety & Support */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Urbont Journey Status',
                      text: `I'm on my way in a ${vehicle.name}. Arriving in 8 minutes.`,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    setNotification('Status link copied to clipboard!');
                  }
                }}
                className="flex items-center justify-center gap-2 h-14 bg-gray-50 text-[#001F3F] text-[11px] font-bold uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all"
              >
                <Share2 size={16} />
                Share Status
              </button>
              <button 
                onClick={() => setShowSOS(true)}
                className="flex items-center justify-center gap-2 h-14 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-widest rounded-2xl border border-red-100 hover:bg-red-100 transition-all"
              >
                <ShieldCheck size={16} />
                Safety Center
              </button>
            </div>

            {/* Trip ID & Support */}
            <div className="flex flex-col items-center gap-2 pt-4">
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">Trip ID: URB-99283-XM</p>
              <button 
                onClick={onEndTrip}
                className="w-full h-16 bg-red-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center mt-4"
              >
                Cancel Journey
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 bg-[#001F3F] text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] text-sm font-medium text-center min-w-[280px]"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOS && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600/90 backdrop-blur-md z-[60] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={40} className="text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#001F3F]">Emergency SOS</h3>
                <p className="text-sm text-gray-500">Are you in immediate danger? This will notify our security team and local authorities.</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setNotification('Emergency services have been notified. Stay calm, help is on the way.');
                    setShowSOS(false);
                  }}
                  className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  CALL EMERGENCY
                </button>
                <button 
                  onClick={() => setShowSOS(false)}
                  className="w-full py-4 bg-gray-100 text-[#001F3F] font-bold rounded-xl active:scale-95 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Modal */}
      <AnimatePresence>
        {showCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-[32px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Contact Chauffeur</h3>
                <button onClick={() => setShowCall(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{CHAUFFEUR.name}</h4>
                  <p className="text-sm text-gray-500">+1 (555) 000-1234</p>
                </div>
              </div>
              <a 
                href="tel:+15550001234"
                className="w-full py-4 bg-[#001F3F] text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
              >
                <Phone size={20} />
                START CALL
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Chat Modal Overlay */}
      <AnimatePresence>
        {showChat && (
          <SmartChat 
            rideId="active-ride-123"
            senderRole="passenger"
            passengerName={CHAUFFEUR.name}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProfileScreen({ 
  userProfile, 
  onBack, 
  onEditProfile, 
  onEditAddress, 
  onSignOut, 
  onLegal,
  onRidePreferences,
  onUpdateProfile
}: { 
  userProfile: UserProfile, 
  onBack: () => void, 
  onEditProfile: () => void, 
  onEditAddress: (type: 'home' | 'work' | 'other') => void, 
  onSignOut: () => void, 
  onLegal: () => void, 
  onRidePreferences: () => void,
  onUpdateProfile: (updated: Partial<UserProfile>) => void,
  key?: string 
}) {
  const [blackCarsOnly, setBlackCarsOnly] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Spanish', 'French', 'German'];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center justify-between p-6">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <button onClick={onEditProfile} className="text-sm font-medium text-[#001F3F] hover:text-[#001F3F] transition-colors">Edit</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-black/[0.02]">
              <User size={48} className="text-[#001F3F]/20" />
            </div>
            <div className="absolute bottom-0 right-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#001F3F] rounded-full flex items-center justify-center shadow-md border-2 border-[#FFFFFF]">
                <Camera size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Account Type Indicator (Visual Only as per current props, or I need to add update logic) */}
        {/* Since I cannot easily pipe the update function down without changing multiple signatures, 
            I will add the UI. To make it functional, I would need `onUpdateProfile`.
            Wait, `EditProfileScreen` has `onSave`. `ProfileScreen` does not.
            I will add `onUpdateProfile` to `ProfileScreen` props in the next step if needed.
            For now, I'll assume the user wants to see it here. 
            Actually, I can just add the prop to the component definition right here since I am replacing the whole component or part of it.
        */}
        
        <div className="flex justify-center mb-8">
           <div className="flex bg-[#001F3F]/5 p-1 rounded-full w-fit border border-[#001F3F]/10">
              <button 
                onClick={() => onUpdateProfile({ accountType: 'personal' })}
                className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all ${
                userProfile.accountType === 'personal' 
                  ? 'bg-[#001F3F] text-white shadow-md' 
                  : 'text-[#001F3F]/60 hover:text-[#001F3F]'
              }`}>
                Personal
              </button>
              <button 
                onClick={() => onUpdateProfile({ accountType: 'business' })}
                className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all ${
                userProfile.accountType === 'business' 
                  ? 'bg-[#001F3F] text-white shadow-md' 
                  : 'text-[#001F3F]/60 hover:text-[#001F3F]'
              }`}>
                Business
              </button>
           </div>
        </div>

        <div className="space-y-8">
          {/* User Info Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
            <div className="py-4 px-5 border-b border-black/[0.04]">
              <div className="text-xs text-[#001F3F]/80 uppercase tracking-widest mb-1">Name</div>
              <div className="text-base font-medium text-[#001F3F]">{userProfile.firstName} {userProfile.lastName}</div>
            </div>
            <div className="py-4 px-5 border-b border-black/[0.04]">
              <div className="text-xs text-[#001F3F]/80 uppercase tracking-widest mb-1">Phone</div>
              <div className="text-base font-medium text-[#001F3F]">{userProfile.phone}</div>
            </div>
            <div className="py-4 px-5 border-b border-black/[0.04]">
              <div className="text-xs text-[#001F3F]/80 uppercase tracking-widest mb-1">Email</div>
              <div className="text-base font-medium text-[#001F3F]">{userProfile.email}</div>
            </div>
            {userProfile.accountType === 'business' && (
              <div className="py-4 px-5 bg-[#001F3F]/5">
                <div className="text-xs text-[#001F3F]/80 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Briefcase size={12} />
                  Company
                </div>
                <div className="text-base font-medium text-[#001F3F]">{userProfile.companyName || 'Add Company Details'}</div>
              </div>
            )}
          </div>

          {/* Favorites Card */}
          <div className="space-y-3">
            <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest px-2">Favorites</div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
              <button onClick={() => onEditAddress('home')} className="flex items-center gap-4 w-full p-5 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  <Home size={18} />
                </div>
                <div className="flex flex-col items-start flex-1">
                  <span className="text-base font-medium text-[#001F3F]">
                    {userProfile.homeAddress ? 'Home' : 'Add Home'}
                  </span>
                  {userProfile.homeAddress && (
                    <span className="text-xs text-[#001F3F]/50 text-left line-clamp-1">{userProfile.homeAddress}</span>
                  )}
                </div>
                <ChevronRight size={16} className="text-[#001F3F]/30" />
              </button>
              <button onClick={() => onEditAddress('work')} className="flex items-center gap-4 w-full p-5 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  <Briefcase size={18} />
                </div>
                <div className="flex flex-col items-start flex-1">
                  <span className="text-base font-medium text-[#001F3F]">
                    {userProfile.workAddress ? 'Work' : 'Add Work'}
                  </span>
                  {userProfile.workAddress && (
                    <span className="text-xs text-[#001F3F]/50 text-left line-clamp-1">{userProfile.workAddress}</span>
                  )}
                </div>
                <ChevronRight size={16} className="text-[#001F3F]/30" />
              </button>
              <button onClick={() => onEditAddress('other')} className="flex items-center gap-4 w-full p-5 hover:bg-black/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  <Plus size={18} />
                </div>
                <span className="text-base font-medium text-[#001F3F] flex-1 text-left">Add Other Address</span>
                <ChevronRight size={16} className="text-[#001F3F]/30" />
              </button>
              {userProfile.otherAddresses.map((addr) => (
                <div key={addr.id} className="flex items-center gap-4 w-full p-5 border-t border-black/[0.04]">
                  <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-base font-medium text-[#001F3F]">{addr.label}</span>
                    <span className="text-xs text-[#001F3F]/50 text-left line-clamp-1">{addr.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Card */}
          <div className="space-y-3">
            <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest px-2">Settings</div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
              <div className="p-5 border-b border-black/[0.04]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-medium text-[#001F3F]">Black Cars Only</span>
                  <button 
                    onClick={() => setBlackCarsOnly(!blackCarsOnly)}
                    className={`w-14 h-7 rounded-full relative transition-all duration-300 border-2 ${blackCarsOnly ? 'bg-[#001F3F] border-[#001F3F]' : 'bg-white border-[#001F3F]/20'}`}
                  >
                    <motion.div 
                      animate={{ x: blackCarsOnly ? 28 : 2 }}
                      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${blackCarsOnly ? 'bg-white' : 'bg-[#001F3F]/20'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[#001F3F]/50 leading-relaxed">
                  Use this option to book only black cars. You might have to wait longer.
                </p>
              </div>
              <button onClick={() => setShowLanguageMenu(true)} className="flex justify-between items-center w-full p-5 hover:bg-black/[0.02] transition-colors">
                <span className="text-base font-medium text-[#001F3F]">Language</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#001F3F]/50">{language}</span>
                  <ChevronRight size={16} className="text-[#001F3F]/30" />
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button onClick={onLegal} className="flex justify-between items-center w-full p-5 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.02] hover:bg-black/[0.02] transition-colors">
              <span className="text-base font-medium text-[#001F3F]">Terms & Privacy</span>
              <ChevronRight size={16} className="text-[#001F3F]/30" />
            </button>
            
            <button onClick={onSignOut} className="w-full h-14 bg-transparent border border-[#001F3F]/20 text-[#001F3F] text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#001F3F]/5 active:scale-[0.98] transition-all flex items-center justify-center">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection Overlay */}
      <AnimatePresence>
        {showLanguageMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageMenu(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute bottom-0 left-0 right-0 bg-[#FFFFFF] z-50 p-6 pt-8 rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-white/50"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="font-sans text-2xl font-light text-[#001F3F]">Select Language</h3>
                  <button onClick={() => setShowLanguageMenu(false)} className="p-2 bg-white rounded-full shadow-sm text-[#001F3F]/80 hover:bg-white/10 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {languages.map((lang) => {
                    const isSelected = language === lang;
                    return (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setTimeout(() => setShowLanguageMenu(false), 200);
                        }}
                        className={`w-full py-4 px-6 text-left text-base font-medium rounded-2xl transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#001F3F]/10 text-[#001F3F] border border-[#001F3F]/30 shadow-sm'
                            : 'bg-white text-[#001F3F] border border-transparent hover:border-[#001F3F]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        {lang}
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 size={20} className="text-[#001F3F]" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RideHistoryScreen({ onBack, onSchedule }: { onBack: () => void, onSchedule: () => void }) {
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const history = [
    { id: 1, date: 'Oct 24, 2024', destination: 'JFK Airport, Terminal 4', vehicle: 'First Class', price: '$145.00', status: 'Completed' },
    { id: 2, date: 'Oct 20, 2024', destination: 'The Plaza Hotel', vehicle: 'Business Class', price: '$85.00', status: 'Completed' },
    { id: 3, date: 'Oct 15, 2024', destination: 'Madison Square Garden', vehicle: 'Business XL', price: '$120.00', status: 'Cancelled' },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <button onClick={onSchedule} className="ml-auto text-sm font-medium uppercase tracking-wider text-[#001F3F]/60 hover:text-[#001F3F] transition-colors">
          Schedule Ride
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-8">
        <div className="text-center space-y-3 mt-2 mb-8">
          <h2 className="font-sans text-3xl font-light text-[#001F3F]">Ride History</h2>
          <p className="text-sm font-normal leading-relaxed text-[#001F3F]/80 px-4">
            Review your past journeys and receipts
          </p>
        </div>

        <div className="space-y-4">
          {history.map((ride) => (
            <button 
              key={ride.id} 
              onClick={() => setSelectedRide(ride)}
              className="w-full text-left bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.02] space-y-4 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start border-b border-black/[0.04] pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest font-medium">{ride.date}</div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    ride.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {ride.status}
                  </div>
                </div>
                <div className="text-sm font-medium text-[#001F3F]">{ride.price}</div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans text-xl font-medium text-[#001F3F]">{ride.destination}</h3>
                  <div className="text-xs text-[#001F3F]/80 mt-1">{ride.vehicle}</div>
                </div>
                <ChevronRight size={18} className="text-[#001F3F]/30" />
              </div>
            </button>
          ))}
        </div>
      </div>
    
      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedRide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
            onClick={() => setSelectedRide(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-[#001F3F]">Receipt</h3>
                <button onClick={() => setSelectedRide(null)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 bg-[#001F3F]/5 rounded-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-black/[0.04] pb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#001F3F]/80">Date</p>
                    <p className="text-base font-medium text-[#001F3F] mt-1">{selectedRide.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-[#001F3F]/80">Total</p>
                    <p className="text-xl font-light text-[#001F3F] mt-1">{selectedRide.price}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#001F3F]/80">Destination</p>
                    <p className="text-sm font-medium text-[#001F3F] mt-1">{selectedRide.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#001F3F]/80">Vehicle Class</p>
                    <p className="text-sm font-medium text-[#001F3F] mt-1">{selectedRide.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#001F3F]/80">Status</p>
                    <p className={`text-sm font-medium mt-1 ${
                      selectedRide.status === 'Completed' ? 'text-green-700' : 'text-red-700'
                    }`}>{selectedRide.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 border border-[#001F3F]/20 text-[#001F3F] text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all">
                  Download PDF
                </button>
                <button className="flex-1 py-4 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all">
                  Book Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
    </motion.div>
  );
}

function PaymentMethodsScreen({ onBack }: { onBack: () => void }) {
  const [methods, setMethods] = useState([
    { id: '1', type: 'card', brand: 'VISA', last4: '4242', active: true },
    { id: '2', type: 'card', brand: 'AMEX', last4: '1005', active: false },
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddMethod = (type: 'card' | 'paypal') => {
    if (type === 'paypal') {
      const newMethod = { id: Date.now().toString(), type: 'paypal', brand: 'PayPal', last4: 'user@example.com', active: false };
      setMethods([...methods, newMethod]);
      setShowAddMenu(false);
    } else {
      setShowCardModal(true);
    }
  };

  const saveCard = () => {
    if (cardNumber && expiry && cvv) {
      const last4 = cardNumber.slice(-4) || '1234';
      const newMethod = { id: Date.now().toString(), type: 'card', brand: 'Mastercard', last4, active: false };
      setMethods([...methods, newMethod]);
      setShowCardModal(false);
      setShowAddMenu(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }
  };

  const toggleActive = (id: string) => {
    setMethods(methods.map(m => ({ ...m, active: m.id === id })));
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 font-sans text-xl font-medium uppercase tracking-widest text-[#001F3F]">PAYMENT</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="text-[10px] text-[#001F3F]/60 uppercase tracking-[0.2em] font-medium px-1">Saved Cards</div>
            
            {/* Realistic Card UI */}
            <div className="relative w-full aspect-[1.586] rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#001F3F]"></div>
              
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>

              {/* Card Content */}
              <div className="relative h-full p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md opacity-90 flex items-center justify-center overflow-hidden relative">
                     <div className="absolute inset-0 border border-black/10 rounded-md"></div>
                     <div className="w-full h-[1px] bg-black/10 absolute top-1/3"></div>
                     <div className="w-full h-[1px] bg-black/10 absolute bottom-1/3"></div>
                     <div className="h-full w-[1px] bg-black/10 absolute left-1/3"></div>
                     <div className="h-full w-[1px] bg-black/10 absolute right-1/3"></div>
                  </div>
                  <span className="font-mono text-xs opacity-60 tracking-widest">PLATINUM</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                    <span className="font-mono text-lg tracking-[0.2em]">4242</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest opacity-60">Card Holder</span>
                      <div className="text-xs font-medium uppercase tracking-widest">Angel Boyer</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[8px] uppercase tracking-widest opacity-60">Expires</span>
                      <div className="text-xs font-medium tracking-widest">12/28</div>
                    </div>
                    <div className="w-10 h-6 flex items-center justify-center">
                       <div className="w-6 h-6 rounded-full bg-red-500/80 -mr-2"></div>
                       <div className="w-6 h-6 rounded-full bg-yellow-500/80"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {methods.map((method) => (
                <button 
                  key={method.id}
                  onClick={() => toggleActive(method.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${method.active ? 'bg-[#001F3F]/5 border-[#001F3F]/20 shadow-sm' : 'bg-white border-black/[0.03] hover:bg-black/[0.01]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-black/[0.03] flex items-center justify-center shadow-sm">
                      {method.type === 'card' ? <CreditCard size={18} className="text-[#001F3F]" /> : <Smartphone size={18} className="text-[#001F3F]" />}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-[#001F3F]">{method.brand} •••• {method.last4}</div>
                      <div className="text-xs text-[#001F3F]/60">{method.active ? 'Primary Payment Method' : 'Secondary'}</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${method.active ? 'border-[#001F3F] bg-[#001F3F]' : 'border-black/10'}`}>
                    {method.active && <Check size={12} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!showAddMenu ? (
            <button 
              onClick={() => setShowAddMenu(true)}
              className="w-full h-14 bg-white text-[#001F3F] text-sm font-bold uppercase tracking-widest rounded-xl shadow-sm border border-[#001F3F]/10 flex items-center justify-center gap-3 hover:bg-[#001F3F]/5 active:scale-[0.98] transition-all"
            >
              <Plus size={18} />
              Add Payment Method
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-[10px] text-[#001F3F]/60 uppercase tracking-[0.2em] font-medium px-1">Add New</div>
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
                <button 
                  onClick={() => handleAddMethod('card')}
                  className="w-full p-5 border-b border-black/[0.04] flex items-center gap-4 hover:bg-black/[0.02] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F] border border-black/[0.05]">
                    <CreditCard size={18} />
                  </div>
                  <span className="text-sm font-medium text-[#001F3F] uppercase tracking-wider">Credit or Debit Card</span>
                </button>
                <button 
                  onClick={() => handleAddMethod('paypal')}
                  className="w-full p-5 flex items-center gap-4 hover:bg-black/[0.02] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F] font-bold border border-black/[0.05]">
                    P
                  </div>
                  <span className="text-sm font-medium text-[#001F3F] uppercase tracking-wider">PayPal</span>
                </button>
              </div>
              <button 
                onClick={() => setShowAddMenu(false)}
                className="w-full py-4 text-xs font-medium text-[#001F3F]/60 uppercase tracking-widest hover:text-[#001F3F] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    
      {/* Add Card Modal */}
      <AnimatePresence>
        {showCardModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-light uppercase tracking-widest text-[#001F3F]">Add Card</h3>
                <button onClick={() => setShowCardModal(false)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/60 font-medium">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none tracking-widest placeholder:text-[#001F3F]/20" 
                  />
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/60 font-medium">Expiry</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none tracking-widest placeholder:text-[#001F3F]/20" 
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/60 font-medium">CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none tracking-widest placeholder:text-[#001F3F]/20" 
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={saveCard} 
                disabled={!cardNumber || !expiry || !cvv}
                className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
              >
                Save Card
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
    </motion.div>
  );
}

function ScheduleRideScreen({ onBack, isLoaded }: { onBack: () => void, isLoaded: boolean }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [pickupRef, setPickupRef] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropoffRef, setDropoffRef] = useState<google.maps.places.Autocomplete | null>(null);

  const onPickupLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setPickupRef(autocomplete);
  };

  const onPickupPlaceChanged = () => {
    if (pickupRef) {
      const place = pickupRef.getPlace();
      setPickup(place.formatted_address || '');
    }
  };

  const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDropoffRef(autocomplete);
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffRef) {
      const place = dropoffRef.getPlace();
      setDropoff(place.formatted_address || '');
    }
  };

  const handleSchedule = () => {
    console.log('Scheduling ride:', { pickup, dropoff, date, time });
    onBack();
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4 border-b border-black/[0.04]">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-sans text-xl font-light uppercase tracking-widest text-[#001F3F]">
          Schedule Ride
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F5F7FA] p-6 space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/50">Trip Details</label>
            <div className="space-y-3">
              <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3 relative z-20">
                <MapPin size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                {isLoaded ? (
                  <Autocomplete
                    onLoad={onPickupLoad}
                    onPlaceChanged={onPickupPlaceChanged}
                    className="w-full"
                  >
                    <input
                      type="text"
                      placeholder="Pickup Location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    placeholder="Pickup Location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                  />
                )}
              </div>
              <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3 relative z-10">
                <MapPin size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                {isLoaded ? (
                  <Autocomplete
                    onLoad={onDropoffLoad}
                    onPlaceChanged={onDropoffPlaceChanged}
                    className="w-full"
                  >
                    <input
                      type="text"
                      placeholder="Dropoff Location"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    placeholder="Dropoff Location"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                  <Calendar size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                  <input
                    type="date"
                    placeholder="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                  />
                </div>
                <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                  <Clock size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                  <input
                    type="time"
                    placeholder="Time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSchedule}
          disabled={!pickup || !dropoff || !date || !time}
          className="w-full py-4 bg-[#001F3F] text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#001F3F]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Schedule Ride
        </button>
      </div>
    </motion.div>
  );
}

function GiftRideScreen({ onBack, isLoaded }: { onBack: () => void, isLoaded: boolean }) {
  const [view, setView] = useState<'menu' | 'gift_card' | 'guest_booking'>('menu');
  
  // Gift Card State
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  // Guest Booking State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [pickupRef, setPickupRef] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropoffRef, setDropoffRef] = useState<google.maps.places.Autocomplete | null>(null);

  const onPickupLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setPickupRef(autocomplete);
  };

  const onPickupPlaceChanged = () => {
    if (pickupRef) {
      const place = pickupRef.getPlace();
      setPickup(place.formatted_address || '');
    }
  };

  const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDropoffRef(autocomplete);
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffRef) {
      const place = dropoffRef.getPlace();
      setDropoff(place.formatted_address || '');
    }
  };

  const handleBack = () => {
    if (view !== 'menu') {
      setView('menu');
    } else {
      onBack();
    }
  };

  const handleSendGiftCard = () => {
    // Logic to send gift card
    console.log('Sending gift card:', { amount: amount || customAmount, recipientName, recipientEmail, message });
    onBack();
  };

  const handleBookGuest = () => {
    // Logic to book for guest
    console.log('Booking for guest:', { guestName, guestPhone, pickup, dropoff, date, time });
    onBack();
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4 border-b border-black/[0.04]">
        <button onClick={handleBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-sans text-xl font-light uppercase tracking-widest text-[#001F3F]">
          {view === 'menu' ? 'Gift a Journey' : view === 'gift_card' ? 'Send Gift Card' : 'Guest Booking'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F5F7FA]">
        <AnimatePresence mode="wait">
          {view === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#001F3F]/20 text-white">
                  <Gift size={32} />
                </div>
                <h3 className="text-2xl font-light text-[#001F3F]">Share the Experience</h3>
                <p className="text-sm text-[#001F3F]/60 leading-relaxed max-w-xs mx-auto">
                  Choose how you'd like to share the URBONT experience with others.
                </p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={() => setView('gift_card')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                      <CreditCard size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-medium text-[#001F3F]">Send a Gift Card</h4>
                      <p className="text-xs text-[#001F3F]/50 mt-1">Send credit to friends or family</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
                </button>

                <button 
                  onClick={() => setView('guest_booking')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                      <UserPlus size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-medium text-[#001F3F]">Book for a Guest</h4>
                      <p className="text-xs text-[#001F3F]/50 mt-1">Arrange a ride for someone else</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'gift_card' && (
            <motion.div 
              key="gift_card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-8"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/50">Select Amount</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[50, 100, 250].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setAmount(amt); setCustomAmount(''); }}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${
                          amount === amt 
                            ? 'bg-[#001F3F] text-white shadow-lg shadow-[#001F3F]/20' 
                            : 'bg-[#F5F7FA] text-[#001F3F] hover:bg-[#001F3F]/5'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001F3F]/40 font-medium">$</span>
                    <input
                      type="number"
                      placeholder="Custom Amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                      className={`w-full bg-[#F5F7FA] rounded-xl py-3 pl-8 pr-4 text-sm font-medium outline-none transition-all ${
                        customAmount ? 'ring-2 ring-[#001F3F] bg-white' : 'focus:bg-white focus:ring-2 focus:ring-[#001F3F]/10'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/50">Recipient Details</label>
                  <div className="space-y-3">
                    <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                      <User size={18} className="text-[#001F3F]/30 mr-3" />
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                      />
                    </div>
                    <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                      <Mail size={18} className="text-[#001F3F]/30 mr-3" />
                      <input
                        type="email"
                        placeholder="Recipient Email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                      />
                    </div>
                    <div className="flex items-start bg-[#F5F7FA] rounded-xl px-4 py-3">
                      <MessageCircle size={18} className="text-[#001F3F]/30 mr-3 mt-0.5" />
                      <textarea
                        placeholder="Add a personal message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSendGiftCard}
                disabled={(!amount && !customAmount) || !recipientName || !recipientEmail}
                className="w-full py-4 bg-[#001F3F] text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#001F3F]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                Send Gift Card
              </button>
            </motion.div>
          )}

          {view === 'guest_booking' && (
            <motion.div 
              key="guest_booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-8"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/50">Guest Details</label>
                  <div className="space-y-3">
                    <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                      <User size={18} className="text-[#001F3F]/30 mr-3" />
                      <input
                        type="text"
                        placeholder="Guest Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                      />
                    </div>
                    <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                      <Phone size={18} className="text-[#001F3F]/30 mr-3" />
                      <input
                        type="tel"
                        placeholder="Guest Phone Number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#001F3F]/50">Trip Details</label>
                  <div className="space-y-3">
                    <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3 relative z-20">
                      <MapPin size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                      {isLoaded ? (
                        <Autocomplete
                          onLoad={onPickupLoad}
                          onPlaceChanged={onPickupPlaceChanged}
                          className="w-full"
                        >
                          <input
                            type="text"
                            placeholder="Pickup Location"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                          />
                        </Autocomplete>
                      ) : (
                        <input
                          type="text"
                          placeholder="Pickup Location"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                        />
                      )}
                    </div>
                    <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3 relative z-10">
                      <MapPin size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                      {isLoaded ? (
                        <Autocomplete
                          onLoad={onDropoffLoad}
                          onPlaceChanged={onDropoffPlaceChanged}
                          className="w-full"
                        >
                          <input
                            type="text"
                            placeholder="Dropoff Location"
                            value={dropoff}
                            onChange={(e) => setDropoff(e.target.value)}
                            className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                          />
                        </Autocomplete>
                      ) : (
                        <input
                          type="text"
                          placeholder="Dropoff Location"
                          value={dropoff}
                          onChange={(e) => setDropoff(e.target.value)}
                          className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                        <Calendar size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                        <input
                          type="date"
                          placeholder="Date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                        />
                      </div>
                      <div className="flex items-center bg-[#F5F7FA] rounded-xl px-4 py-3">
                        <Clock size={18} className="text-[#001F3F]/30 mr-3 shrink-0" />
                        <input
                          type="time"
                          placeholder="Time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="bg-transparent w-full outline-none text-sm text-[#001F3F] placeholder:text-[#001F3F]/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBookGuest}
                disabled={!guestName || !guestPhone || !pickup || !dropoff || !date || !time}
                className="w-full py-4 bg-[#001F3F] text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#001F3F]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                Request Booking
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function RidePreferencesScreen({ preferences, onBack, onSave }: { 
  preferences: UserProfile['ridePreferences'], 
  onBack: () => void,
  onSave: (prefs: UserProfile['ridePreferences']) => void 
}) {
  const [temp, setTemp] = useState(preferences?.temperature || 'Neutral');
  const [music, setMusic] = useState(preferences?.music || 'Silence');
  const [conv, setConv] = useState(preferences?.conversation || 'Minimal');

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-white text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-medium uppercase tracking-widest ml-4">Ride Preferences</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
        {/* Temperature */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#001F3F]/60">
            <Thermometer size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Cabin Temperature</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Cool', 'Neutral', 'Warm'].map((t) => (
              <button
                key={t}
                onClick={() => setTemp(t as any)}
                className={`py-4 rounded-xl text-sm font-medium transition-all ${
                  temp === t 
                    ? 'bg-[#001F3F] text-white shadow-lg' 
                    : 'bg-gray-50 text-[#001F3F]/60 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Music */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#001F3F]/60">
            <Music size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">In-Car Entertainment</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Jazz', 'Classical', 'Pop', 'Silence'].map((m) => (
              <button
                key={m}
                onClick={() => setMusic(m as any)}
                className={`py-4 rounded-xl text-sm font-medium transition-all ${
                  music === m 
                    ? 'bg-[#001F3F] text-white shadow-lg' 
                    : 'bg-gray-50 text-[#001F3F]/60 hover:bg-gray-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* Conversation */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#001F3F]/60">
            <MessageSquare size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Conversation Level</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Active', 'Minimal', 'Silence'].map((c) => (
              <button
                key={c}
                onClick={() => setConv(c as any)}
                className={`py-4 rounded-xl text-sm font-medium transition-all ${
                  conv === c 
                    ? 'bg-[#001F3F] text-white shadow-lg' 
                    : 'bg-gray-50 text-[#001F3F]/60 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <p className="text-xs text-[#001F3F]/60 leading-relaxed italic">
            Your preferences will be shared with your chauffeur to ensure your journey is tailored to your exact requirements.
          </p>
        </div>
      </div>

      <div className="p-6 pb-10">
        <button 
          onClick={() => {
            onSave({ temperature: temp as any, music: music as any, conversation: conv as any });
            onBack();
          }}
          className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all shadow-xl"
        >
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [language, setLanguage] = useState('English');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const languages = ['English', 'Spanish', 'French', 'German', 'Arabic'];
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4 border-b border-black/[0.04]">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-sans text-xl font-light uppercase tracking-widest">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest px-2">General</div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
              <div className="flex justify-between items-center p-5 border-b border-black/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                    <Bell size={16} />
                  </div>
                  <span className="text-base font-medium text-[#001F3F]">Notifications</span>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${notifications ? 'bg-[#001F3F]' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    animate={{ x: notifications ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>
              <div className="flex justify-between items-center p-5 border-b border-black/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                    <MapPin size={16} />
                  </div>
                  <span className="text-base font-medium text-[#001F3F]">Location Services</span>
                </div>
                <button 
                  onClick={() => setLocation(!location)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${location ? 'bg-[#001F3F]' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    animate={{ x: location ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>
              <button 
                onClick={() => setShowLanguageMenu(true)}
                className="w-full flex justify-between items-center p-5 hover:bg-black/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                    <MessageSquare size={16} />
                  </div>
                  <span className="text-base font-medium text-[#001F3F]">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#001F3F]/60">{language}</span>
                  <ChevronRight size={18} className="text-[#001F3F]/40" />
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest px-2">Support</div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
              <button className="w-full flex items-center gap-3 p-5 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                  <Info size={16} />
                </div>
                <span className="text-base font-medium text-[#001F3F]">Help Center</span>
              </button>
              <button className="w-full flex items-center gap-3 p-5 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                  <FileText size={16} />
                </div>
                <span className="text-base font-medium text-[#001F3F]">Terms of Service</span>
              </button>
              <button className="w-full flex items-center gap-3 p-5 hover:bg-black/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-base font-medium text-[#001F3F]">Privacy Policy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#001F3F]/80 uppercase tracking-widest">URBONT Chauffeur v1.0.4</p>
        </div>
      </div>

      {/* Language Menu */}
      <AnimatePresence>
        {showLanguageMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-[#001F3F]">Select Language</h3>
                <button onClick={() => setShowLanguageMenu(false)} className="p-2 bg-black/5 rounded-full text-[#001F3F]">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button 
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLanguageMenu(false); }}
                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${language === lang ? 'bg-[#001F3F] text-white shadow-lg' : 'bg-black/5 text-[#001F3F] hover:bg-black/10'}`}
                  >
                    <span className="text-sm font-medium">{lang}</span>
                    {language === lang && <Check size={18} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MyPreferencesScreen({ onBack }: { onBack: () => void }) {
  const [selectedValues, setSelectedValues] = useState({
    door: 'Pickup Only',
    temp: 'Comfortable',
    music: 'Chillout',
    conversation: 'Quiet',
    amenities: 'Water'
  });

  const [editingPref, setEditingPref] = useState<string | null>(null);

  const options: Record<string, string[]> = {
    door: ['Pickup Only', 'Pickup & Dropoff', 'No'],
    temp: ['Comfortable', 'Cool', 'Warm', 'No Preference'],
    music: ['Chillout', 'Jazz', 'Classical', 'Radio', 'Silence'],
    conversation: ['Quiet', 'Friendly', 'No Preference'],
    amenities: ['Water', 'Newspaper', 'Both', 'None']
  };

  const preferences = [
    { id: 'door', icon: <DoorOpen size={18} />, label: 'Open the Door', value: selectedValues.door },
    { id: 'temp', icon: <Sun size={18} />, label: 'Temperature', value: selectedValues.temp },
    { id: 'music', icon: <Music size={18} />, label: 'Music', value: selectedValues.music },
    { id: 'conversation', icon: <MessageCircle size={18} />, label: 'Conversation', value: selectedValues.conversation },
    { id: 'amenities', icon: <Briefcase size={18} />, label: 'Amenities', value: selectedValues.amenities },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col relative overflow-hidden"
    >
      <div className="flex items-center p-6">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 px-6 space-y-8 overflow-y-auto pb-12">
        <div className="text-center space-y-3 mt-4">
          <h2 className="font-sans text-3xl font-light text-[#001F3F]">My Preferences</h2>
          <p className="text-sm font-normal leading-relaxed text-[#001F3F]/80 px-4">
            Save your preferences and we will apply these choices to every journey for your comfort
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
          {preferences.map((pref, index) => (
            <button 
              key={pref.id}
              onClick={() => setEditingPref(pref.id)}
              className={`w-full flex items-center justify-between p-5 hover:bg-black/[0.02] transition-colors ${
                index !== preferences.length - 1 ? 'border-b border-black/[0.04]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  {pref.icon}
                </div>
                <span className="text-base font-medium text-[#001F3F]">{pref.label}</span>
              </div>
              <div className="flex items-center gap-3 text-[#001F3F]/50">
                <span className="text-sm font-normal">{pref.value}</span>
                <ChevronRight size={16} className="opacity-40" />
              </div>
            </button>
          ))}
        </div>

        <div className="pt-6 flex items-center justify-center gap-2 text-[#001F3F]/80">
          <Info size={14} />
          <p className="text-[11px] font-light">Changes will be applied to your next journeys</p>
        </div>
      </div>

      {/* Selection Overlay */}
      <AnimatePresence>
        {editingPref && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPref(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-[#FFFFFF] z-50 p-6 pt-8 rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-white/50"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="font-sans text-2xl font-light text-[#001F3F]">
                    {preferences.find(p => p.id === editingPref)?.label}
                  </h3>
                  <button onClick={() => setEditingPref(null)} className="p-2 bg-black/5 rounded-full text-[#001F3F] hover:bg-black/10 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {options[editingPref].map((option) => {
                    const isSelected = selectedValues[editingPref as keyof typeof selectedValues] === option;
                    
                    // Icon mapping for options
                    const getOptionIcon = (opt: string) => {
                      switch(opt) {
                        case 'Water': return <Droplets size={18} />;
                        case 'Newspaper': return <FileText size={18} />;
                        case 'Both': return <Plus size={18} />;
                        case 'None': return <X size={18} />;
                        case 'Chillout': return <Music size={18} />;
                        case 'Jazz': return <Music size={18} />;
                        case 'Classical': return <Music size={18} />;
                        case 'Radio': return <Music size={18} />;
                        case 'Silence': return <BellOff size={18} />;
                        case 'Quiet': return <MessageSquare size={18} />;
                        case 'Friendly': return <MessageSquare size={18} />;
                        case 'No Preference': return <Check size={18} />;
                        case 'Comfortable': return <Sun size={18} />;
                        case 'Cool': return <Thermometer size={18} />;
                        case 'Warm': return <Thermometer size={18} />;
                        case 'Pickup Only': return <DoorOpen size={18} />;
                        case 'Pickup & Dropoff': return <DoorOpen size={18} />;
                        case 'No': return <X size={18} />;
                        default: return null;
                      }
                    };

                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedValues(prev => ({ ...prev, [editingPref]: option }));
                          setTimeout(() => setEditingPref(null), 200); // Small delay for visual feedback
                        }}
                        className={`w-full py-4 px-6 text-left text-base font-medium rounded-2xl transition-all duration-300 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#001F3F]/10 text-[#001F3F] border border-[#001F3F]/30 shadow-sm'
                            : 'bg-white text-[#001F3F] border border-transparent hover:border-[#001F3F]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-[#001F3F]/60">
                            {getOptionIcon(option)}
                          </div>
                          {option}
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 size={20} className="text-[#001F3F]" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CustomerServiceScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'main' | 'chat' | 'faq'>('main');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'agent', text: string}[]>([{sender: 'agent', text: 'Hello! How can I assist you today?'}]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I book a ride?", a: "You can book a ride directly from the home screen by entering your pickup and drop-off locations." },
    { q: "What is the cancellation policy?", a: "Cancellations made less than 2 hours before pickup incur a 100% fee. Airport transfers have a 60-minute grace period." },
    { q: "Can I book for someone else?", a: "Yes, use the 'Gift a Ride' feature in the menu to book a journey for a guest." },
    { q: "What payment methods are accepted?", a: "We accept all major credit cards, Apple Pay, and Google Pay." },
    { q: "Are pets allowed?", a: "Small pets in carriers are allowed in SUV class vehicles. Please notify us in advance." },
  ];

  const sendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, {sender: 'user', text: message}]);
      setMessage('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, {sender: 'agent', text: 'Thank you for reaching out. An agent will be with you shortly.'}]);
      }, 1000);
    }
  };

  const handleBack = () => {
    if (view !== 'main') {
      setView('main');
    } else {
      onBack();
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-black/[0.04]">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-sans text-xl font-light uppercase tracking-widest">
            {view === 'main' ? 'Help Center' : view === 'chat' ? 'Live Chat' : 'FAQ'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F5F7FA]">
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-8"
            >
              <div className="text-center space-y-4 mt-4">
                <div className="w-20 h-20 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#001F3F]/20 text-white">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-2xl font-light text-[#001F3F]">How can we help?</h3>
                <p className="text-sm text-[#001F3F]/60 leading-relaxed max-w-xs mx-auto">
                  Our concierge team is available 24/7 to assist you with any inquiries.
                </p>
              </div>

              <div className="space-y-4">
                <button onClick={() => setView('chat')} className="w-full bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                      <MessageSquare size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-medium text-[#001F3F]">Start Live Chat</h4>
                      <p className="text-xs text-[#001F3F]/50 mt-1">Wait time: &lt; 2 min</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
                </button>
                
                <button onClick={() => setView('chat')} className="w-full bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                      <Phone size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-medium text-[#001F3F]">Call Concierge</h4>
                      <p className="text-xs text-[#001F3F]/50 mt-1">Available 24/7</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
                </button>
                
                <button onClick={() => setView('faq')} className="w-full bg-white p-6 rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#001F3F]/5 flex items-center justify-center text-[#001F3F]">
                      <Info size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-medium text-[#001F3F]">Questions & Answers</h4>
                      <p className="text-xs text-[#001F3F]/50 mt-1">Common topics</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' ? 'bg-[#001F3F] text-white rounded-tr-sm' : 'bg-white text-[#001F3F] border border-black/[0.04] shadow-sm rounded-tl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-black/[0.04]">
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-4 bg-[#F5F7FA] rounded-full text-[#001F3F] outline-none text-sm focus:bg-[#001F3F]/5 transition-colors"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="w-12 h-12 rounded-full bg-[#001F3F] text-white flex items-center justify-center disabled:opacity-50 transition-opacity shadow-lg shadow-[#001F3F]/20"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'faq' && (
            <motion.div 
              key="faq"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-4"
            >
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-medium text-[#001F3F]">{faq.q}</span>
                    <ChevronRight size={16} className={`text-[#001F3F]/40 transition-transform duration-300 ${expandedFaq === idx ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0 text-sm text-[#001F3F]/70 leading-relaxed font-light border-t border-black/[0.04] mt-2 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CountrySelectorScreen({ onBack, onSelect }: { onBack: () => void, onSelect: (code: string) => void }) {
  const [search, setSearch] = useState('');
  
  const filteredCommon = COMMON_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );
  
  const filteredAll = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-white text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4 border-b border-[#001F3F]/5">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <input 
          type="text" 
          placeholder="Search country" 
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-lg placeholder:text-[#001F3F]/20 text-[#001F3F]"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCommon.length > 0 && (
          <div className="mb-8">
            <div className="px-8 py-4 text-[10px] text-[#001F3F]/40 uppercase tracking-[0.2em] bg-[#F5F7FA] font-bold">
              Common Countries
            </div>
            <div className="flex flex-col">
              {filteredCommon.map((country) => (
                <button 
                  key={country.name}
                  onClick={() => onSelect(country.code)}
                  className="flex items-center justify-between w-full py-5 px-8 border-b border-[#001F3F]/5 hover:bg-[#001F3F]/[0.02] transition-colors"
                >
                  <span className="text-base font-medium">{country.name}</span>
                  <span className="text-base font-medium text-[#001F3F]/40">{country.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="px-8 py-4 text-[10px] text-[#001F3F]/40 uppercase tracking-[0.2em] bg-[#F5F7FA] font-bold">
            All Countries
          </div>
          <div className="flex flex-col">
            {filteredAll.map((country) => (
              <button 
                key={country.name}
                onClick={() => onSelect(country.code)}
                className="flex items-center justify-between w-full py-5 px-8 border-b border-[#001F3F]/5 hover:bg-[#001F3F]/[0.02] transition-colors"
              >
                <span className="text-base font-medium">{country.name}</span>
                <span className="text-base font-medium text-[#001F3F]/40">{country.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ServicesScreen({ onBack }: { onBack: () => void }) {
  const services = [
    { title: 'Private Aviation & Airport Concierge', description: 'Seamless tarmac transfers and luxury airport coordination.', icon: <Plane size={24} /> },
    { title: 'Executive Hourly Charter', description: 'On-demand chauffeur service for flexible business schedules.', icon: <Clock size={24} /> },
    { title: 'Intercity Business Travel', description: 'First-class comfort for long-distance corporate journeys.', icon: <Navigation size={24} /> },
    { title: 'Gala & Special Events', description: 'Red carpet arrivals and coordinated event transportation.', icon: <Star size={24} /> },
    { title: 'Luxury Hotel Partnerships', description: 'Exclusive transport solutions for five-star hospitality guests.', icon: <Building2 size={24} /> },
    { title: 'Diplomatic & Public Figure Services', description: 'Discreet, secure, and professional transport for high-profile individuals.', icon: <ShieldCheck size={24} /> },
    { title: 'Residential & Estate Management', description: 'Dedicated chauffeur services for private residences and estates.', icon: <Home size={24} /> },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-8">
        <div className="text-center space-y-3 mt-2 mb-8">
          <h2 className="font-sans text-3xl font-light text-[#001F3F]">Signature Services</h2>
          <p className="text-sm font-normal leading-relaxed text-[#001F3F]/80 px-4">
            Discover the URBONT standard of travel
          </p>
        </div>

        <div className="space-y-4">
          {services.map((service, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.02] space-y-4 group cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F] group-hover:bg-[#001F3F] group-hover:text-white transition-colors duration-300">
                  {service.icon}
                </div>
                <ChevronRight size={18} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sans text-xl font-medium text-[#001F3F]">{service.title}</h3>
                <p className="text-sm font-normal text-[#001F3F]/80 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EditProfileScreen({ userProfile, onBack, onSave }: { userProfile: UserProfile, onBack: () => void, onSave: (updated: Partial<UserProfile>) => void }) {
  const [title, setTitle] = useState<any>(userProfile.title || '');
  const [firstName, setFirstName] = useState(userProfile.firstName);
  const [lastName, setLastName] = useState(userProfile.lastName);
  const [email, setEmail] = useState(userProfile.email);
  const [companyName, setCompanyName] = useState(userProfile.companyName || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col relative">
      <div className="flex items-center justify-between p-6 border-b border-black/[0.04]">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <button onClick={() => onSave({ title, firstName, lastName, email, companyName })} className="text-base font-medium">Save</button>
      </div>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-xs text-[#001F3F]/70 uppercase tracking-widest font-medium">Title</label>
          <div className="flex gap-3">
            {['Mr.', 'Ms.', 'Mrs.', 'Dr.'].map((t) => (
              <button
                key={t}
                onClick={() => setTitle(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  title === t 
                    ? 'bg-[#001F3F] text-white border-[#001F3F]' 
                    : 'bg-transparent text-[#001F3F] border-black/[0.1] hover:border-[#001F3F]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#001F3F]/70 uppercase tracking-widest font-medium">First Name</label>
          <input 
            type="text" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full py-2 border-b border-black/[0.04] outline-none text-lg font-light focus:border-[#001F3F] bg-transparent text-[#001F3F] placeholder:text-[#001F3F]/50 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#001F3F]/70 uppercase tracking-widest font-medium">Last Name</label>
          <input 
            type="text" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full py-2 border-b border-black/[0.04] outline-none text-lg font-light focus:border-[#001F3F] bg-transparent text-[#001F3F] placeholder:text-[#001F3F]/50 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#001F3F]/70 uppercase tracking-widest font-medium">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-2 border-b border-black/[0.04] outline-none text-lg font-light focus:border-[#001F3F] bg-transparent text-[#001F3F] placeholder:text-[#001F3F]/50 transition-colors"
          />
        </div>

        {userProfile.accountType === 'business' && (
          <div className="space-y-2 pt-4 border-t border-black/[0.04]">
            <label className="text-xs text-[#001F3F]/70 uppercase tracking-widest font-medium flex items-center gap-2">
              <Briefcase size={12} />
              Company Name
            </label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="w-full py-2 border-b border-black/[0.04] outline-none text-lg font-light focus:border-[#001F3F] bg-transparent text-[#001F3F] placeholder:text-[#001F3F]/50 transition-colors"
            />
          </div>
        )}

        <div className="pt-12">
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-14 bg-transparent border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10"
            >
              <h3 className="text-xl font-medium text-[#001F3F] mb-2">Delete Account?</h3>
              <p className="text-sm text-[#001F3F]/70 mb-6 leading-relaxed">
                Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-12 bg-[#001F3F]/5 text-[#001F3F] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#001F3F]/10 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // In a real app, this would trigger account deletion
                    setShowDeleteConfirm(false);
                    onBack(); // Or navigate to welcome
                  }}
                  className="flex-1 h-12 bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddressEditScreen({ type, onBack, onSave }: { type: 'home' | 'work' | 'other', onBack: () => void, onSave: (addr: string) => void }) {
  const [address, setAddress] = useState('');

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-black/[0.04]">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={() => onSave(address)} 
          disabled={!address.trim()}
          className="text-base font-medium disabled:opacity-30"
        >
          Save
        </button>
      </div>

      <div className="p-8 space-y-6">
        <h2 className="font-sans text-2xl font-light uppercase tracking-widest">
          {type === 'home' ? 'Add Home Address' : type === 'work' ? 'Add Work Address' : 'Add New Address'}
        </h2>
        
        <div className="space-y-2">
          <label className="text-xs text-[#001F3F]/70 uppercase tracking-widest font-medium">Address</label>
          <input 
            type="text" 
            autoFocus
            placeholder="Search for address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full py-2 border-b border-black/[0.04] outline-none text-lg font-light focus:border-[#001F3F] bg-transparent text-[#001F3F] placeholder:text-[#001F3F]/50 transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
}

function LegalScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col">
      <div className="flex items-center p-6 gap-4 border-b border-black/[0.04]">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-sans text-xl font-light uppercase tracking-widest">Terms & Privacy</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        <section className="space-y-4">
          <h3 className="text-lg font-medium uppercase tracking-widest border-b border-black/5 pb-2">Terms of Service</h3>
          <div className="space-y-4 text-sm text-[#001F3F]/80 leading-relaxed font-light">
            <p>
              Welcome to URBONT. By accessing or using our application, you agree to be bound by these Terms of Service.
            </p>
            <p>
              <strong>1. Service Description:</strong> URBONT provides a premium chauffeur service platform. We act as an intermediary between you and professional chauffeurs.
            </p>
            <p>
              <strong>2. Bookings & Cancellations:</strong> All bookings are subject to availability. Cancellations made less than 2 hours before the scheduled pickup time will incur a 100% cancellation fee. For airport transfers, a 60-minute grace period is included.
            </p>
            <p>
              <strong>3. User Conduct:</strong> You agree to treat chauffeurs with respect. Any damage to the vehicle caused by the passenger will be charged to the user's account.
            </p>
            <p>
              <strong>4. Payments:</strong> All payments are processed securely. Fares are calculated based on distance, time, and vehicle class.
            </p>
          </div>
        </section>
        
        <section className="space-y-4">
          <h3 className="text-lg font-medium uppercase tracking-widest border-b border-black/5 pb-2">Privacy Policy</h3>
          <div className="space-y-4 text-sm text-[#001F3F]/80 leading-relaxed font-light">
            <p>
              Your privacy is our priority. This policy explains how we collect, use, and protect your personal data.
            </p>
            <p>
              <strong>1. Data Collection:</strong> We collect information you provide directly (name, email, phone) and data generated by your use of the service (location, trip history).
            </p>
            <p>
              <strong>2. Use of Information:</strong> We use your data to provide and improve our services, process payments, and communicate with you about your bookings.
            </p>
            <p>
              <strong>3. Data Sharing:</strong> We do not sell your personal data. We share information with chauffeurs only to facilitate your trips and with third-party service providers for payment processing.
            </p>
            <p>
              <strong>4. Security:</strong> We implement industry-standard security measures to protect your data from unauthorized access.
            </p>
          </div>
        </section>

        <div className="pt-8 text-center">
          <p className="text-[10px] text-[#001F3F]/40 uppercase tracking-widest">Last Updated: March 2026</p>
        </div>
      </div>
    </motion.div>
  );
}

function MembershipScreen({ userProfile, onBack }: { userProfile: UserProfile, onBack: () => void }) {
  const loyalty = userProfile.loyalty || { level: 'Silver', points: 0, nextLevelPoints: 1000, ridesThisMonth: 0 };
  const progress = (loyalty.points / loyalty.nextLevelPoints) * 100;

  const privileges = [
    { 
      name: 'PRESIDENTIAL', 
      description: 'The ultimate in American executive travel. Featuring the Lincoln Continental and Cadillac CT6 for a smooth, authoritative arrival.' 
    },
    { 
      name: 'FLAGSHIP SUV', 
      description: 'Command presence with the Cadillac Escalade ESV and Lincoln Navigator. Unmatched luxury, space, and American craftsmanship.' 
    },
    { 
      name: 'EXECUTIVE SUV', 
      description: 'Versatility meets comfort. The Chevrolet Suburban, Tahoe, and GMC Yukon Denali offer superior capacity for your entourage and luggage.' 
    },
    { 
      name: 'LIFESTYLE', 
      description: 'Reclaim your time. Our trusted team handles errands, exclusive purchases, and reservations on your behalf.' 
    },
    { 
      name: 'CHARTER', 
      description: 'Complete freedom. A dedicated chauffeur and vehicle at your disposal for as long as you need, at a flat hourly rate.' 
    }
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="h-full w-full bg-white text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F]">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
        <div className="text-center space-y-4 mt-8 mb-16 px-6">
          <h2 className="text-4xl font-light text-[#001F3F] uppercase tracking-[0.4em] mb-2">CLUB URBONT</h2>
          <h3 className="text-xl font-light text-[#001F3F] uppercase tracking-[0.3em] opacity-60">{loyalty.level} STATUS</h3>
          <p className="text-base font-light text-[#001F3F] leading-relaxed">
            {loyalty.level === 'Diamond' 
              ? 'You have reached the pinnacle of Urbont membership. Enjoy unparalleled access and bespoke service.'
              : `You are ${loyalty.nextLevelPoints - loyalty.points} points away from the next tier of exclusive benefits.`}
          </p>
          
          {/* Progress Tracker */}
          <div className="mt-12 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/40 font-bold">Points Tracker</span>
              <span className="text-sm font-medium text-[#001F3F]">{loyalty.points} / {loyalty.nextLevelPoints} PTS</span>
            </div>
            <div className="h-1.5 w-full bg-[#001F3F]/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#001F3F] rounded-full"
              />
            </div>
            <p className="text-[10px] text-[#001F3F]/60 font-medium italic">{loyalty.ridesThisMonth} journeys taken this month</p>
          </div>
        </div>

        <div className="space-y-12">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F] font-medium border-t border-black/[0.03] pt-10">Club Privileges</h4>
          
          <div className="space-y-10">
            {privileges.map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#001F3F] rounded-sm flex items-center justify-center">
                      <div className="w-1.5 h-2 border-l border-b border-white rotate-[-45deg] mt-[-1px]" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium uppercase tracking-widest text-[#001F3F]">{item.name}</h5>
                  <p className="text-sm text-[#001F3F]/80 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/[0.03]">
          <button className="w-full flex items-center justify-between group">
            <span className="text-sm font-medium text-[#001F3F]">Membership Details</span>
            <ChevronRight size={18} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
          </button>
        </div>
      </div>

      <div className="p-6 pb-10">
        <button className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all">
          Become a Member
        </button>
    
   </div>
    </motion.div>
  );
}