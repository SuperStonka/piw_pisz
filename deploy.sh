#!/bin/bash

# 🚀 Skrypt Deploymentu - PIW Pisz
# Użycie: ./deploy.sh

set -e  # Zatrzymaj skrypt przy pierwszym błędzie

echo "🚀 Rozpoczynam deployment PIW Pisz..."

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
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

# Sprawdź czy jesteśmy w odpowiednim katalogu
if [ ! -f "package.json" ]; then
    log_error "Nie jesteś w katalogu projektu! Przejdź do katalogu z package.json"
    exit 1
fi

# Sprawdź wersję Node.js
log_info "Sprawdzam wersję Node.js..."
NODE_VERSION=$(node --version)
log_info "Wersja Node.js: $NODE_VERSION"

if [[ $NODE_VERSION != v18* ]]; then
    log_warning "Używasz Node.js $NODE_VERSION. Zalecana wersja: v18.19.0"
    log_info "Możesz zmienić wersję używając: nvm use 18.19.0"
fi

# Sprawdź czy Git jest zainstalowany
if ! command -v git &> /dev/null; then
    log_error "Git nie jest zainstalowany!"
    exit 1
fi

# Sprawdź status Git
log_info "Sprawdzam status Git..."
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Aktualny branch: $CURRENT_BRANCH"
    
    if [ "$CURRENT_BRANCH" != "master" ]; then
        log_warning "Nie jesteś na branch master! Przełącz na master: git checkout master"
    fi
    
    # Pobierz najnowsze zmiany
    log_info "Pobieram najnowsze zmiany z Git..."
    git pull origin master
    log_success "Git zaktualizowany"
else
    log_error "Nie jesteś w repozytorium Git!"
    exit 1
fi

# Sprawdź czy istnieje plik .env.local
if [ ! -f ".env.local" ]; then
    log_warning "Brak pliku .env.local"
    if [ -f "env.production" ]; then
        log_info "Kopiuję env.production do .env.local..."
        cp env.production .env.local
        log_success "Plik .env.local utworzony"
    else
        log_error "Brak pliku env.production! Utwórz plik .env.local z odpowiednimi zmiennymi"
        exit 1
    fi
fi

# Wyczyść cache i node_modules
log_info "Czyszczę cache i node_modules..."
rm -rf .next
rm -rf node_modules/.cache

if [ -d "node_modules" ]; then
    log_info "Usuwam istniejące node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    log_info "Usuwam package-lock.json..."
    rm package-lock.json
fi

# Instalacja zależności
log_info "Instaluję zależności..."
npm cache clean --force
npm install
log_success "Zależności zainstalowane"

# Sprawdź konfigurację Next.js
log_info "Sprawdzam konfigurację Next.js..."
if grep -q "experimental: { turbo: false }" next.config.mjs; then
    log_error "Wykryto nieprawidłową konfigurację experimental.turbo w next.config.mjs!"
    log_info "Usuń linię 'experimental: { turbo: false }' z next.config.mjs"
    exit 1
fi
log_success "Konfiguracja Next.js poprawna"

# Build aplikacji
log_info "Buduję aplikację..."
if npm run build; then
    log_success "Build zakończony pomyślnie"
else
    log_error "Build nie powiódł się!"
    log_info "Próbuję alternatywne metody build..."
    
    # Metoda 1: Ograniczona liczba wątków
    log_info "Metoda 1: Ograniczona liczba wątków..."
    if NEXT_WORKER_THREADS=1 npm run build; then
        log_success "Build zakończony pomyślnie (metoda 1)"
    else
        log_warning "Metoda 1 nie powiodła się, próbuję metodę 2..."
        
        # Metoda 2: Ograniczona pamięć
        log_info "Metoda 2: Ograniczona pamięć..."
        if NODE_OPTIONS="--max-old-space-size=1024" npm run build; then
            log_success "Build zakończony pomyślnie (metoda 2)"
        else
            log_warning "Metoda 2 nie powiodła się, próbuję metodę 3..."
            
            # Metoda 3: Ograniczone wątki + pamięć
            log_info "Metoda 3: Ograniczone wątki + pamięć..."
            if NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build; then
                log_success "Build zakończony pomyślnie (metoda 3)"
            else
                log_warning "Metoda 3 nie powiodła się, próbuję metodę 4..."
                
                # Metoda 4: Bardzo ograniczone zasoby
                log_info "Metoda 4: Bardzo ograniczone zasoby..."
                if NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=512 --max-old-space-size=256" npm run build; then
                    log_success "Build zakończony pomyślnie (metoda 4)"
                else
                    log_error "Wszystkie metody build nie powiodły się!"
                    log_info "Sprawdź limity systemowe: ulimit -n, ulimit -u"
                    log_info "Zwiększ limity: ulimit -n 4096, ulimit -u 2048"
                    log_info "Lub spróbuj na innym serwerze z większymi zasobami"
                    exit 1
                fi
            fi
        fi
    fi
fi

# Sprawdź czy port 3000 jest wolny
log_info "Sprawdzam czy port 3000 jest wolny..."
if command -v ss &> /dev/null; then
    PORT_CHECK=$(ss -tlnp | grep :3000 || true)
elif command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tlnp | grep :3000 || true)
else
    log_warning "Nie mogę sprawdzić portu (brak ss/netstat)"
    PORT_CHECK=""
fi

if [ ! -z "$PORT_CHECK" ]; then
    log_warning "Port 3000 jest zajęty!"
    log_info "Procesy używające port 3000:"
    echo "$PORT_CHECK"
    
    read -p "Czy chcesz zabić procesy używające port 3000? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Zabijam procesy używające port 3000..."
        pkill -9 -f node || true
        pkill -9 -f npm || true
        log_success "Procesy zabite"
    else
        log_warning "Port 3000 nadal zajęty. Uruchom aplikację na innym porcie: PORT=3001 npm start"
    fi
else
    log_success "Port 3000 jest wolny"
fi

# Uruchom aplikację
log_info "Uruchamiam aplikację..."
if npm start; then
    log_success "Aplikacja uruchomiona pomyślnie!"
    log_info "Aplikacja dostępna pod adresem: http://localhost:3000"
    log_info "Naciśnij Ctrl+C aby zatrzymać"
else
    log_error "Nie udało się uruchomić aplikacji!"
    exit 1
fi

log_success "🎉 Deployment zakończony pomyślnie!"
log_info "Następne kroki:"
log_info "1. Skonfiguruj Nginx jako reverse proxy"
log_info "2. Ustaw SSL/HTTPS"
log_info "3. Skonfiguruj PM2 dla automatycznego uruchamiania"
log_info "4. Sprawdź czy aplikacja działa pod domeną: https://bippiwpisz.arstudio.atthost24.pl"
