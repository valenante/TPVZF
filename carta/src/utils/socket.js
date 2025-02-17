// utils/socket.js
import { io } from 'socket.io-client';

// Cambia la URL según la de tu backend
const socket = io(`http://192.168.98.203:3000`);

export default socket;
