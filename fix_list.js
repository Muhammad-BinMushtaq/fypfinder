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

const file = 'c:/Users/Muhammad/Desktop/fypfinder/components/request/RequestList.tsx';
let content = fs.readFileSync(file, 'utf8');

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed RequestList');
