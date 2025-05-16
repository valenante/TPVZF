import FacturaHash from '../models/FacturaHash.js';
import { generarHashFactura } from '../../utils/hashFactura.js';

/**
 * Registra una factura generando hash encadenado.
 * @param {Object} datosFactura - Datos básicos de la factura.
 * @returns {Promise<Object>} - FacturaHash guardada.
 */
export const registrarFacturaConHash = async (datosFactura) => {
  const {
    numeroFactura,
    fechaExpedicion,
    clienteNombre,
    clienteNIF,
    productos,
    importeTotal,
  } = datosFactura;

  // Buscar la última factura registrada para encadenar el hash
  const ultimaFactura = await FacturaHash.findOne().sort({ createdAt: -1 });

  // Si no hay factura anterior, usar 'INICIO' como valor de hash anterior
  const hashAnterior = ultimaFactura ? ultimaFactura.hash : 'INICIO';

  // Preparar los datos de la factura como un objeto (no como string)
  const factura = {
    numeroFactura,
    fechaExpedicion,
    clienteNombre,
    clienteNIF,
    importeTotal,
  };

  // Generar el nuevo hash usando la función adecuada
  const nuevoHash = generarHashFactura(factura, hashAnterior);

  // Crear y guardar la nueva factura
  const nuevaFactura = new FacturaHash({
    numeroFactura,
    fechaExpedicion,
    clienteNombre,
    clienteNIF,
    productos,
    importeTotal,
    hash: nuevoHash,
    hashAnterior,
  });

  await nuevaFactura.save();
  return nuevaFactura;
};
