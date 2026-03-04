import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import {
  Train, MessageCircle, Crown, Zap, Bell, ArrowRight, Gift, Percent,
  CheckCheck, BellOff, Share2, Smartphone, Check, FileText, Mail,
  AlertTriangle, Search, ArrowLeft, ShieldCheck, MapPin, Star, Phone,
  X, CheckCircle2, User, CreditCard, Clock, Settings, LogOut, Heart,
  HelpCircle, Shield, ChevronRight, Menu, Map as MapIcon, Calendar,
  Info, Layers, Compass, Loader2, Briefcase, Camera, Plus, Music,
  Sun, DoorOpen, Plane, History, Navigation, Users
} from 'lucide-react';

// --- Animated Premium Icon Component ---
const AnimatedIcon = ({ icon: Icon, size = 20, color = 'currentColor', animation = 'pulse' as 'pulse' | 'spin' | 'float' | 'ping' }) => {
  const animations = {
    pulse: { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] },
    spin: { rotate: 360 },
    float: { y: [0, -3, 0] },
    ping: { scale: [1, 1.1], opacity: [1, 0] }
  };

  return (
    <motion.div
      animate={animations[animation]}
      transition={{
        duration: animation === 'spin' ? 2 : 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon size={size} color={color} />
    </motion.div>
  );
};
import { Screen, VEHICLES, CHAUFFEUR, Vehicle, UserProfile, Chauffeur } from './types';
import { COUNTRIES, COMMON_COUNTRIES } from './constants';
import DriverDashboardMobile from './components/DriverDashboardMobile';
import ChatRoom from './components/ChatRoom';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+58');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Angel',
    lastName: 'Boyer',
    phone: '+58 424-5661220',
    email: 'angelelisx@gmail.com',
    accountType: 'personal',
    otherAddresses: []
  });

  const [editingAddressType, setEditingAddressType] = useState<'home' | 'work' | 'other' | null>(null);
  const [returnToMenu, setReturnToMenu] = useState(false);

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
                      className="h-10 object-contain brightness-0"
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
                    <span className="font-sans text-4xl leading-none font-light uppercase tracking-tight text-left text-[#001F3F] group-hover:text-[#001F3F]/80 transition-colors">ACCESS</span>
                  </button>
                  <button onClick={() => navigate('customer-service', true)} className="group flex flex-col items-start">
                    <span className="font-sans text-4xl leading-none font-light uppercase tracking-tight text-left text-[#001F3F] group-hover:text-[#001F3F]/80 transition-colors">HELP CENTER</span>
                  </button>
                </div>

                {/* Secondary Navigation (Profile, etc.) */}
                <div className="border-t border-[#001F3F]/20 pt-2 shrink-0">
                  <button onClick={() => navigate('profile', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">MY INFO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm font-normal text-[#001F3F]/80">Angel Boyer</span>
                      <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/80" />
                    </div>
                  </button>
                  <button onClick={() => navigate('preferences', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">MY PREFERENCES</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/80" />
                  </button>
                  <button onClick={() => navigate('ride-history', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">MY JOURNEY HISTORY</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/80" />
                  </button>
                  <button onClick={() => navigate('payment-methods', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">PAYMENT</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/80" />
                  </button>
                  <button onClick={() => navigate('gift-ride', true)} className="flex justify-between items-center w-full py-4 border-b border-[#001F3F]/10 group hover:bg-[#001F3F]/5 transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <Gift size={18} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
                      <span className="font-sans text-sm font-medium uppercase tracking-wider text-[#001F3F]">GIFT A RIDE</span>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-[#001F3F]/80" />
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
            key="welcome"
            onStart={() => navigate('auth-phone')}
            onChauffeurStart={() => navigate('chauffeur-login')}
          />
        )}
        {currentScreen === 'chauffeur-login' && (
          <ChauffeurLoginScreen
            key="chauffeur-login"
            onBack={() => navigate('welcome')}
            onLogin={() => navigate('chauffeur-dashboard')}
            onRegister={() => navigate('chauffeur-registration')}
          />
        )}
        {currentScreen === 'chauffeur-registration' && (
          <ChauffeurRegistrationScreen
            key="chauffeur-registration"
            onBack={() => navigate('chauffeur-login')}
            onComplete={() => navigate('chauffeur-login')}
          />
        )}
        {currentScreen === 'chauffeur-dashboard' && (
          <DriverDashboardMobile
            key="chauffeur-dashboard"
            onLogout={() => navigate('welcome')}
          />
        )}
        {currentScreen === 'auth-phone' && (
          <PhoneAuthScreen
            key="auth-phone"
            countryCode={countryCode}
            onBack={() => navigate('welcome')}
            onSelectCountry={() => navigate('country-selector')}
            onContinue={(num) => {
              setPhoneNumber(num);
              navigate('auth-otp');
            }}
          />
        )}
        {currentScreen === 'country-selector' && (
          <CountrySelectorScreen
            key="country-selector"
            onBack={() => navigate('auth-phone')}
            onSelect={(code) => {
              setCountryCode(code);
              navigate('auth-phone');
            }}
          />
        )}
        {currentScreen === 'auth-otp' && (
          <OtpScreen
            key="auth-otp"
            phoneNumber={phoneNumber}
            onBack={() => navigate('auth-phone')}
            onVerify={() => navigate('booking')}
          />
        )}
        {currentScreen === 'booking' && (
          <BookingScreen
            key="booking"
            onOpenMenu={() => setIsMenuOpen(true)}
            onSelectVehicle={() => navigate('vehicle-selection')}
            onNotifications={() => navigate('notifications')}
            onPaymentMethods={() => navigate('payment-methods')}
          />
        )}
        {currentScreen === 'notifications' && (
          <NotificationsScreen
            key="notifications"
            onBack={() => navigate('booking')}
          />
        )}
        {currentScreen === 'vehicle-selection' && (
          <VehicleSelectionScreen
            key="vehicle"
            onBack={() => navigate('booking')}
            onConfirm={(v) => {
              setSelectedVehicle(v);
              navigate('payment-confirmation');
            }}
          />
        )}
        {currentScreen === 'payment-confirmation' && (
          <PaymentConfirmationScreen
            key="payment-confirmation"
            vehicle={selectedVehicle || VEHICLES[1]}
            onBack={() => navigate('vehicle-selection')}
            onConfirm={() => navigate('searching')}
          />
        )}
        {currentScreen === 'searching' && (
          <SearchingScreen
            key="searching"
            onFound={() => navigate('chauffeur-profile')}
          />
        )}
        {currentScreen === 'chauffeur-profile' && (
          <ChauffeurProfileScreen
            key="profile"
            onBack={() => navigate('vehicle-selection')}
            onConfirm={() => navigate('confirmed')}
          />
        )}
        {currentScreen === 'confirmed' && (
          <ConfirmedScreen
            key="confirmed"
            onContinue={() => navigate('tracking')}
          />
        )}
        {currentScreen === 'tracking' && (
          <TrackingScreen
            key="tracking"
            vehicle={selectedVehicle || VEHICLES[1]}
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
            onUpdateProfile={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
          />
        )}
        {currentScreen === 'edit-profile' && (
          <EditProfileScreen
            key="edit-profile-screen"
            userProfile={userProfile}
            onBack={() => navigate('profile', true)}
            onSave={(updated) => handleUpdateProfile(updated)}
          />
        )}
        {currentScreen === 'address-edit' && (
          <AddressEditScreen
            key="address-edit-screen"
            type={editingAddressType || 'other'}
            onBack={() => navigate('profile', true)}
            onSave={(addr) => handleUpdateAddress(addr)}
          />
        )}
        {currentScreen === 'legal' && (
          <LegalScreen
            key="legal-screen"
            onBack={() => navigate('profile', true)}
          />
        )}
        {currentScreen === 'preferences' && (
          <MyPreferencesScreen
            key="preferences-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'customer-service' && (
          <CustomerServiceScreen
            key="customer-service-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'services' && (
          <ServicesScreen
            key="services-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'membership' && (
          <MembershipScreen
            key="membership-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'ride-history' && (
          <RideHistoryScreen
            key="history-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'payment-methods' && (
          <PaymentMethodsScreen
            key="payment-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'gift-ride' && (
          <GiftRideScreen
            key="gift-ride-screen"
            onBack={handleBack}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            key="settings-screen"
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WelcomeScreen({ onStart, onChauffeurStart, key }: { onStart: () => void, onChauffeurStart: () => void, key?: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "Excellence in Motion",
    "Your Private Journey",
    "Unmatched Comfort",
    "Professional Chauffeurs"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative h-full w-full flex flex-col justify-between p-6 overflow-hidden navy-gradient-bg"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />

      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center flex-1 space-y-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <img
            src="https://lh3.googleusercontent.com/d/1eQeW4NAEtlRUwxyDpObf5acpd1ZNCB1_"
            alt="URBONT Logo"
            className="h-32 object-contain drop-shadow-2xl brightness-0 invert mb-8"
            referrerPolicy="no-referrer"
          />

          <div className="h-8 overflow-hidden relative w-full flex justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSlide}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white/95 text-[11px] uppercase tracking-[0.2em] font-medium absolute text-center w-full px-4"
              >
                {slides[currentSlide]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-20 w-full space-y-4 mb-8"
      >
        <button
          onClick={onStart}
          className="w-full py-5 bg-white text-[#001F3F] font-bold uppercase tracking-[0.1em] hover:bg-white/90 transition-all rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.98] text-[13px]"
        >
          Get Started
        </button>

        <button
          onClick={onChauffeurStart}
          className="w-full py-4 text-white/90 font-semibold uppercase tracking-[0.1em] text-[11px] hover:text-white transition-all flex items-center justify-center gap-2"
        >
          Chauffeur Login <ArrowRight size={12} strokeWidth={1.5} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function ChauffeurLoginScreen({ onBack, onLogin, onRegister }: { onBack: () => void, onLogin: () => void, onRegister: () => void, key?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col p-6 pt-16 navy-gradient-bg text-white relative"
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
            <label className="font-sans text-[11px] text-white/70 uppercase tracking-[0.2em] font-bold">Email ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 bg-transparent border-b border-white/10 outline-none text-white focus:border-white transition-colors text-lg font-light"
              placeholder="Enter your ID"
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-[11px] text-white/70 uppercase tracking-[0.2em] font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 bg-transparent border-b border-white/10 outline-none text-white focus:border-white transition-colors text-lg font-light"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button className="mt-8 font-sans text-xs text-white/60 uppercase tracking-widest hover:text-white transition-colors font-medium">
          Forgot Password?
        </button>
      </div>

      <button
        disabled={!email || !password}
        onClick={onLogin}
        className="w-full py-5 bg-white text-[#001F3F] font-medium uppercase tracking-[0.2em] disabled:opacity-20 hover:bg-white/90 transition-all rounded-full shadow-xl shadow-white/10 text-xs"
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

function ChauffeurRegistrationScreen({ onBack, onComplete }: { onBack: () => void, onComplete: () => void, key?: string }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '', address: '', city: '', zip: '',
    make: '', model: '', year: '', color: '', plate: '', vin: '',
    bankName: '', accountNumber: '', routingNumber: ''
  });
  const [documents, setDocuments] = useState<Record<string, string | null>>({});

  const REQUIRED_DOCS = [
    { id: 'license', label: 'Chauffeur License' },
    { id: 'limoPermit', label: 'Miami Dade County Limo Permit' },
    { id: 'airportPermit', label: 'Miami Airport Permit' },
    { id: 'inspection', label: 'Miami Dade Inspection' },
    { id: 'insurance', label: 'Commercial Insurance' },
    { id: 'registration', label: 'Vehicle Registration' },
    { id: 'photo', label: 'Professional Photo', isPhoto: true }
  ];

  const handleFileUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setDocuments(prev => ({ ...prev, [id]: url }));
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-widest text-[#001F3F]/80 font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 bg-white border border-black/10 rounded-lg text-base text-[#001F3F] placeholder:text-[#001F3F]/30 focus:outline-none focus:border-[#001F3F] transition-colors"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col bg-[#F5F7FA] text-[#001F3F] relative"
    >
      <div className="bg-[#001F3F] text-white p-6 pt-12 pb-8 rounded-b-[2rem] shadow-xl z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h2 className="font-sans text-xl font-light uppercase tracking-widest">
              {step === 1 ? 'Personal Info' :
                step === 2 ? 'Vehicle Info' :
                  step === 3 ? 'Documents' :
                    step === 4 ? 'Banking' : 'Complete'}
            </h2>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" value={formData.firstName} onChange={(v: string) => setFormData({ ...formData, firstName: v })} placeholder="John" />
              <InputField label="Last Name" value={formData.lastName} onChange={(v: string) => setFormData({ ...formData, lastName: v })} placeholder="Doe" />
            </div>
            <InputField label="Email" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} placeholder="john@example.com" type="email" />
            <InputField label="Phone" value={formData.phone} onChange={(v: string) => setFormData({ ...formData, phone: v })} placeholder="+1 (555) 000-0000" type="tel" />
            <InputField label="Date of Birth" value={formData.dob} onChange={(v: string) => setFormData({ ...formData, dob: v })} placeholder="MM/DD/YYYY" />
            <InputField label="Address" value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} placeholder="123 Main St" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="City" value={formData.city} onChange={(v: string) => setFormData({ ...formData, city: v })} placeholder="Miami" />
              <InputField label="ZIP Code" value={formData.zip} onChange={(v: string) => setFormData({ ...formData, zip: v })} placeholder="33101" />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl mt-8"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <InputField label="Vehicle Make" value={formData.make} onChange={(v: string) => setFormData({ ...formData, make: v })} placeholder="Mercedes-Benz" />
            <InputField label="Vehicle Model" value={formData.model} onChange={(v: string) => setFormData({ ...formData, model: v })} placeholder="S-Class" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Year" value={formData.year} onChange={(v: string) => setFormData({ ...formData, year: v })} placeholder="2024" />
              <InputField label="Color" value={formData.color} onChange={(v: string) => setFormData({ ...formData, color: v })} placeholder="Black" />
            </div>
            <InputField label="License Plate" value={formData.plate} onChange={(v: string) => setFormData({ ...formData, plate: v })} placeholder="ABC 123" />
            <InputField label="VIN" value={formData.vin} onChange={(v: string) => setFormData({ ...formData, vin: v })} placeholder="Vehicle Identification Number" />

            <button
              onClick={() => setStep(3)}
              className="w-full py-4 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl mt-8"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm opacity-80 mb-4">
              Please upload clear, legible copies of the following required documents.
            </p>
            {REQUIRED_DOCS.map(doc => (
              <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-black/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${documents[doc.id] ? 'bg-green-100 text-green-600' : 'bg-[#001F3F]/5 text-[#001F3F]/70'}`}>
                    {documents[doc.id] ? <CheckCircle2 size={20} /> : (doc.isPhoto ? <Camera size={20} /> : <FileText size={20} />)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.label}</p>
                    {documents[doc.id] && <p className="text-[10px] text-green-600 uppercase tracking-widest mt-1">Uploaded</p>}
                  </div>
                </div>
                <div className="relative shrink-0">
                  <input
                    type="file"
                    accept={doc.isPhoto ? "image/*" : "image/*,.pdf"}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(doc.id, e.target.files[0]);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="px-4 py-2 bg-[#001F3F]/5 text-[#001F3F] text-[10px] font-bold uppercase tracking-widest rounded-lg">
                    {documents[doc.id] ? 'Change' : 'Upload'}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setStep(4)}
              className="w-full py-4 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl mt-8"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <p className="text-sm opacity-80 mb-4">
              Enter your banking information for weekly payouts.
            </p>
            <InputField label="Bank Name" value={formData.bankName} onChange={(v: string) => setFormData({ ...formData, bankName: v })} placeholder="Chase" />
            <InputField label="Account Number" value={formData.accountNumber} onChange={(v: string) => setFormData({ ...formData, accountNumber: v })} placeholder="0000000000" />
            <InputField label="Routing Number" value={formData.routingNumber} onChange={(v: string) => setFormData({ ...formData, routingNumber: v })} placeholder="000000000" />

            <button
              onClick={onComplete}
              className="w-full py-4 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl mt-8"
            >
              Submit Application
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChauffeurDashboardScreen({ onLogout }: { onLogout: () => void, key?: string }) {
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
              <div className="flex items-center gap-1 text-[11px] text-white/90 font-bold uppercase tracking-widest mt-1">
                <Star size={10} fill="white" className="text-white" />
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
            <div className="text-[11px] text-white/90 uppercase tracking-[0.2em] font-bold mb-1">Today's Earnings</div>
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
          className={`w-full py-6 rounded-xl shadow-sm border flex items-center justify-center gap-3 transition-all ${isOnline
            ? 'bg-black\/10 border-black\/20 text-[#001F3F]'
            : 'bg-white\/10 border-white\/20 text-white'
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
            <div className="opacity-80 mb-2"><Clock size={20} /></div>
            <div className="text-2xl font-light mb-1">6.5h</div>
            <div className="text-[11px] text-[#001F3F] uppercase tracking-widest font-bold">Online Hours</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm">
            <div className="opacity-80 mb-2"><Navigation size={20} /></div>
            <div className="text-2xl font-light mb-1">12</div>
            <div className="text-[11px] text-[#001F3F] uppercase tracking-widest font-bold">Trips</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-widest opacity-80">Recent Trips</h3>

          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium">JFK Airport Transfer</div>
              <div className="text-sm font-medium text-white">$85.00</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#001F3F]/80">
              <Clock size={12} />
              <span>10:30 AM - 11:15 AM</span>
            </div>
            <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white\/10 px-2 py-1 rounded">Completed</span>
              <ChevronRight size={14} className="opacity-80" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-black/[0.04] shadow-sm space-y-3 opacity-80">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium">Downtown to Brooklyn</div>
              <div className="text-sm font-medium text-white">$45.00</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#001F3F]/80">
              <Clock size={12} />
              <span>08:45 AM - 09:15 AM</span>
            </div>
            <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest bg-white\/10 px-2 py-1 rounded">Completed</span>
              <ChevronRight size={14} className="opacity-80" />
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
                  <span className="text-xs text-[#001F3F]/80 uppercase tracking-widest">Change Photo</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] uppercase tracking-[0.2em] text-[#001F3F] font-bold">Full Name</label>
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

function PhoneAuthScreen({ onBack, onContinue, onSelectCountry, countryCode }: { onBack: () => void, onContinue: (num: string) => void, onSelectCountry: () => void, countryCode: string, key?: string }) {
  const [value, setValue] = useState('');

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || { placeholder: '000 000 0000', maxLength: 10 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col p-8 pt-24 navy-gradient-bg text-white relative"
    >
      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-medium text-center leading-tight mb-16 max-w-[280px] uppercase tracking-widest text-white">
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
      </div>

      <button
        disabled={value.length < 5}
        onClick={() => onContinue(value)}
        className="w-full py-5 bg-white text-[#001F3F] font-medium uppercase tracking-[0.2em] disabled:opacity-20 hover:bg-white/90 transition-all rounded-full shadow-xl shadow-white/10 mt-8 text-xs"
      >
        CONTINUE
      </button>
    </motion.div>
  );
}

function OtpScreen({ phoneNumber, onBack, onVerify }: { phoneNumber: string, onBack: () => void, onVerify: () => void, key?: string }) {
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
      className="h-full w-full flex flex-col p-6 pt-16 navy-gradient-bg text-white"
    >
      <button onClick={onBack} className="p-2 -ml-2 mb-8 text-white hover:bg-white/10 rounded-full transition-colors w-fit">
        <ArrowLeft size={24} />
      </button>

      <div className="space-y-12">
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">Verification</span>
          <h2 className="font-sans text-4xl font-light uppercase tracking-tight text-white">Enter Code</h2>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Sent to {phoneNumber}
          </p>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
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
            <p className="text-xs text-white/70 font-semibold uppercase tracking-widest">
              Resend code in {timer}s
            </p>
          )}
        </div>

        <button
          onClick={onVerify}
          disabled={otp.length !== 6}
          className="w-full py-5 bg-white text-[#001F3F] font-medium uppercase tracking-[0.2em] disabled:opacity-20 hover:bg-white/90 transition-all rounded-full shadow-xl shadow-white/10 text-xs"
        >
          Verify Code
        </button>
      </div>
    </motion.div>
  );
}

function AirportPickupScreen({ onBack, onFlightFound, onSkip }: { onBack: () => void, onFlightFound: (flight: string) => void, onSkip: () => void, key?: string }) {
  const [flightNumber, setFlightNumber] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 bg-white z-[200] flex flex-col"
    >
      <div className="px-6 py-4 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2">
          <X size={24} className="text-[#001F3F]" />
        </button>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center -mt-20">
        <h2 className="text-2xl font-sans font-light text-[#001F3F] mb-4">Enter Flight Number</h2>
        <p className="text-sm text-[#001F3F]/60 text-center mb-8 leading-relaxed max-w-xs">
          Your flight will be tracked automatically so the chauffeur will meet you at exactly the right time and place.
        </p>

        <div className="w-full max-w-xs relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001F3F]/40">
            <Plane size={20} className="rotate-45" />
          </div>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            placeholder="AA1234"
            className="w-full h-14 pl-12 pr-4 border border-[#001F3F]/20 rounded-none text-xl font-light text-[#001F3F] placeholder:text-[#001F3F]/20 focus:outline-none focus:border-[#001F3F] transition-colors text-center uppercase tracking-widest"
          />
          <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[1px] h-6 bg-[#001F3F]/20" />
        </div>
      </div>

      <div className="px-6 pb-8 space-y-4">
        <button
          onClick={() => onFlightFound(flightNumber)}
          disabled={!flightNumber}
          className="w-full py-4 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Find Flight
        </button>

        <button
          onClick={onSkip}
          className="w-full py-4 text-[#001F3F]/60 text-xs uppercase tracking-widest hover:text-[#001F3F] transition-colors"
        >
          Book without Flight Number
        </button>
      </div>
    </motion.div>
  );
}

function BookingScreen({ onOpenMenu, onSelectVehicle, onNotifications, onPaymentMethods }: { onOpenMenu: () => void, onSelectVehicle: () => void, onNotifications: () => void, onPaymentMethods: () => void, key?: string }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAirportPickup, setShowAirportPickup] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [scheduledTime, setScheduledTime] = useState<{ date: string, time: string } | null>(null);
  const [hourlyDuration, setHourlyDuration] = useState<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [destination, setDestination] = useState('');
  const [pickup, setPickup] = useState('Detecting location...');
  const [extraDestinations, setExtraDestinations] = useState<string[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
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

  // if (loadError) {
  //   return (
  //     <div className="h-full w-full flex flex-col items-center justify-center bg-white text-[#001F3F] p-8 text-center space-y-4">
  //       <div className="p-4 bg-red-50 rounded-full text-red-500">
  //         <MapPin size={32} />
  //       </div>
  //       <h3 className="text-xl font-medium">Map Error</h3>
  //       <p className="text-sm opacity-80 max-w-xs">{loadError.message}</p>
  //       <p className="text-xs opacity-80 max-w-xs">
  //         Please ensure your Google Maps API Key is valid and has the "Maps JavaScript API" and "Places API" enabled in the Google Cloud Console.
  //       </p>
  //     </div>
  //   );
  // }

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
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "all",
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
          <div className="w-full h-full bg-[#E5E3DF] flex items-center justify-center">
            <MapPin size={48} className="text-[#001F3F]/20" />
          </div>
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
      <div className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px] z-20 transition-all duration-500 overflow-y-auto ${destination ? 'h-[75%] sm:h-[60%]' : 'h-auto p-6 pb-10'}`}>
        {!destination ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-light text-[#001F3F]">Where to next?</h2>
              <p className="text-sm text-[#001F3F]/80 font-light">Enter your destination to see available rides</p>
            </div>

            <div className="space-y-0 border-t border-black/[0.04] pt-2">
              <div
                onClick={() => { setDestination('Heathrow Airport'); }}
                className="flex items-center gap-4 w-full py-5 border-b border-black/[0.04] cursor-pointer hover:bg-black/[0.02] rounded-xl px-2 transition-colors -mx-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  <Plane size={14} />
                </div>
                <div className="flex-1">
                  <span className="text-base font-light text-[#001F3F]/80">Airport Pickup</span>
                </div>
                <ChevronRight size={16} className="text-[#001F3F]/80 group-hover:text-[#001F3F] transition-colors" />
              </div>

              <div
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-4 w-full py-5 border-b border-black/[0.04] cursor-pointer hover:bg-black/[0.02] rounded-xl px-2 transition-colors -mx-2"
              >
                <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                  <Search size={14} />
                </div>
                <div className="flex items-center gap-1 text-base font-light text-[#001F3F]/80">
                  <span>Search</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.5 }}
                      className="text-[#001F3F]/80"
                    >
                      {places[placeholderIndex]}...
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Address Section */}
            <div className="px-6 pt-8 pb-6 border-b border-black/[0.03]">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-black flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-[#001F3F]">{pickup}</p>
                    <p className="text-xs text-[#001F3F]/80 mt-0.5">Current Location</p>
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

                <div className="flex items-start gap-4">
                  <div className="mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-[#001F3F]">{destination}</p>
                    <p className="text-xs text-[#001F3F]/80 mt-0.5">Destination Address</p>
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
            <div className="py-6 border-b border-black/[0.03]">
              <div className="px-6 flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#001F3F] font-bold">Options</span>
                <button className="text-[11px] uppercase tracking-[0.1em] text-[#001F3F] font-bold">See All</button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-6 no-scrollbar">
                <button onClick={() => setShowScheduleModal(true)} className="shrink-0 px-6 py-3 bg-[#001F3F]/5 rounded-xl text-sm font-medium text-[#001F3F] hover:bg-black/10 transition-colors">
                  Schedule a Journey
                </button>
                <button onClick={() => setShowHourlyModal(true)} className="shrink-0 px-6 py-3 bg-[#001F3F]/5 rounded-xl text-sm font-medium text-[#001F3F] hover:bg-black/10 transition-colors">
                  Hourly Booking
                </button>
                <button onClick={() => setShowCommentModal(true)} className="shrink-0 px-6 py-3 bg-[#001F3F]/5 rounded-xl text-sm font-medium text-[#001F3F] hover:bg-black/10 transition-colors">
                  Add a Comment
                </button>
              </div>
            </div>

            {/* Class & Payment Section */}
            <div className="px-6 py-6 space-y-6">
              <button
                onClick={onSelectVehicle}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold uppercase tracking-widest text-[#001F3F]">Business Class</span>
                    <ChevronRight size={14} className="text-[#001F3F]" />
                  </div>
                  <span className="text-xs text-[#001F3F]/80 mt-1">$85–$120</span>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => { e.stopPropagation(); onPaymentMethods(); }}>
                  <div className="w-10 h-10 rounded-xl border border-dashed border-black/20 flex items-center justify-center">
                    <Plus size={16} className="text-[#001F3F]/80" />
                  </div>
                  <span className="text-xs font-bold text-[#001F3F]">Add Card</span>
                </div>
              </button>

              <button
                onClick={onSelectVehicle}
                className="w-full py-5 bg-[#001F3F] text-white text-sm font-medium uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-black/10 active:scale-[0.98] transition-all"
              >
                Request a Chauffeur
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAirportPickup && (
          <AirportPickupScreen
            onBack={() => setShowAirportPickup(false)}
            onFlightFound={(flight) => {
              setShowAirportPickup(false);
              setIsSearchOpen(false);
              setPickup(`LHR • ${flight}`);
              // Reset destination if needed or keep as is
            }}
            onSkip={() => {
              setShowAirportPickup(false);
              setIsSearchOpen(false);
              setPickup('Heathrow Airport (LHR)');
            }}
          />
        )}
      </AnimatePresence>

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
                  <div className="flex-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Where To"
                      className="w-full bg-transparent outline-none text-base font-light text-[#001F3F] placeholder:text-[#001F3F]/80"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsSearchOpen(false);
                          setDestination('Selected Address');
                        }
                      }}
                    />
                  </div>
                  <button onClick={handleAddStop} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    <Plus size={20} className="text-[#001F3F]/80" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center gap-16 py-8 border-b border-black/[0.03]">
                <button
                  onClick={() => {
                    // setIsSearchOpen(false);
                    setShowAirportPickup(true);
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <Plane size={32} className="text-[#001F3F]" />
                  <span className="text-[11px] font-medium text-center text-[#001F3F]">Airport<br />Pickup</span>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setDestination('Paddington Station');
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <Train size={32} className="text-[#001F3F]" />
                  <span className="text-[11px] font-medium text-center text-[#001F3F]">Railway<br />Stations</span>
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

function NotificationsScreen({ onBack }: { onBack: () => void, key?: string }) {
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
      className="h-full w-full bg-white text-[#001F3F] flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6 z-10 bg-white">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-[#001F3F]/5 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-[#001F3F]" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#001F3F]/80 hover:text-[#001F3F] transition-colors">
              <CheckCheck size={20} />
            </button>
            <button className="p-2 text-[#001F3F]/80 hover:text-[#001F3F] transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        <h2 className="font-sans text-3xl font-light uppercase tracking-widest text-[#001F3F] mb-8">Inbox</h2>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#001F3F]/10">
          {['All', 'Offers', 'Activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-medium uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#001F3F]' : 'text-[#001F3F]/70 hover:text-[#001F3F]/80'
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
          <div className="h-full flex flex-col items-center justify-center text-[#001F3F]/70 space-y-4">
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
                className={`py-6 group flex gap-4 ${!item.read ? 'bg-[#001F3F]/[0.02] -mx-6 px-6' : ''}`}
              >
                {/* Icon Column */}
                <div className="pt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${!item.read
                    ? 'bg-[#001F3F] border-[#001F3F] text-white'
                    : 'bg-white border-[#001F3F]/20 text-[#001F3F]/80'
                    }`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 14 })}
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm uppercase tracking-wide ${!item.read ? 'font-medium text-[#001F3F]' : 'font-medium text-[#001F3F]/80'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/70 whitespace-nowrap ml-2 mt-0.5">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-sm text-[#001F3F]/80 font-light leading-relaxed max-w-[90%]">
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

function VehicleSelectionScreen({ onBack, onConfirm }: { onBack: () => void, onConfirm: (v: Vehicle) => void, key?: string }) {
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
        <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/5">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {VEHICLES.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === selectedIdx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Title & Description */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-[#001F3F]">{vehicle.name}</h3>
            <p className="text-sm text-[#001F3F]/80 font-light">{vehicle.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-[#001F3F]">
            <span>From {vehicle.price}</span>
            <span className="w-1 h-1 rounded-full bg-black/20" />
            <span className="flex items-center gap-1.5"><Users size={16} /> 4</span>
            <span className="w-1 h-1 rounded-full bg-black/20" />
            <span className="flex items-center gap-1.5"><Briefcase size={16} /> 1–3</span>
          </div>

          {/* Price Comparison */}
          {vehicle.competitorPrice && (
            <div className="bg-[#001F3F]/5 rounded-xl p-4 flex items-center justify-between border border-[#001F3F]/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/80 font-medium">Urbont</span>
                <span className="text-lg font-medium text-[#001F3F]">{vehicle.price}</span>
              </div>
              <div className="h-8 w-px bg-[#001F3F]/10" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/80 font-medium">Competitors</span>
                <span className="text-lg font-light text-[#001F3F]/80 line-through decoration-red-500/50">{vehicle.competitorPrice}</span>
              </div>
            </div>
          )}

          <p className="text-sm text-[#001F3F] font-light text-center leading-relaxed">
            An elevated, professional service for all your business needs. Finely crafted interiors and exquisite personal service.
          </p>

          {/* Details List */}
          <div className="space-y-0 border-t border-black/[0.03] pt-4">
            <div className="flex items-center justify-between py-4 border-b border-black/[0.03]">
              <span className="text-sm font-normal text-[#001F3F]">Estimated Price</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#001F3F]/80">From {vehicle.price}</span>
                <ChevronRight size={16} className="text-[#001F3F]/70" />
              </div>
            </div>

            {/* Ride Preferences Section */}
            <div className="py-6 space-y-6">
              <h4 className="text-[12px] uppercase tracking-[0.2em] text-[#001F3F] font-bold">Ride Preferences</h4>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#001F3F]/80 uppercase tracking-widest">Climate Control</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PREF_OPTIONS.climate.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPreferences({ ...preferences, climate: opt })}
                        className={`px-4 py-2 rounded-full text-xs transition-all border ${preferences.climate === opt ? 'bg-[#001F3F] text-white border-[#001F3F]' : 'bg-white text-[#001F3F]/80 border-[#001F3F]/10 hover:border-[#001F3F]/30'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#001F3F]/80 uppercase tracking-widest">Music Genre</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PREF_OPTIONS.music.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPreferences({ ...preferences, music: opt })}
                        className={`px-4 py-2 rounded-full text-xs transition-all border ${preferences.music === opt ? 'bg-[#001F3F] text-white border-[#001F3F]' : 'bg-white text-[#001F3F]/80 border-[#001F3F]/10 hover:border-[#001F3F]/30'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#001F3F]/80 uppercase tracking-widest">Conversation</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PREF_OPTIONS.conversation.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPreferences({ ...preferences, conversation: opt })}
                        className={`px-4 py-2 rounded-full text-xs transition-all border ${preferences.conversation === opt ? 'bg-[#001F3F] text-white border-[#001F3F]' : 'bg-white text-[#001F3F]/80 border-[#001F3F]/10 hover:border-[#001F3F]/30'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-black/[0.03]">
              <span className="text-sm font-normal text-[#001F3F]">Passengers</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#001F3F]/80">Up to 4 people</span>
                <ChevronRight size={16} className="text-[#001F3F]/70" />
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-black/[0.03]">
              <span className="text-sm font-normal text-[#001F3F]">Luggage Capacity</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#001F3F]/80">1–3 suitcases</span>
                <ChevronRight size={16} className="text-[#001F3F]/70" />
              </div>
            </div>
            <div className="flex items-start justify-between py-4">
              <span className="text-sm font-normal text-[#001F3F] shrink-0">Amenities</span>
              <span className="text-sm text-[#001F3F]/80 text-right max-w-[200px]">
                Water, phone charger, tissues, sanitising wipes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Selector */}
      <div className="shrink-0 bg-white border-t border-black/[0.03] pb-10">
        <div className="flex gap-8 overflow-x-auto px-6 py-6 no-scrollbar justify-center">
          {VEHICLES.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelectedIdx(i)}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <span className={`text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${i === selectedIdx ? 'text-[#001F3F]' : 'text-[#001F3F]/60'}`}>
                {v.id.toUpperCase()}
              </span>
              {i === selectedIdx && (
                <div className="w-1 h-1 rounded-full bg-[#001F3F]" />
              )}
              {v.id === 'suv' || v.id === 'concierge' ? (
                <span className="text-[10px] text-[#001F3F] font-bold">Members Only</span>
              ) : (
                <span className="text-[10px] text-[#001F3F] font-bold">3 min</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-6 space-y-4">
          <button className="w-full flex items-center justify-between p-4 rounded-xl border border-black/[0.04] bg-white hover:bg-black/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-[#001F3F]" />
              <span className="text-sm font-medium text-[#001F3F]">Personal • Visa 4242</span>
            </div>
            <ChevronRight size={16} className="text-[#001F3F]/70" />
          </button>

          <button
            onClick={() => onConfirm(vehicle)}
            className="w-full py-5 bg-[#001F3F] text-white rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] transition-all"
          >
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Select {vehicle.id.toUpperCase()}</span>
            <span className="text-[11px] text-white/90 font-bold uppercase tracking-widest">3 min away</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PaymentConfirmationScreen({ vehicle, onBack, onConfirm }: { vehicle: Vehicle, onBack: () => void, onConfirm: () => void, key?: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const priceNum = parseInt(vehicle.price.replace(/\D/g, '')) || 0;
  const taxesFees = 5.00;
  const total = priceNum + taxesFees;

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate Stripe Payment Intent creation
    setTimeout(() => {
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(false);
        onConfirm();
      }, 800);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '32px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <button onClick={onBack} style={{ padding: 8, marginLeft: -8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: '#1A1A1A' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#1A1A1A', margin: 0 }}>Confirm Payment</h2>
      </div>

      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Vehicle Summary Card */}
        <div style={{ background: '#FAFAFA', borderRadius: 16, padding: 20, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ width: 72, height: 48, borderRadius: 8, overflow: 'hidden', background: '#F0F0F0', flexShrink: 0 }}>
              <img src={vehicle.image} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0, lineHeight: 1.5 }}>{vehicle.name}</h3>
              <p style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.6, margin: 0, lineHeight: 1.5 }}>One-way trip</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, color: '#1A1A1A', opacity: 0.7, lineHeight: 1.5 }}>Base Fare</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.5 }}>{vehicle.price}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, color: '#1A1A1A', opacity: 0.7, lineHeight: 1.5 }}>Taxes & Fees</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.5 }}>${taxesFees.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.5 }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#0A2540', lineHeight: 1.5 }}>${total.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#1A1A1A', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>Payment Method</h3>

          {/* Selected Card */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 16, borderRadius: 12, border: '2px solid #0A2540', background: 'rgba(10,37,64,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 30, background: '#0A2540', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em'
              }}>
                VISA
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.5 }}>•••• 4242</div>
                <div style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.5, lineHeight: 1.5 }}>Expires 12/28</div>
              </div>
            </div>
            <CheckCircle2 size={22} color="#0A2540" />
          </div>

          {/* Add New Card */}
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: 14, borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)',
            background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            color: '#0066CC', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.5
          }}>
            <Plus size={16} />
            Add New Card
          </button>
        </div>

        {/* Security Info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 16,
          background: 'rgba(10,37,64,0.03)', borderRadius: 12
        }}>
          <ShieldCheck size={20} color="#0A2540" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.8, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            Your payment is processed securely by Stripe. Card data is encrypted end-to-end.
          </p>
        </div>
      </div>

      {/* Pay Button Footer */}
      <div style={{ padding: '16px 20px 40px', borderTop: '1px solid rgba(0,0,0,0.04)', background: '#FFFFFF' }}>
        <button
          onClick={handlePay}
          disabled={isProcessing}
          style={{
            width: '100%', padding: 18, borderRadius: 14, border: 'none',
            background: paymentSuccess ? '#28A745' : '#0A2540',
            color: '#FFFFFF', fontSize: 16, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            cursor: isProcessing ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: isProcessing && !paymentSuccess ? 0.8 : 1,
            transition: 'all 0.3s ease',
            fontFamily: "'Barlow Condensed', sans-serif",
            boxShadow: '0 4px 24px rgba(10,37,64,0.2)'
          }}
        >
          {paymentSuccess ? (
            <>
              <CheckCircle2 size={20} />
              Payment Successful
            </>
          ) : isProcessing ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', animation: 'spin 0.8s linear infinite' }} />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Pay ${total.toFixed(2)} USD
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function SearchingScreen({ onFound }: { onFound: () => void, key?: string }) {
  useEffect(() => {
    const timer = setTimeout(onFound, 4000);
    return () => clearTimeout(timer);
  }, [onFound]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32,
        background: 'linear-gradient(170deg, #0A2540 0%, #0D1F3A 55%, #0A2540 100%)',
        fontFamily: "'Barlow Condensed', sans-serif"
      }}
    >
      <div style={{ position: 'relative', marginBottom: 48 }}>
        <motion.div
          animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '1px solid rgba(192,192,192,0.3)' }}
        />
        <motion.div
          animate={{ scale: [1, 2.5], opacity: [0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '1px solid rgba(192,192,192,0.2)' }}
        />
        <div style={{
          position: 'relative', width: 100, height: 100, borderRadius: '50%',
          border: '1px solid rgba(192,192,192,0.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
          boxShadow: '0 0 40px rgba(0,0,0,0.3)'
        }}>
          <AnimatedIcon icon={Compass} size={40} color="#C0C0C0" animation="spin" />
        </div>
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
          Searching for Excellence
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Loader2 size={16} className="animate-spin text-[#C0C0C0]" />
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' as const, fontWeight: 500, color: '#C0C0C0', margin: 0 }}>
            Contacting elite chauffeurs
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ChauffeurProfileScreen({ onBack, onConfirm }: { onBack: () => void, onConfirm: () => void, key?: string }) {
  const [showFullProfile, setShowFullProfile] = useState(false);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ height: '100%', width: '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: "'Barlow Condensed', sans-serif", position: 'relative' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '48px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', flexShrink: 0 }}>
        <button onClick={onBack} style={{ padding: 8, marginLeft: -8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: '#1A1A1A' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#1A1A1A', margin: 0, opacity: 0.6 }}>Your Chauffeur</h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Chauffeur Photo + Name + Rating */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', overflow: 'hidden',
            border: '3px solid #0A2540', boxShadow: '0 8px 32px rgba(10,37,64,0.15)'
          }}>
            <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A', margin: 0, lineHeight: 1.5 }}>{CHAUFFEUR.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Star size={16} fill="#FFC107" color="#FFC107" />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.5 }}>{CHAUFFEUR.rating}</span>
              <span style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.5, lineHeight: 1.5 }}>• Certified Chauffeur</span>
            </div>
          </div>
        </div>

        {/* Vehicle Photo + Info */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', background: '#FAFAFA' }}>
          <div style={{ width: '100%', height: 160, overflow: 'hidden', background: '#F0F0F0' }}>
            <img src={CHAUFFEUR.vehicleImage} alt={CHAUFFEUR.vehicle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.5 }}>{CHAUFFEUR.vehicle}</span>
            <span style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.5, lineHeight: 1.5 }}>Plate: {CHAUFFEUR.licensePlate}</span>
          </div>
        </div>

        {/* Status: Chauffeur on the way */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 16,
          background: 'rgba(10,37,64,0.03)', borderRadius: 12, border: '1px solid rgba(10,37,64,0.06)'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#0A2540',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Clock size={18} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.5, display: 'block' }}>Your chauffeur is on the way</span>
            <span style={{ fontSize: 14, color: '#0A2540', fontWeight: 500, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
              Estimated arrival: 8 min
            </span>
          </div>
        </div>

        {/* View Full Profile Button */}
        <button
          onClick={() => setShowFullProfile(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: '#0066CC',
            textDecoration: 'underline', textUnderlineOffset: '3px',
            textAlign: 'center', padding: 8, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.5
          }}
        >
          View full profile
        </button>
      </div>

      {/* Confirm Button */}
      <div style={{ padding: '16px 20px 40px', borderTop: '1px solid rgba(0,0,0,0.04)', flexShrink: 0 }}>
        <button
          onClick={onConfirm}
          style={{
            width: '100%', padding: 18, borderRadius: 14, border: 'none',
            background: '#0A2540', color: '#FFFFFF', fontSize: 16, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif",
            boxShadow: '0 4px 24px rgba(10,37,64,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
        >
          <CheckCircle2 size={18} />
          Confirm Chauffeur
        </button>
      </div>

      {/* Full Profile Modal */}
      <AnimatePresence>
        {showFullProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFullProfile(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                maxHeight: '85%', overflowY: 'auto', zIndex: 51, padding: '24px 20px 40px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={() => setShowFullProfile(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} color="#1A1A1A" />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid #0A2540', flexShrink: 0 }}>
                  <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{CHAUFFEUR.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Star size={14} fill="#FFC107" color="#FFC107" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{CHAUFFEUR.rating}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#FAFAFA', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0A2540' }}>{CHAUFFEUR.yearsExperience}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', opacity: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Years Exp.</div>
                </div>
                <div style={{ background: '#FAFAFA', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0A2540' }}>{CHAUFFEUR.rating}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', opacity: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Rating</div>
                </div>
                <div style={{ background: '#FAFAFA', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0A2540' }}>{CHAUFFEUR.languages.length}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', opacity: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Languages</div>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.6, marginBottom: 12 }}>Certifications</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                  {CHAUFFEUR.certifications.map((cert, i) => (
                    <span key={i} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500, background: 'rgba(10,37,64,0.06)', color: '#0A2540' }}>{cert}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.6, marginBottom: 12 }}>Languages</h4>
                <p style={{ fontSize: 16, color: '#1A1A1A', margin: 0 }}>{CHAUFFEUR.languages.join(', ')}</p>
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.6, marginBottom: 12 }}>Featured Reviews</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CHAUFFEUR.reviews.map((review, i) => (
                    <div key={i} style={{ padding: 16, background: '#FAFAFA', borderRadius: 12, border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} size={12} fill="#FFC107" color="#FFC107" />
                        ))}
                      </div>
                      <p style={{ fontSize: 14, color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.5, fontStyle: 'italic' }}>"{review.text}"</p>
                      <span style={{ fontSize: 13, color: '#1A1A1A', opacity: 0.5, fontWeight: 500 }}>— {review.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ConfirmedScreen({ onContinue }: { onContinue: () => void, key?: string }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32,
        background: 'linear-gradient(170deg, #0A2540 0%, #0D1F3A 55%, #0A2540 100%)',
        fontFamily: "'Barlow Condensed', sans-serif"
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{
          width: 96, height: 96, borderRadius: '50%', background: 'rgba(192,192,192,0.1)',
          border: '2px solid rgba(192,192,192,0.3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <CheckCircle2 size={48} color="#FFFFFF" strokeWidth={1.5} />
        </div>
      </motion.div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#FFFFFF', margin: 0 }}>
          Journey Confirmed
        </h2>
        <p style={{ fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 500, color: '#C0C0C0', margin: 0 }}>
          Your chauffeur is on the way
        </p>
      </div>
    </motion.div>
  );
}

function TrackingScreen({ vehicle, onBack }: { vehicle: Vehicle, onBack: () => void, key?: string }) {
  const [showChat, setShowChat] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [tripStatus, setTripStatus] = useState<'IN_PROGRESS' | 'ARRIVED' | 'COMPLETED'>('IN_PROGRESS');
  const [etaMinutes, setEtaMinutes] = useState(8);
  const rideId = React.useRef(`ride_${Date.now()}`).current;

  useEffect(() => {
    const t1 = setTimeout(() => setTripStatus('ARRIVED'), 30000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (etaMinutes <= 0) return;
    const interval = setInterval(() => {
      setEtaMinutes(prev => Math.max(prev - 1, 0));
    }, 15000);
    return () => clearInterval(interval);
  }, [etaMinutes]);

  const handleTripCompleted = () => {
    setTripStatus('COMPLETED');
    setShowChat(false);
    onBack();
  };

  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        background: '#FFFFFF', position: 'relative', fontFamily: "'Barlow Condensed', sans-serif"
      }}
    >
      {/* Top Bar — Chauffeur Mini Info (60px) */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', background: '#FFFFFF',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', zIndex: 10, flexShrink: 0, marginTop: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2px solid #0A2540', flexShrink: 0 }}>
            <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3 }}>{CHAUFFEUR.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={11} fill="#FFC107" color="#FFC107" />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1A1A', opacity: 0.6 }}>{CHAUFFEUR.rating}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowFullProfile(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#0066CC', fontFamily: "'Barlow Condensed', sans-serif", padding: '4px 8px' }}
        >
          View profile
        </button>
      </div>

      {/* Map Area (85% of remaining height) */}
      <div style={{ flex: 1, position: 'relative', background: '#0A2540', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 60% 40%, rgba(26,58,92,0.6) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(26,58,92,0.4) 0%, transparent 40%), linear-gradient(170deg, #0A2540 0%, #0D1F3A 50%, #071B30 100%)'
        }}>
          {/* Simulated road lines */}
          <div style={{ position: 'absolute', top: '30%', left: '10%', width: '80%', height: 2, background: 'rgba(192,192,192,0.15)', transform: 'rotate(-25deg)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '15%', width: '70%', height: 2, background: 'rgba(192,192,192,0.1)', transform: 'rotate(10deg)' }} />
          <div style={{ position: 'absolute', top: '65%', left: '5%', width: '90%', height: 2, background: 'rgba(192,192,192,0.12)', transform: 'rotate(-5deg)' }} />
          <div style={{ position: 'absolute', top: '20%', left: '40%', width: 1, height: '60%', background: 'rgba(192,192,192,0.08)' }} />
          <div style={{ position: 'absolute', top: '10%', left: '70%', width: 1, height: '80%', background: 'rgba(192,192,192,0.1)' }} />

          {/* Vehicle marker */}
          <motion.div
            animate={{ x: [0, -30, -15], y: [0, 40, 20] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', top: '35%', left: '55%' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#0A2540',
              border: '3px solid #C0C0C0', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 0 20px rgba(192,192,192,0.3)'
            }}>
              <Navigation size={20} color="#C0C0C0" style={{ transform: 'rotate(45deg)' }} />
            </div>
          </motion.div>

          {/* Destination marker */}
          <div style={{ position: 'absolute', top: '60%', left: '30%' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#FFFFFF',
              border: '3px solid #0A2540', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}>
              <MapPin size={16} color="#0A2540" />
            </div>
          </div>
        </div>

        {/* ETA Overlay */}
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          padding: '10px 20px', borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Clock size={16} color="#0A2540" />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#0A2540' }}>
            {tripStatus === 'ARRIVED' ? 'Arrived' : `Arriving in ${etaMinutes} min`}
          </span>
        </div>

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: tripStatus === 'ARRIVED' ? 'rgba(40,167,69,0.9)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 20, zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tripStatus === 'ARRIVED' ? '#FFFFFF' : '#28A745', display: 'inline-block' }} />
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: tripStatus === 'ARRIVED' ? '#FFFFFF' : '#1A1A1A'
          }}>
            {tripStatus === 'ARRIVED' ? 'Arrived' : 'En Route'}
          </span>
        </div>
      </div>

      {/* Bottom Bar — 3 Equal Buttons (80px) */}
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 20px', background: '#FFFFFF',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 10, flexShrink: 0, paddingBottom: 16
      }}>
        <button
          onClick={() => window.open(`tel:${CHAUFFEUR.phone}`)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, padding: '10px 0',
            background: 'rgba(0,102,204,0.08)', border: '1px solid rgba(0,102,204,0.2)',
            borderRadius: 12, cursor: 'pointer', color: '#0066CC', fontFamily: "'Barlow Condensed', sans-serif"
          }}
        >
          <Phone size={18} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Call</span>
        </button>

        <button
          onClick={() => setShowChat(true)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, padding: '10px 0',
            background: 'rgba(40,167,69,0.08)', border: '1px solid rgba(40,167,69,0.2)',
            borderRadius: 12, cursor: 'pointer', color: '#28A745', fontFamily: "'Barlow Condensed', sans-serif",
            position: 'relative'
          }}
        >
          <MessageCircle size={18} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Message</span>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#28A745', boxShadow: '0 0 4px rgba(40,167,69,0.6)' }} />
        </button>

        {/* Share Trip button */}
        <button
          onClick={() => {
            const shareData = { title: 'URBONT Trip', text: `I'm on my way with URBONT. Chauffeur: ${CHAUFFEUR.name}`, url: window.location.href };
            if (navigator.share) { navigator.share(shareData).catch(() => { }); }
            else { navigator.clipboard.writeText(shareData.text); }
          }}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, padding: '10px 0',
            background: 'rgba(10,37,64,0.05)', border: '1px solid rgba(10,37,64,0.12)',
            borderRadius: 12, cursor: 'pointer', color: '#0A2540', fontFamily: "'Barlow Condensed', sans-serif"
          }}
        >
          <Share2 size={18} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Share</span>
        </button>

        <button
          onClick={() => setShowCancelDialog(true)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, padding: '10px 0',
            background: 'rgba(220,53,69,0.06)', border: '1px solid rgba(220,53,69,0.15)',
            borderRadius: 12, cursor: 'pointer', color: '#DC3545', fontFamily: "'Barlow Condensed', sans-serif"
          }}
        >
          <X size={18} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Cancel</span>
        </button>
      </div>

      {/* Trip Completed bar — shown when chauffeur ARRIVED */}
      {tripStatus === 'ARRIVED' && (
        <div style={{ padding: '0 20px 16px', background: '#FFFFFF', zIndex: 10 }}>
          <button
            onClick={handleTripCompleted}
            style={{
              width: '100%', padding: 16, borderRadius: 14, border: 'none',
              background: '#0A2540', color: '#FFFFFF', fontSize: 15, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif",
              boxShadow: '0 4px 24px rgba(10,37,64,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
          >
            <CheckCircle2 size={18} />
            Complete Trip
          </button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCancelDialog(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 60 }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: '#FFFFFF', borderRadius: 20, padding: 28, width: 'calc(100% - 48px)',
                maxWidth: 340, zIndex: 61, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(220,53,69,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={28} color="#DC3545" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0, textAlign: 'center' }}>Cancel this ride?</h3>
              <p style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.6, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                Are you sure you want to cancel? Cancellation fees may apply.
              </p>
              <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 8 }}>
                <button
                  onClick={() => setShowCancelDialog(false)}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: '#F0F0F0', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  No
                </button>
                <button
                  onClick={handleCancelConfirm}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: '#DC3545', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#FFFFFF', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Yes, cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Profile Modal */}
      <AnimatePresence>
        {showFullProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFullProfile(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                maxHeight: '80%', overflowY: 'auto', zIndex: 51, padding: '24px 20px 40px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={() => setShowFullProfile(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0F0F0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} color="#1A1A1A" />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid #0A2540', flexShrink: 0 }}>
                  <img src={CHAUFFEUR.portrait} alt={CHAUFFEUR.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{CHAUFFEUR.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Star size={14} fill="#FFC107" color="#FFC107" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{CHAUFFEUR.rating}</span>
                    <span style={{ fontSize: 13, color: '#1A1A1A', opacity: 0.4 }}>• {CHAUFFEUR.experience}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.5, marginBottom: 8 }}>Vehicle</h4>
                  <p style={{ fontSize: 16, color: '#1A1A1A', margin: 0 }}>{CHAUFFEUR.vehicle} • {CHAUFFEUR.licensePlate}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.5, marginBottom: 8 }}>Certifications</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                    {CHAUFFEUR.certifications.map((cert, i) => (
                      <span key={i} style={{ padding: '5px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500, background: 'rgba(10,37,64,0.06)', color: '#0A2540' }}>{cert}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.5, marginBottom: 8 }}>Languages</h4>
                  <p style={{ fontSize: 16, color: '#1A1A1A', margin: 0 }}>{CHAUFFEUR.languages.join(', ')}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Room Overlay */}
      <AnimatePresence>
        {showChat && (tripStatus === 'IN_PROGRESS' || tripStatus === 'ARRIVED') && (
          <ChatRoom
            rideId={rideId}
            senderRole="passenger"
            tripStatus={tripStatus}
            onClose={() => setShowChat(false)}
            onTripCompleted={handleTripCompleted}
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
  onUpdateProfile
}: {
  userProfile: UserProfile,
  onBack: () => void,
  onEditProfile: () => void,
  onEditAddress: (type: 'home' | 'work' | 'other') => void,
  onSignOut: () => void,
  onLegal: () => void,
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
              className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all ${userProfile.accountType === 'personal'
                ? 'bg-[#001F3F] text-white shadow-md'
                : 'text-[#001F3F]/80 hover:text-[#001F3F]'
                }`}>
              Personal
            </button>
            <button
              onClick={() => onUpdateProfile({ accountType: 'business' })}
              className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all ${userProfile.accountType === 'business'
                ? 'bg-[#001F3F] text-white shadow-md'
                : 'text-[#001F3F]/80 hover:text-[#001F3F]'
                }`}>
              Business
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* User Info Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
            <div className="py-4 px-5 border-b border-black/[0.04]">
              <div className="text-[12px] text-[#001F3F] uppercase tracking-widest font-bold mb-1">Name</div>
              <div className="text-base font-medium text-[#001F3F]">{userProfile.firstName} {userProfile.lastName}</div>
            </div>
            <div className="py-4 px-5 border-b border-black/[0.04]">
              <div className="text-[12px] text-[#001F3F] uppercase tracking-widest font-bold mb-1">Phone</div>
              <div className="text-base font-medium text-[#001F3F]">{userProfile.phone}</div>
            </div>
            <div className="py-4 px-5 border-b border-black/[0.04]">
              <div className="text-[12px] text-[#001F3F] uppercase tracking-widest font-bold mb-1">Email</div>
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
            <div className="text-[12px] text-[#001F3F] uppercase tracking-widest px-2 font-bold transition-all">Favorites</div>
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
            <div className="text-[12px] text-[#001F3F] uppercase tracking-widest px-2 font-bold transition-all">Settings</div>
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

            <button onClick={onSignOut} className="w-full py-4 text-[#001F3F] text-sm font-medium uppercase tracking-widest text-center hover:bg-black\/10 rounded-2xl transition-colors">
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
                  <button onClick={() => setShowLanguageMenu(false)} className="p-2 bg-white rounded-full shadow-sm text-[#001F3F]/80 hover:bg-white\/10 transition-colors">
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
                        className={`w-full py-4 px-6 text-left text-base font-medium rounded-2xl transition-all duration-300 flex items-center justify-between ${isSelected
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

function RideHistoryScreen({ onBack }: { onBack: () => void, key?: string }) {
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const history = [
    { id: 1, date: 'Oct 24, 2024', destination: 'JFK Airport, Terminal 4', vehicle: 'First Class', price: '$145.00' },
    { id: 2, date: 'Oct 20, 2024', destination: 'The Plaza Hotel', vehicle: 'Business Class', price: '$85.00' },
    { id: 3, date: 'Oct 15, 2024', destination: 'Madison Square Garden', vehicle: 'Business XL', price: '$120.00' },
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
          <h2 className="font-sans text-3xl font-light text-[#001F3F]">Ride History</h2>
          <p className="text-sm font-normal leading-relaxed text-[#001F3F]/80 px-4">
            Review your past journeys and receipts
          </p>
        </div>

        <div className="space-y-4">
          {history.map((ride) => (
            <div key={ride.id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.02] space-y-4 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-start border-b border-black/[0.04] pb-4">
                <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest font-medium">{ride.date}</div>
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
              </div>
            </div>
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
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[32px] p-6 pb-10 space-y-6"
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

function PaymentMethodsScreen({ onBack }: { onBack: () => void, key?: string }) {
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
            <div className="text-[10px] text-[#001F3F]/80 uppercase tracking-[0.2em] font-medium px-1">Saved Cards</div>

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
                  <span className="font-mono text-xs opacity-80 tracking-widest">PLATINUM</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />)}
                    </div>
                    <span className="font-mono text-lg tracking-[0.2em]">4242</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-widest opacity-80">Card Holder</span>
                      <div className="text-xs font-medium uppercase tracking-widest">Angel Boyer</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[8px] uppercase tracking-widest opacity-80">Expires</span>
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
                      <div className="text-xs text-[#001F3F]/80">{method.active ? 'Primary Payment Method' : 'Secondary'}</div>
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
              className="w-full py-5 bg-white text-[#001F3F] font-medium rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/[0.04] flex items-center justify-between px-6 hover:bg-black/[0.02] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#001F3F]/10 flex items-center justify-center text-[#001F3F] group-hover:bg-[#001F3F] group-hover:text-white transition-colors">
                  <Plus size={18} />
                </div>
                <span className="text-sm font-medium uppercase tracking-widest">Add Payment Method</span>
              </div>
              <ChevronRight size={18} className="text-[#001F3F]/70 group-hover:text-[#001F3F] transition-colors" />
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-[10px] text-[#001F3F]/80 uppercase tracking-[0.2em] font-medium px-1">Add New</div>
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
                className="w-full py-4 text-xs font-medium text-[#001F3F]/80 uppercase tracking-widest hover:text-[#001F3F] transition-colors"
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
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/80 font-medium">Card Number</label>
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
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/80 font-medium">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full p-4 bg-[#001F3F]/5 rounded-xl text-[#001F3F] outline-none tracking-widest placeholder:text-[#001F3F]/20"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/80 font-medium">CVV</label>
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

function GiftRideScreen({ onBack }: { onBack: () => void, key?: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center p-6 gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-sans text-xl font-medium uppercase tracking-widest text-[#001F3F]">GIFT A JOURNEY</h2>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="space-y-6 text-center mt-4">
          <div className="w-24 h-24 bg-[#001F3F] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#001F3F]/20">
            <Gift size={36} className="text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#001F3F]">Surprise someone special</h3>
            <p className="text-sm text-[#001F3F]/80 font-normal leading-relaxed max-w-[260px] mx-auto">
              Send an elite chauffeur to pick up your guest.
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/70 font-bold ml-1">Recipient Name</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001F3F]/30">
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who are we picking up?"
                className="w-full bg-[#F5F7FA] rounded-xl py-4 pl-12 pr-4 text-base font-medium text-[#001F3F] outline-none focus:ring-1 focus:ring-[#001F3F]/20 transition-all placeholder:text-[#001F3F]/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/70 font-bold ml-1">Phone Number</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#001F3F]/30">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhone(val);
                }}
                placeholder="000 000 0000"
                className="w-full bg-[#F5F7FA] rounded-xl py-4 pl-12 pr-4 text-base font-medium text-[#001F3F] outline-none focus:ring-1 focus:ring-[#001F3F]/20 transition-all placeholder:text-[#001F3F]/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F]/70 font-bold ml-1">Personal Message</label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-[#001F3F]/30">
                <MessageCircle size={20} />
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a welcoming note..."
                rows={4}
                className="w-full bg-[#F5F7FA] rounded-xl py-4 pl-12 pr-4 text-base font-medium text-[#001F3F] outline-none focus:ring-1 focus:ring-[#001F3F]/20 transition-all placeholder:text-[#001F3F]/30 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full py-4 bg-[#D1D5DB] text-white font-bold uppercase tracking-widest hover:bg-[#001F3F] transition-colors rounded-full shadow-sm text-sm">
            Continue to Booking
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void, key?: string }) {
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
                <span className="text-base font-medium text-[#001F3F]">Notifications</span>
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
                <span className="text-base font-medium text-[#001F3F]">Location Services</span>
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
                <span className="text-base font-medium text-[#001F3F]">Language</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#001F3F]/80">{language}</span>
                  <ChevronRight size={18} className="text-[#001F3F]/70" />
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-[#001F3F]/80 uppercase tracking-widest px-2">Support</div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
              <button className="w-full text-left p-5 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"><span className="text-base font-medium text-[#001F3F]">Help Center</span></button>
              <button className="w-full text-left p-5 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"><span className="text-base font-medium text-[#001F3F]">Terms of Service</span></button>
              <button className="w-full text-left p-5 hover:bg-black/[0.02] transition-colors"><span className="text-base font-medium text-[#001F3F]">Privacy Policy</span></button>
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

function MyPreferencesScreen({ onBack }: { onBack: () => void, key?: string }) {
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
              className={`w-full flex items-center justify-between p-5 hover:bg-black/[0.02] transition-colors ${index !== preferences.length - 1 ? 'border-b border-black/[0.04]' : ''
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
                <ChevronRight size={16} className="opacity-70" />
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
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedValues(prev => ({ ...prev, [editingPref]: option }));
                          setTimeout(() => setEditingPref(null), 200); // Small delay for visual feedback
                        }}
                        className={`w-full py-4 px-6 text-left text-base font-medium rounded-2xl transition-all duration-300 flex items-center justify-between ${isSelected
                          ? 'bg-[#001F3F]/10 text-[#001F3F] border border-[#001F3F]/30 shadow-sm'
                          : 'bg-white text-[#001F3F] border border-transparent hover:border-[#001F3F]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                          }`}
                      >
                        {option}
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

function CustomerServiceScreen({ onBack }: { onBack: () => void, key?: string }) {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'agent', text: string }[]>([{ sender: 'agent', text: 'Hello! How can I assist you today?' }]);

  const sendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { sender: 'user', text: message }]);
      setMessage('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: 'agent', text: 'Thank you for reaching out. An agent will be with you shortly.' }]);
      }, 1000);
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
      <div className="flex items-center justify-between p-6">
        <h2 className="font-sans text-2xl font-light text-[#001F3F]">Help Center</h2>
        <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-[#001F3F]/80 hover:bg-white\/10 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-8">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-4 bg-[#001F3F]/10 rounded-full text-[#001F3F] mb-2 shadow-sm border border-[#001F3F]/20">
            <MessageCircle size={32} />
          </div>
          <p className="text-sm font-normal text-[#001F3F]/80 leading-relaxed px-4">
            How can we assist you today? Our concierge team is available 24/7.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-black/[0.02]">
          <button onClick={() => setShowChat(true)} className="flex items-center justify-between w-full p-6 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                <MessageCircle size={18} />
              </div>
              <span className="text-base font-medium text-[#001F3F]">Open Chat</span>
            </div>
            <ChevronRight size={16} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
          </button>

          <button onClick={() => setShowChat(true)} className="flex items-center justify-between w-full p-6 border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                <Phone size={18} />
              </div>
              <span className="text-base font-medium text-[#001F3F]">Call Us</span>
            </div>
            <ChevronRight size={16} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
          </button>

          <button onClick={() => setShowChat(true)} className="flex items-center justify-between w-full p-6 hover:bg-black/[0.02] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#001F3F]">
                <Info size={18} />
              </div>
              <span className="text-base font-medium text-[#001F3F]">Questions & Answers</span>
            </div>
            <ChevronRight size={16} className="text-[#001F3F]/30 group-hover:text-[#001F3F] transition-colors" />
          </button>
        </div>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-50 flex flex-col"
          >
            <div className="flex items-center p-6 gap-4 border-b border-black/[0.04] bg-white">
              <button onClick={() => setShowChat(false)} className="p-2 -ml-2 text-[#001F3F] hover:bg-black/5 rounded-full transition-colors">
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#001F3F]/10 flex items-center justify-center text-[#001F3F]">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-[#001F3F]">URBONT Concierge</h3>
                  <p className="text-xs text-[#001F3F]/80">Typically replies in minutes</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#001F3F]/[0.02]">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' ? 'bg-[#001F3F] text-white rounded-tr-sm' : 'bg-white text-[#001F3F] border border-black/[0.04] shadow-sm rounded-tl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-black/[0.04]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-4 bg-[#001F3F]/5 rounded-full text-[#001F3F] outline-none text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="w-12 h-12 rounded-full bg-[#001F3F] text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

function CountrySelectorScreen({ onBack, onSelect }: { onBack: () => void, onSelect: (code: string) => void, key?: string }) {
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
            <div className="px-8 py-4 text-[10px] text-[#001F3F]/70 uppercase tracking-[0.2em] bg-[#F5F7FA] font-bold">
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
                  <span className="text-base font-medium text-[#001F3F]/70">{country.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="px-8 py-4 text-[10px] text-[#001F3F]/70 uppercase tracking-[0.2em] bg-[#F5F7FA] font-bold">
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
                <span className="text-base font-medium text-[#001F3F]/70">{country.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ServicesScreen({ onBack }: { onBack: () => void, key?: string }) {
  const services = [
    { title: 'Airport Transfers', description: 'Reliable pickup and drop-off at all major airports.', icon: <Plane size={24} /> },
    { title: 'Hourly Booking', description: 'A chauffeur at your disposal for as long as you need.', icon: <Clock size={24} /> },
    { title: 'City to City', description: 'Seamless long-distance travel between cities.', icon: <Navigation size={24} /> },
    { title: 'Events & Weddings', description: 'Arrive in style for your most important moments.', icon: <Star size={24} /> },
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
          <h2 className="font-sans text-3xl font-light text-[#001F3F]">Signature</h2>
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

function EditProfileScreen({ userProfile, onBack, onSave }: { userProfile: UserProfile, onBack: () => void, onSave: (updated: Partial<UserProfile>) => void, key?: string }) {
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
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${title === t
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
            className="w-full py-4 text-red-500 text-sm font-medium uppercase tracking-widest hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
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
                  className="flex-1 py-3 rounded-xl bg-[#001F3F]/5 text-[#001F3F] font-medium text-sm uppercase tracking-wider hover:bg-[#001F3F]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would trigger account deletion
                    setShowDeleteConfirm(false);
                    onBack(); // Or navigate to welcome
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
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

function AddressEditScreen({ type, onBack, onSave }: { type: 'home' | 'work' | 'other', onBack: () => void, onSave: (addr: string) => void, key?: string }) {
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

function LegalScreen({ onBack }: { onBack: () => void, key?: string }) {
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
          <p className="text-[10px] text-[#001F3F]/70 uppercase tracking-widest">Last Updated: March 2026</p>
        </div>
      </div>
    </motion.div>
  );
}

function MembershipScreen({ onBack }: { onBack: () => void, key?: string }) {
  const privileges = [
    {
      name: 'LUXE',
      description: 'Discover the latest-generation Mercedes-Maybach S-Class, delivering the smoothest and most elegant journeys. Available in Dubai and Paris.'
    },
    {
      name: 'SUV',
      description: 'Experience URBONT’s most refined class to date, featuring the latest generation Range Rover Long Wheelbase 4×4, available exclusively in London.'
    },
    {
      name: 'CONCIERGE',
      description: 'Reclaim your precious time by having a trusted chauffeur handle errands — including seamless purchasing — on your behalf.'
    },
    {
      name: 'CHAUFFEUR FOR A DAY',
      description: 'Reserve a chauffeur for up to an entire day, at a convenient flat hourly rate.'
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
          <h3 className="text-3xl font-light text-[#001F3F]">Access</h3>
          <p className="text-base font-light text-[#001F3F] leading-relaxed">
            Access exclusive privileges after taking 15 journeys within 6 months, or by invitation from another member.
          </p>

          {/* Progress Tracker */}
          <div className="mt-12 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#001F3F]/70 font-bold">Your Progress</span>
              <span className="text-sm font-medium text-[#001F3F]">8 / 15 Journeys</span>
            </div>
            <div className="h-1.5 w-full bg-[#001F3F]/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '53%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#001F3F] rounded-full"
              />
            </div>
            <p className="text-[10px] text-[#001F3F]/80 font-medium italic">7 more journeys to unlock Signature Access</p>
          </div>
        </div>

        <div className="space-y-12">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#001F3F] font-medium border-t border-black/[0.03] pt-10">Membership Privileges</h4>

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
