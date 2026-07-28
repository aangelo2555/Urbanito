# 📦 Guía de Instalación - Sistema Urbanito

Esta guía te llevará paso a paso por la instalación completa del sistema Urbanito.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Una cuenta de Google Cloud Platform
- Una cuenta de Firebase
- Git instalado
- Editor de código (VS Code recomendado)

## 🚀 Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd urbanito
```

## 📦 Paso 2: Instalar Dependencias

```bash
npm install
```

## 🔥 Paso 3: Configurar Firebase

### 3.1 Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Nombre del proyecto: `urbanito-barranca` (o el que prefieras)
4. Habilita Google Analytics (opcional)
5. Clic en "Crear proyecto"

### 3.2 Habilitar Servicios de Firebase

#### Authentication
1. En la consola de Firebase, ve a **Authentication**
2. Clic en "Comenzar"
3. Habilita el proveedor **Email/Password**

#### Firestore Database
1. Ve a **Firestore Database**
2. Clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de producción"
4. Elige la ubicación más cercana: `southamerica-east1` (São Paulo)

#### Realtime Database
1. Ve a **Realtime Database**
2. Clic en "Crear base de datos"
3. Selecciona "Comenzar en modo bloqueado"
4. Elige la misma ubicación

#### Storage
1. Ve a **Storage**
2. Clic en "Comenzar"
3. Acepta las reglas predeterminadas

#### Cloud Messaging
1. Ve a **Cloud Messaging**
2. No requiere configuración inicial

### 3.3 Obtener Credenciales de Firebase

#### Credenciales Web (Frontend)
1. En la página principal de Firebase, clic en el ícono **</>** (Web)
2. Registra tu app con el nombre "Urbanito Web"
3. Copia las credenciales (las necesitarás para `.env.local`)

#### Credenciales Admin (Backend)
1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Pestaña **Cuentas de servicio**
3. Clic en "Generar nueva clave privada"
4. Descarga el archivo JSON (guárdalo en un lugar seguro)

## 🗺️ Paso 4: Configurar Google Maps

### 4.1 Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona el proyecto de Firebase existente

### 4.2 Habilitar APIs

1. Ve a **APIs y servicios** → **Biblioteca**
2. Busca y habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Distance Matrix API**
   - **Geolocation API**

### 4.3 Crear API Key

1. Ve a **APIs y servicios** → **Credenciales**
2. Clic en "Crear credenciales" → "Clave de API"
3. Copia la clave generada
4. (Opcional) Restringe la clave:
   - Restricciones de aplicación: Sitios web HTTP
   - Agrega tu dominio (ej: `localhost:3000`, tu dominio de producción)
   - Restricciones de API: Selecciona solo las APIs que habilitaste

## ⚙️ Paso 5: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y completa con tus credenciales:

```env
# Firebase Configuration (Web)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Firebase Admin SDK (del archivo JSON descargado)
FIREBASE_ADMIN_PROJECT_ID=tu-proyecto-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_private_key_aqui\n-----END PRIVATE KEY-----\n"

# JWT Secret (genera uno aleatorio)
JWT_SECRET=un_string_largo_y_aleatorio_muy_seguro

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
UBICACION_ESPERA_EXPIRACION_MINUTOS=20
ACTUALIZACION_GPS_SEGUNDOS=7
```

**Nota:** Para `FIREBASE_ADMIN_PRIVATE_KEY`, copia el contenido del campo `private_key` del archivo JSON descargado, asegurándote de mantener los saltos de línea (`\n`).

## 🔐 Paso 6: Configurar Reglas de Seguridad

### Firestore Rules

Ve a la consola de Firebase → Firestore Database → Reglas, y copia el contenido de `firebase/firestore.rules`:

```bash
cat firebase/firestore.rules
```

### Realtime Database Rules

Ve a Realtime Database → Reglas, y copia el contenido de `firebase/database.rules.json`:

```bash
cat firebase/database.rules.json
```

### Storage Rules (Opcional)

Si usarás fotos de choferes, configura reglas de Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /choferes/{choferId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     (request.auth.uid == choferId || 
                      get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin');
    }
  }
}
```

## 🗄️ Paso 7: Inicializar la Base de Datos

Ejecuta el script de configuración para crear la estructura inicial:

```bash
npx ts-node scripts/setup-firebase.ts
```

Este script creará:
- ✅ Ruta predeterminada Buenavista - La Florida
- ✅ Usuario administrador inicial
- ✅ Configuración del sistema

**Credenciales iniciales:**
- Email: `admin@urbanito.com`
- Contraseña: `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer inicio de sesión.

## 🏃 Paso 8: Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## ✅ Paso 9: Verificar Instalación

1. **Login Administrativo:**
   - Ve a `http://localhost:3000/login`
   - Inicia sesión con las credenciales de admin
   - Deberías ver el dashboard administrativo

2. **Registro de Alumno:**
   - Ve a `http://localhost:3000/registro`
   - Registra un alumno de prueba
   - Usa un email con formato `@unab.edu.pe`
   - Código de estudiante: cualquier número de 6-8 dígitos

3. **Verificar Mapa:**
   - Inicia sesión como alumno
   - Deberías ver el mapa cargado correctamente
   - Otorga permisos de ubicación si el navegador lo solicita

## 📱 Paso 10: Configurar PWA (Opcional)

### Crear Iconos

Crea iconos para la PWA:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)
- `public/favicon.ico`

Puedes usar herramientas como [RealFaviconGenerator](https://realfavicongenerator.net/).

### Registrar Service Worker

El service worker se registra automáticamente con Next.js.

## 🚀 Paso 11: Deploy a Producción

### Deploy con Vercel

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configura las variables de entorno en el dashboard de Vercel

### Actualizar URLs

1. En Firebase Authentication, agrega el dominio de producción a dominios autorizados
2. En Google Maps, agrega el dominio de producción a las restricciones de la API Key
3. Actualiza `NEXT_PUBLIC_APP_URL` en las variables de entorno

## 🔧 Solución de Problemas

### Error: "Firebase API key inválida"
- Verifica que copiaste correctamente las credenciales
- Asegúrate de que no haya espacios extra en `.env.local`

### Error: "Google Maps no carga"
- Verifica que la API Key esté correctamente configurada
- Asegúrate de haber habilitado todas las APIs necesarias
- Verifica que no hayas excedido las cuotas gratuitas

### Error: "Permiso denegado en Firestore"
- Verifica que hayas copiado las reglas de seguridad correctamente
- Asegúrate de que el usuario esté autenticado

### Error de ubicación GPS
- Asegúrate de estar usando HTTPS en producción (HTTP solo funciona en localhost)
- Verifica que el usuario haya otorgado permisos de ubicación en el navegador

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de Google Maps Platform](https://developers.google.com/maps/documentation)
- [Documentación de Next.js](https://nextjs.org/docs)
- [README del proyecto](./README.md)

## 🆘 Soporte

Si encuentras problemas durante la instalación, revisa:
1. Los logs de la consola del navegador
2. Los logs del servidor (`npm run dev`)
3. La consola de Firebase para errores de reglas

---

**¡Felicidades! El sistema Urbanito está listo para usar.** 🎉
