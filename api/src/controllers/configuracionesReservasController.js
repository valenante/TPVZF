import ConfiguracionReserva from "../models/ConfiguracionReserva.js";

// Si no hay configuración en la base de datos para esa fecha, usar predeterminada
const franjasPredeterminadas = [
  { horaInicio: "13:00", horaFin: "15:00", maxReservas: 10 },
  { horaInicio: "20:00", horaFin: "21:30", maxReservas: 10 },
];

export const obtenerConfiguracionPorFecha = async (req, res) => {
  const { fecha } = req.query;

  try {
    let config = await ConfiguracionReserva.findOne({ fecha });

    if (!config) {
      return res.json({ franjas: franjasPredeterminadas });
    }

    res.json({ franjas: config.franjas });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ mensaje: "Error al obtener configuración de reservas." });
  }
};


export const guardarConfiguracion = async (req, res) => {
  const { fecha, franjas } = req.body;

  try {
    let config = await ConfiguracionReserva.findOne({ fecha });

    if (config) {
      config.franjas = franjas;
      await config.save();
    } else {
      config = new ConfiguracionReserva({fecha, franjas });
      await config.save();
    }

    res.json({ mensaje: "Configuración guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    res.status(500).json({ mensaje: "Error al guardar la configuración" });
  }
};
