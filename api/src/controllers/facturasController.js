import axios from 'axios';
import { Parser } from 'json2csv';
import FacturaHash from '../models/FacturaHash.js';
import { generarHashFactura } from '../../utils/hashFactura.js';
import EventoFactura from '../models/EventosFactura.js';

export const listarFacturasEncadenadas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20; // Puedes ajustar este límite
    const skip = (page - 1) * limit;

    const totalFacturas = await FacturaHash.countDocuments();
    const facturas = await FacturaHash.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPaginas = Math.ceil(totalFacturas / limit);

    res.status(200).json({ facturas, totalPaginas });
  } catch (error) {
    console.error('Error al obtener las facturas encadenadas:', error);
    res.status(500).json({ error: 'Error al obtener las facturas encadenadas.' });
  }
};

export const exportarFacturasCSV = async (req, res) => {
  try {
    const facturas = await FacturaHash.find().sort({ createdAt: 1 });

    if (!facturas.length) {
      return res.status(404).json({ error: 'No hay facturas registradas.' });
    }

    const fields = ['numeroFactura', 'fechaExpedicion', 'clienteNombre', 'clienteNIF', 'importeTotal', 'hash', 'hashAnterior'];
    const parser = new Parser({ fields });
    const csv = parser.parse(facturas);

    res.header('Content-Type', 'text/csv');
    res.attachment('facturas.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error al exportar facturas:', error);
    res.status(500).json({ error: 'Error al exportar facturas' });
  }
};

export const rectificarFactura = async (req, res) => {
  const { id } = req.params;
  const { motivo, importeTotal, clienteNombre, clienteNIF } = req.body;

  try {
    const facturaOriginal = await FacturaHash.findById(id);
    if (!facturaOriginal) {
      return res.status(404).json({ error: 'Factura original no encontrada.' });
    }

    if (facturaOriginal.rectificada) {
      return res.status(400).json({ error: 'La factura ya ha sido rectificada anteriormente.' });
    }

    // Obtener el último número de factura generado
    const ultimaFactura = await FacturaHash.findOne().sort({ numeroFactura: -1 });

    // Si no hay facturas anteriores, empezar desde 1
    const nuevoNumeroFactura = ultimaFactura
      ? (parseInt(ultimaFactura.numeroFactura.split('-')[1], 10) + 1).toString().padStart(4, '0')
      : '0001';

    // Concatenar año con número generado
    const numeroFactura = `${new Date().getFullYear()}-${nuevoNumeroFactura}`;

    // Comprobar si el número de factura ya existe
    const facturaExistente = await FacturaHash.findOne({ numeroFactura });
    if (facturaExistente) {
      return res.status(400).json({ error: 'El número de factura ya existe. Intente nuevamente.' });
    }

    // Crear la nueva factura rectificativa
    const nuevaFactura = new FacturaHash({
      numeroFactura,
      fechaExpedicion: new Date(),
      clienteNombre,
      clienteNIF,
      importeTotal,
      hashAnterior: facturaOriginal.hash,
    });

    // Generamos el hash para la nueva factura
    const hashGenerado = await generarHashFactura({
      numeroFactura,
      fechaExpedicion: nuevaFactura.fechaExpedicion,
      clienteNombre,
      clienteNIF,
      importeTotal
    }, facturaOriginal.hash); // Aquí pasamos el hash anterior

    nuevaFactura.hash = hashGenerado; // Asignamos el hash directamente

    // Guardamos la nueva factura
    await nuevaFactura.save();

    // Marcar la factura original como rectificada
    facturaOriginal.rectificada = true;
    facturaOriginal.facturaRectificativaId = nuevaFactura._id;
    await facturaOriginal.save();

    // Registrar evento de la rectificación
    const eventoFactura = new EventoFactura({
      tipoEvento: 'rectificación',
      numeroFactura: nuevaFactura.numeroFactura,
      clienteNombre,
      clienteNIF,
      motivo,
      importeTotal,
      hashFactura: nuevaFactura.hash,
      facturaOriginalId: facturaOriginal._id,
      facturaRectificativaId: nuevaFactura._id
    });
    await eventoFactura.save();

    // Enviar a impresión (si es necesario)
    const impresionData = {
      numeroFactura,
      fechaExpedicion: nuevaFactura.fechaExpedicion,
      clienteNombre,
      clienteNIF,
      importeTotal,
      motivo,
      hash: nuevaFactura.hash
    };

    await axios.post('http://localhost:4000/imprimir-factura-rectificativa', impresionData);

    // Responder al cliente
    res.status(200).json({
      message: 'Factura rectificativa generada correctamente.',
      facturaOriginal,
      facturaRectificativa: nuevaFactura
    });

  } catch (error) {
    console.error('Error al rectificar la factura:', error);
    res.status(500).json({ error: 'Error al rectificar la factura.' });
  }
};