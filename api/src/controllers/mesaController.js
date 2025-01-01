const Mesa = require('../models/Mesa'); // Modelo de mesas activas
const MesaCerrada = require('../models/MesaCerrada'); // Modelo de historial de mesas

// Obtener todas las mesas activas
exports.getMesas = async (req, res) => {
    try {
        const mesas = await Mesa.find().populate('pedidos');
        res.status(200).json(mesas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las mesas activas' });
    }
};

// Obtener una mesa activa por ID
exports.getMesaById = async (req, res) => {
    const { id } = req.params;
    try {
        const mesa = await Mesa.findById(id).populate('pedidos');
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        res.status(200).json(mesa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
};

// Abrir una nueva mesa
exports.abrirMesa = async (req, res) => {
    const { numero } = req.body;
    try {
        // Verificar si la mesa ya está abierta
        const mesaExistente = await Mesa.findOne({ numero, estado: 'abierta' });
        if (mesaExistente) {
            return res.status(400).json({ error: 'La mesa ya está abierta' });
        }

        // Crear una nueva mesa activa
        const nuevaMesa = new Mesa({ numero });
        await nuevaMesa.save();

        // Emitir evento de apertura de mesa
        req.io.emit('mesaAbierta', nuevaMesa);

        res.status(201).json(nuevaMesa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al abrir la mesa' });
    }
};

// Cerrar una mesa
exports.cerrarMesa = async (req, res) => {
    const { id } = req.params;
    const { total } = req.body; // Total acumulado para la mesa

    try {
        // Buscar la mesa activa
        const mesa = await Mesa.findById(id).populate('pedidos');
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada o ya cerrada' });
        }

        // Crear un registro en el historial
        const mesaCerrada = new MesaCerrada({
            numero: mesa.numero,
            pedidos: mesa.pedidos,
            total,
            inicio: mesa.inicio,
            cierre: new Date(),
        });
        await mesaCerrada.save();

        // Eliminar la mesa activa
        await Mesa.findByIdAndDelete(id);

        // Emitir evento de cierre de mesa
        req.io.emit('mesaCerrada', mesaCerrada);

        res.status(200).json({ message: 'Mesa cerrada y registrada en el historial', mesaCerrada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cerrar la mesa' });
    }
};

// Obtener historial de mesas cerradas
exports.getHistorialMesas = async (req, res) => {
    const { numero, desde, hasta } = req.query;

    try {
        const filtros = {};
        if (numero) filtros.numero = numero;
        if (desde || hasta) {
            filtros.cierre = {};
            if (desde) filtros.cierre.$gte = new Date(desde);
            if (hasta) filtros.cierre.$lte = new Date(hasta);
        }

        const historial = await MesaCerrada.find(filtros).populate('pedidos');
        res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de mesas' });
    }
};


//Obtener el ID de una mesa por su número
exports.getMesaByNumero = async (req, res) => {
    const { numero } = req.params;
    try {
        const mesa = await Mesa.findOne({ numero });
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa no encontrada' });
        }
        res.status(200).json(mesa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la mesa' });
    }
};