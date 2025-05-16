import { generarHashFactura } from '../../utils/hashFactura.js';

const ejemploFactura = {
  numeroFactura: '2025-000001',
  fechaExpedicion: new Date().toISOString(),
  cliente: { nombre: 'Ejemplo SL', nif: 'B12345678' },
  importeTotal: 50.0,
};

const hashAnterior = '0000';
const hashGenerado = generarHashFactura(ejemploFactura, hashAnterior);
