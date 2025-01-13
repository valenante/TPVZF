import CajaDiaria from '../models/CajaDiaria.js';

// Obtener todos los registros de caja diaria
export const getCajaDiaria = async (req, res) => {
    try {
        const registros = await CajaDiaria.find().sort({ fecha: -1 }); // Ordenar por fecha descendente
        res.status(200).json(registros);
    } catch (error) {
        console.error('Error al obtener los registros de caja diaria:', error);
        res.status(500).json({ error: 'Error al obtener los registros de caja diaria.' });
    }
};

// Obtener un registro de caja diaria por ID
export const getCajaDiariaById = async (req, res) => {
    const { id } = req.params;
    try {
        const registro = await CajaDiaria.findById(id);
        if (!registro) {
            return res.status(404).json({ error: 'Registro de caja diaria no encontrado.' });
        }
        res.status(200).json(registro);
    } catch (error) {
        console.error('Error al obtener el registro de caja diaria:', error);
        res.status(500).json({ error: 'Error al obtener el registro de caja diaria.' });
    }
};

// Crear un nuevo registro de caja diaria
export const createCajaDiaria = async (req, res) => {
    const { fecha, ingresos, egresos, saldoInicial, saldoFinal } = req.body;

    try {
        // Verificar si ya existe un registro para la fecha
        const registroExistente = await CajaDiaria.findOne({ fecha });
        if (registroExistente) {
            return res.status(400).json({ error: 'Ya existe un registro para esta fecha.' });
        }

        // Crear un nuevo registro de caja diaria
        const nuevoRegistro = new CajaDiaria({
            fecha,
            ingresos: ingresos || 0,
            egresos: egresos || 0,
            saldoInicial: saldoInicial || 0,
            saldoFinal: saldoFinal || saldoInicial + (ingresos || 0) - (egresos || 0)
        });

        await nuevoRegistro.save();

        res.status(201).json({ message: 'Registro de caja diaria creado con éxito.', registro: nuevoRegistro });
    } catch (error) {
        console.error('Error al crear el registro de caja diaria:', error);
        res.status(400).json({ error: 'Error al crear el registro de caja diaria.' });
    }
};

// Actualizar un registro de caja diaria por ID
export const updateCajaDiaria = async (req, res) => {
    const { id } = req.params;
    const { ingresos, egresos, saldoInicial, saldoFinal } = req.body;

    try {
        const registro = await CajaDiaria.findById(id);

        if (!registro) {
            return res.status(404).json({ error: 'Registro de caja diaria no encontrado.' });
        }

        // Actualizar los campos permitidos
        if (ingresos !== undefined) registro.ingresos += ingresos;
        if (egresos !== undefined) registro.egresos += egresos;
        if (saldoInicial !== undefined) registro.saldoInicial = saldoInicial;
        registro.saldoFinal = saldoFinal || registro.saldoInicial + registro.ingresos - registro.egresos;

        await registro.save();

        res.status(200).json({ message: 'Registro de caja diaria actualizado con éxito.', registro });
    } catch (error) {
        console.error('Error al actualizar el registro de caja diaria:', error);
        res.status(400).json({ error: 'Error al actualizar el registro de caja diaria.' });
    }
};

// Eliminar un registro de caja diaria por ID
export const deleteCajaDiaria = async (req, res) => {
    const { id } = req.params;

    try {
        const registroEliminado = await CajaDiaria.findByIdAndDelete(id);

        if (!registroEliminado) {
            return res.status(404).json({ error: 'Registro de caja diaria no encontrado.' });
        }

        res.status(200).json({ message: 'Registro de caja diaria eliminado con éxito.', registro: registroEliminado });
    } catch (error) {
        console.error('Error al eliminar el registro de caja diaria:', error);
        res.status(500).json({ error: 'Error al eliminar el registro de caja diaria.' });
    }
};
