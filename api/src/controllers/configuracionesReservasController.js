import ConfiguracionReserva from '../models/ConfiguracionReserva.js';

const franjasPredeterminadas = [
  { horaInicio: '13:00', horaFin: '15:00', maxReservas: 10 },
  { horaInicio: '20:00', horaFin: '21:30', maxReservas: 10 },
];

export const obtenerConfiguracionPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;
    const config = await ConfiguracionReserva.findOne({ fecha });
    res.json({ franjas: config?.franjas || franjasPredeterminadas });
  } catch (error) {
    console.error('❌ Error al obtener configuración:', error);
    res.status(500).json({ mensaje: 'Error al obtener configuración de reservas.' });
  }
};

export const guardarConfiguracion = async (req, res) => {
  try {
    const { fecha, franjas } = req.body;

    const config = await ConfiguracionReserva.findOneAndUpdate(
      { fecha },
      { franjas },
      { upsert: true, new: true }
    );

    res.json({ mensaje: 'Configuración guardada correctamente', config });
  } catch (error) {
    console.error('❌ Error al guardar configuración:', error);
    res.status(500).json({ mensaje: 'Error al guardar la configuración' });
  }
};
