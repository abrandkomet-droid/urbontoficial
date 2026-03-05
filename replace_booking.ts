import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update BookingScreen props
content = content.replace(
  /function BookingScreen\(\{ onOpenMenu, onSelectVehicle, onNotifications \}: \{ onOpenMenu: \(\) => void, onSelectVehicle: \(\) => void, onNotifications: \(\) => void, key\?: string \}\) \{/,
  'function BookingScreen({ onOpenMenu, onSelectVehicle, onNotifications, onPaymentMethods }: { onOpenMenu: () => void, onSelectVehicle: () => void, onNotifications: () => void, onPaymentMethods: () => void, key?: string }) {'
);

// Update BookingScreen usage in App
content = content.replace(
  /<BookingScreen \n            key="booking" \n            onOpenMenu=\{\(\) => setIsMenuOpen\(true\)\} \n            onSelectVehicle=\{\(\) => navigate\(\'vehicle-selection\'\)\} \n            onNotifications=\{\(\) => navigate\(\'notifications\'\)\}\n          \/>/,
  '<BookingScreen \n            key="booking" \n            onOpenMenu={() => setIsMenuOpen(true)} \n            onSelectVehicle={() => navigate(\'vehicle-selection\')} \n            onNotifications={() => navigate(\'notifications\')}\n            onPaymentMethods={() => navigate(\'payment-methods\')}\n          />'
);

// Fix text-white/60 and text-white/40 in BookingScreen
// I will just use a regex for the specific lines inside BookingScreen
const bookingScreenStart = content.indexOf('function BookingScreen');
const bookingScreenEnd = content.indexOf('function NotificationsScreen', bookingScreenStart);

if (bookingScreenStart !== -1 && bookingScreenEnd !== -1) {
  let bookingScreenContent = content.substring(bookingScreenStart, bookingScreenEnd);
  bookingScreenContent = bookingScreenContent.replace(/text-white\\\/60/g, 'text-[#001F3F]/60');
  bookingScreenContent = bookingScreenContent.replace(/text-white\\\/40/g, 'text-[#001F3F]/40');
  bookingScreenContent = bookingScreenContent.replace(/bg-white\\\/10/g, 'bg-[#001F3F]/5');
  
  // Also fix the Add Card button to use onPaymentMethods
  bookingScreenContent = bookingScreenContent.replace(
    /<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-xl border border-dashed border-black\/20 flex items-center justify-center">\s*<Plus size=\{16\} className="text-\[#001F3F\]\/60" \/>\s*<\/div>\s*<span className="text-xs font-medium text-\[#001F3F\]\/60">Add Card<\/span>\s*<\/div>/,
    '<div className="flex items-center gap-3" onClick={(e) => { e.stopPropagation(); onPaymentMethods(); }}>\n                  <div className="w-10 h-10 rounded-xl border border-dashed border-black/20 flex items-center justify-center">\n                    <Plus size={16} className="text-[#001F3F]/60" />\n                  </div>\n                  <span className="text-xs font-medium text-[#001F3F]/60">Add Card</span>\n                </div>'
  );

  content = content.substring(0, bookingScreenStart) + bookingScreenContent + content.substring(bookingScreenEnd);
}

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
