-- Schema de PostgreSQL para Urbanito
-- Reemplaza Firestore con PostgreSQL

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos personalizados
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('admin', 'chofer', 'alumno');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_autorizacion AS ENUM ('pendiente', 'activo', 'suspendido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_viaje AS ENUM ('en_curso', 'finalizado', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    firebase_uid VARCHAR(255) UNIQUE,
    rol rol_usuario NOT NULL,
    estado estado_usuario DEFAULT 'activo',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_firebase_uid ON usuarios(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Tabla: rutas
CREATE TABLE IF NOT EXISTS rutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    paradas JSONB NOT NULL,
    polyline JSONB NOT NULL,
    distancia_km DECIMAL(10, 2) NOT NULL,
    tiempo_estimado_min INTEGER NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutas_activa ON rutas(activa);

-- Tabla: choferes
CREATE TABLE IF NOT EXISTS choferes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dni VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(9) NOT NULL,
    foto_url TEXT,
    placa_vehiculo VARCHAR(8) UNIQUE NOT NULL,
    ruta_id UUID REFERENCES rutas(id),
    estado_autorizacion estado_autorizacion DEFAULT 'pendiente',
    autorizado_por UUID REFERENCES usuarios(id),
    fecha_autorizacion TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_choferes_usuario_id ON choferes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_choferes_estado ON choferes(estado_autorizacion);
CREATE INDEX IF NOT EXISTS idx_choferes_dni ON choferes(dni);
CREATE INDEX IF NOT EXISTS idx_choferes_placa ON choferes(placa_vehiculo);

-- Tabla: alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(9),
    notificaciones_activas BOOLEAN DEFAULT TRUE,
    minutos_notificacion INTEGER DEFAULT 5,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alumnos_usuario_id ON alumnos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_codigo ON alumnos(codigo_estudiante);

-- Tabla: viajes
CREATE TABLE IF NOT EXISTS viajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chofer_id UUID NOT NULL REFERENCES choferes(id) ON DELETE CASCADE,
    ruta_id UUID NOT NULL REFERENCES rutas(id),
    hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    hora_fin TIMESTAMP WITH TIME ZONE,
    estado estado_viaje DEFAULT 'en_curso',
    distancia_recorrida_km DECIMAL(10, 2),
    duracion_minutos INTEGER,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_viajes_chofer_id ON viajes(chofer_id);
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_hora_inicio ON viajes(hora_inicio DESC);

-- Tabla: ubicaciones_espera_alumnos
CREATE TABLE IF NOT EXISTS ubicaciones_espera_alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    usuario_nombre VARCHAR(255) NOT NULL,
    codigo_estudiante VARCHAR(8) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    ruta_id UUID REFERENCES rutas(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ubicaciones_espera_alumno ON ubicaciones_espera_alumnos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_espera_activo ON ubicaciones_espera_alumnos(activo);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_espera_expira ON ubicaciones_espera_alumnos(expira_en);

-- Tabla: notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    rol_destinatario rol_usuario,
    usuario_destinatario UUID REFERENCES usuarios(id),
    leido BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: configuracion_sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    clave VARCHAR(100) PRIMARY KEY,
    valor JSONB NOT NULL,
    descripcion TEXT,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
