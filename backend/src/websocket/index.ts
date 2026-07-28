import { WebSocketServer, WebSocket } from 'ws';
import { redis } from '../config/redis';

interface ClientInfo {
  ws: WebSocket;
  userId: string;
  role: string;
}

const clients = new Map<string, ClientInfo>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

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
            handleSubscribeUbicaciones(ws, data);
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
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
  clients.set(userId, { ws, userId, role });
  ws.send(JSON.stringify({ type: 'auth_success' }));
}

async function handleUbicacionGPS(data: any) {
  const { choferId, lat, lng, velocidad, rumbo } = data;
  
  await redis.set(
    `ubicacion:${choferId}`,
    JSON.stringify({ lat, lng, velocidad, rumbo, timestamp: Date.now() }),
    { EX: 60 }
  );

  broadcast({ type: 'ubicacion_actualizada', choferId, lat, lng });
}

function handleSubscribeUbicaciones(ws: WebSocket, data: any) {
  // Cliente se suscribe a actualizaciones
}

function broadcast(message: any) {
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function findClientId(ws: WebSocket): string | null {
  for (const [id, client] of clients) {
    if (client.ws === ws) return id;
  }
  return null;
}
