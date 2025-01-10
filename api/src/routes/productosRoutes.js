const express = require('express');
const { check } = require('express-validator');
const productosController = require('../controllers/productosController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/checkRole');
const router = express.Router();

// Obtener todos los productos (ruta pública)
router.get('/', productosController.getProductos);

// Obtener un producto por ID (ruta pública con validación)
router.get('/:id', [
    check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId()
], productosController.getProductoById);

//Obtener categorias de productos
router.get('/categories/:type', productosController.getCategoriasByType);

//Obtener productos por categoria
router.get('/category/:category', productosController.getProductosByCategory);

//Editar producto
router.put('/:id', productosController.updateProducto);

// Crear un nuevo producto (solo usuarios autenticados y con rol admin)
router.post(
    '/',
    authMiddleware,
    checkRole(['admin']), // Solo los administradores pueden crear productos
    [
        check('nombre', 'El nombre es obligatorio').notEmpty(),
        check('categoria', 'La categoría es obligatoria').notEmpty(),
        check('precios.precioBase', 'El precio base debe ser un número positivo').isFloat({ min: 0 }),
        check('stock', 'El stock debe ser un número entero positivo').optional().isInt({ min: 0 }),
        check('tipo', 'El tipo debe ser "plato" o "bebida"').isIn(['plato', 'bebida']),
    ],
    productosController.createProducto
);

// Actualizar un producto por ID (solo usuarios autenticados y con rol admin)
router.put(
    '/:id',
    authMiddleware,
    checkRole(['admin']), // Solo los administradores pueden actualizar productos
    [
        check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId(),
        check('nombre', 'El nombre es obligatorio').optional().notEmpty(),
        check('precios.precioBase', 'El precio base debe ser un número positivo').optional().isFloat({ min: 0 }),
        check('stock', 'El stock debe ser un número entero positivo').optional().isInt({ min: 0 }),
    ],
    productosController.updateProducto
);

// Eliminar un producto por ID (solo usuarios autenticados y con rol admin)
router.delete(
    '/:id',
    authMiddleware,
    checkRole(['admin']), // Solo los administradores pueden eliminar productos
    [
        check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId()
    ],
    productosController.deleteProducto
);

module.exports = router;
