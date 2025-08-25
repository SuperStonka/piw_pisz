import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the download directory exists
const downloadDir = path.join(__dirname, '..', 'public', 'download');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Extract all file URLs from the original HTML content provided by the user
const originalUrls = {
  // Sprawozdania Finansowe URLs - extracted from original HTML
  'bilans-jednostki-budzetowej-na-dzien-31.12.2024.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2025/05/bilans-jednostki-budzetowej-na-dzien-31.12.2024.pdf',
  'rachunek-zyskow-i-strat-jednostki-budzetowej-na-dzien-31.12.2024.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2025/05/rachunek-zyskow-i-strat-jednostki-budzetowej-na-dzien-31.12.2024.pdf',
  'zestawienie-zmian-w-funduszu-jednostki-budzetowej-na-dzien-31.12.2024.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2025/05/zestawienie-zmian-w-funduszu-jednostki-budzetowej-na-dzien-31.12.2024.pdf',
  'informacja-dodatkowa-na-dzien-31.12.2024.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2025/05/informacja-dodatkowa-na-dzien-31.12.2024.pdf',
  
  'Bilans-2023.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2024/05/Bilans-2023.pdf',
  'Rachunek-zyskow-i-strat-2023.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2024/05/Rachunek-zyskow-i-strat-2023.pdf',
  'Zestawienie-zmian-w-funduszu-2023.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2024/05/Zestawienie-zmian-w-funduszu-2023.pdf',
  'Informacja-dodatkowa-2023.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2024/05/Informacja-dodatkowa-2023.pdf',
  
  'Bilans-2022.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2023/05/Bilans.pdf',
  'Rachunek-zyskow-i-strat-2022.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2023/05/Rachunek-zyskow-i-strat.pdf',
  'Zestawienie-zmian-w-funduszu-2022.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2023/05/Zestawienie-zmian-w-funduszu.pdf',
  'Informacja-dodatkowa-2022.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2023/05/Informacja-dodatkowa.pdf',
  
  'Bilans-sporzadzony-na-dzien-31.12.2021-.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2022/06/Bilans-sporzadzony-na-dzien-31.12.2021-.pdf',
  'Rachunek-zyskow-i-strat-sporzadzony-na-dzien-31.12.2021.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2022/06/Rachunek-zyskow-i-strat-sporzadzony-na-dzien-31.12.2021.pdf',
  'Zestawienie-zmian-w-funduszu-jednostki-sporzadzony-na-dzien-31.12.2021.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2022/06/Zestawienie-zmian-w-funduszu-jednostki-sporzadzony-na-dzien-31.12.2021.pdf',
  'Informacja-dodatkowa-sporzadzona-na-dzien-31.12.2021.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2022/06/Informacja-dodatkowa-sporzadzona-na-dzien-31.12.2021.pdf',
  
  'Bilans-za-2020.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2021/05/Bilans-za-2020.pdf',
  'Rachunek-zysków-i-strat-2020.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2021/05/Rachunek-zysków-i-strat.pdf',
  'Zestawienie-zmian-w-funduszu-2020.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2021/05/Zestawienie-zmian-w-funduszu.pdf',
  'Informacja-Dodatkowa-2020.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2021/05/Informacja-Dodatkowa.pdf',
  
  'bilans-2019.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2020/05/bilans.pdf',
  'rachunek-zysków-i-strat-2019.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2020/05/rachunek-zysków-i-strat.pdf',
  'zestawienie-zmian-w-funduszu-2019.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2020/05/zestawienie-zmian-w-funduszu-1.pdf',
  'Informacja-dodatkowa-2019.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2020/05/Informacja-dodatkowa-1.pdf',
  
  'Bilans-2018.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2019/05/Bilans.pdf',
  'Rachunek-zysków-i-strat-2018.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2019/05/Rachunek-zysków-i-strat.pdf',
  'Zestawienie-zmian-w-funduszu-2018.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2019/05/Zestawienie-zmian-w-funduszu.pdf',
  'Informacja-dodatkowa-2018.pdf': 'http://bip.pisz.piw.gov.pl/wp-content/uploads/2019/05/Informacja-dodatkowa.pdf',
  
  // Note: For recruitment (Nabór kandydatów) - these would typically be from original recruitment announcements
  // Since no specific URLs were provided in the user content, these would need to be sourced separately
  'inspektor-weterynaryjny153719.pdf': null, // Would need original URL
  'inspektor-weterynaryjny152433.pdf': null, // Would need original URL  
  'inspektor-weterynaryjny78010.pdf': null, // Would need original URL
  'inspektor-weterynaryjny76435.pdf': null, // Would need original URL
  
  // Note: For Majątek articles - these would typically be from asset disposal announcements
  // Since no specific URLs were provided in the user content, these would need to be sourced separately
  'Informacja-o-zbednych-i-zuzytych-skladnikach-majatku-sig.pdf': null,
  'Zalacznik-nr-1-wykaz-zbednych-zuzytych-skladnikow-majatku-PIW-w-Piszu-sig.pdf': null,
  'Zalacznik-nr-2-wniosek-o-przekazanie-darowizne-skladnika-majatku-ruchomego.pdf': null,
  'Zalacznik-nr-3-wniosek-o-zakup.pdf': null,
  'Zalacznik-nr-4-klauzula-informacyjna.pdf': null,
  'Informacja-o-zbednych-i-zuzytych-skladnikach-majatku-sig-2024-11.pdf': null,
  'Zalacznik-nr-1-do-ogloszenia-z-dnia-26-listopada-2024-r.-wykaz-zbednych-i-zuzytych-skladnikow-sig.pdf': null,
  'Zalacznik-nr-2-do-ogloszenia-z-dnia-26-listopada-2024-r.-wniosek-o-darowizne.doc': null,
  'Zalacznik-nr-3-do-ogloszenia-z-dnia-26-listopada-2024-r.-wniosek-o-zakup.docx': null,
  'Zalacznik-nr-4-do-ogloszenia-z-dnia-26-listopada-2024-r.-klauzula-informacyjna.pdf': null,
  'Ogloszenie-o-zbednych-lub-zuzytych-skladnikach-rzeczowych-matatku-ruchomego-PIW-Pisz.pdf': null,
  'Zbedny-skladnik-majatku-ruchomego.pdf': null,
  
  // Note: For Zamówienia publiczne - this would typically be from a procurement announcement
  'informacja.pdf': null // Would need original URL
};

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      console.log(`❌ No URL provided for ${path.basename(filepath)} - skipping`);
      resolve(false);
      return;
    }

    const protocol = url.startsWith('https:') ? https : http;
    
    console.log(`📥 Downloading: ${path.basename(filepath)}`);
    console.log(`    From: ${url}`);
    
    const file = fs.createWriteStream(filepath);
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve(true);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        console.log(`🔄 Redirecting to: ${response.headers.location}`);
        file.close();
        fs.unlinkSync(filepath); // Remove the empty file
        downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath); // Remove the empty file
        console.log(`❌ Failed to download ${path.basename(filepath)}: HTTP ${response.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath); // Remove the empty file
      }
      console.log(`❌ Error downloading ${path.basename(filepath)}: ${err.message}`);
      resolve(false);
    });
  });
}

async function downloadAllFiles() {
  console.log('🚀 Starting download of all files from scripts...\n');
  
  let downloadCount = 0;
  let successCount = 0;
  let skipCount = 0;

  for (const [filename, url] of Object.entries(originalUrls)) {
    const filepath = path.join(downloadDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  File already exists: ${filename}`);
      skipCount++;
      continue;
    }
    
    if (url) {
      downloadCount++;
      const success = await downloadFile(url, filepath);
      if (success) {
        successCount++;
      }
      
      // Add a small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`⚠️  No URL mapping found for: ${filename}`);
      skipCount++;
    }
  }
  
  console.log('\n📊 Download Summary:');
  console.log(`✅ Successfully downloaded: ${successCount} files`);
  console.log(`⏭️  Already existed: ${skipCount} files`);
  console.log(`❌ Failed or no URL: ${downloadCount - successCount} files`);
  console.log(`📁 Download directory: ${downloadDir}`);
  
  // List all files in download directory
  const files = fs.readdirSync(downloadDir);
  console.log(`\n📋 Total files in download directory: ${files.length}`);
  
  if (files.length > 0) {
    console.log('\nFiles in download directory:');
    files.forEach(file => {
      const stat = fs.statSync(path.join(downloadDir, file));
      const sizeKB = Math.round(stat.size / 1024);
      console.log(`  📄 ${file} (${sizeKB} KB)`);
    });
  }
}

downloadAllFiles().catch(console.error);
