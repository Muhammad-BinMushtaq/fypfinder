const fs = require('fs');
const file = 'c:/Users/Muhammad/Desktop/fypfinder/app/dashboard/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/border-slate-200\/60 dark:border-slate-800/g, 'border-white/40 dark:border-white/10');
content = content.replace(/border-slate-200\/80 dark:border-slate-700/g, 'border-white/20 dark:border-white/5');
content = content.replace(/bg-white\/60 dark:bg-slate-900\/40 backdrop-blur-xl/g, 'bg-white/80 dark:bg-white/10 backdrop-blur-md');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed stray borders');
