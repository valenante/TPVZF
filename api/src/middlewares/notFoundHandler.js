const notFoundHandler = (req, res, next) => {
    res.status(404).json({
      error: {
        message: 'Ruta no encontrada',
        status: 404,
      },
    });
  };
  
  module.exports = notFoundHandler;
  