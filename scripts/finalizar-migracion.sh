#!/bin/bash

# Script para finalizar la migración a Railway
# Renombra archivos y limpia obsoletos

echo "🚀 Finalizando migración a Railway..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar progreso
log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Backup de archivos antiguos
echo "📦 Creando backup de archivos antiguos..."
mkdir -p .backup/firebase-services
if [ -f "src/lib/services/auth.service.ts" ]; then
    cp src/lib/services/*.service.ts .backup/firebase-services/ 2>/dev/null
    log_success "Backup creado en .backup/firebase-services/"
fi

# 2. Eliminar archivos obsoletos de Firebase
echo ""
echo "🗑️  Eliminando archivos obsoletos de Firebase..."

obsolete_files=(
    "src/lib/services/auth.service.ts"
    "src/lib/services/chofer.service.ts"
    "src/lib/services/viaje.service.ts"
    "src/lib/services/ruta.service.ts"
    "src/lib/services/ubicacion-espera.service.ts"
    "src/lib/firebase/admin.ts"
    "src/lib/firebase/collections.ts"
    "firebase/firestore.rules"
    "firebase/database.rules.json"
    "firebase/firestore.indexes.json"
    "scripts/setup-firebase.ts"
)

for file in "${obsolete_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        log_success "Eliminado: $file"
    fi
done

# 3. Renombrar archivos Railway a nombres estándar
echo ""
echo "📝 Renombrando servicios Railway..."

railway_services=(
    "auth.service.railway.ts:auth.service.ts"
    "chofer.service.railway.ts:chofer.service.ts"
    "viaje.service.railway.ts:viaje.service.ts"
    "ruta.service.railway.ts:ruta.service.ts"
    "ubicacion-espera.service.railway.ts:ubicacion-espera.service.ts"
)

for service in "${railway_services[@]}"; do
    IFS=':' read -r old new <<< "$service"
    if [ -f "src/lib/services/$old" ]; then
        mv "src/lib/services/$old" "src/lib/services/$new"
        log_success "Renombrado: $old → $new"
    fi
done

# 4. Limpiar carpetas Firebase vacías
echo ""
echo "🧹 Limpiando carpetas vacías..."

if [ -d "firebase" ] && [ -z "$(ls -A firebase)" ]; then
    rmdir firebase
    log_success "Eliminada carpeta firebase/ (vacía)"
fi

# 5. Actualizar package.json (remover dependencias Firebase innecesarias)
echo ""
echo "📦 Limpiando package.json..."

if command -v jq &> /dev/null; then
    # Si jq está disponible, usarlo
    jq 'del(.dependencies["firebase-admin"], .dependencies.bcryptjs, .dependencies.jsonwebtoken)' package.json > package.json.tmp && mv package.json.tmp package.json
    log_success "Dependencias Firebase Admin eliminadas"
else
    log_warning "jq no instalado, omitiendo limpieza automática de package.json"
    echo "   Remueve manualmente: firebase-admin, bcryptjs, jsonwebtoken"
fi

# 6. Crear .env.local si no existe
echo ""
echo "⚙️  Configurando variables de entorno..."

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    log_success "Creado .env.local desde .env.example"
    log_warning "¡Configura tus credenciales en .env.local!"
else
    log_warning ".env.local ya existe, verifica que tenga las nuevas variables Railway"
fi

# 7. Verificar estructura
echo ""
echo "🔍 Verificando estructura del proyecto..."

required_files=(
    "backend/src/server.ts"
    "backend/Dockerfile"
    "database/schema.sql"
    "src/lib/api/client.ts"
    "src/lib/api/websocket.ts"
    "docker-compose.yml"
    "Dockerfile"
)

all_good=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "Encontrado: $file"
    else
        log_error "Falta: $file"
        all_good=false
    fi
done

# 8. Resumen final
echo ""
echo "════════════════════════════════════════"
if $all_good; then
    echo -e "${GREEN}✅ MIGRACIÓN COMPLETADA${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Configura .env.local con tus credenciales"
    echo "  2. Ejecuta: docker-compose up -d"
    echo "  3. Verifica: http://localhost:3000"
    echo ""
    echo "Para deploy en Railway:"
    echo "  → Ver: DEPLOY_COMPLETO.md"
else
    echo -e "${RED}⚠️  ADVERTENCIA${NC}"
    echo "Algunos archivos faltan. Revisa los errores arriba."
fi
echo "════════════════════════════════════════"
echo ""
echo "Backup de archivos antiguos en: .backup/firebase-services/"
echo ""
