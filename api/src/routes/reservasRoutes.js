import express from "express";
import { crearReserva, obtenerReservas, cancelarReserva, confirmarReserva } from "../controllers/reservasController.js";

const router = express.Router();

// No requiere auth, viene desde el cliente público
router.post("/", crearReserva);

// Nuevos (para TPV)
router.get("/", obtenerReservas);
router.put("/:id/cancelar", cancelarReserva);
router.put("/:id/confirmar", confirmarReserva);


export default router;
