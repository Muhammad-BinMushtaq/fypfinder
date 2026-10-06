const fs = require('fs');
const path = require('path');

const files = [
  'app/dashboard/requests/page.tsx',
  'app/dashboard/requests/partner/page.tsx',
  'app/dashboard/requests/messages/page.tsx'
];

files.forEach(f => {
  const file = path.join('c:/Users/Muhammad/Desktop/fypfinder', f);
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/min-h-screen bg-white dark:bg-slate-950/g, 'min-h-screen bg-transparent');
    content = content.replace(/bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300/g, 'bg-black/5 dark:bg-white/10 text-slate-800 dark:text-slate-300 backdrop-blur-md');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', f);
  }
});
