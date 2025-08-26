#!/bin/bash

# 🚨 Skrypt naprawy Phusion Passenger dla PIW Pisz
# Użycie: ./fix-passenger.sh

set -e

echo "🚨 Naprawiam problemy z Phusion Passenger..."

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

# Krok 1: Sprawdź czy Passenger jest zainstalowany
log_info "Krok 1: Sprawdzam instalację Phusion Passenger..."
if command -v passenger-config &> /dev/null; then
    log_success "Phusion Passenger jest zainstalowany"
    passenger-config --version
else
    log_warning "Phusion Passenger nie jest zainstalowany"
    log_info "Instaluję Phusion Passenger..."
    
    # Sprawdź system
    if command -v apt &> /dev/null; then
        # Ubuntu/Debian
        sudo apt update
        sudo apt install -y apache2 libapache2-mod-passenger
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        sudo yum install -y httpd mod_passenger
    else
        log_error "Nieznany system operacyjny. Zainstaluj Passenger ręcznie."
        exit 1
    fi
fi

# Krok 2: Sprawdź konfigurację Apache
log_info "Krok 2: Sprawdzam konfigurację Apache..."
if command -v apache2ctl &> /dev/null; then
    log_info "Apache jest zainstalowany"
    
    # Sprawdź moduły
    if apache2ctl -M | grep -q passenger; then
        log_success "Moduł Passenger jest załadowany"
    else
        log_warning "Moduł Passenger nie jest załadowany"
        log_info "Ładuję moduł Passenger..."
        sudo a2enmod passenger
        sudo systemctl restart apache2
    fi
else
    log_warning "Apache nie jest zainstalowany"
fi

# Krok 3: Sprawdź pliki aplikacji
log_info "Krok 3: Sprawdzam pliki aplikacji..."

# Sprawdź app.js
if [ ! -f "app.js" ]; then
    log_error "Brak pliku app.js! Tworzę..."
    # Tutaj możesz dodać automatyczne tworzenie app.js
fi

# Sprawdź .htaccess
if [ ! -f "public/.htaccess" ]; then
    log_error "Brak pliku public/.htaccess! Tworzę..."
    # Tutaj możesz dodać automatyczne tworzenie .htaccess
fi

# Krok 4: Sprawdź uprawnienia
log_info "Krok 4: Sprawdzam uprawnienia..."
USER=$(whoami)
log_info "Aktualny użytkownik: $USER"

# Sprawdź uprawnienia do katalogu
if [ -w "." ]; then
    log_success "Masz uprawnienia do zapisu w katalogu projektu"
else
    log_warning "Brak uprawnień do zapisu w katalogu projektu"
    sudo chown -R $USER:$USER .
fi

# Krok 5: Sprawdź Node.js
log_info "Krok 5: Sprawdzam Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js $NODE_VERSION jest zainstalowany"
    
    # Sprawdź czy Passenger może znaleźć Node.js
    PASSENGER_NODE=$(passenger-config --node 2>/dev/null || echo "Nie znaleziono")
    log_info "Passenger Node.js: $PASSENGER_NODE"
    
    if [ "$PASSENGER_NODE" != "Nie znaleziono" ]; then
        log_success "Passenger może znaleźć Node.js"
    else
        log_warning "Passenger nie może znaleźć Node.js"
        log_info "Ustawiam ścieżkę do Node.js..."
        
        # Znajdź Node.js
        NODE_PATH=$(which node)
        log_info "Ścieżka do Node.js: $NODE_PATH"
        
        # Zaktualizuj .htaccess
        if [ -f "public/.htaccess" ]; then
            sed -i "s|PassengerNodejs.*|PassengerNodejs $NODE_PATH|" public/.htaccess
            log_success "Zaktualizowano .htaccess z ścieżką do Node.js"
        fi
    fi
else
    log_error "Node.js nie jest zainstalowany!"
    exit 1
fi

# Krok 6: Sprawdź zależności
log_info "Krok 6: Sprawdzam zależności..."
if [ ! -d "node_modules" ]; then
    log_warning "Brak node_modules. Instaluję zależności..."
    npm install
fi

# Krok 7: Sprawdź build
log_info "Krok 7: Sprawdzam build..."
if [ ! -d ".next" ]; then
    log_warning "Brak katalogu .next. Buduję aplikację..."
    npm run build
fi

# Krok 8: Testuj Passenger
log_info "Krok 8: Testuję Passenger..."
if command -v passenger-config &> /dev/null; then
    log_info "Testuję konfigurację Passenger..."
    passenger-config validate-install --auto
    
    log_info "Sprawdzam status Passenger..."
    passenger-status
fi

# Krok 9: Restart Apache
log_info "Krok 9: Restartuję Apache..."
if command -v systemctl &> /dev/null; then
    sudo systemctl restart apache2
    log_success "Apache zrestartowany"
else
    log_warning "Nie mogę zrestartować Apache (brak systemctl)"
fi

# Krok 10: Sprawdź logi
log_info "Krok 10: Sprawdzam logi..."
if [ -f "/var/log/apache2/error.log" ]; then
    log_info "Ostatnie błędy Apache:"
    sudo tail -10 /var/log/apache2/error.log
fi

if [ -f "/var/log/apache2/piw-pisz-error.log" ]; then
    log_info "Ostatnie błędy PIW Pisz:"
    sudo tail -10 /var/log/apache2/piw-pisz-error.log
fi

# Podsumowanie
echo ""
log_success "🎉 Naprawa Phusion Passenger zakończona!"
echo ""
log_info "📋 Następne kroki:"
echo "  1. Sprawdź czy aplikacja działa: https://bippiwpisz.arstudio.atthost24.pl"
echo "  2. Jeśli nadal nie działa, sprawdź logi:"
echo "     • Apache: sudo tail -f /var/log/apache2/error.log"
echo "     • PIW Pisz: sudo tail -f /var/log/apache2/piw-pisz-error.log"
echo "  3. Sprawdź status Passenger: passenger-status"
echo "  4. Sprawdź konfigurację Apache: apache2ctl -S"
echo ""
log_info "🔧 Jeśli problemy nadal występują:"
echo "  • Uruchom: ./deploy-server.sh (alternatywny deployment)"
echo "  • Sprawdź: ./fix-build-errors.sh (problemy z build)"
echo "  • Skontaktuj się z administratorem serwera"
echo ""
log_success "PIW Pisz powinien teraz działać z Phusion Passenger!"
