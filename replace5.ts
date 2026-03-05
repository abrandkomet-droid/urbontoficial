import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// EditProfileScreen
content = content.replace(
  /className="h-full w-full bg-white flex flex-col"\s*>\s*<div className="flex items-center justify-between p-6 border-b border-border-subtle">/g,
  'className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col">\n      <div className="flex items-center justify-between p-6 border-b border-black/[0.04]">'
);

// AddressEditScreen
content = content.replace(
  /className="h-full w-full bg-white flex flex-col"\s*>\s*<div className="flex items-center justify-between p-6 border-b border-border-subtle">/g,
  'className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col">\n      <div className="flex items-center justify-between p-6 border-b border-black/[0.04]">'
);

// LegalScreen
content = content.replace(
  /className="h-full w-full bg-white flex flex-col"\s*>\s*<div className="flex items-center p-6 gap-4 border-b border-border-subtle">/g,
  'className="h-full w-full bg-[#FFFFFF] text-[#001F3F] flex flex-col">\n      <div className="flex items-center p-6 gap-4 border-b border-black/[0.04]">'
);

// Fix input borders and text colors in EditProfileScreen and AddressEditScreen
content = content.replace(/border-border-subtle outline-none text-lg font-light focus:border-black/g, 'border-black/[0.04] outline-none text-lg font-light focus:border-[#001F3F] bg-transparent text-[#001F3F] placeholder:text-[#001F3F]/30');

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
