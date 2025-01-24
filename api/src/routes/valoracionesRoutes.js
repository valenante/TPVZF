import { Router } from 'express';
const router = Router();
import { valorarPedido, crearValoraciones, obtenerProductosValorados } from '../controllers/valoracionesController.js';


// Rutas para valoraciones
router.get('/productos-valoraciones', valorarPedido);

// Ruta para crear valoraciones
router.post("/", crearValoraciones);

//Obtener mas valorados
router.get('/valoraciones/mas-valorados', obtenerProductosValorados);

export default router;