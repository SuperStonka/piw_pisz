#!/bin/bash

# 📊 Skrypt konfiguracji PM2 dla PIW Pisz
# Użycie: ./pm2-setup.sh

set -e

echo "📊 Konfiguruję PM2 dla PIW Pisz..."

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

# Sprawdź czy PM2 jest zainstalowany
if ! command -v pm2 &> /dev/null; then
    log_info "Instaluję PM2 globalnie..."
    npm install -g pm2
    log_success "PM2 zainstalowany"
else
    log_info "PM2 już zainstalowany"
fi

# Sprawdź czy jesteśmy w katalogu projektu
if [ ! -f "package.json" ]; then
    log_error "Nie jesteś w katalogu projektu! Przejdź do katalogu z package.json"
    exit 1
fi

# Zatrzymaj istniejące procesy PM2
log_info "Zatrzymuję istniejące procesy PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Stwórz plik konfiguracyjny PM2
log_info "Tworzę plik konfiguracyjny PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'piw-pisz',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
EOF

# Stwórz katalog na logi
log_info "Tworzę katalog na logi..."
mkdir -p logs

# Uruchom aplikację przez PM2
log_info "Uruchamiam aplikację przez PM2..."
pm2 start ecosystem.config.js --env production

# Sprawdź status
log_info "Sprawdzam status PM2..."
pm2 status

# Skonfiguruj automatyczne uruchamianie po restarcie serwera
log_info "Konfiguruję automatyczne uruchamianie po restarcie serwera..."
pm2 startup
pm2 save

log_success "🎉 PM2 skonfigurowany pomyślnie!"

# Instrukcje
echo ""
log_info "📋 Instrukcje zarządzania:"
echo "  • Sprawdź status: pm2 status"
echo "  • Zobacz logi: pm2 logs piw-pisz"
echo "  • Restart: pm2 restart piw-pisz"
echo "  • Stop: pm2 stop piw-pisz"
echo "  • Start: pm2 start piw-pisz"
echo "  • Monitor: pm2 monit"
echo ""
log_info "🔗 Aplikacja powinna być dostępna pod adresem:"
echo "  • Lokalnie: http://localhost:3001"
echo "  • Przez domenę: https://bippiwpisz.arstudio.atthost24.pl"
echo ""
log_info "📊 Monitoring w czasie rzeczywistym:"
echo "  pm2 monit"
