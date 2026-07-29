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
  handleSubscribeUbicaciones(ws);
}

export function finalizarUbicacionChofer(choferId: string) {
  const ubic = activeUbicaciones.get(choferId);
  if (ubic) {
    ubic.inactivo = true;
    ubic.estado_viaje = 'finalizado';
    ubic.timestamp = Date.now();
    activeUbicaciones.set(choferId, ubic);
  }

  try {
    redis.del(`ubicacion:${choferId}`);
  } catch (e) {}

  emitirUbicacionesActualizadas();
}

async function handleUbicacionGPS(data: any) {
  const { choferId, lat, lng, velocidad, rumbo } = data;
  if (!choferId || lat === undefined || lng === undefined) return;

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
    inactivo: false,
    estado_viaje: 'en_curso',
    timestamp: Date.now(),
  };

  activeUbicaciones.set(choferId, ubicacionObj);

  try {
    await redis.set(
      `ubicacion:${choferId}`,
      JSON.stringify(ubicacionObj),
      { EX: 120 }
    );
  } catch (e) {}

  emitirUbicacionesActualizadas();

  broadcast({
    type: 'ubicacion_actualizada',
    choferId,
    ubicacion: ubicacionObj,
    lat,
    lng,
  });
}

function emitirUbicacionesActualizadas() {
  const payloadMap: Record<string, any> = {};
  const ahora = Date.now();

  activeUbicaciones.forEach((val, key) => {
    const msInactivo = ahora - val.timestamp;
    
    // Si han pasado más de 40 segundos sin señal GPS o el viaje finalizó
    if (msInactivo > 40000 || val.estado_viaje === 'finalizado') {
      val.inactivo = true;
    }

    // Mantener la combi inactiva (color gris) durante 2 minutos maximo antes de removerla completamente
    if (msInactivo < 120000) {
      payloadMap[key] = val;
    } else {
      activeUbicaciones.delete(key);
    }
  });

  broadcast({
    type: 'ubicaciones_actualizadas',
    ubicaciones: payloadMap,
  });
}

function handleSubscribeUbicaciones(ws: WebSocket) {
  emitirUbicacionesActualizadas();
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
