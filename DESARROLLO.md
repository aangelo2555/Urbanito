# 🛠️ Guía de Desarrollo - Sistema Urbanito

Esta guía te ayudará a desarrollar y extender el sistema Urbanito.

## 📁 Estructura del Proyecto

```
urbanito/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   │   ├── login/                # Página de login
│   │   │   └── registro/             # Página de registro
│   │   ├── admin/                    # Dashboard administrativo
│   │   │   ├── choferes/             # Gestión de choferes
│   │   │   ├── rutas/                # Gestión de rutas
│   │   │   ├── reportes/             # Reportes y estadísticas
│   │   │   ├── layout.tsx            # Layout con sidebar
│   │   │   └── page.tsx              # Dashboard principal
│   │   ├── chofer/                   # App del chofer
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── alumno/                   # App del alumno
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Página de redirección
│   │   └── globals.css               # Estilos globales
│   ├── components/                   # Componentes React
│   │   ├── admin/                    # Componentes específicos de admin
│   │   ├── chofer/                   # Componentes específicos de chofer
│   │   ├── alumno/                   # Componentes específicos de alumno
│   │   ├── maps/                     # Componentes de mapas
│   │   │   ├── MapaBase.tsx          # Componente base de mapa
│   │   │   ├── MarcadorCombi.tsx     # Marcador de combi
│   │   │   └── MarcadorAlumnoEsperando.tsx
│   │   ├── shared/                   # Componentes reutilizables
│   │   │   ├── Alert.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Loading.tsx
│   │   └── providers/                # Context providers
│   ├── lib/                          # Lógica de negocio
│   │   ├── firebase/                 # Configuración de Firebase
│   │   │   ├── config.ts             # Cliente Firebase
│   │   │   ├── admin.ts              # Firebase Admin
│   │   │   └── collections.ts        # Nombres de colecciones
│   │   ├── services/                 # Servicios de backend
│   │   │   ├── auth.service.ts
│   │   │   ├── chofer.service.ts
│   │   │   ├── ruta.service.ts
│   │   │   ├── viaje.service.ts
│   │   │   └── ubicacion-espera.service.ts
│   │   └── utils/                    # Utilidades
│   │       ├── validaciones.ts
│   │       ├── geo.ts
│   │       └── fechas.ts
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Hook de autenticación
│   │   └── useGeolocation.ts         # Hook de geolocalización
│   ├── store/                        # Estado global (Zustand)
│   │   └── mapaStore.ts
│   └── types/                        # TypeScript types
│       └── index.ts
├── firebase/                         # Configuración de Firebase
│   ├── firestore.rules               # Reglas de Firestore
│   ├── database.rules.json           # Reglas de Realtime DB
│   └── firestore.indexes.json        # Índices de Firestore
├── scripts/                          # Scripts de utilidad
│   └── setup-firebase.ts             # Script de inicialización
├── public/                           # Assets públicos
│   └── manifest.json                 # Configuración PWA
├── CHECKLIST.md                      # Checklist de funcionalidades
├── INSTALACION.md                    # Guía de instalación
├── DESARROLLO.md                     # Esta guía
└── README.md                         # Documentación principal
```

## 🏗️ Arquitectura

### Frontend (Next.js + React)
- **App Router:** Sistema de rutas de Next.js 14
- **TypeScript:** Tipado estático para mayor seguridad
- **Tailwind CSS:** Estilos utilitarios
- **Zustand:** Gestión de estado ligera
- **React Hook Form:** Manejo de formularios
- **Google Maps API:** Visualización de mapas

### Backend (Firebase)
- **Firebase Auth:** Autenticación de usuarios
- **Firestore:** Base de datos principal (NoSQL)
- **Realtime Database:** Ubicaciones GPS en tiempo real
- **Cloud Storage:** Almacenamiento de fotos
- **Cloud Messaging:** Notificaciones push (futuro)

## 🎨 Patrones de Diseño

### 1. Separación de Capas

```
UI (Componentes)
     ↓
Hooks (useAuth, useGeolocation)
     ↓
Services (auth.service, viaje.service)
     ↓
Firebase (Firestore, Realtime DB)
```

### 2. Servicios Singleton

Todos los servicios son clases con métodos estáticos para evitar múltiples instancias:

```typescript
export class ViajeService {
  static async iniciarViaje(...) { }
  static async finalizarViaje(...) { }
}
```

### 3. Custom Hooks

Encapsular lógica compleja en hooks reutilizables:

```typescript
export function useGeolocation() {
  // Lógica GPS
  return { posicion, error, loading };
}
```

## 🔧 Cómo Agregar Funcionalidades

### Agregar un Nuevo Rol

1. **Actualizar tipos:**
```typescript
// src/types/index.ts
export type RolUsuario = 'admin' | 'chofer' | 'alumno' | 'supervisor';
```

2. **Crear layout y página:**
```typescript
// src/app/supervisor/layout.tsx
// src/app/supervisor/page.tsx
```

3. **Actualizar reglas de seguridad:**
```javascript
// firebase/firestore.rules
function isSupervisor() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'supervisor';
}
```

