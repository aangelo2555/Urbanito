# ⚡ Quick Start - Deploy en Railway (5 minutos)

## 🎯 Opción Más Rápida

### 1. Crear Proyecto en Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
```

### 2. Agregar Servicios

```bash
# Agregar PostgreSQL
railway add --plugin postgresql

# Agregar Redis  
railway add --plugin redis
```

### 3. Configurar Variables

En el dashboard de Railway, agregar:

```
JWT_SECRET=tu_secreto_muy_seguro
FIREBASE_API_KEY=tu_key
FRONTEND_URL=https://tu-frontend.vercel.app
```

### 4. Deploy

```bash
git add .
git commit -m "Deploy en Railway"
git push

# Railway hace deploy automáticamente
```

### 5. Inicializar Base de Datos

```bash
# Conectar a PostgreSQL
railway connect postgres

# Ejecutar schema
\i database/schema.sql
\i database/seed.sql
\q
```

### 6. Deploy Frontend en Vercel

```bash
vercel --prod
```

Configurar en Vercel:
```
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

## ✅ ¡Listo!

Tu sistema Urbanito está en producción en Railway.

**Costo: ~$5/mes** (vs $50+ con Firebase)

---

**Tiempo total: 5-10 minutos** 🚀
