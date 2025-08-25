# 🚀 Deployment Guide - PIW Pisz

## 📋 **Wymagania systemowe**
- **Node.js**: v18.19.0 (LTS) - **WAŻNE**: Nie używaj Node.js v22
- **NPM**: Najnowsza wersja
- **Git**: Zainstalowany
- **Port**: 3000 (lub inny dostępny)
- **Pamięć**: Minimum 2GB RAM
- **Dysk**: Minimum 1GB wolnego miejsca

## 🔧 **Konfiguracja środowiska**

### **1. Sprawdź wersję Node.js**
```bash
node --version
# Powinno pokazać: v18.19.0
```

### **2. Jeśli masz inną wersję, zmień na v18.19.0**
```bash
# Użyj NVM do zmiany wersji
nvm use 18.19.0

# Lub zainstaluj jeśli nie masz
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0
```

## 📥 **Pobieranie kodu**

### **1. Sklonuj repozytorium**
```bash
cd ~/websites
git clone https://github.com/SuperStonka/piw_pisz.git
cd piw_pisz
```

### **2. Sprawdź branch**
```bash
git branch
# Powinno pokazać: * master
```

### **3. Pobierz najnowsze zmiany**
```bash
git pull origin master
```

## ⚙️ **Konfiguracja aplikacji**

### **1. Stwórz plik środowiskowy**
```bash
cp env.production .env.local
```

### **2. Sprawdź zawartość .env.local**
```bash
cat .env.local
```

**Powinno zawierać (dla produkcji):**
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://bippiwpisz.arstudio.atthost24.pl
DB_HOST=localhost
DB_USER=9518_piwpisz
DB_PASSWORD=Rs75Nz#$UB65@
DB_NAME=9518_piwpisz
DB_PORT=3306
PORT=3000
```

**Uwaga:** W produkcji `DB_HOST=localhost` (baza lokalna na serwerze), w development `DB_HOST=arstudio.atthost24.pl` (baza zdalna)

## 📦 **Instalacja zależności**

### **1. Wyczyść cache npm**
```bash
npm cache clean --force
```

### **2. Usuń istniejące node_modules**
```bash
rm -rf node_modules
rm -rf .next
rm package-lock.json
```

### **3. Zainstaluj zależności**
```bash
npm install
```

## 🏗️ **Build aplikacji**

### **1. Sprawdź konfigurację Next.js**
```bash
cat next.config.mjs
```

**Powinno NIE zawierać:**
```javascript
experimental: { turbo: false }
```

### **2. Uruchom build**
```bash
npm run build
```

**Oczekiwany wynik:**
```
✓ Creating an optimized production build
✓ Compiled successfully
```

### **3. Jeśli build się nie powiedzie**
```bash
# Spróbuj z ograniczoną liczbą wątków
NEXT_WORKER_THREADS=1 npm run build

# Lub z ograniczoną pamięcią
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

## 🚀 **Uruchomienie aplikacji**

### **1. Sprawdź czy port 3000 jest wolny**
```bash
ss -tlnp | grep :3000
# Lub
lsof -i :3000
```

### **2. Jeśli port jest zajęty, zabij procesy**
```bash
# Zabij wszystkie procesy npm/node
pkill -9 -f npm
pkill -9 -f node

# Lub użyj PM2
pm2 stop all
pm2 delete all
```

### **3. Uruchom aplikację**
```bash
npm start
```

**Oczekiwany wynik:**
```
> my-v0-project@0.1.0 start
> next start

▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Network:      http://[IP]:3000
✓ Starting...
```

## 🌐 **Konfiguracja Nginx (Reverse Proxy)**

### **1. Stwórz plik konfiguracyjny Nginx**
```bash
sudo nano /etc/nginx/sites-available/piw-pisz
```

### **2. Dodaj konfigurację**
```nginx
server {
    listen 80;
    server_name bippiwpisz.arstudio.atthost24.pl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Obsługa plików statycznych
    location /_next/static/ {
        alias /home/arstudio/websites/piw_pisz/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Obsługa uploadów
    location /uploads/ {
        alias /home/arstudio/websites/piw_pisz/public/uploads/;
        expires 1d;
    }
}
```

### **3. Aktywuj konfigurację**
```bash
sudo ln -s /etc/nginx/sites-available/piw-pisz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 **Konfiguracja SSL (HTTPS)**

### **1. Zainstaluj Certbot**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### **2. Uzyskaj certyfikat SSL**
```bash
sudo certbot --nginx -d bippiwpisz.arstudio.atthost24.pl
```

## 📊 **Monitoring i zarządzanie procesami**

### **1. Użyj PM2 do zarządzania procesami**
```bash
# Zainstaluj PM2 globalnie
npm install -g pm2

