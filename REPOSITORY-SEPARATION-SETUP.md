# 🚀 Setup Complet pentru Repository Separat cu Auto-Deploy

## 📋 Configurație Repository Separat pentru Miseda Inspect SRL

### 🎯 Obiectiv:
- **Repository** → `/home/misedain/repositories/Miseda-Notificari`
- **Website** → `/home/misedain/public_html` (doar conținutul din `client/build/`)

---

## 1️⃣ Setup în cPanel - Git Version Control

### Creează Repository:
```bash
Repository Path: /home/misedain/repositories/Miseda-Notificari
Repository URL: https://github.com/AduAdrian/Miseda-Notificari.git  
Branch: master
Document Root: ❌ NU bifa (repository separat!)
```

---

## 2️⃣ Upload Script-uri de Deployment (prin cPanel File Manager)

### A. Upload `deploy.sh` în `/home/misedain/`:
- Folosește fișierul `deploy.sh` din acest repository
- Setează permissions: `chmod +x /home/misedain/deploy.sh`

### B. Configurează Git Hook:
- Navighează la: `/home/misedain/repositories/Miseda-Notificari/.git/hooks/`
- Upload `post-receive` (fără extensie)
- Setează permissions: `chmod +x post-receive`

---

## 3️⃣ Configurare în VS Code pentru Deployment

### Adaugă Remote pentru Production:
```bash
# SSH cu cPanel (înlocuiește cu datele tale)
git remote add production ssh://misedain@misedainspectsrl.ro:2222/home/misedain/repositories/Miseda-Notificari

# Pentru deployment direct
git push production master
```

### Alternativ - prin GitHub (recomandat):
```bash
# Push normal la GitHub
git push origin master

# Apoi în cPanel Git: "Update from Remote"
```

---

## 4️⃣ Procesul de Deployment Automată

### Ce se întâmplă automat:
1. 📡 **Git pull** latest changes
2. 🧹 **Clean public_html** (păstrează .htaccess)
3. 📦 **Copy** doar `client/build/*` → `public_html/`
4. 🖥️ **Copy server files** (dacă există backend)
5. 📦 **Install dependencies** în production
6. 🔧 **Set permissions** corecte
7. 📝 **Log deployment** pentru debugging

### Fișiere copiate în public_html:
```
public_html/
├── index.html          # React app
├── static/             # CSS, JS, assets
├── favicon.ico         # Icons
├── manifest.json       # PWA manifest
├── robots.txt          # SEO
├── server.js           # Backend (dacă există)
├── package.json        # Dependencies
└── node_modules/       # Production packages
```

---

## 5️⃣ Workflow de Dezvoltare

### Development:
```bash
# Local development
npm run dev                 # Test local

# Build pentru production
cd client
npm run build              # Creează build/ folder

# Commit & Push
git add .
git commit -m "Update app"
git push origin master     # → GitHub
```

### Deployment:
```bash
# Opțiunea 1: cPanel GUI
# Du-te la Git Version Control → "Update from Remote"

# Opțiunea 2: SSH Direct
git push production master

# Opțiunea 3: Webhook (advanced)
# Configurează GitHub webhook pentru auto-deploy
```

---

## 6️⃣ Verificare Deployment

### Check Website:
- 🌐 **Frontend**: https://misedainspectsrl.ro
- 🔧 **Admin**: https://misedainspectsrl.ro/admin (dacă există)
- 📊 **API**: https://misedainspectsrl.ro/api/health (test endpoint)

### Check Logs:
```bash
# Deployment logs
cat /home/misedain/deploy.log

# cPanel Error Logs
# Din cPanel → Errors → View
```

---

## 7️⃣ Beneficii Setup-ului

### ✅ Avantaje:
- 🔒 **Security**: Source code nu e web accessible
- ⚡ **Performance**: Doar build files în public_html
- 🔄 **Automation**: Deploy automat la fiecare push
- 🧹 **Clean**: Separare clară repo vs. website
- 📝 **Logging**: Track toate deployment-urile
- 🛡️ **Backup**: Repository complet separat

### 🎯 Rezultat Final:
```
/home/misedain/
├── repositories/           # 🔒 PRIVATE
│   └── Miseda-Notificari/  # Source code
│       ├── client/
│       ├── server/
│       ├── .cpanel.yml
│       └── deploy.sh
│
├── public_html/            # 🌐 PUBLIC
│   ├── index.html          # React app
│   ├── static/             # Build assets
│   └── server.js           # Backend API
│
└── deploy.sh               # 🚀 Deployment script
```

---

## 🚨 Notițe Importante:

1. **Build local înainte de deploy**: Asigură-te că `client/build/` există
2. **Permissions**: Script-urile trebuie să aibă `chmod +x`
3. **Backup**: Fă backup la .htaccess din public_html
4. **Testing**: Testează local înainte de push în producție
5. **SSH Keys**: Pentru deployment direct, configurează SSH keys

---

## 🎉 Gata! 

Acum ai setup complet pentru repository separat cu auto-deploy doar din folder-ul build!