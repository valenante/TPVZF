import { Router } from 'express';
const router = Router();
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { check } from 'express-validator';

// Obtener el carrito
router.get('/', getCart);

// Agregar un producto al carrito
router.post(
  '/',
  [
    check('productId', 'El ID del producto es obligatorio.').isMongoId(),
    check('cantidad', 'La cantidad debe ser un número positivo.').isInt({ min: 1 }),
  ],
  addToCart
);

// Actualizar un producto del carrito
router.put(
  '/',
  [
    check('itemId', 'El ID del item es obligatorio.').isMongoId(),
    check('cantidad', 'La cantidad debe ser un número positivo.').isInt({ min: 1 }),
  ],
  updateCartItem
);

// Eliminar un producto del carrito
router.delete('/:itemId', removeFromCart);

// Vaciar el carrito
router.delete('/',  clearCart);

export default router;
