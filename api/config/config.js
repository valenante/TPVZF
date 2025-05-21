// config/config.js
import { Server } from "socket.io";
import { config } from "dotenv";
import { connect } from "mongoose";
import MongoStore from "connect-mongo";

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
    "http://192.168.1.142:3001",
    "http://192.168.1.142:3002",
    "http://192.168.18.26:3001",
    "http://192.168.18.26:3000",
    "http://192.168.18.26:3002",
    "http://192.168.1.150:3000",
    "http://192.168.1.150:3001",
    "http://192.168.1.150:3002",
    "https://valenante.info",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Cart-ID"],
  credentials: true,
};

// Configuración de la sesión
export const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "None",
    maxAge: 15 * 60 * 1000, // 15 minutos
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // tu conexión a Mongo Atlas o local
    collectionName: "sessions",
    ttl: 15 * 60, // duración de la sesión en segundos (15 min)
  }),
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
