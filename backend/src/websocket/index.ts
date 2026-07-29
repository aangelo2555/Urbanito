import { WebSocketServer, WebSocket } from 'ws';
import { db } from '../config/database';
import { redis } from '../config/redis';

interface ClientInfo {
  ws: WebSocket;
  userId: string;
  role: string;
}

const clients = new Map<string, ClientInfo>();
const activeUbicaciones = new Map<string, any>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'auth':
            handleAuth(ws, data);
            break;

          case 'ubicacion_gps':
            await handleUbicacionGPS(data);
            break;

          case 'subscribe_ubicaciones':
            handleSubscribeUbicaciones(ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      const clientId = findClientId(ws);
      if (clientId) {
        clients.delete(clientId);
      }
    });
  });
}

function handleAuth(ws: WebSocket, data: any) {
  const { userId, role } = data;
  if (userId) {
    clients.set(userId, { ws, userId, role });
  }
  ws.send(JSON.stringify({ type: 'auth_success' }));

  // Enviar inmediatamente las ubicaciones activas al autenticarse
  handleSubscribeUbicaciones(ws);
}

async function handleUbicacionGPS(data: any) {
  const { choferId, lat, lng, velocidad, rumbo } = data;
  if (!choferId || lat === undefined || lng === undefined) return;

  // Buscar viaje id activo para este chofer
  let viajeId = `viaje_${choferId}`;
  try {
    const res = await db.query(
      `SELECT v.id FROM viajes v
       JOIN choferes c ON v.chofer_id = c.id
       WHERE (c.id = $1 OR c.usuario_id = $1) AND v.estado = 'en_curso'
       ORDER BY v.hora_inicio DESC LIMIT 1`,
      [choferId]
    );
    if (res.rows.length > 0) {
      viajeId = res.rows[0].id;
    }
  } catch (err) {
    console.error('Error buscando viaje para WebSocket:', err);
  }

  const ubicacionObj = {
    viaje_id: viajeId,
    chofer_id: choferId,
    lat,
    lng,
    velocidad: velocidad || 0,
    rumbo: rumbo || 0,
    timestamp: Date.now(),
  };

  // Guardar en memoria
  activeUbicaciones.set(choferId, ubicacionObj);

  // Intentar guardar en Redis si está disponible
  try {
    await redis.set(
      `ubicacion:${choferId}`,
      JSON.stringify(ubicacionObj),
      { EX: 120 }
    );
  } catch (e) {}

  // Construir mapa de ubicaciones activas (menos de 3 minutos de antigüedad)
  const payloadMap: Record<string, any> = {};
  activeUbicaciones.forEach((val, key) => {
    if (Date.now() - val.timestamp < 180000) {
      payloadMap[key] = val;
    }
  });

  // Transmitir a todos los clientes (alumnos, admin, choferes)
  broadcast({
    type: 'ubicaciones_actualizadas',
    ubicaciones: payloadMap,
  });

  broadcast({
    type: 'ubicacion_actualizada',
    choferId,
    ubicacion: ubicacionObj,
    lat,
    lng,
  });
}

function handleSubscribeUbicaciones(ws: WebSocket) {
  const payloadMap: Record<string, any> = {};
  activeUbicaciones.forEach((val, key) => {
    if (Date.now() - val.timestamp < 180000) {
      payloadMap[key] = val;
    }
  });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'ubicaciones_actualizadas',
        ubicaciones: payloadMap,
      })
    );
  }
}

function broadcast(message: any) {
  const msgString = JSON.stringify(message);
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msgString);
    }
  });
}

function findClientId(ws: WebSocket): string | null {
  for (const [id, client] of clients) {
    if (client.ws === ws) return id;
  }
  return null;
}
