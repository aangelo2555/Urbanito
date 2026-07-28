# 🚂 Guía de Deploy en Railway

## 📋 Arquitectura Final

```
┌─────────────────┐
│  Vercel/Railway │  <- Frontend Next.js
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Railway      │  <- Backend API Node.js/Express
│   (API Server)  │
└────────┬────────┘
         │
         ├──────────┐
         ▼          ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │
│   (Railway)  │  │   (Railway)  │
└──────────────┘  └──────────────┘
         │
         ▼
┌──────────────────┐
│  Firebase Auth   │  <- Solo autenticación
│   (Gratuito)     │
└──────────────────┘
```

## 🎯 Por qué esta arquitectura

✅ **PostgreSQL** reemplaza Firestore (mejor para datos relacionales)
✅ **Redis** reemplaza Realtime Database (perfecto para GPS en tiempo real)
✅ **Firebase Auth** se mantiene (gratis, robusto, fácil de usar)
✅ **Railway** hosting todo en un solo lugar (más económico que Firebase)

## 📦 Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Registrate/inicia sesión
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"

## 🗄️ Paso 2: Agregar PostgreSQL

1. En tu proyecto Railway, click "New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. Copia la `DATABASE_URL` de las variables de entorno

## 🔴 Paso 3: Agregar Redis

1. Click "New" → "Database" → "Redis"
2. Railway creará automáticamente Redis
3. Copia la `REDIS_URL` de las variables de entorno

## 🔧 Paso 4: Configurar Variables de Entorno

En el dashboard de Railway, configura estas variables:

```bash
# Base de datos (auto-generadas por Railway)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# API
NODE_ENV=production
PORT=4000
JWT_SECRET=tu_secreto_muy_seguro_aqui

# Firebase (solo Auth)
FIREBASE_API_KEY=tu_firebase_api_key
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n"

# Frontend
FRONTEND_URL=https://tu-dominio.vercel.app

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

## 📤 Paso 5: Deploy del Backend

### Opción A: Desde GitHub (Recomendado)

```bash
# 1. Push tu código a GitHub
git add .
git commit -m "Preparar para deploy en Railway"
git push origin main

# 2. En Railway:
- Click "New" → "GitHub Repo"
- Selecciona tu repositorio
- Railway detectará el Dockerfile automáticamente
- Click "Deploy"
```

### Opción B: Desde Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Linkear proyecto
railway link

# Deploy
railway up
```

## 🗃️ Paso 6: Inicializar Base de Datos

Conéctate a PostgreSQL y ejecuta el schema:

```bash
# Opción 1: Desde Railway Dashboard
# Ve a PostgreSQL → Data → Query
# Copia y pega el contenido de database/schema.sql

# Opción 2: Desde local con psql
psql $DATABASE_URL < database/schema.sql
psql $DATABASE_URL < database/seed.sql
```

## 🌐 Paso 7: Deploy del Frontend en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd tu-proyecto
vercel

# Configurar variables de entorno en Vercel:
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_key
NEXT_PUBLIC_FIREBASE_API_KEY=tu_key
```

## ✅ Paso 8: Verificar Deploy

### Backend
```bash
curl https://tu-backend.railway.app/health
# Debe responder: {"status":"ok","timestamp":"..."}
```

### Frontend
```bash
# Abrir en navegador
https://tu-frontend.vercel.app
```

## 🔍 Troubleshooting

### Error: "DATABASE_URL not set"
- Verifica que Railway haya creado la variable automáticamente
- Ve a Settings → Variables

### Error: "Connection timeout"
- Verifica que PostgreSQL esté running
- Ve a PostgreSQL service → Logs

### Error en build de Docker
- Revisa los logs en Railway
- Verifica que el Dockerfile esté en la raíz

## 💰 Costos Estimados

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| Railway Hobby | 500 horas gratis | $0 - $5 |
| PostgreSQL | Incluido | $0 |
| Redis | Incluido | $0 |
| Vercel | Hobby | $0 |
| Firebase Auth | Spark (gratis) | $0 |
| Google Maps | $200 crédito | $0 - $10 |
| **TOTAL** | | **$0 - $15/mes** |

## 🚀 Comandos Útiles

```bash
# Ver logs del backend
railway logs

# Conectar a PostgreSQL
railway connect postgres

# Conectar a Redis
railway connect redis

# Restart service
railway restart

# Ver variables
railway variables
```

## 📊 Monitoreo

### Railway
- Dashboard muestra CPU, RAM, Requests
- Logs en tiempo real

### Vercel
- Analytics incluido
- Ver deployments y logs

## 🔄 CI/CD Automático

Railway y Vercel detectan push a GitHub y hacen deploy automático:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push
# ✅ Auto-deploy en Railway y Vercel
```

## 🎯 Próximos Pasos

1. ✅ Deploy básico funcionando
2. ⏳ Configurar dominio personalizado
3. ⏳ Configurar SSL (automático en Railway)
4. ⏳ Configurar backups de PostgreSQL
5. ⏳ Configurar monitoring con UptimeRobot

---

**¡Listo! Tu sistema Urbanito está en producción en Railway** 🎉
