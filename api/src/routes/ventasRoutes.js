const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Obtener todas las ventas
router.get('/', ventasController.getVentas);

// Obtener una venta por ID
router.get('/:id', ventasController.getVentaById);

// Crear una nueva venta
router.post('/', ventasController.createVenta);

// Actualizar una venta por ID
router.put('/:id', ventasController.updateVenta);

// Eliminar una venta por ID
router.delete('/:id', ventasController.deleteVenta);

module.exports = router;