# Uruchom aplikację przez PM2
pm2 start npm --name "piw-pisz" -- start

# Sprawdź status
pm2 status

# Logi
pm2 logs piw-pisz

# Restart
pm2 restart piw-pisz

# Stop
pm2 stop piw-pisz
```

### **2. Automatyczne uruchamianie po restarcie serwera**
```bash
pm2 startup
pm2 save
```

## 🧪 **Testowanie deploymentu**

### **1. Sprawdź czy aplikacja działa**
```bash
curl http://localhost:3000
```

### **2. Sprawdź logi**
```bash
# Jeśli używasz npm start
tail -f ~/.npm/_logs/*.log

# Jeśli używasz PM2
pm2 logs piw-pisz
```

### **3. Sprawdź błędy w przeglądarce**
- Otwórz: https://bippiwpisz.arstudio.atthost24.pl
- Sprawdź Console (F12) pod kątem błędów
- Sprawdź Network tab pod kątem nieudanych requestów

## 🔄 **Aktualizacje**

### **1. Pobierz najnowsze zmiany**
```bash
git pull origin master
```

### **2. Zainstaluj nowe zależności**
```bash
npm install
```

### **3. Zbuduj ponownie**
```bash
npm run build
```

### **4. Restart aplikacji**
```bash
# Jeśli używasz npm start
pkill -f "npm start"
npm start

# Jeśli używasz PM2
pm2 restart piw-pisz
```

## 🚨 **Rozwiązywanie problemów**

### **Problem: Port 3000 zajęty**
```bash
# Sprawdź co używa portu
ss -tlnp | grep :3000

# Zabij procesy
pkill -9 -f node
pkill -9 -f npm
```

### **Problem: Build nie działa**
```bash
# Sprawdź wersję Node.js
node --version

# Wyczyść cache
rm -rf .next
rm -rf node_modules/.cache

# Spróbuj z ograniczoną pamięcią
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

### **Problem: Błąd EADDRINUSE**
```bash
# Zmień port w .env.local
PORT=3001

# Lub zabij procesy używające port 3000
pkill -9 -f "npm start"
```

### **Problem: Błąd EAGAIN**
```bash
# Sprawdź limity systemowe
ulimit -n
ulimit -u

# Zwiększ limity
ulimit -n 4096
ulimit -u 2048

# Spróbuj build z ograniczoną liczbą wątków
NEXT_WORKER_THREADS=1 npm run build
```

### **Problem: ThreadPoolBuildError (rayon-core)**
```bash
# To jest błąd systemowy związany z limitami zasobów
# Użyj dedykowanego skryptu naprawy:
chmod +x fix-build-errors.sh
./fix-build-errors.sh

# Lub spróbuj ręcznie:
# Metoda 1: Ograniczone wątki
NEXT_WORKER_THREADS=1 npm run build

# Metoda 2: Ograniczona pamięć
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Metoda 3: Ograniczone wątki + pamięć
NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Metoda 4: Bardzo ograniczone zasoby
NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=512" npm run build

# Jeśli nic nie pomaga, zwiększ limity systemowe:
sudo ulimit -n 4096
sudo ulimit -u 2048
```

## 📞 **Wsparcie**

### **Logi do sprawdzenia:**
- **Aplikacja**: `~/.npm/_logs/` lub `pm2 logs`
- **Nginx**: `sudo tail -f /var/log/nginx/error.log`
- **System**: `journalctl -u nginx`

### **Kluczowe pliki:**
- **Konfiguracja**: `next.config.mjs`
- **Środowisko**: `.env.local`
- **Nginx**: `/etc/nginx/sites-available/piw-pisz`

---

## ✅ **Checklist deploymentu**

- [ ] Node.js v18.19.0 zainstalowany
- [ ] Repozytorium sklonowane
- [ ] Plik .env.local utworzony
- [ ] Zależności zainstalowane
- [ ] Build udany
- [ ] Port 3000 wolny
- [ ] Aplikacja uruchomiona
- [ ] Nginx skonfigurowany
- [ ] SSL skonfigurowany
- [ ] Aplikacja dostępna przez HTTPS
- [ ] PM2 skonfigurowany (opcjonalnie)

**🎯 Gotowe do deploymentu!**
