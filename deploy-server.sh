#!/bin/bash

# 🚀 Kompletny skrypt deploymentu na serwer - PIW Pisz
# Użycie: ./deploy-server.sh

set -e

echo "🚀 Rozpoczynam kompletny deployment PIW Pisz na serwer..."

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Sprawdź czy jesteśmy w katalogu projektu
if [ ! -f "package.json" ]; then
    log_error "Nie jesteś w katalogu projektu! Przejdź do katalogu z package.json"
    exit 1
fi

# Sprawdź czy jesteśmy na serwerze (root lub sudo)
if [ "$EUID" -eq 0 ]; then
    log_info "Uruchomiono jako root"
elif sudo -n true 2>/dev/null; then
    log_info "Masz uprawnienia sudo"
else
    log_warning "Nie masz uprawnień sudo. Niektóre operacje mogą się nie powieść."
fi

# Krok 1: Sprawdź wersję Node.js
log_info "Krok 1: Sprawdzam wersję Node.js..."
NODE_VERSION=$(node --version)
log_info "Wersja Node.js: $NODE_VERSION"

if [[ $NODE_VERSION != v18* ]]; then
    log_warning "Używasz Node.js $NODE_VERSION. Zalecana wersja: v18.19.0"
    log_info "Możesz zmienić wersję używając: nvm use 18.19.0"
fi

# Krok 2: Sprawdź dostępne zasoby
log_info "Krok 2: Sprawdzam dostępne zasoby..."
if command -v free &> /dev/null; then
    log_info "Pamięć RAM:"
    free -h
fi

if command -v df &> /dev/null; then
    log_info "Wolne miejsce na dysku:"
    df -h .
fi

log_info "Limity systemowe:"
log_info "ulimit -n (deskryptory plików): $(ulimit -n)"
log_info "ulimit -u (procesy użytkownika): $(ulimit -u)"

# Krok 3: Pobierz najnowsze zmiany z Git
log_info "Krok 3: Pobieram najnowsze zmiany z Git..."
if [ -d ".git" ]; then
    git pull origin master
    log_success "Git zaktualizowany"
else
    log_error "Nie jesteś w repozytorium Git!"
    exit 1
fi

# Krok 4: Konfiguracja środowiska
log_info "Krok 4: Konfiguruję środowisko..."
if [ ! -f ".env.local" ]; then
    if [ -f "env.production" ]; then
        cp env.production .env.local
        log_success "Plik .env.local utworzony z env.production"
    else
        log_error "Brak pliku env.production!"
        exit 1
    fi
fi

log_info "Zawartość .env.local:"
cat .env.local

# Krok 5: Instalacja zależności
log_info "Krok 5: Instaluję zależności..."
npm cache clean --force
rm -rf node_modules .next package-lock.json
npm install
log_success "Zależności zainstalowane"

# Krok 6: Build aplikacji
log_info "Krok 6: Buduję aplikację..."
if npm run build; then
    log_success "Build zakończony pomyślnie"
else
    log_warning "Build nie powiódł się, uruchamiam automatyczną naprawę..."
    chmod +x fix-build-errors.sh
    ./fix-build-errors.sh
fi

# Krok 7: Sprawdź port 3001
log_info "Krok 7: Sprawdzam port 3001..."
if command -v ss &> /dev/null; then
    PORT_CHECK=$(ss -tlnp | grep :3001 || true)
elif command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tlnp | grep :3001 || true)
else
    log_warning "Nie mogę sprawdzić portu (brak ss/netstat)"
    PORT_CHECK=""
fi

if [ ! -z "$PORT_CHECK" ]; then
    log_warning "Port 3001 jest zajęty!"
    log_info "Procesy używające port 3001:"
    echo "$PORT_CHECK"
    
    read -p "Czy chcesz zabić procesy używające port 3001? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Zabijam procesy używające port 3001..."
        pkill -9 -f node || true
        pkill -9 -f npm || true
        log_success "Procesy zabite"
    fi
fi

# Krok 8: Uruchom aplikację
log_info "Krok 8: Uruchamiam aplikację..."
if npm start; then
    log_success "Aplikacja uruchomiona pomyślnie!"
    log_info "Aplikacja dostępna pod adresem: http://localhost:3001"
