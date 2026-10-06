const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-white dark:bg-slate-700/g, replace: 'bg-black/5 dark:bg-white/5 backdrop-blur-sm' },
  { search: /border-gray-200 dark:border-slate-600/g, replace: 'border-white/40 dark:border-white/10' },
  { search: /bg-gray-100 dark:bg-slate-600/g, replace: 'bg-black/5 dark:bg-white/10' },
  { search: /bg-gray-900 dark:bg-white text-white dark:text-gray-900/g, replace: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md border border-white/20' }
];

const file = 'c:/Users/Muhammad/Desktop/fypfinder/components/request/SendRequestButtons.tsx';
let content = fs.readFileSync(file, 'utf8');

replacements.forEach(r => {
  content = content.replace(r.search, r.replace);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed textareas');