### Agregar una Nueva Ruta

1. **Crear servicio:**
```typescript
// src/lib/services/nueva-ruta.service.ts
export class NuevaRutaService {
  static async crearRuta() { }
}
```

2. **Agregar tipos:**
```typescript
// src/types/index.ts
export interface NuevaRuta {
  // Definir propiedades
}
```

3. **Crear componentes:**
```typescript
// src/components/admin/NuevaRutaForm.tsx
```

### Agregar una Página de Admin

1. **Crear archivo de página:**
```typescript
// src/app/admin/nueva-seccion/page.tsx
export default function NuevaSeccionPage() {
  return <div>Contenido</div>;
}
```

2. **Actualizar navegación:**
```typescript
// src/app/admin/layout.tsx
const navItems = [
  // ... items existentes
  { href: '/admin/nueva-seccion', label: 'Nueva Sección', icon: '...' }
];
```

## 🧪 Testing (Próximamente)

### Estructura de Tests

```
src/
├── __tests__/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   └── viaje.service.test.ts
│   ├── components/
│   │   └── Button.test.tsx
│   └── utils/
│       └── geo.test.ts
```

### Ejemplo de Test

```typescript
import { ViajeService } from '@/lib/services/viaje.service';

describe('ViajeService', () => {
  it('debe iniciar un viaje correctamente', async () => {
    const viajeId = await ViajeService.iniciarViaje('chofer123', 'ruta456');
    expect(viajeId).toBeDefined();
  });
});
```

## 🚀 Deployment

### Vercel (Recomendado para Frontend)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Firebase Hosting (Alternativa)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting
```

## 🔐 Seguridad

### Validaciones en Frontend Y Backend

Siempre validar en ambos lados:

```typescript
// Frontend
if (!validarCodigoEstudiante(codigo)) {
  throw new Error('Código inválido');
}

// Backend (Firestore Rules)
match /alumnos/{alumnoId} {
  allow create: if request.resource.data.codigo_estudiante.matches('^\\d{6,8}$');
}
```

### Rate Limiting

Implementar límites de solicitudes para prevenir abuso:

```typescript
// Usar Firebase App Check o implementar en Cloud Functions
```

## 📊 Monitoreo

### Firebase Analytics

```typescript
import { logEvent } from 'firebase/analytics';

// Trackear eventos
logEvent(analytics, 'viaje_iniciado', {
  chofer_id: choferId,
  ruta_id: rutaId
});
```

### Error Logging

```typescript
// Usar Sentry o similar
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error);
```

## 🐛 Debugging

### Firebase Emulator

```bash
# Instalar emulators
firebase init emulators

# Ejecutar
firebase emulators:start
```

Actualizar `src/lib/firebase/config.ts`:

```typescript
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}
```

### React DevTools

- Instalar extensión React Developer Tools
- Inspeccionar componentes y estado

### Network Tab

- Revisar llamadas a Firebase
- Verificar reglas de seguridad

## 📝 Convenciones de Código

### Nombres de Archivos

- Componentes: `PascalCase.tsx`
- Hooks: `usePascalCase.ts`
- Services: `kebab-case.service.ts`
- Utils: `kebab-case.ts`

### Importaciones

```typescript
// Orden recomendado:
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Next.js
import { useRouter } from 'next/navigation';

// 3. Librerías externas
import { doc, getDoc } from 'firebase/firestore';

// 4. Componentes internos
import { Button } from '@/components/shared/Button';

// 5. Hooks
import { useAuth } from '@/hooks/useAuth';

// 6. Services
import { ViajeService } from '@/lib/services/viaje.service';

// 7. Tipos
import { Viaje } from '@/types';

// 8. Utils
import { formatearFecha } from '@/lib/utils/fechas';
```

### Comentarios

```typescript
/**
 * Descripción de la función
 * @param parametro - Descripción del parámetro
 * @returns Descripción del retorno
 */
export async function miFuncion(parametro: string): Promise<void> {
  // Lógica
}
```

## 🔄 Git Workflow

### Branches

- `main` - Producción
- `develop` - Desarrollo
- `feature/nombre-feature` - Nueva funcionalidad
- `fix/nombre-fix` - Corrección de bug

### Commits

Seguir Conventional Commits:

```
feat: agregar ETA dinámico con Google Directions
fix: corregir bug en transmisión GPS
docs: actualizar README
style: formatear código con prettier
refactor: reorganizar servicios de Firebase
test: agregar tests para auth.service
```

## 🎯 Próximas Mejoras

1. **ETA Dinámico:** Integrar Google Directions API
2. **Notificaciones Push:** Configurar FCM
3. **Reportes:** Dashboard con estadísticas avanzadas
4. **Tests:** Cobertura completa de tests
5. **PWA Offline:** Service worker y caché
6. **Optimización:** Code splitting y lazy loading
7. **Internacionalización:** Soporte multi-idioma
8. **Dark Mode:** Tema oscuro

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Maps Platform](https://developers.google.com/maps/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**¡Happy Coding!** 🚀
