const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// Obtener el carrito
router.get('/', cartController.getCart);

// Agregar un producto al carrito
router.post(
  '/',
  [
    check('productId', 'El ID del producto es obligatorio.').isMongoId(),
    check('cantidad', 'La cantidad debe ser un número positivo.').isInt({ min: 1 }),
  ],
  cartController.addToCart
);

// Actualizar un producto del carrito
router.put(
  '/',
  [
    check('itemId', 'El ID del item es obligatorio.').isMongoId(),
    check('cantidad', 'La cantidad debe ser un número positivo.').isInt({ min: 1 }),
  ],
  cartController.updateCartItem
);

// Eliminar un producto del carrito
router.delete('/:itemId', cartController.removeFromCart);

// Vaciar el carrito
router.delete('/',  cartController.clearCart);

module.exports = router;
