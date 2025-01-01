const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');

// Rutas
router.get('/', mesaController.getMesas); // Obtener todas las mesas activas
router.get('/:id', mesaController.getMesaById); // Obtener una mesa activa por ID
router.post('/', mesaController.abrirMesa); // Abrir una nueva mesa
router.put('/:id/cerrar', mesaController.cerrarMesa); // Cerrar una mesa
router.get('/historial', mesaController.getHistorialMesas); // Obtener el historial de mesas cerradas
router.get('/:numeroMesa', mesaController.getMesaByNumero); // Obtener una mesa activa por número

module.exports = router;
