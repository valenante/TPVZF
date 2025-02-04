// utils/logger.js
import { createLogger, format, transports } from "winston";

// Definir formato de logs
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
);

// Crear el logger
const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }), // Guardar errores
    new transports.File({ filename: "logs/combined.log" }), // Guardar todos los logs
    new transports.File({ filename: "logs/rate-limit.log", level: "warn" }), // ✅ Guardar intentos bloqueados
  ],
});

// Exportar funciones para logs
export const info = (message) => logger.info(message);
export const warn = (message) => logger.warn(message);
export const error = (message) => logger.error(message);

