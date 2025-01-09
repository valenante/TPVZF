const limpiarTokensExpirados = require("./utils/cleanupTokens");

// Ejecutar limpieza de tokens cada 1 hora
setInterval(() => {
  limpiarTokensExpirados();
}, 3600000); // 1 hora en milisegundos

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const compression = require("compression");
const logger = require("./utils/logger");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mesaRoutes = require("./src/routes/mesaRoutes"); // Importar rutas de mesas
const productoRoutes = require("./src/routes/productosRoutes"); // Importar rutas de productos
const authRoutes = require("./src/routes/authRoutes"); // Importar rutas de autenticación
const pedidosRoutes = require("./src/routes/pedidosRoutes"); // Importar rutas de pedidos
const ventasRoutes = require("./src/routes/ventasRoutes"); // Importar rutas de ventas
const cartRoutes = require("./src/routes/cartRoutes"); // Importar rutas de carrito
const errorHandler = require("./src/middlewares/errorHandler");
const notFoundHandler = require("./src/middlewares/notFoundHandler");


// Configurar dotenv para variables de entorno
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const server = http.createServer(app); // Crear el servidor HTTP

// Configuración de CORS
const corsOptions = {
  origin: '*', // Dirección del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true, // Permitir envío de cookies si es necesario
};

app.use(cors(corsOptions)); // Habilitar CORS con opciones específicas
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir acceso desde cualquier origen (modifícalo según tu entorno)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware de compresión HTTP
app.use(compression());

// Middleware para parsear JSON
app.use(express.json());

// Middleware para compartir `io` con las rutas
app.use((req, res, next) => {
  req.io = io; // Compartir la instancia de Socket.IO con los controladores
  next();
});

// Variables de entorno y configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dataBaseZF";
const PORT = process.env.PORT || 3000;

// Log inicial
logger.info("Aplicación iniciada correctamente");

// Conexión a MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Conectado a MongoDB");
    console.log("Conectado a MongoDB");
  })
  .catch((error) => {
    logger.error(`Error al conectar a MongoDB: ${error.message}`);
    console.error("Error al conectar a MongoDB:", error);
  });

// Rutas
app.use("/api/mesas", mesaRoutes); // Rutas de mesas
app.use("/api/productos", productoRoutes); // Rutas de productos
app.use("/api/auth", authRoutes); // Rutas de autenticación
app.use("/api/pedidos", pedidosRoutes); // Rutas de pedidos
app.use("/api/ventas", ventasRoutes); // Rutas de ventas
app.use("/api/cart", cartRoutes); // Rutas de carrito

app.use(notFoundHandler);
app.use(errorHandler);

// Ruta de ejemplo
app.get("/", (req, res) => {
  logger.info("Se recibió una solicitud en la ruta raíz");
  res.send("¡Bienvenido a la API de ZF!");
});

// Manejo de errores no capturados
process.on("uncaughtException", (error) => {
  logger.error(`Excepción no capturada: ${error.message}`);
  process.exit(1); // Finalizar la aplicación
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Promesa no manejada: ${reason}`);
  process.exit(1); // Finalizar la aplicación
});

// Configuración de Socket.IO
io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Ejemplo: Escuchar eventos personalizados
  socket.on("mensaje", (data) => {
    console.log(`Mensaje recibido: ${data}`);
  });

  // Desconexión
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  logger.info(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
