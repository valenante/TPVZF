// utils/socket.js
import { io } from 'socket.io-client';

// Cambia la URL según la de tu backend
const socket = io('http://172.20.10.7:3000');

export default socket;
