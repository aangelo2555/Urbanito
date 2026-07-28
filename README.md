# Urbanito - Sistema de Rastreo GPS en Tiempo Real

Sistema de rastreo para transporte urbano en combi entre Buenavista y La Florida, Barranca - Perú.

## 🚂 SISTEMA MIGRADO A RAILWAY

Este proyecto ha sido **completamente migrado de Firebase a Railway** con PostgreSQL y Redis.

### ⚡ Quick Start

```bash
# 1. Finalizar migración
scripts/finalizar-migracion.sh  # Linux/Mac
scripts\finalizar-migracion.bat  # Windows

# 2. Configurar .env.local
cp .env.example .env.local
# Editar con tus credenciales

# 3. Iniciar con Docker
docker-compose up -d

# 4. Abrir
# http://localhost:3000
```

### 📖 Documentación Completa

- **[README_FINAL.md](./README_FINAL.md)** - Guía completa del sistema migrado
- **[DEPLOY_COMPLETO.md](./DEPLOY_COMPLETO.md)** - Deploy en Railway paso a paso
- **[QUICKSTART_RAILWAY.md](./QUICKSTART_RAILWAY.md)** - Quick start (5 min)
- **[MIGRACION_COMPLETADA.md](./MIGRACION_COMPLETADA.md)** - Estado de la migración

## 🚌 Características Principales

- **3 Roles Diferenciados**: Administrador, Chofer y Alumno
- **Rastreo GPS en Tiempo Real**: Actualización cada 5-10 segundos
- **Función "Estoy Esperando"**: Alumnos comparten su ubicación mientras esperan
- **ETA Dinámico**: Tiempo estimado de llegada con datos de tráfico en tiempo real
- **Control de Acceso**: Sistema de autorización para choferes
- **Notificaciones Push**: Alertas cuando la combi se acerca
- **Dashboard Administrativo**: Gestión completa de choferes, rutas y reportes

## 🎯 Roles del Sistema

### Administrador
- Registro y autorización de choferes
- Vista general del mapa con todas las combis activas
- Gestión de rutas y paradas
- Historial de viajes y reportes
- Visualización de alumnos esperando (agregado)

### Chofer
- Inicio/fin de viaje con transmisión GPS
- Vista de su posición en la ruta
- Visualización de alumnos esperando cerca de la ruta
- Control de estado de transmisión

### Alumno
- Registro con código de estudiante UNAB
- Visualización de combis en tiempo real
- Activación de "Estoy esperando"
- ETA a paradas clave
- Notificaciones de proximidad

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (PWA)
- **Backend**: Firebase (Firestore, Realtime Database, Cloud Functions, Auth)
- **Mapas**: Google Maps Platform (Maps API, Directions API, Distance Matrix API)
- **Tiempo Real**: Firebase Realtime Database + Firestore listeners
- **Notificaciones**: Firebase Cloud Messaging (FCM)
- **Hosting**: Vercel (frontend) + Firebase (backend)

## 📁 Estructura del Proyecto

```
urbanito/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── admin/             # Dashboard administrador
│   │   ├── chofer/            # App del chofer
│   │   ├── alumno/            # App del alumno
│   │   └── api/               # API routes
│   ├── components/            # Componentes reutilizables
│   │   ├── admin/
│   │   ├── chofer/
│   │   ├── alumno/
│   │   ├── maps/
│   │   └── shared/
│   ├── lib/                   # Utilidades y configuración
│   │   ├── firebase/
│   │   ├── maps/
│   │   └── utils/
│   ├── types/                 # TypeScript types
│   ├── hooks/                 # React hooks personalizados
│   └── store/                 # Zustand store
├── firebase/
│   ├── functions/             # Cloud Functions
│   ├── firestore.rules        # Reglas de seguridad
│   └── storage.rules          # Reglas de Storage
└── public/                    # Assets estáticos
```

## 🗄️ Modelo de Datos

### Colecciones de Firestore

- **usuarios**: Datos de autenticación y perfil
- **choferes**: Información específica de choferes
- **alumnos**: Información específica de alumnos
- **rutas**: Definición de rutas y paradas
- **viajes**: Registro de viajes
- **ubicaciones_espera_alumnos**: Ubicaciones temporales de alumnos esperando

### Realtime Database

- **ubicaciones_tiempo_real**: Posiciones GPS de choferes en viaje activo

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd urbanito
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y completa con tus credenciales:

```bash
cp .env.local.example .env.local
```

### 4. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Crea una Realtime Database
5. Habilita Cloud Functions
6. Habilita Cloud Messaging
7. Descarga el archivo de configuración y actualiza `.env.local`

### 5. Configurar Google Maps

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geolocation API
3. Crea una API Key y agrégala a `.env.local`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA para permitir:
- Instalación en dispositivos móviles
- Funcionamiento offline (caché de assets)
- Notificaciones push
- Acceso a GPS del dispositivo

## 🔐 Seguridad y Privacidad

- Autenticación con Firebase Auth
- Control de acceso basado en roles (RBAC)
- Validación de permisos en backend (Firestore Rules)
- HTTPS obligatorio
- Cifrado de datos sensibles
- Rate limiting en APIs
- Ubicación compartida solo con consentimiento explícito
- Expiración automática de ubicaciones temporales
- Logs de auditoría para accesos administrativos
- Cumplimiento con Ley N.° 29733 de Protección de Datos Personales (Perú)

## 📊 Fases de Desarrollo

### ✅ MVP (Fase 1)
- Login de admin y chofer
- Registro y login de alumnos con código de estudiante
- Activación/suspensión de choferes
- Transmisión GPS en tiempo real
- Visualización en mapa
- Función "Estoy esperando"

### 🔄 Fase 2 (Próximamente)
- ETA con tráfico real
- Notificaciones push
- Historial de viajes
- Reportes de puntualidad
- Mapa de calor de alumnos esperando

### 📈 Fase 3 (Futuro)
- Soporte multi-ruta
- Calificación del servicio
- Panel estadístico avanzado
- App móvil nativa

## 🧪 Testing

```bash
npm run test
```

## 🏗️ Build y Deploy

```bash
npm run build
npm run start
```

### Deploy a Vercel

```bash
vercel --prod
```

## 📄 Licencia

Proprietary - Universidad Nacional de Barranca

## 👥 Contacto

Para soporte o consultas sobre el sistema Urbanito, contactar al equipo de desarrollo.

---

**Ruta Principal**: Buenavista ↔ La Florida (Universidad Nacional de Barranca)  
**Ubicación UNAB**: Jr. Toribio de Luzuriaga 376, La Florida, Barranca, Perú
