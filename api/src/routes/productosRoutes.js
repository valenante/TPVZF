import { Router } from 'express';
import { check } from 'express-validator';
import { getProductos, getProductoById, getCategoriasByType, getProductosByCategory, updateProducto, createProducto, deleteProducto } from '../controllers/productosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/checkRole.js';
const router = Router();

// Obtener todos los productos (ruta pública)
router.get('/', getProductos);

// Obtener un producto por ID (ruta pública con validación)
router.get('/:id', [
    check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId()
], getProductoById);

//Obtener categorias de productos
router.get('/categories/:type', getCategoriasByType);

//Obtener productos por categoria
router.get('/category/:category', getProductosByCategory);

//Editar producto
router.put('/:id', updateProducto);

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
    createProducto
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
    updateProducto
);

// Eliminar un producto por ID (solo usuarios autenticados y con rol admin)
router.delete(
    '/:id',
    authMiddleware,
    checkRole(['admin']), // Solo los administradores pueden eliminar productos
    [
        check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId()
    ],
    deleteProducto
);

export default router;
