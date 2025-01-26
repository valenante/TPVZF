import limpiarTokensExpirados from "./utils/cleanupTokens.js";

// Ejecutar limpieza de tokens cada 1 hora
setInterval(() => {
  limpiarTokensExpirados();
}, 3600000); // 1 hora en milisegundos

import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import compression from "compression";
import { info, error as _error } from "./utils/logger.js";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import mesaRoutes from "./src/routes/mesaRoutes.js"; // Importar rutas de mesas
import productoRoutes from "./src/routes/productosRoutes.js"; // Importar rutas de productos
import authRoutes from "./src/routes/authRoutes.js"; // Importar rutas de autenticación
import pedidosRoutes from "./src/routes/pedidosRoutes.js"; // Importar rutas de pedidos
import ventasRoutes from "./src/routes/ventasRoutes.js"; // Importar rutas de ventas
import cartRoutes from "./src/routes/cartRoutes.js"; // Importar rutas de carrito
import passwordRoutes from "./src/routes/passwordRoutes.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import notFoundHandler from "./src/middlewares/notFoundHandler.js";
import cajaRoutes from "./src/routes/cajaRoutes.js"; // Importar rutas de caja
import eliminacionRoutes from "./src/routes/eliminacionRoutes.js"; // Importar rutas de eliminaciones
import cajaDiariaRoutes from "./src/routes/cajaDiariaRoutes.js"; // Importar rutas de caja diaria
import valoracionesRoutes from "./src/routes/valoracionesRoutes.js"; // Importar rutas de 
import cuentaRoutes from "./src/routes/cuentaRoutes.js"; // Importar rutas de cuenta

// Configurar dotenv para variables de entorno
config();

// Inicializar la aplicación Express
const app = express();
const server = createServer(app); // Crear el servidor HTTP
dotenv.config();


const corsOptions = {
  origin: ["http://localhost:3002", "http://172.20.10.7:3002", "http://localhost:3001", "http://172.20.10.7:3001", "http://localhost:3000", "http://172.20.10.7:3000"], // Orígenes permitidos
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization",'X-Cart-ID'], // Encabezados permitidos
  credentials: true, // Permitir envío de cookies
};


app.use(cors(corsOptions)); // Habilitar CORS con opciones específicas
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3002", "http://172.20.10.7:3002", "http://localhost:3001", "http://172.20.10.7:3001", "http://localhost:3000", "http://172.20.10.7:3000"], // Orígenes permitidos
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization",'X-Cart-ID'],
    credentials: true,
  },
});


// Middleware de compresión HTTP
app.use(compression());

// Middleware para parsear JSON
app.use(json());

// Middleware para parsear cookies
app.use(cookieParser());

// Middleware para interpretar datos codificados en la URL
app.use(urlencoded({ extended: true }));

// Middleware para compartir `io` con las rutas
app.use((req, res, next) => {
  req.io = io; // Compartir la instancia de Socket.IO con los controladores
  next();
});

// Variables de entorno y configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dataBaseZF";
const PORT = process.env.PORT || 3000;

// Log inicial
info("Aplicación iniciada correctamente");

// Conexión a MongoDB
connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    info("Conectado a MongoDB");
    console.log("Conectado a MongoDB");
  })
  .catch((error) => {
    _error(`Error al conectar a MongoDB: ${error.message}`);
    console.error("Error al conectar a MongoDB:", error);
  });

// Rutas
app.use("/api/mesas", mesaRoutes); // Rutas de mesas
app.use("/api/productos", productoRoutes); // Rutas de productos
app.use("/api/auth", authRoutes); // Rutas de autenticación
app.use("/api/pedidos", pedidosRoutes); // Rutas de pedidos
app.use("/api/ventas", ventasRoutes); // Rutas de ventas
app.use("/api/cart", cartRoutes); // Rutas de carrito
app.use("/api/password", passwordRoutes); // Rutas de contraseña
app.use("/api/caja", cajaRoutes); // Rutas de caja
app.use("/api/eliminaciones", eliminacionRoutes); // Rutas de eliminaciones
app.use("/api/cajaDiaria", cajaDiariaRoutes); // Rutas de caja diaria
app.use("/api/valoraciones", valoracionesRoutes); // Rutas de valoraciones
app.use("/api/cuenta", cuentaRoutes); // Rutas de cuenta

app.use(notFoundHandler);
app.use(errorHandler);

// Ruta de ejemplo
app.get("/", (req, res) => {
  info("Se recibió una solicitud en la ruta raíz");
  res.send("¡Bienvenido a la API de ZF!");
});

// Manejo de errores no capturados
process.on("uncaughtException", (error) => {
  _error(`Excepción no capturada: ${error.message}`);
  process.exit(1); // Finalizar la aplicación
});

process.on("unhandledRejection", (reason) => {
  _error(`Promesa no manejada: ${reason}`);
  process.exit(1); // Finalizar la aplicación
});

import debug from "debug";

const debugLog = debug("socket.io");
debugLog.enabled = true; // Activa logs de Socket.IO

io.on("connection", (socket) => {
  debugLog(`Cliente conectado: ${socket.id}`);
});

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`Cliente desconectado: ${socket.id}, motivo: ${reason}`);
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  info(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

export {io};