# Instrukcje Deploymentu - PIW Pisz

## 🌐 Domena produkcyjna
**URL**: https://bippiwpisz.arstudio.atthost24.pl

## 🚀 Deployment na serwerze

### 1. Pobierz kod z Git
```bash
git clone https://github.com/SuperStonka/piw_pisz.git
cd piw_pisz
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Skonfiguruj zmienne środowiskowe
```bash
# Skopiuj plik env.production
cp env.production .env.local

# Edytuj dane bazy danych
nano .env.local
```

### 4. Zbuduj projekt
```bash
npm run build:prod
```

### 5. Uruchom aplikację
```bash
npm run start:prod
```

## 🔧 Konfiguracja serwera

### Port aplikacji
- **Port**: 3000
- **URL**: http://localhost:3000

### Reverse Proxy (Nginx/Apache)
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📁 Struktura plików
```
piw_pisz/
├── .next/           # Zbudowana aplikacja
├── public/          # Pliki statyczne
├── .env.local       # Zmienne środowiskowe
└── package.json     # Zależności
```

## 🚨 Ważne uwagi
- Upewnij się, że port 3000 jest otwarty
- Skonfiguruj SSL/HTTPS dla domeny
- Ustaw odpowiednie uprawnienia do plików
- Skonfiguruj PM2 lub systemd dla automatycznego uruchamiania
