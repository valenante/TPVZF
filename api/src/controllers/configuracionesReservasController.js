import ConfiguracionReserva from "../models/ConfiguracionReserva.js";

export const obtenerConfiguracionPorFecha = async (req, res) => {
  const { fecha } = req.query;

  try {
    const configuracion = await ConfiguracionReserva.findOne({ fecha });

    if (!configuracion) return res.json(null);

    res.json(configuracion);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ mensaje: "Error al obtener la configuración" });
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
