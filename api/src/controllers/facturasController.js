import axios from 'axios';
import { Parser } from 'json2csv';
import FacturaHash from '../models/FacturaHash.js';
import EventoFactura from '../models/EventosFactura.js';
import { generarHashFactura } from '../../utils/hashFactura.js';

export const listarFacturasEncadenadas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const totalFacturas = await FacturaHash.countDocuments();
    const facturas = await FacturaHash.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ facturas, totalPaginas: Math.ceil(totalFacturas / limit) });
  } catch (error) {
    console.error('❌ Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener las facturas encadenadas.' });
  }
};

export const exportarFacturasCSV = async (_req, res) => {
  try {
    const facturas = await FacturaHash.find().sort({ createdAt: 1 });
    if (!facturas.length) {
      return res.status(404).json({ error: 'No hay facturas registradas.' });
    }

    const fields = ['numeroFactura', 'fechaExpedicion', 'clienteNombre', 'clienteNIF', 'importeTotal', 'hash', 'hashAnterior'];
    const csv = new Parser({ fields }).parse(facturas);

    res.header('Content-Type', 'text/csv');
    res.attachment('facturas.csv');
    res.send(csv);
  } catch (error) {
    console.error('❌ Error al exportar facturas:', error);
    res.status(500).json({ error: 'Error al exportar facturas.' });
  }
};

export const rectificarFactura = async (req, res) => {
  const { id } = req.params;
  const { motivo, importeTotal, clienteNombre, clienteNIF } = req.body;

  try {
    const facturaOriginal = await FacturaHash.findById(id);
    if (!facturaOriginal) return res.status(404).json({ error: 'Factura original no encontrada.' });
    if (facturaOriginal.rectificada) return res.status(400).json({ error: 'Ya fue rectificada.' });

    const ultima = await FacturaHash.findOne().sort({ numeroFactura: -1 });
    const nuevoNum = ultima ? (parseInt(ultima.numeroFactura.split('-')[1]) + 1).toString().padStart(4, '0') : '0001';
    const numeroFactura = `${new Date().getFullYear()}-${nuevoNum}`;

    const existente = await FacturaHash.findOne({ numeroFactura });
    if (existente) return res.status(400).json({ error: 'Número de factura ya existe.' });

    const nuevaFactura = new FacturaHash({
      numeroFactura,
      fechaExpedicion: new Date(),
      clienteNombre,
      clienteNIF,
      importeTotal,
      hashAnterior: facturaOriginal.hash,
      hash: await generarHashFactura({ numeroFactura, fechaExpedicion: new Date(), clienteNombre, clienteNIF, importeTotal }, facturaOriginal.hash),
    });

    await nuevaFactura.save();

    facturaOriginal.rectificada = true;
    facturaOriginal.facturaRectificativaId = nuevaFactura._id;
    await facturaOriginal.save();

    await new EventoFactura({
      tipoEvento: 'rectificación',
      numeroFactura,
      clienteNombre,
      clienteNIF,
      motivo,
      importeTotal,
      hashFactura: nuevaFactura.hash,
      facturaOriginalId: facturaOriginal._id,
      facturaRectificativaId: nuevaFactura._id,
    }).save();

    await axios.post('http://100.91.21.52:4000/imprimir-factura-rectificativa', {
      numeroFactura,
      fechaExpedicion: nuevaFactura.fechaExpedicion,
      clienteNombre,
      clienteNIF,
      importeTotal,
      motivo,
      hash: nuevaFactura.hash,
    });

    res.json({
      message: 'Factura rectificativa generada correctamente.',
      facturaOriginal,
      facturaRectificativa: nuevaFactura,
    });
  } catch (error) {
    console.error('❌ Error al rectificar factura:', error);
    res.status(500).json({ error: 'Error al rectificar la factura.' });
  }
};
