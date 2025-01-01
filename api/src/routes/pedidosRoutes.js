const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidosController');

// Obtener todos los pedidos
router.get('/', pedidoController.getPedidos);

// Obtener un pedido por ID
router.get('/:id', pedidoController.getPedidoById);

// Crear un nuevo pedido
router.post('/', pedidoController.createPedido);

// Actualizar un pedido por ID
router.put('/:id', pedidoController.updatePedido);

// Eliminar un pedido por ID
router.delete('/:id', pedidoController.deletePedido);

module.exports = router;
