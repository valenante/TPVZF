// utils/socket.js
import { io } from 'socket.io-client';

// ✅ Usamos variable de entorno para la URL del servidor de Socket.io
const socket = io(process.env.REACT_APP_SOCKET_URL);

export default socket;
