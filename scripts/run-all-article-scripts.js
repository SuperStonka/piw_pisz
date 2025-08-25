import { execSync } from 'child_process';

const scripts = [
  'add-przedmiot-dzialalnosci-article.js',
  'add-organy-osoby-article.js', 
  'add-zalatwianie-spraw-article.js',
  'add-urzedowe-badanie-miesa-article.js',
  'add-nabor-kandydatow-articles.js',
  'add-majatek-articles.js',
  'add-zamowienia-publiczne-article.js',
  'add-wskazowki-dla-rolnikow-articles.js',
  'add-sprawozdania-finansowe-articles.js'
];

console.log('Running all article creation scripts...\n');

for (const script of scripts) {
  try {
    console.log(`Running ${script}...`);
    execSync(`node scripts/${script}`, { stdio: 'inherit' });
    console.log(`✓ ${script} completed successfully\n`);
  } catch (error) {
    console.error(`✗ Error running ${script}:`, error.message);
    console.log(''); // Add blank line for readability
  }
}

console.log('All scripts completed!');
