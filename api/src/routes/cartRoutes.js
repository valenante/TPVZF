import { Router } from 'express';
const router = Router();
import {
  eliminarDelCarrito,
  agregarAlCarrito,
  actualizarItem,
  obtenerCarrito,
  vaciarCarrito,
} from '../controllers/cartController.js';
import { check } from 'express-validator';
import verificarLider from '../middlewares/verificarLider.js';

// Obtener el carrito
router.get('/', obtenerCarrito);

// Agregar un producto al carrito
router.post(
  '/',
  [
    check('productId', 'El ID del producto es obligatorio.').isMongoId(),
    check('cantidad', 'La cantidad debe ser un número positivo.').isInt({
      min: 1,
    }),
  ],
  agregarAlCarrito
);

// Actualizar un producto del carrito
router.put(
  '/',
  [
    check('itemId', 'El ID del item es obligatorio.').isMongoId(),
    check('cantidad', 'La cantidad debe ser un número positivo.').isInt({
      min: 1,
    }),
  ],
  actualizarItem
);

// Eliminar un producto del carrito
router.delete('/:itemId', eliminarDelCarrito, verificarLider);

// Vaciar el carrito
router.delete('/', vaciarCarrito);

export default router;
