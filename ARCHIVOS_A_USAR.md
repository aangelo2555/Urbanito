# 📋 GUÍA: QUÉ ARCHIVOS USAR (Railway vs Firebase)

## ⚠️ IMPORTANTE

El sistema ahora usa **Railway** en lugar de Firebase. Debes usar los archivos correctos:

---

## ✅ USAR ESTOS ARCHIVOS (Railway)

### Servicios del Frontend
```
src/lib/services/
├── auth.service.railway.ts          ← USAR ESTE
├── chofer.service.railway.ts        ← USAR ESTE
├── viaje.service.railway.ts         ← USAR ESTE
├── ruta.service.railway.ts          ← USAR ESTE
└── ubicacion-espera.service.railway.ts  ← USAR ESTE
```

### Clientes de Comunicación
```
src/lib/api/
├── client.ts                        ← NUEVO - HTTP REST client
└── websocket.ts                     ← NUEVO - WebSocket client
```

### Firebase (Solo Auth)
```
src/lib/firebase/
└── config.ts                        ← ACTUALIZADO - Solo Auth
```

---

## ❌ NO USAR ESTOS (Obsoletos)

### Servicios Antiguos de Firebase
```
src/lib/services/
├── auth.service.ts                  ❌ NO USAR
├── chofer.service.ts                ❌ NO USAR
├── viaje.service.ts                 ❌ NO USAR
├── ruta.service.ts                  ❌ NO USAR
└── ubicacion-espera.service.ts      ❌ NO USAR
```

### Configs Firebase Antiguas
```
src/lib/firebase/
├── admin.ts                         ❌ NO USAR (ahora en backend)
└── collections.ts                   ❌ NO USAR
```

---

## 🔄 CÓMO IMPORTAR CORRECTAMENTE

### ❌ INCORRECTO (Viejo - Firebase)
```typescript
import { ViajeService } from '@/lib/services/viaje.service';
import { AuthService } from '@/lib/services/auth.service';
```

### ✅ CORRECTO (Nuevo - Railway)
```typescript
import { ViajeService } from '@/lib/services/viaje.service.railway';
import { AuthService } from '@/lib/services/auth.service.railway';
```

O mejor aún, renombra los archivos:

```bash
# Eliminar archivos viejos
rm src/lib/services/auth.service.ts
rm src/lib/services/chofer.service.ts
rm src/lib/services/viaje.service.ts
rm src/lib/services/ruta.service.ts
rm src/lib/services/ubicacion-espera.service.ts

# Renombrar archivos nuevos
mv src/lib/services/auth.service.railway.ts src/lib/services/auth.service.ts
mv src/lib/services/chofer.service.railway.ts src/lib/services/chofer.service.ts
mv src/lib/services/viaje.service.railway.ts src/lib/services/viaje.service.ts
mv src/lib/services/ruta.service.railway.ts src/lib/services/ruta.service.ts
mv src/lib/services/ubicacion-espera.service.railway.ts src/lib/services/ubicacion-espera.service.ts
```

---

## 📁 ESTRUCTURA CORRECTA FINAL

```
urbanito/
├── backend/                         ✅ NUEVO - Backend Railway
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── database.ts         (PostgreSQL)
│   │   │   └── redis.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── websocket/
│   ├── Dockerfile
│   └── package.json
│
├── src/
│   ├── lib/
│   │   ├── api/                    ✅ NUEVO
│   │   │   ├── client.ts
│   │   │   └── websocket.ts
│   │   ├── services/               ✅ USAR los *.railway.ts
│   │   │   ├── auth.service.railway.ts
│   │   │   ├── chofer.service.railway.ts
│   │   │   ├── viaje.service.railway.ts
│   │   │   ├── ruta.service.railway.ts
│   │   │   └── ubicacion-espera.service.railway.ts
│   │   └── firebase/
│   │       └── config.ts           ✅ ACTUALIZADO - Solo Auth
│   │
│   ├── components/                 ✅ SIN CAMBIOS (funcionan igual)
│   ├── app/                        ✅ SIN CAMBIOS (funcionan igual)
│   └── types/                      ✅ SIN CAMBIOS
│
├── database/                       ✅ NUEVO
│   ├── schema.sql                  (PostgreSQL)
│   └── seed.sql
│
├── docker-compose.yml              ✅ NUEVO
├── Dockerfile                      ✅ NUEVO
└── .env.example                    ✅ ACTUALIZADO
```

---

## 🔧 VARIABLES DE ENTORNO

### ❌ Eliminar de .env.local (Ya no se usan)
```bash
# ELIMINAR ESTAS:
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

### ✅ Agregar a .env.local (Nuevas)
```bash
# AGREGAR ESTAS:
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### ✅ Mantener (Solo Auth)
```bash
# MANTENER ESTAS (Firebase Auth):
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

---

## 🚀 COMANDOS DE DESARROLLO

### Desarrollo Local

```bash
# Opción 1: Docker (Recomendado)
docker-compose up -d
# Levanta: PostgreSQL + Redis + Backend + Frontend

# Opción 2: Manual
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
npm install
npm run dev
```

### Build de Producción

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
npm start
```

---

## 🎯 RESUMEN RÁPIDO

### ¿Qué cambió?
1. ✅ Servicios usan HTTP REST API en lugar de Firestore
2. ✅ Ubicaciones en tiempo real usan WebSocket en lugar de Realtime Database
3. ✅ Firebase solo para autenticación (Auth)
4. ✅ Backend nuevo en Node.js/Express
5. ✅ PostgreSQL + Redis en Railway

### ¿Qué NO cambió?
1. ✅ Componentes React (mismo código)
2. ✅ Páginas Next.js (mismo código)
3. ✅ Tipos TypeScript (mismo código)
4. ✅ Estilos Tailwind (mismo código)
5. ✅ Hooks personalizados (mismo código)

---

## ✅ CHECKLIST ANTES DE DEPLOYAR

- [ ] Usar archivos `*.railway.ts` en lugar de archivos antiguos
- [ ] Actualizar imports en componentes
- [ ] Configurar variables de entorno (.env.local)
- [ ] Eliminar archivos obsoletos de Firebase
- [ ] Probar localmente con docker-compose
- [ ] Backend funcionando en http://localhost:4000
- [ ] Frontend funcionando en http://localhost:3000
- [ ] WebSocket conectando correctamente
- [ ] Login funcionando
- [ ] Mapa cargando

---

## 🆘 SI ALGO NO FUNCIONA

### Error: "Cannot find module '@/lib/services/viaje.service'"
**Solución:** Usar `viaje.service.railway.ts` o renombrar archivo

### Error: "fetch is not defined"
**Solución:** Verificar que `NEXT_PUBLIC_API_URL` esté configurado

### Error: "WebSocket connection failed"
**Solución:** Verificar que el backend esté corriendo

### Error: "Firebase auth failed"
**Solución:** Mantener las variables Firebase Auth

---

**📖 Más info:** Ver `DEPLOY_COMPLETO.md` para guía paso a paso
