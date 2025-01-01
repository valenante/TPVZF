const logger = require('../../utils/logger'); // Asegúrate de tener `winston` configurado

const errorHandler = (err, req, res, next) => {
  // Determina el estado HTTP (500 si no se especifica)
  const status = err.status || 500;

  // Loggea el error en consola y en el logger
  logger.error(`[${req.method}] ${req.url} - ${err.message}`);
  console.error(err.stack);

  // Responde al cliente con un mensaje estándar
  res.status(status).json({
    error: {
      message: err.message || 'Error interno del servidor',
      status,
    },
  });
};

module.exports = errorHandler;
