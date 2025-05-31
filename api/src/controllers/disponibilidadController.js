import Disponibilidad from '../models/Disponibilidad.js';

// Obtener configuración actual o crear por defecto
export const obtenerDisponibilidad = async (req, res) => {
  try {
    let disponibilidad = await Disponibilidad.findOne();

    if (!disponibilidad) {
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

    // Devolver solo los días, sin _id ni __v
    const {
      domingo, lunes, martes, miércoles, jueves, viernes, sábado
    } = disponibilidad;

    res.json({ domingo, lunes, martes, miércoles, jueves, viernes, sábado });
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error al obtener la disponibilidad.' });
  }
};

// Actualizar días habilitados
export const actualizarDisponibilidad = async (req, res) => {
  try {
    const valores = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const nuevosValores = Object.fromEntries(
      valores.map((dia) => [dia, !!req.body[dia]])
    );
    nuevosValores.actualizadoEn = new Date();

    let disponibilidad = await Disponibilidad.findOne();

    if (!disponibilidad) {
      disponibilidad = new Disponibilidad(nuevosValores);
    } else {
      Object.assign(disponibilidad, nuevosValores);
    }

    await disponibilidad.save();
    res.json({ mensaje: 'Disponibilidad actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error al actualizar disponibilidad:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la disponibilidad.' });
  }
};
