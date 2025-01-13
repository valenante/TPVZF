import { Router } from 'express';
const router = Router();
import { getMesas, getMesaById, abrirMesa, cerrarMesa, getHistorialMesas, getMesaByNumero } from '../controllers/mesaController.js';

// Rutas
router.get('/', getMesas); // Obtener todas las mesas activas
router.get('/:id', getMesaById); // Obtener una mesa activa por ID
router.post('/', abrirMesa); // Abrir una nueva mesa
router.put('/:id/cerrar', cerrarMesa); // Cerrar una mesa
router.get('/historial', getHistorialMesas); // Obtener el historial de mesas cerradas
router.get('/:numeroMesa', getMesaByNumero); // Obtener una mesa activa por número

export default router;
