import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<FreepikIcon[^>]*fallback=\{([^}]+)\}\s*\/>/g, '$1');

fs.writeFileSync('src/App.tsx', content);
console.log('Icons replaced successfully.');
