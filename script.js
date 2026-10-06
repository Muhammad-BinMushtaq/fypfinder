const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-white dark:bg-slate-900/g, replace: 'bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl' },
  { search: /bg-white dark:bg-slate-800/g, replace: 'bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl' },
  { search: /bg-slate-50\/50 dark:bg-slate-900\/50/g, replace: 'bg-black/5 dark:bg-white/5 backdrop-blur-md' },
  { search: /bg-slate-50\/50 dark:bg-slate-900\/40/g, replace: 'bg-black/5 dark:bg-white/5 backdrop-blur-md' },
  { search: /bg-slate-50 dark:bg-slate-800\/40/g, replace: 'bg-black/5 dark:bg-white/5 backdrop-blur-md' },
  { search: /bg-slate-100 dark:bg-slate-800\/80/g, replace: 'bg-black/5 dark:bg-white/5 backdrop-blur-md' },
  { search: /bg-slate-100 dark:bg-slate-800/g, replace: 'bg-black/5 dark:bg-white/5 backdrop-blur-md' },
  { search: /border-slate-200 dark:border-slate-800/g, replace: 'border-white/40 dark:border-white/10' },
  { search: /border-slate-200 dark:border-slate-700/g, replace: 'border-white/40 dark:border-white/10' },
  { search: /border-slate-100 dark:border-slate-800\/80/g, replace: 'border-white/20 dark:border-white/5' },
  { search: /border-slate-100 dark:border-slate-800/g, replace: 'border-white/20 dark:border-white/5' },
  { search: /rounded-xl/g, replace: 'rounded-3xl' },
  { search: /rounded-lg/g, replace: 'rounded-2xl' },
  { search: /shadow-2xs/g, replace: 'shadow-xl' }
];

const filesToProcess = [
  'app/dashboard/settings/page.tsx',
  'app/dashboard/requests/page.tsx',
  'app/dashboard/requests/partner/page.tsx',
  'app/dashboard/requests/messages/page.tsx',
  'components/request/RequestEmptyState.tsx',
  'components/request/RequestActions.tsx',
  'components/request/SendRequestButtons.tsx'
];

filesToProcess.forEach(file => {
  const fullPath = path.join('c:/Users/Muhammad/Desktop/fypfinder', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Custom fix for settings page min-h-screen bg
    if (file.includes('settings')) {
      content = content.replace(/min-h-screen bg-white dark:bg-slate-950/g, 'min-h-screen bg-transparent');
    }
    
    // Custom fixes for SendRequestButtons modal
    if (file.includes('SendRequestButtons')) {
       content = content.replace(/relative bg-white\/60 dark:bg-slate-900\/40 backdrop-blur-xl rounded-3xl shadow-2xl/g, 'relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl');
    }

    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Processed', file);
  } else {
    console.log('Not found', file);
  }
});
