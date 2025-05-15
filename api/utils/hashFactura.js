import crypto from 'crypto';

/**
 * Genera un hash SHA-256 para una factura con enlace al hash anterior (blockchain).
 * @param {Object} factura - Datos clave de la factura.
 * @param {string} hashAnterior - Hash de la factura anterior, '0000' para la primera.
 * @returns {string} - Hash generado en base64.
 */
export function generarHashFactura(factura, hashAnterior) {
  const datos = [
    factura.numeroFactura,
    factura.fechaExpedicion,
    factura.cliente?.nombre || '',
    factura.cliente?.nif || '',
    factura.importeTotal.toFixed(2),
    hashAnterior
  ].join('|');

  const hash = crypto.createHash('sha256').update(datos).digest('base64');
  return hash;
}
