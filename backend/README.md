# Backend API - Urbanito

API REST + WebSockets para el sistema Urbanito.

## 🚀 Stack

- **Node.js** 18+
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos relacional
- **Redis** - Cache y tiempo real
- **WebSocket** - Comunicación bidireccional

## 📦 Instalación Local

```bash
# Instalar dependencias
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run migration:run

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 🐳 Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

## 🔌 Endpoints

### Auth
- `POST /api/auth/verify` - Verificar token de Firebase

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario

### Choferes
- `GET /api/choferes` - Listar choferes
- `POST /api/choferes` - Crear chofer
- `PUT /api/choferes/:id/estado` - Cambiar estado

### Viajes
- `POST /api/viajes` - Iniciar viaje
- `PUT /api/viajes/:id/finalizar` - Finalizar viaje
- `GET /api/viajes/activos` - Viajes en curso

## 🔌 WebSocket Events

### Cliente → Servidor
```javascript
// Autenticación
{ type: 'auth', userId: '123', role: 'chofer' }

// Actualizar ubicación GPS
{ type: 'ubicacion_gps', choferId: '123', lat: -10.75, lng: -77.76 }

// Suscribirse a ubicaciones
{ type: 'subscribe_ubicaciones' }
```

### Servidor → Cliente
```javascript
// Ubicación actualizada
{ type: 'ubicacion_actualizada', choferId: '123', lat: -10.75, lng: -77.76 }
```

## 📊 Base de Datos

Ver `../database/schema.sql` para el schema completo.

## 🚀 Deploy en Railway

Ver `../RAILWAY_DEPLOY.md`
