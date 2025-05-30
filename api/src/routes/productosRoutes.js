import { Router } from 'express';
import { check } from 'express-validator';
import {
  obtenerProductos,
  obtenerCategoriasPorTipo,
  obtenerProductosPorCategoria,
  editarProducto,
  crearProducto,
  eliminarProducto,
  eliminarProductoPedido,
  obtenerProductoPorId,
  buscarProductoPorNombre
} from '../controllers/productosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/checkRole.js';
const router = Router();

// Obtener todos los productos (ruta pública)
router.get('/', obtenerProductos);

// Obtener un producto por ID (ruta pública con validación)
router.get(
  '/:id',
  [check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId()],
  obtenerProductoPorId
);

//Obtener categorias de productos
router.get('/categories/:type', obtenerCategoriasPorTipo);

//Obtener productos por categoria
router.get('/category/:category', obtenerProductosPorCategoria);

// Crear un nuevo producto (solo usuarios autenticados y con rol admin)
router.post(
  '/',
  authMiddleware,
  checkRole(['admin']), // Solo los administradores pueden crear productos
  [
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('categoria', 'La categoría es obligatoria').notEmpty(),
    check(
      'precios.precioBase',
      'El precio base debe ser un número positivo'
    ).isFloat({ min: 0 }),
    check('stock', 'El stock debe ser un número entero positivo')
      .optional()
      .isInt({ min: 0 }),
    check('tipo', 'El tipo debe ser "plato" o "bebida"').isIn([
      'plato',
      'bebida',
    ]),
  ],
  crearProducto
);

// GET /api/productos/buscar?nombre=cerveza
router.get('/buscar/buscar', buscarProductoPorNombre);


// Actualizar un producto por ID (solo usuarios autenticados y con rol admin)
router.put(
  '/:id',
  authMiddleware,
  checkRole(['admin']), // Solo los administradores pueden actualizar productos
  [
    check('id', 'El ID debe ser un ID de MongoDB válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').optional().notEmpty(),
    check('precios.precioBase', 'El precio base debe ser un número positivo')
      .optional()
      .isFloat({ min: 0 }),
    check('stock', 'El stock debe ser un número entero positivo')
      .optional()
      .isInt({ min: 0 }),
  ],
  editarProducto
);

// Route to delete a product by ID (only authenticated users with admin role)
router.delete('/:id', eliminarProducto);

// Eliminar un producto por ID (solo usuarios autenticados y con rol admin)
router.post('/:pedidoId/:id', eliminarProductoPedido);

export default router;
