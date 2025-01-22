import express from 'express';
const router = express.Router();
import { obtenerEliminaciones } from '../controllers/eliminacionController.js';

// Endpoint para obtener eliminaciones
router.get('/', obtenerEliminaciones);

export default router;
