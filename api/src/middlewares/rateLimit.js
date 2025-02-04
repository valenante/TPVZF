// middlewares/rateLimit.js
import rateLimit from "express-rate-limit";
import { warn, error } from "../../utils/logger.js"; // ✅ Importamos el logger

// Función para registrar intentos bloqueados
const logRateLimit = (req, res, options) => {
  const ip = req.ip || req.connection.remoteAddress;
  warn(`🚨 IP bloqueada por exceso de solicitudes: ${ip} | Endpoint: ${req.originalUrl}`);
};

// 🔒 Límite para intentos de login (fuerza bruta)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 intentos por IP
  message: "Demasiados intentos de inicio de sesión. Intente de nuevo más tarde.",
  headers: true,
  handler: logRateLimit, // ✅ Registrar intento bloqueado
});

// 🚀 Límite general para evitar abuso en la API
export const generalRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // Máximo 100 solicitudes por IP en 5 minutos
  message: "Demasiadas solicitudes desde esta IP. Intente más tarde.",
  headers: true,
  handler: logRateLimit,
});

// 🛑 Límite en pedidos para evitar spam
export const pedidosRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 pedidos por minuto
  message: "Has realizado demasiados pedidos en poco tiempo. Espera un momento.",
  headers: true,
  handler: logRateLimit,
});

// 🔥 Límite en valoraciones para evitar spam
export const valoracionesRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Máximo 5 valoraciones en 10 minutos
  message: "Has enviado demasiadas valoraciones. Inténtalo más tarde.",
  headers: true,
  handler: logRateLimit,
});
