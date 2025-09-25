# 🚀 Ghid de Deployment pentru cPanel

## Pasul 1: Configurarea Bazei de Date

### 1.1 Crează o nouă bază de date în cPanel
1. Accesează **phpMyAdmin** din cPanel
2. Creează o nouă bază de date: `misedainr_notifications`
3. Creează un utilizator pentru baza de date cu permisiuni complete
4. Rulează scriptul SQL din `server/database.sql` pentru a crea tabelele

### 1.2 Actualizează schema bazei de date
```sql
-- Dacă ai deja o bază de date cu schema veche, rulează aceste comenzi:
ALTER TABLE users 
ADD COLUMN nume VARCHAR(50) AFTER id,
ADD COLUMN prenume VARCHAR(50) AFTER nume,
ADD COLUMN telefon VARCHAR(20) AFTER prenume,
MODIFY COLUMN email VARCHAR(100) NULL,
DROP INDEX unique_email,
DROP INDEX unique_telefon,
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT unique_telefon UNIQUE (telefon),
ADD CONSTRAINT chk_contact CHECK (telefon IS NOT NULL OR email IS NOT NULL);

-- Actualizează indexurile
CREATE INDEX idx_users_telefon ON users(telefon);
```

## Pasul 2: Configurarea Environment Variables

### 2.1 Creează fișierul .env în folderul server
```bash
cp server/.env.example server/.env
```

### 2.2 Editează server/.env cu valorile reale:
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=generează_un_secret_de_minim_32_caractere_aici
DB_HOST=server50.romania-webhosting.com
DB_USER=misedainr
DB_PASSWORD=parola_ta_mysql_din_cpanel
DB_NAME=misedainr_notifications
ALLOWED_ORIGINS=https://misedainspectsrl.ro,https://www.misedainspectsrl.ro
```

## Pasul 3: Deployment Backend Node.js

### 3.1 În cPanel, activează Node.js
1. Mergi la **Node.js Apps** în cPanel
2. Creează o nouă aplicație Node.js:
   - **Node.js version**: 18.x sau mai nou
   - **Application root**: `/home/misedainr/repositories/Miseda-Notificari/server`
   - **Application URL**: `api` (va fi api.misedainspectsrl.ro)
   - **Application startup file**: `server.js`

### 3.2 Configurează variabilele de environment în cPanel
În secțiunea **Environment Variables**, adaugă:
- `NODE_ENV=production`
- `JWT_SECRET=your_secret_key`
- `DB_HOST=server50.romania-webhosting.com`
- `DB_USER=misedainr`
- `DB_PASSWORD=your_password`
- `DB_NAME=misedainr_notifications`

### 3.3 Instalează dependențele
În terminal-ul cPanel sau prin SSH:
```bash
cd /home/misedainr/repositories/Miseda-Notificari/server
npm install --production
```

## Pasul 4: Configurarea Frontend

### 4.1 Actualizează config.js în client
Editează `client/src/config.js`:
```javascript
const config = {
  development: {
    apiUrl: 'http://localhost:5000'
  },
  production: {
    apiUrl: 'https://api.misedainspectsrl.ro'  // sau URL-ul tău Node.js app
  }
};

export default config[process.env.NODE_ENV || 'production'];
```

## Pasul 5: Deploy și Test

### 5.1 Commit și push modificările
```bash
git add .
git commit -m "Configure production backend with Romanian localization"
git push origin master
```

### 5.2 Verifică deployment-ul
1. **Frontend**: https://misedainspectsrl.ro
2. **Backend API**: https://api.misedainspectsrl.ro (sau URL-ul configurat)
3. **Database**: Verifică în phpMyAdmin că tabelele sunt create

### 5.3 Testează funcționalitățile
1. **Înregistrare**: Testează cu nume/prenume + email sau telefon
2. **Autentificare**: Testează cu email sau telefon
3. **API Health Check**: GET https://api.misedainspectsrl.ro/

## Troubleshooting

### Eroare: "Database connection failed"
- Verifică credențialele în .env
- Asigură-te că baza de date există
- Verifică că utilizatorul are permisiuni complete

### Eroare: "Not allowed by CORS"
- Verifică că domain-ul este în ALLOWED_ORIGINS
- Asigură-te că certificatul SSL funcționează

### Node.js app nu pornește
- Verifică log-urile în cPanel Node.js Apps
- Asigură-te că toate dependențele sunt instalate
- Verifică că server.js există în folderul corect

## Securitate

### Recomandări importante:
1. **JWT Secret**: Generează un secret puternic (32+ caractere)
2. **Database Password**: Folosește o parolă puternică
3. **HTTPS**: Asigură-te că SSL-ul este activat
4. **Environment Variables**: Nu commite niciodată .env în Git

## Monitoring

### Log-uri importante:
- **cPanel Error Logs**: Pentru erori generale
- **Node.js App Logs**: Pentru erori backend
- **Browser Developer Tools**: Pentru erori frontend
- **phpMyAdmin**: Pentru probleme cu baza de date

---

**Status**: ✅ Backend configurat pentru formulare românești cu nume/prenume/telefon/email
**Următorul pas**: Deployment și testare în producție