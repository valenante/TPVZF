// controllers/disponibilidadController.js
import Disponibilidad from "../models/Disponibilidad.js";

// Obtener la configuración actual
export const obtenerDisponibilidad = async (req, res) => {
  try {
    let disponibilidad = await Disponibilidad.findOne();

    if (!disponibilidad) {
      // Crear por defecto: todos los días habilitados
      disponibilidad = await Disponibilidad.create({
        domingo: true,
        lunes: true,
        martes: true,
        miércoles: true,
        jueves: true,
        viernes: true,
        sábado: true,
      });
    }

    res.json({
      domingo: disponibilidad.domingo,
      lunes: disponibilidad.lunes,
      martes: disponibilidad.martes,
      miércoles: disponibilidad.miércoles,
      jueves: disponibilidad.jueves,
      viernes: disponibilidad.viernes,
      sábado: disponibilidad.sábado,
    });
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    res.status(500).json({ mensaje: "Error al obtener la disponibilidad." });
  }
};

// Actualizar los días habilitados
export const actualizarDisponibilidad = async (req, res) => {
  const {
    domingo,
    lunes,
    martes,
    miércoles,
    jueves,
    viernes,
    sábado,
  } = req.body;

  try {
    let disponibilidad = await Disponibilidad.findOne();

    const nuevosValores = {
      domingo: !!domingo,
      lunes: !!lunes,
      martes: !!martes,
      miércoles: !!miércoles,
      jueves: !!jueves,
      viernes: !!viernes,
      sábado: !!sábado,
      actualizadoEn: new Date(),
    };

    if (!disponibilidad) {
      disponibilidad = new Disponibilidad(nuevosValores);
    } else {
      Object.assign(disponibilidad, nuevosValores);
    }

    await disponibilidad.save();
    res.json({ mensaje: "Disponibilidad actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    res.status(500).json({ mensaje: "Error al actualizar la disponibilidad." });
  }
};
