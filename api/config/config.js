// config/config.js
import { Server } from "socket.io";
import { config } from "dotenv";
import { connect } from "mongoose";

// Cargar variables de entorno
config();

// Configuración de CORS
export const corsOptions = {
  origin: [
    "http://localhost:3002",
    "http://172.20.10.7:3002",
    "http://localhost:3001",
    "http://172.20.10.7:3001",
    "http://localhost:3000",
    "http://172.20.10.7:3000",
    "http://172.20.10.18:3000",
    "http://172.20.10.18:3001",
    "http://172.20.10.18:3002",
    "http://192.168.98.203:3000",
    "http://192.168.98.203:3001",
    "http://192.168.98.203:3002",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Cart-ID"],
  credentials: true,
};

// Configuración de la sesión
export const sessionConfig = {
  secret: process.env.SESSION_SECRET, // Clave secreta para firmar la cookie
  resave: false, // No guarda la sesión si no hay cambios
  saveUninitialized: false, // No crea sesiones vacías
  cookie: {
    httpOnly: true, // Solo accesible desde el servidor
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "Strict", // Protege contra ataques CSRF
    maxAge: 15 * 60 * 1000, // 15 minutos de duración
  },
};

// Configuración de Socket.IO
export const configureSocketIO = (server) => {
  return new Server(server, {
    cors: corsOptions,
  });
};

// Configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI;

export const connectToDatabase = async () => {
  try {
    await connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1); // Salir de la aplicación en caso de error crítico
  }
};

// Configuración del puerto
export const PORT = process.env.PORT || 3000;
