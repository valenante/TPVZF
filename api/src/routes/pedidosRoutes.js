const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidosController');

// Obtener todos los pedidos
router.get('/', pedidoController.getPedidos);

// Obtener un pedido por ID
router.get('/:id', pedidoController.getPedidoById);

//Obtener un pedido pendiente
router.get('/pendientes/pendientes', pedidoController.getPedidosPendientes);

//Obtener un pedido finalizado
router.get('/finalizados/finalizados', pedidoController.getPedidosFinalizados);

// Crear un nuevo pedido
router.post('/', pedidoController.createPedido);

// Actualizar un pedido por ID
router.put('/:id', pedidoController.updatePedido);

//Actualizar el estado de un producto en un pedido
router.put('/:pedidoId/producto/:productoId', pedidoController.updateProducto);

// Eliminar un pedido por ID
router.delete('/:id', pedidoController.deletePedido);

module.exports = router;
