import CajaDiaria from '../models/CajaDiaria.js';

// Obtener todos los registros, ordenados por fecha descendente
export const getCajaDiaria = async (req, res) => {
  try {
    const registros = await CajaDiaria.find().sort({ fecha: -1 });
    res.status(200).json(registros);
  } catch (error) {
    console.error('❌ Error al obtener registros de caja diaria:', error);
    res.status(500).json({ error: 'Error al obtener los registros de caja diaria.' });
  }
};

// Obtener un registro por ID
export const getCajaDiariaById = async (req, res) => {
  const { id } = req.params;
  try {
    const registro = await CajaDiaria.findById(id);
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }
    res.status(200).json(registro);
  } catch (error) {
    console.error('❌ Error al obtener registro por ID:', error);
    res.status(500).json({ error: 'Error al obtener el registro de caja diaria.' });
  }
};

// Crear un nuevo registro (si no existe ya uno con la misma fecha)
export const createCajaDiaria = async (req, res) => {
  const { fecha, ingresos = 0, egresos = 0, saldoInicial = 0, saldoFinal } = req.body;

  try {
    const existe = await CajaDiaria.findOne({ fecha });
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un registro para esta fecha.' });
    }

    const nuevoRegistro = new CajaDiaria({
      fecha,
      ingresos,
      egresos,
      saldoInicial,
      saldoFinal: saldoFinal ?? saldoInicial + ingresos - egresos,
    });

    await nuevoRegistro.save();

    res.status(201).json({
      message: 'Registro creado con éxito.',
      registro: nuevoRegistro,
    });
  } catch (error) {
    console.error('❌ Error al crear registro de caja diaria:', error);
    res.status(400).json({ error: 'Error al crear el registro.' });
  }
};

// Actualizar un registro por ID
export const updateCajaDiaria = async (req, res) => {
  const { id } = req.params;
  const { ingresos, egresos, saldoInicial, saldoFinal } = req.body;

  try {
    const registro = await CajaDiaria.findById(id);
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }

    if (ingresos !== undefined) registro.ingresos += ingresos;
    if (egresos !== undefined) registro.egresos += egresos;
    if (saldoInicial !== undefined) registro.saldoInicial = saldoInicial;

    registro.saldoFinal = saldoFinal ?? (registro.saldoInicial + registro.ingresos - registro.egresos);

    await registro.save();

    res.status(200).json({
      message: 'Registro actualizado con éxito.',
      registro,
    });
  } catch (error) {
    console.error('❌ Error al actualizar registro de caja diaria:', error);
    res.status(400).json({ error: 'Error al actualizar el registro.' });
  }
};

// Eliminar un registro por ID
export const deleteCajaDiaria = async (req, res) => {
  const { id } = req.params;

  try {
    const eliminado = await CajaDiaria.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }

    res.status(200).json({
      message: 'Registro eliminado con éxito.',
      registro: eliminado,
    });
  } catch (error) {
    console.error('❌ Error al eliminar registro de caja diaria:', error);
    res.status(500).json({ error: 'Error al eliminar el registro.' });
  }
};

// Obtener registros por rango de fechas
export const obtenerCajasPorRango = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Debe proporcionar un rango de fechas.' });
  }

  try {
    const cajas = await CajaDiaria.find({
      fecha: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin),
      },
    }).sort({ fecha: 1 });

    res.status(200).json(cajas);
  } catch (error) {
    console.error('❌ Error al obtener cajas por rango:', error);
    res.status(500).json({ error: 'Error al obtener cajas.' });
  }
};