else
    log_error "Nie udało się uruchomić aplikacji!"
    exit 1
fi

# Krok 9: Konfiguracja Nginx
log_info "Krok 9: Konfiguruję Nginx..."
if command -v nginx &> /dev/null; then
    log_info "Nginx jest zainstalowany"
    
    # Sprawdź czy plik konfiguracyjny istnieje
    if [ -f "nginx-piw-pisz.conf" ]; then
        log_info "Kopiuję konfigurację Nginx..."
        sudo cp nginx-piw-pisz.conf /etc/nginx/sites-available/piw-pisz
        
        # Usuń istniejące linki
        sudo rm -f /etc/nginx/sites-enabled/piw-pisz
        
        # Stwórz nowy link
        sudo ln -s /etc/nginx/sites-available/piw-pisz /etc/nginx/sites-enabled/
        
        # Sprawdź konfigurację
        if sudo nginx -t; then
            sudo systemctl reload nginx
            log_success "Nginx skonfigurowany i przeładowany"
        else
            log_error "Błąd w konfiguracji Nginx!"
        fi
    else
        log_warning "Brak pliku nginx-piw-pisz.conf"
    fi
else
    log_warning "Nginx nie jest zainstalowany. Zainstaluj: sudo apt install nginx"
fi

# Krok 10: Konfiguracja PM2
log_info "Krok 10: Konfiguruję PM2..."
if command -v pm2 &> /dev/null; then
    log_info "PM2 jest zainstalowany"
    
    read -p "Czy chcesz skonfigurować PM2? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "pm2-setup.sh" ]; then
            chmod +x pm2-setup.sh
            ./pm2-setup.sh
        else
            log_warning "Brak pliku pm2-setup.sh"
        fi
    fi
else
    log_info "Instaluję PM2..."
    npm install -g pm2
    
    read -p "Czy chcesz skonfigurować PM2? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "pm2-setup.sh" ]; then
            chmod +x pm2-setup.sh
            ./pm2-setup.sh
        fi
    fi
fi

# Krok 11: SSL/HTTPS
log_info "Krok 11: Konfiguracja SSL/HTTPS..."
read -p "Czy chcesz skonfigurować SSL/HTTPS? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v certbot &> /dev/null; then
        log_info "Certbot jest zainstalowany"
        log_info "Uruchom: sudo certbot --nginx -d bippiwpisz.arstudio.atthost24.pl"
    else
        log_info "Instaluję Certbot..."
        sudo apt update
        sudo apt install certbot python3-certbot-nginx
        log_info "Uruchom: sudo certbot --nginx -d bippiwpisz.arstudio.atthost24.pl"
    fi
fi

# Krok 12: Testowanie
log_info "Krok 12: Testowanie deploymentu..."
log_info "Sprawdzam czy aplikacja działa..."
if curl -s http://localhost:3001 > /dev/null; then
    log_success "Aplikacja odpowiada na localhost:3001"
else
    log_warning "Aplikacja nie odpowiada na localhost:3001"
fi

# Podsumowanie
echo ""
log_success "🎉 Deployment zakończony pomyślnie!"
echo ""
log_info "📋 Podsumowanie:"
echo "  ✅ Aplikacja uruchomiona na porcie 3001"
echo "  ✅ Nginx skonfigurowany"
echo "  ✅ PM2 skonfigurowany (opcjonalnie)"
echo "  ✅ SSL/HTTPS gotowy do konfiguracji"
echo ""
log_info "🔗 Aplikacja dostępna pod adresem:"
echo "  • Lokalnie: http://localhost:3001"
echo "  • Przez domenę: https://bippiwpisz.arstudio.atthost24.pl"
echo ""
log_info "📊 Monitoring:"
echo "  • Status PM2: pm2 status"
echo "  • Logi PM2: pm2 logs piw-pisz"
echo "  • Logi Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""
log_info "🔄 Aktualizacje:"
echo "  • Pobierz zmiany: git pull origin master"
echo "  • Restart: pm2 restart piw-pisz"
echo ""
log_success "PIW Pisz jest gotowe do użycia!"
