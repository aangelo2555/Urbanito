-- Datos iniciales para el sistema Urbanito

-- Insertar configuración del sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('ubicacion_espera_expiracion_minutos', '20', 'Minutos antes de expirar ubicación de espera'),
('actualizacion_gps_segundos', '7', 'Segundos entre actualizaciones GPS'),
('radio_busqueda_alumnos_metros', '500', 'Radio de búsqueda de alumnos cerca de ruta'),
('velocidad_minima_movimiento_kmh', '5', 'Velocidad mínima para considerar movimiento'),
('tiempo_inactividad_alerta_minutos', '10', 'Minutos de inactividad antes de alertar')
ON CONFLICT (clave) DO NOTHING;

-- Insertar usuario administrador (Password por defecto: admin123)
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estado) VALUES
('00000000-0000-0000-0000-000000000001', 'Administrador Urbanito', 'admin@urbanito.com', '$2a$10$r9G5QjH2P9wLwZ3nE1dG5.n6J1qA8R9uE0Y2W3X4Y5Z6A7B8C9D0E', 'admin', 'activo')
ON CONFLICT (id) DO NOTHING;

-- Insertar ruta predeterminada Buenavista - La Florida
INSERT INTO rutas (id, nombre, origen, destino, paradas, polyline, distancia_km, tiempo_estimado_min, activa) VALUES
('00000000-0000-0000-0000-000000000100',
'Buenavista - La Florida (UNAB)',
'Buenavista',
'La Florida - Universidad Nacional de Barranca',
'[
  {
    "id": "1",
    "nombre": "Buenavista (Inicio)",
    "coordenada": {"lat": -10.75, "lng": -77.76},
    "orden": 1
  },
  {
    "id": "2",
    "nombre": "Universidad Nacional de Barranca - La Florida",
    "coordenada": {"lat": -10.73833, "lng": -77.75278},
    "orden": 2,
    "es_parada_universidad": true
  }
]'::jsonb,
'[
  {"lat": -10.75, "lng": -77.76},
  {"lat": -10.73833, "lng": -77.75278}
]'::jsonb,
3.8,
15,
true)
ON CONFLICT (id) DO NOTHING;
