import { Router } from 'express';
const router = Router();
import { getPedidos, getPedidoById, getPedidosPendientes, getPedidosFinalizados, createPedido, updatePedido, updateProducto, deletePedido } from '../controllers/pedidosController.js';

// Obtener todos los pedidos
router.get('/', getPedidos);

// Obtener un pedido por ID
router.get('/:id', getPedidoById);

//Obtener un pedido pendiente
router.get('/pendientes/pendientes', getPedidosPendientes);

//Obtener un pedido finalizado
router.get('/finalizados/finalizados', getPedidosFinalizados);

// Crear un nuevo pedido
router.post('/', createPedido);

// Actualizar un pedido por ID
router.put('/:id', updatePedido);

//Actualizar el estado de un producto en un pedido
router.put('/:pedidoId/producto/:productoId', updateProducto);

// Eliminar un pedido por ID
router.delete('/:id', deletePedido);

export default router;
