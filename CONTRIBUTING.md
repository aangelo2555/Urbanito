# 🤝 Guía de Contribución - Sistema Urbanito

¡Gracias por tu interés en contribuir al sistema Urbanito! Esta guía te ayudará a contribuir de manera efectiva.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Estándares de Código](#estándares-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 📜 Código de Conducta

Este proyecto se rige por un código de conducta. Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables.

### Nuestro Compromiso

- Ser respetuoso con todos los contribuyentes
- Aceptar críticas constructivas
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

## 🚀 Cómo Contribuir

### Configuración Inicial

1. **Fork el repositorio**
   ```bash
   # Hacer fork en GitHub, luego:
   git clone https://github.com/tu-usuario/urbanito.git
   cd urbanito
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   # Editar .env.local con tus credenciales
   ```

4. **Crear una rama**
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```

### Tipos de Contribuciones

#### 🐛 Corrección de Bugs

1. Busca si el bug ya fue reportado en Issues
2. Si no existe, crea un nuevo Issue con:
   - Descripción clara del bug
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Capturas de pantalla si aplica
   - Información del entorno (navegador, OS, etc.)

3. Crea una rama: `fix/descripcion-del-bug`
4. Corrige el bug
5. Agrega tests si es posible
6. Envía un Pull Request

#### ✨ Nuevas Funcionalidades

1. Abre un Issue para discutir la funcionalidad
2. Espera aprobación del equipo
3. Crea una rama: `feature/nombre-funcionalidad`
4. Implementa la funcionalidad
5. Agrega documentación
6. Agrega tests
7. Envía un Pull Request

#### 📝 Mejoras de Documentación

1. Crea una rama: `docs/tema-a-documentar`
2. Actualiza o crea documentación
3. Verifica ortografía y gramática
4. Envía un Pull Request

#### 🎨 Mejoras de UI/UX

1. Abre un Issue con mockups o descripciones
2. Espera feedback del equipo
3. Implementa los cambios
4. Asegúrate de que sea responsive
5. Verifica accesibilidad
6. Envía un Pull Request

## 🔄 Proceso de Pull Request

### Antes de Enviar

- [ ] El código compila sin errores (`npm run build`)
- [ ] El código pasa el linter (`npm run lint`)
- [ ] El código pasa type-check (`npm run type-check`)
- [ ] Los tests pasan (cuando estén implementados)
- [ ] La documentación está actualizada
- [ ] Los commits siguen Conventional Commits

### Formato del Pull Request

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## ¿Cómo se ha probado?
[Describe cómo probaste los cambios]

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He revisado mi propio código
- [ ] He comentado áreas complejas
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi fix/funcionalidad
```

### Revisión de Código

1. Un miembro del equipo revisará tu PR
2. Pueden solicitar cambios
3. Realiza los cambios solicitados
4. Una vez aprobado, se hará merge

## 💻 Estándares de Código

### TypeScript

```typescript
// ✅ BIEN
interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

function obtenerUsuario(id: string): Promise<Usuario | null> {
  // ...
}

// ❌ MAL
function obtenerUsuario(id) {
  // Sin tipos
}
```

### Nombres de Variables

```typescript
// ✅ BIEN
const alumnosEsperando = [];
const TIEMPO_EXPIRACION = 20;

// ❌ MAL
const ae = [];
const t = 20;
```

### Componentes React

```typescript
// ✅ BIEN
export function MiComponente({ prop1, prop2 }: Props) {
  const [estado, setEstado] = useState();
  
  useEffect(() => {
    // Cleanup
    return () => {};
  }, []);

  return <div>{/* JSX */}</div>;
}

// ❌ MAL
export default function({ p1, p2 }) {
  // Sin tipos, sin nombre claro
}
```

### Imports

```typescript
// ✅ BIEN - Orden correcto
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { useAuth } from '@/hooks/useAuth';
import { ViajeService } from '@/lib/services/viaje.service';
import type { Viaje } from '@/types';

// ❌ MAL - Desordenado
import { Viaje } from '@/types';
import React from 'react';
import { Button } from '@/components/shared/Button';
```

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(alumno): agregar botón de estoy esperando
fix(chofer): corregir transmisión GPS
docs(readme): actualizar guía de instalación
style(button): ajustar espaciado
refactor(services): reorganizar código de viajes
test(auth): agregar tests de login
chore(deps): actualizar dependencias
```

## 🐛 Reportar Bugs

### Formato del Reporte

```markdown
**Descripción del Bug**
[Descripción clara y concisa]

**Pasos para Reproducir**
1. Ir a '...'
2. Click en '...'
3. Ver error

**Comportamiento Esperado**
[Lo que debería pasar]

**Comportamiento Actual**
[Lo que realmente pasa]

**Capturas de Pantalla**
[Si aplica]

**Entorno**
- OS: [ej: Windows 11]
- Navegador: [ej: Chrome 120]
- Versión: [ej: 1.0.0]

**Logs de Consola**
[Si hay errores en consola]

**Información Adicional**
[Cualquier otro contexto]
```

## 💡 Sugerir Mejoras

### Formato de Sugerencia

```markdown
**Funcionalidad Solicitada**
[Descripción clara]

**Problema que Resuelve**
[¿Por qué es necesaria esta funcionalidad?]

**Solución Propuesta**
[Cómo debería funcionar]

**Alternativas Consideradas**
[Otras opciones que pensaste]

**Mockups/Ejemplos**
[Si tienes diseños o ejemplos]

**Impacto**
[¿A quién ayudará? ¿Qué tan importante es?]
```

## 📊 Áreas que Necesitan Ayuda

Actualmente necesitamos contribuciones en:

### Alta Prioridad
- [ ] Tests automatizados (Jest + React Testing Library)
- [ ] ETA dinámico con Google Directions API
- [ ] Notificaciones push con FCM
- [ ] Optimización de rendimiento

### Media Prioridad
- [ ] Reportes y dashboard estadístico
- [ ] Mapa de calor de demanda
- [ ] Service worker para PWA offline
- [ ] Internacionalización (i18n)

### Baja Prioridad
- [ ] Modo oscuro
- [ ] Animaciones mejoradas
- [ ] Accesibilidad (ARIA labels)
- [ ] Documentación en inglés

## 🎯 Guías Específicas

### Agregar un Nuevo Servicio

1. Crear archivo en `src/lib/services/`
2. Exportar clase con métodos estáticos
3. Documentar con JSDoc
4. Agregar tipos en `src/types/`
5. Agregar tests
6. Documentar en README

### Agregar un Componente

1. Crear archivo en carpeta apropiada
2. Definir interface Props
3. Implementar componente
4. Agregar PropTypes/TypeScript
5. Documentar uso
6. Agregar a Storybook (futuro)

### Actualizar Base de Datos

1. Actualizar tipos en `src/types/`
2. Actualizar reglas de seguridad
3. Agregar índices si es necesario
4. Documentar cambios
5. Crear migración si aplica

## 🤔 ¿Tienes Preguntas?

- Abre un Issue con la etiqueta `question`
- Contacta al equipo de desarrollo
- Revisa la documentación existente

## 🙏 Reconocimientos

Todos los contribuyentes serán listados en el README.

---

**¡Gracias por contribuir a Urbanito!** 🚀
