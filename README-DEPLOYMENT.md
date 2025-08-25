# 🚀 Szybki Deployment - PIW Pisz

## ⚡ **Deployment w 5 minut**

### **1. Na serwerze zdalnym:**
```bash
cd ~/websites
git clone https://github.com/SuperStonka/piw_pisz.git
cd piw_pisz
```

### **2. Uruchom automatyczny deployment:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### **3. Skonfiguruj Nginx:**
```bash
sudo cp nginx-piw-pisz.conf /etc/nginx/sites-available/piw-pisz
sudo ln -s /etc/nginx/sites-available/piw-pisz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **4. Skonfiguruj PM2 (opcjonalnie):**
```bash
chmod +x pm2-setup.sh
./pm2-setup.sh
```

### **5. SSL/HTTPS:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bippiwpisz.arstudio.atthost24.pl
```

## 📋 **Wymagania**
- Node.js v18.19.0 (LTS)
- Git
- Nginx
- Port 3000 wolny

## 🔗 **Dokumentacja**
- **Pełny guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Skrypt deploymentu**: [deploy.sh](deploy.sh)
- **Konfiguracja Nginx**: [nginx-piw-pisz.conf](nginx-piw-pisz.conf)
- **Konfiguracja PM2**: [pm2-setup.sh](pm2-setup.sh)

## 🎯 **Rezultat**
Aplikacja dostępna pod adresem: **https://bippiwpisz.arstudio.atthost24.pl**

---

**💡 Wszystkie pliki deploymentu są gotowe!**
