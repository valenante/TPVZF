import express from "express";
import { config } from "dotenv";
import compression from "compression";
import { info, error as _error } from "./utils/logger.js";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import { corsOptions, sessionConfig, configureSocketIO, connectToDatabase, PORT } from "./config/config.js"; // ✅ Importamos la configuración
import mesaRoutes from "./src/routes/mesaRoutes.js";
import productoRoutes from "./src/routes/productosRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import pedidosRoutes from "./src/routes/pedidosRoutes.js";
import pedidoBebidasRoutes from "./src/routes/pedidoBebidasRoutes.js";
import ventasRoutes from "./src/routes/ventasRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import passwordRoutes from "./src/routes/passwordRoutes.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import notFoundHandler from "./src/middlewares/notFoundHandler.js";
import cajaRoutes from "./src/routes/cajaRoutes.js";
import eliminacionRoutes from "./src/routes/eliminacionRoutes.js";
import cajaDiariaRoutes from "./src/routes/cajaDiariaRoutes.js";
import valoracionesRoutes from "./src/routes/valoracionesRoutes.js";
import cuentaRoutes from "./src/routes/cuentaRoutes.js";
import imagesRoutes from "./src/routes/imagesRoutes.js";

// Configurar dotenv
config();

// Inicializar Express y servidor HTTP
const app = express();
const server = createServer(app);

// Configurar CORS
app.use(cors(corsOptions));

// Configurar sesión
app.use(session(sessionConfig));

// Middleware de compresión HTTP
app.use(compression());

// Middleware para parsear cookies
app.use(cookieParser());

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Socket.IO
const io = configureSocketIO(server);

// Compartir instancia de Socket.IO con las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Conectar a MongoDB
connectToDatabase();

//Devolver imagenes
app.use(express.static("public"));

// Registrar rutas
app.use("/api/mesas", mesaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/pedidosBebidas", pedidoBebidasRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/caja", cajaRoutes);
app.use("/api/eliminaciones", eliminacionRoutes);
app.use("/api/cajaDiaria", cajaDiariaRoutes);
app.use("/api/valoraciones", valoracionesRoutes);
app.use("/api/cuenta", cuentaRoutes);
app.use("/api/images", imagesRoutes);

// Middlewares de error
app.use(notFoundHandler);
app.use(errorHandler);

// Ruta principal
app.get("/", (req, res) => {
  info("Se recibió una solicitud en la ruta raíz");
  res.send("¡Bienvenido a la API de ZF!");
});

// Manejo de errores no capturados
process.on("uncaughtException", (error) => {
  _error(`Excepción no capturada: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  _error(`Promesa no manejada: ${reason}`);
  process.exit(1);
});

// Configurar eventos de Socket.IO
io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`Cliente desconectado: ${socket.id}, motivo: ${reason}`);
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  info(`Servidor escuchando en el puerto ${PORT}`);
});

export { io };
