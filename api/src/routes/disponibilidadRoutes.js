import express from "express";
import { obtenerDisponibilidad, actualizarDisponibilidad } from "../controllers/disponibilidadController.js";

const router = express.Router();

router.get("/", obtenerDisponibilidad);
router.put("/", actualizarDisponibilidad);

export default router;
