# 🔄 Guía de Migración de Firebase a Railway

## 📊 Comparativa de Arquitecturas

### ❌ Antes (Firebase)
```
Firebase Auth ────┐
Firebase Firestore ┼──→ Frontend Next.js
Firebase Realtime DB ┘
Firebase Storage ────┘
Firebase Hosting ────┘
```
**Problema:** Costoso al escalar, vendor lock-in

### ✅ Después (Railway)
```
Firebase Auth (solo) ───┐
Railway PostgreSQL ─────┼──→ Backend API ──→ Frontend Next.js
Railway Redis ──────────┘
Railway/Vercel Hosting ─┘
```
**Ventajas:** Más económico, más control, fácil de migrar

## 🎯 Qué Cambia

| Componente | Antes (Firebase) | Después (Railway) |
|------------|------------------|-------------------|
| **Auth** | Firebase Auth | ✅ Firebase Auth (mantener) |
| **Base de Datos** | Firestore | ✅ PostgreSQL |
| **Tiempo Real** | Realtime Database | ✅ Redis + WebSockets |
| **Storage** | Firebase Storage | ✅ Railway Volume/S3 |
| **Backend** | Cloud Functions | ✅ Node.js/Express |
| **Hosting** | Firebase Hosting | ✅ Vercel/Railway |

## 📝 Mapeo de Datos

### Usuarios
**Firebase (Firestore)**
```javascript
{
  id: "abc123",
  nombre: "Juan",
  email: "juan@unab.edu.pe",
  rol: "alumno"
}
```

**Railway (PostgreSQL)**
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  firebase_uid VARCHAR(255),
  nombre VARCHAR(255),
  email VARCHAR(255),
  rol rol_usuario
);
```

### Ubicaciones en Tiempo Real
**Firebase (Realtime Database)**
```javascript
/ubicaciones_tiempo_real/chofer123: {
  lat: -10.75,
  lng: -77.76,
  timestamp: 1234567890
}
```

**Railway (Redis)**
```javascript
redis.set('ubicacion:chofer123', JSON.stringify({
  lat: -10.75,
  lng: -77.76,
  timestamp: Date.now()
}), { EX: 60 });
```

## 🔧 Pasos de Migración

### Paso 1: Exportar Datos de Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Exportar Firestore
firebase firestore:export ./backup
```

### Paso 2: Transformar Datos

```bash
# Script de transformación (crear archivo)
node scripts/migrate-firebase-to-postgres.js
```

### Paso 3: Importar a PostgreSQL

```bash
# Conectar a Railway PostgreSQL
railway connect postgres

# Ejecutar schema
\i database/schema.sql

# Importar datos transformados
\i database/migrated-data.sql
```

### Paso 4: Actualizar Frontend

**Antes:**
```typescript
// src/lib/firebase/config.ts
import { getFirestore } from 'firebase/firestore';
const db = getFirestore();
```

**Después:**
```typescript
// src/lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchUsuarios() {
  const res = await fetch(`${API_URL}/api/usuarios`);
  return res.json();
}
```

### Paso 5: Migrar Reglas de Seguridad

**Firebase Rules → Express Middleware**

**Antes (Firestore Rules):**
```javascript
match /usuarios/{userId} {
  allow read: if request.auth.uid == userId;
}
```

**Después (Express Middleware):**
```typescript
function requireAuth(req, res, next) {
  if (!req.user || req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

router.get('/usuarios/:userId', requireAuth, getUsuario);
```

## 🚀 Deploy Completo

### 1. Backend en Railway

```bash
# Crear servicio desde Dockerfile
railway up

# Agregar PostgreSQL
railway add postgres

# Agregar Redis
railway add redis

# Ver variables
railway variables

# Deploy
git push
```

### 2. Frontend en Vercel

```bash
# Deploy
vercel --prod

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_API_URL
```

## ✅ Checklist de Migración

### Pre-Migración
- [ ] Backup completo de Firebase
- [ ] Documento de mapeo de datos
- [ ] Tests del sistema actual funcionando

### Migración
- [ ] PostgreSQL configurado en Railway
- [ ] Redis configurado en Railway
- [ ] Schema de BD ejecutado
- [ ] Datos migrados y verificados
- [ ] Backend API funcionando
- [ ] Frontend conectado al nuevo backend
- [ ] WebSockets funcionando para tiempo real

### Post-Migración
- [ ] Tests E2E pasando
- [ ] Monitoreo configurado
- [ ] Backups automáticos activados
- [ ] DNS actualizado
- [ ] Documentación actualizada

### Limpieza (después de 1 mes)
- [ ] Downgrage Firebase a plan gratuito
- [ ] Eliminar datos antiguos de Firebase
- [ ] Actualizar documentación final

## 💰 Ahorro Estimado

| Servicio | Firebase (mes) | Railway (mes) | Ahorro |
|----------|----------------|---------------|--------|
| Database | $25 | $5 | $20 |
| Hosting | $10 | $0 | $10 |
| Functions | $15 | $5 | $10 |
| **Total** | **$50** | **$10** | **$40** |

## 🔄 Rollback Plan

Si algo sale mal:

```bash
# 1. Revertir frontend al commit anterior
git revert HEAD
vercel --prod

# 2. Reactivar Firebase
# Ya está funcionando en paralelo

# 3. Actualizar DNS para apuntar a Firebase
```

## 📞 Soporte

- Railway Docs: https://docs.railway.app
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Redis Docs: https://redis.io/docs/

---

**Tiempo estimado de migración: 2-4 horas**  
**Downtime: ~15 minutos** (solo cambio de DNS)
