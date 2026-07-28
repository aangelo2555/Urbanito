-- Schema de PostgreSQL para Urbanito
-- Reemplaza Firestore con PostgreSQL

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para datos geográficos

-- Tipos personalizados
CREATE TYPE rol_usuario AS ENUM ('admin', 'chofer', 'alumno');
CREATE TYPE estado_autorizacion AS ENUM ('pendiente', 'activo', 'suspendido');
CREATE TYPE estado_viaje AS ENUM ('en_curso', 'finalizado', 'cancelado');
CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo');

-- Tabla: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    firebase_uid VARCHAR(255) UNIQUE, -- UID de Firebase Auth
    rol rol_usuario NOT NULL,
    estado estado_usuario DEFAULT 'activo',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_firebase_uid ON usuarios(firebase_uid);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Tabla: choferes
CREATE TABLE choferes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dni VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(9) NOT NULL,
    foto_url TEXT,
    placa_vehiculo VARCHAR(8) UNIQUE NOT NULL,
    ruta_id UUID, -- Se agregará la foreign key después de crear la tabla rutas
    estado_autorizacion estado_autorizacion DEFAULT 'pendiente',
    autorizado_por UUID REFERENCES usuarios(id),
    fecha_autorizacion TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_choferes_usuario_id ON choferes(usuario_id);
CREATE INDEX idx_choferes_estado ON choferes(estado_autorizacion);
CREATE INDEX idx_choferes_dni ON choferes(dni);
CREATE INDEX idx_choferes_placa ON choferes(placa_vehicular);

-- Tabla: alumnos
CREATE TABLE alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(8) UNIQUE NOT NULL,
    telefono VARCHAR(9),
    notificaciones_activas BOOLEAN DEFAULT TRUE,
    minutos_notificacion INTEGER DEFAULT 5,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alumnos_usuario_id ON alumnos(usuario_id);
CREATE INDEX idx_alumnos_codigo ON alumnos(codigo_estudiante);

-- Tabla: rutas
CREATE TABLE rutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    paradas JSONB NOT NULL, -- Array de paradas en formato JSON
    polyline JSONB NOT NULL, -- Array de coordenadas en formato JSON
    distancia_km DECIMAL(10, 2) NOT NULL,
    tiempo_estimado_min INTEGER NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rutas_activa ON rutas(activa);

-- Ahora agregamos la foreign key en choferes
ALTER TABLE choferes
ADD CONSTRAINT fk_choferes_ruta
FOREIGN KEY (ruta_id) REFERENCES rutas(id);

-- Tabla: viajes
CREATE TABLE viajes (
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

CREATE INDEX idx_viajes_chofer_id ON viajes(chofer_id);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_hora_inicio ON viajes(hora_inicio DESC);
CREATE INDEX idx_viajes_chofer_estado ON viajes(chofer_id, estado);

-- Tabla: ubicaciones_espera_alumnos
CREATE TABLE ubicaciones_espera_alumnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    usuario_nombre VARCHAR(255) NOT NULL,
    codigo_estudiante VARCHAR(8) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    ubicacion GEOGRAPHY(POINT, 4326), -- PostGIS para búsquedas geográficas
    activo BOOLEAN DEFAULT TRUE,
    ruta_id UUID REFERENCES rutas(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_ubicaciones_espera_alumno ON ubicaciones_espera_alumnos(alumno_id);
CREATE INDEX idx_ubicaciones_espera_activo ON ubicaciones_espera_alumnos(activo);
CREATE INDEX idx_ubicaciones_espera_expira ON ubicaciones_espera_alumnos(expira_en);
CREATE INDEX idx_ubicaciones_espera_geo ON ubicaciones_espera_alumnos USING GIST(ubicacion);

-- Tabla: notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    rol_destinatario rol_usuario,
    usuario_destinatario UUID REFERENCES usuarios(id),
    leido BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_destinatario);
CREATE INDEX idx_notificaciones_rol ON notificaciones(rol_destinatario);
CREATE INDEX idx_notificaciones_leido ON notificaciones(leido);

-- Tabla: logs_auditoria
CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    usuario_nombre VARCHAR(255) NOT NULL,
    usuario_rol rol_usuario NOT NULL,
    accion VARCHAR(255) NOT NULL,
    entidad_tipo VARCHAR(100) NOT NULL,
    entidad_id UUID NOT NULL,
    detalles JSONB,
    ip VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_timestamp ON logs_auditoria(timestamp DESC);
CREATE INDEX idx_logs_entidad ON logs_auditoria(entidad_tipo, entidad_id);

-- Tabla: configuracion_sistema
CREATE TABLE configuracion_sistema (
    clave VARCHAR(100) PRIMARY KEY,
    valor JSONB NOT NULL,
    descripcion TEXT,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamp
CREATE TRIGGER trigger_usuarios_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_choferes_timestamp
BEFORE UPDATE ON choferes
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_alumnos_timestamp
BEFORE UPDATE ON alumnos
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_rutas_timestamp
BEFORE UPDATE ON rutas
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_viajes_timestamp
BEFORE UPDATE ON viajes
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Trigger para actualizar ubicación geográfica
CREATE OR REPLACE FUNCTION actualizar_ubicacion_geo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ubicacion = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ubicacion_geo
BEFORE INSERT OR UPDATE ON ubicaciones_espera_alumnos
FOR EACH ROW EXECUTE FUNCTION actualizar_ubicacion_geo();

-- Función para limpiar ubicaciones expiradas
CREATE OR REPLACE FUNCTION limpiar_ubicaciones_expiradas()
RETURNS void AS $$
BEGIN
    UPDATE ubicaciones_espera_alumnos
    SET activo = FALSE
    WHERE activo = TRUE AND expira_en < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Vista para choferes activos
CREATE VIEW choferes_activos AS
SELECT 
    c.*,
    u.nombre,
    u.email,
    r.nombre as ruta_nombre
FROM choferes c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN rutas r ON c.ruta_id = r.id
WHERE c.estado_autorizacion = 'activo'
AND u.estado = 'activo';

-- Vista para viajes en curso
CREATE VIEW viajes_en_curso AS
SELECT 
    v.*,
    u.nombre as chofer_nombre,
    c.placa_vehiculo,
    r.nombre as ruta_nombre
FROM viajes v
JOIN choferes c ON v.chofer_id = c.id
JOIN usuarios u ON c.usuario_id = u.id
JOIN rutas r ON v.ruta_id = r.id
WHERE v.estado = 'en_curso';

-- Comentarios en tablas
COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE choferes IS 'Información específica de choferes';
COMMENT ON TABLE alumnos IS 'Información específica de alumnos UNAB';
COMMENT ON TABLE rutas IS 'Definición de rutas de transporte';
COMMENT ON TABLE viajes IS 'Registro histórico de viajes';
COMMENT ON TABLE ubicaciones_espera_alumnos IS 'Ubicaciones temporales de alumnos esperando';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones del sistema';
COMMENT ON TABLE logs_auditoria IS 'Registro de auditoría de acciones';
