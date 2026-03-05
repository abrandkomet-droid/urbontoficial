import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace bg-black text-white buttons with bg-[#001F3F] text-white
content = content.replace(/className="w-full py-5 bg-black text-white/g, 'className="w-full py-5 bg-[#001F3F] text-white');
content = content.replace(/className="w-full py-5 bg-black text-white text-sm/g, 'className="w-full py-5 bg-[#001F3F] text-white text-sm');

// Replace text-black icons with text-[#001F3F]
content = content.replace(/className="text-black"/g, 'className="text-[#001F3F]"');
content = content.replace(/className="text-black /g, 'className="text-[#001F3F] ');
content = content.replace(/text-black/g, 'text-[#001F3F]');

// Fix any double replacements
content = content.replace(/text-\[#001F3F\]/g, 'text-[#001F3F]');

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
