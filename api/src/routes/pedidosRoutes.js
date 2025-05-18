import { Router } from 'express';
const router = Router();
import {
  agregarProductoAlPedido,
  verificarPedidosMesa,
  obtenerPedidos,
  obtenerPedidosId,
  obtenerPedidosPendientes,
  obtenerPedidosFinalizados,
  crearPedido,
  actualizarPedido,
  actualizarProducto,
  eliminarPedido,
  obtenerPedidoPorMesaId,
} from '../controllers/pedidosController.js';
import verificarLider from '../middlewares/verificarLider.js';

// Obtener todos los pedidos
router.get('/', obtenerPedidos);

// Obtener un pedido por ID
router.get('/:id', obtenerPedidosId);

//Obtener un pedido pendiente
router.get('/pendientes/pendientes', obtenerPedidosPendientes);

//Obtener un pedido finalizado
router.get('/finalizados/finalizados', obtenerPedidosFinalizados);

//Obtener pedidos finalizados por mesa
router.get('/pedidos/estado/:numeroMesa', verificarPedidosMesa);

// Obtener pedidos por mesa
router.get('/mesa/:mesaId', obtenerPedidoPorMesaId);

// Crear un nuevo pedido
router.post('/', crearPedido, verificarLider);

//Agregar un producto a un pedido
router.post('/:mesaId/agregar-producto', agregarProductoAlPedido);

// Actualizar un pedido por ID
router.put('/:id', actualizarPedido);

//Actualizar el estado de un producto en un pedido
router.put('/:pedidoId/producto/:productoId', actualizarProducto);

// Eliminar un producto por ID
router.delete('/:pedidoId/:id', eliminarPedido);

export default router;
