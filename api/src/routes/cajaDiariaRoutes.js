const express = require('express');
const router = express.Router();
const cajaDiariaController = require('../controllers/cajaDiariaController');

// Obtener todos los registros de caja diaria
router.get('/', cajaDiariaController.getCajaDiaria);

// Obtener un registro de caja diaria por ID
router.get('/:id', cajaDiariaController.getCajaDiariaById);

// Crear un nuevo registro de caja diaria
router.post('/', cajaDiariaController.createCajaDiaria);

// Actualizar un registro de caja diaria por ID
router.put('/:id', cajaDiariaController.updateCajaDiaria);

// Eliminar un registro de caja diaria por ID
router.delete('/:id', cajaDiariaController.deleteCajaDiaria);

module.exports = router;
