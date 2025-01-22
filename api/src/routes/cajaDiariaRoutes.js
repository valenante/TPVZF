import { Router } from 'express';
const router = Router();
import { getCajaDiaria, getCajaDiariaById, createCajaDiaria, updateCajaDiaria, deleteCajaDiaria, obtenerCajasPorRango } from '../controllers/cajaDiariaController.js';

// Obtener todos los registros de caja diaria
router.get('/', getCajaDiaria);

// Obtener un registro de caja diaria por ID
router.get('/:id', getCajaDiariaById);

// Crear un nuevo registro de caja diaria
router.post('/', createCajaDiaria);

// Actualizar un registro de caja diaria por ID
router.put('/:id', updateCajaDiaria);

// Eliminar un registro de caja diaria por ID
router.delete('/:id', deleteCajaDiaria);

//Obtener caja por rango
router.get('/rango/rango', obtenerCajasPorRango);

export default router;
