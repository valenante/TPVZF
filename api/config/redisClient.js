// config/redisClient.js
import { createClient } from 'redis';

// Puedes usar variables de entorno para mayor seguridad y flexibilidad
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000), // reconexión progresiva
  },
});

redisClient.on('connect', () => {
  console.log('🔗 Conectado a Redis');
});

redisClient.on('ready', () => {
  console.log('✅ Redis listo para usar');
});

redisClient.on('error', (err) => {
  console.error('❌ Error en Redis:', err);
});

redisClient.on('end', () => {
  console.log('🔌 Conexión con Redis finalizada');
});

// Nos aseguramos de conectar de forma asíncrona
await redisClient.connect();

export default redisClient;
