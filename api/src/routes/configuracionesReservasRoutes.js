import express from "express";
import {
  obtenerConfiguracionPorFecha,
  guardarConfiguracion,
} from "../controllers/configuracionesReservasController.js";

const router = express.Router();

// Obtener configuración de un día
router.get("/", obtenerConfiguracionPorFecha);

// Guardar o actualizar configuración
router.post("/", guardarConfiguracion);

export default router;
