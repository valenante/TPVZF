const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Cambia a 'debug' o 'error' según el nivel de detalle que necesites
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Log en la consola
    new transports.File({ filename: 'logs/app.log' }) // Log en un archivo
  ],
});

module.exports = logger;
