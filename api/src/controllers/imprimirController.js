import axios from 'axios';
import Mesa from '../models/Mesa.js';

const IMPRESION_SERVER = 'http://100.91.21.52:4000';

// Función genérica para enviar a impresión
const enviarAImpresion = async (endpoint, payload) => {
  return await axios.post(`${IMPRESION_SERVER}/${endpoint}`, payload);
};

// Imprimir platos
export const imprimirPlatos = async (req, res) => {
  try {
    const { mesaNumero, comensales, productos, total } = req.body;
    const response = await enviarAImpresion('imprimir', { mesaNumero, comensales, productos, total });
    res.status(200).json({ message: 'Platos enviados a la impresora', data: response.data });
  } catch (error) {
    console.error('Error al imprimir platos:', error.message);
    res.status(500).json({ error: 'Error al imprimir platos', details: error.message });
  }
};

// Imprimir bebidas
export const imprimirBebidas = async (req, res) => {
  try {
    const { mesaNumero, comensales, productos, total } = req.body;
    const response = await enviarAImpresion('imprimir-bebidas', { mesaNumero, comensales, productos, total });
    res.status(200).json({ message: 'Bebidas enviadas a la impresora', data: response.data });
  } catch (error) {
    console.error('Error al imprimir bebidas:', error.message);
    res.status(500).json({ error: 'Error al imprimir bebidas', details: error.message });
  }
};

// Imprimir factura
export const imprimirFactura = async (req, res) => {
  const { mesaId } = req.params;
  const { clienteNombre, clienteNIF, metodoPago, productos, hash, numeroFactura } = req.body;

  try {
    const mesa = await Mesa.findById(mesaId).lean();
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    const datosImpresion = {
      mesaNumero: mesa.numero,
      comensales: mesa.comensales || 0,
      productos,
      total,
      clienteNombre,
      clienteNIF,
      metodoPago,
      hash,
      numeroFactura,
    };

    const response = await enviarAImpresion('imprimir-factura', datosImpresion);
    res.json({ message: 'Factura enviada a impresión correctamente', data: response.data });
  } catch (error) {
    console.error('Error al imprimir factura:', error.message);
    res.status(500).json({ error: 'Error al imprimir factura' });
  }
};

// Imprimir cuenta
export const imprimirCuenta = async (req, res) => {
  const { mesaId } = req.params;

  try {
    const mesa = await Mesa.findById(mesaId)
      .populate({ path: 'pedidos', match: { estado: { $in: ['pendiente', 'listo'] } } })
      .lean();

    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    const productos = mesa.pedidos.flatMap(pedido =>
      pedido.productos.map(p => ({
        nombre: p.nombre || 'Producto sin nombre',
        cantidad: p.cantidad,
        precio: p.precioSeleccionado || 0,
        opcionesPersonalizables: p.opcionesPersonalizables || [],
        alergiasComensal: p.alergiasComensal || '',
        tipoPrecio: p.tipoPrecio || '',
      }))
    );

    const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    const response = await enviarAImpresion('imprimir-cuenta', {
      mesaNumero: mesa.numero,
      comensales: mesa.comensales || 0,
      productos,
      total,
    });

    res.json({ message: 'Cuenta enviada a impresión correctamente', data: response.data });
  } catch (error) {
    console.error('Error al imprimir cuenta:', error.message);
    res.status(500).json({ error: 'Error al imprimir cuenta' });
  }
};
