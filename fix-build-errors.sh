#!/bin/bash

# 🚨 Skrypt naprawy błędów build - ThreadPoolBuildError
# Użycie: ./fix-build-errors.sh

set -e

echo "🚨 Naprawiam błędy build - ThreadPoolBuildError..."

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

# Sprawdź wersję Node.js
log_info "Sprawdzam wersję Node.js..."
NODE_VERSION=$(node --version)
log_info "Wersja Node.js: $NODE_VERSION"

if [[ $NODE_VERSION != v18* ]]; then
    log_warning "Używasz Node.js $NODE_VERSION. Zalecana wersja: v18.19.0"
    log_info "Możesz zmienić wersję używając: nvm use 18.19.0"
fi

# Sprawdź limity systemowe
log_info "Sprawdzam limity systemowe..."
log_info "ulimit -n (deskryptory plików): $(ulimit -n)"
log_info "ulimit -u (procesy użytkownika): $(ulimit -u)"

# Sprawdź dostępne zasoby
log_info "Sprawdzam dostępne zasoby..."
if command -v free &> /dev/null; then
    log_info "Pamięć RAM:"
    free -h
fi

if command -v df &> /dev/null; then
    log_info "Wolne miejsce na dysku:"
    df -h .
fi

# Sprawdź procesy Node.js
log_info "Sprawdzam procesy Node.js..."
if pgrep -f "node" > /dev/null; then
    log_warning "Znaleziono uruchomione procesy Node.js:"
    pgrep -f "node" | xargs ps -o pid,cmd --no-headers
    read -p "Czy chcesz zabić wszystkie procesy Node.js? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Zabijam procesy Node.js..."
        pkill -9 -f node || true
        log_success "Procesy Node.js zabite"
    fi
fi

# Wyczyść cache
log_info "Czyszczę cache..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force
log_success "Cache wyczyszczony"

# Metoda 1: Ograniczona liczba wątków
log_info "Metoda 1: Ograniczona liczba wątków (NEXT_WORKER_THREADS=1)..."
if NEXT_WORKER_THREADS=1 npm run build; then
    log_success "🎉 Build zakończony pomyślnie (metoda 1)!"
    exit 0
else
    log_warning "Metoda 1 nie powiodła się"
fi

# Metoda 2: Ograniczona pamięć
log_info "Metoda 2: Ograniczona pamięć (NODE_OPTIONS='--max-old-space-size=1024')..."
if NODE_OPTIONS="--max-old-space-size=1024" npm run build; then
    log_success "🎉 Build zakończony pomyślnie (metoda 2)!"
    exit 0
else
    log_warning "Metoda 2 nie powiodła się"
fi

# Metoda 3: Ograniczone wątki + pamięć
log_info "Metoda 3: Ograniczone wątki + pamięć..."
if NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build; then
    log_success "🎉 Build zakończony pomyślnie (metoda 3)!"
    exit 0
else
    log_warning "Metoda 3 nie powiodła się"
fi

# Metoda 4: Bardzo ograniczone zasoby
log_info "Metoda 4: Bardzo ograniczone zasoby..."
if NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=512" npm run build; then
    log_success "🎉 Build zakończony pomyślnie (metoda 4)!"
    exit 0
else
    log_warning "Metoda 4 nie powiodła się"
fi

# Metoda 5: Wyłącz paralelizm
log_info "Metoda 5: Wyłącz paralelizm..."
if NEXT_WORKER_THREADS=1 NODE_OPTIONS="--max-old-space-size=256 --no-parallel" npm run build; then
    log_success "🎉 Build zakończony pomyślnie (metoda 5)!"
    exit 0
else
    log_warning "Metoda 5 nie powiodła się"
fi

# Metoda 6: Użyj starszej wersji Next.js
log_info "Metoda 6: Sprawdzam starsze wersje Next.js..."
if npm list next | grep -q "next@"; then
    CURRENT_NEXT=$(npm list next | grep "next@" | head -1)
    log_info "Aktualna wersja Next.js: $CURRENT_NEXT"
    
    read -p "Czy chcesz spróbować downgrade Next.js do wersji 14? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Instaluję Next.js 14..."
        npm install next@14
        if npm run build; then
            log_success "🎉 Build zakończony pomyślnie (Next.js 14)!"
            exit 0
        else
            log_warning "Downgrade Next.js nie pomógł"
        fi
    fi
fi

# Wszystkie metody nie powiodły się
log_error "❌ Wszystkie metody build nie powiodły się!"
echo ""
log_info "🔧 Zalecane kroki naprawy:"
echo "1. Zwiększ limity systemowe:"
echo "   sudo ulimit -n 4096"
echo "   sudo ulimit -u 2048"
echo ""
echo "2. Sprawdź dostępne zasoby:"
echo "   free -h"
echo "   df -h"
echo ""
echo "3. Zabij wszystkie procesy Node.js:"
echo "   pkill -9 -f node"
echo "   pkill -9 -f npm"
echo ""
echo "4. Spróbuj na innym serwerze z większymi zasobami"
echo ""
echo "5. Sprawdź logi systemowe:"
echo "   journalctl -u systemd-user-sessions"
echo "   dmesg | tail -20"
echo ""
log_error "Build nie może być zakończony na tym serwerze!"
exit 1
