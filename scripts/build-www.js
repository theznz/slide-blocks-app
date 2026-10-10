// Copies the built game into www/ for Capacitor (npm run build runs assemble.py first).
// Only what the app needs ships: the page, its font and icons. The service worker and web
// manifest are for the browser version and stay out of the native apps.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
for (const dir of ['fonts', 'icons']) fs.cpSync(path.join(root, dir), path.join(out, dir), { recursive: true });
console.log('www ready:', fs.readdirSync(out).join(', '));
