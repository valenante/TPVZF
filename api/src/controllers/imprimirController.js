import axios from 'axios';
import Mesa from '../models/Mesa.js';

// IP Tailscale del servidor impresión
const IMPRESION_SERVER = 'http://100.91.21.52:4000';

export const imprimirPlatos = async (req, res) => {
  try {
    const { mesaNumero, comensales, productos, total } = req.body;

    // Reenviar la petición al servidor impresión
    const response = await axios.post(`${IMPRESION_SERVER}/imprimir`, {
      mesaNumero,
      comensales,
      productos,
      total,
    });

    res.status(200).json({ message: 'Pedido de platos enviado a la impresora', data: response.data });
  } catch (error) {
    console.error('Error al imprimir platos:', error.message);
    res.status(500).json({ error: 'Error al imprimir platos', details: error.message });
  }
};

export const imprimirBebidas = async (req, res) => {
  try {
    const { mesaNumero, comensales, productos, total } = req.body;

    const response = await axios.post(`${IMPRESION_SERVER}/imprimir-bebidas`, {
      mesaNumero,
      comensales,
      productos,
      total,
    });

    res.status(200).json({ message: 'Pedido de bebidas enviado a la impresora', data: response.data });
  } catch (error) {
    console.error('Error al imprimir bebidas:', error.message);
    res.status(500).json({ error: 'Error al imprimir bebidas', details: error.message });
  }
};
// Función para imprimir factura
export const imprimirFactura = async (req, res) => {
  const { mesaId } = req.params;
  const { clienteNombre, clienteNIF, metodoPago, productos } = req.body;

  try {
    const mesa = await Mesa.findById(mesaId).lean();
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    // Calcular total desde productos que vienen del frontend
    const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    const datosImpresion = {
      mesaNumero: mesa.numero,
      comensales: mesa.comensales || 0,
      productos,
      total,
      clienteNombre,
      clienteNIF,
      metodoPago,
    };

    const response = await axios.post(`${IMPRESION_SERVER}/imprimir-factura`, datosImpresion);

    res.json({ message: 'Factura enviada a impresión correctamente', data: response.data });
  } catch (error) {
    console.error('Error al imprimir factura:', error.message);
    res.status(500).json({ error: 'Error al imprimir factura' });
  }
};

// Función para imprimir cuenta (ticket simple)
export const imprimirCuenta = async (req, res) => {
  const { mesaId } = req.params;

  try {
    const mesa = await Mesa.findById(mesaId)
      .populate({
        path: 'pedidos',
        match: { estado: { $in: ['pendiente', 'listo'] } },
      })
      .lean();

    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });

    // Productos activos en pedidos pendientes o listos (cuenta)
    const productos = [];
    for (const pedido of mesa.pedidos) {
      for (const p of pedido.productos) {
        productos.push({
          nombre: p.nombre || 'Producto sin nombre',
          cantidad: p.cantidad,
          precio: p.precioSeleccionado || 0,
          opcionesPersonalizables: p.opcionesPersonalizables || [],
          alergiasComensal: p.alergiasComensal || '',
          tipoPrecio: p.tipoPrecio || '',
        });
      }
    }

    const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    const datosImpresion = {
      mesaNumero: mesa.numero,
      comensales: mesa.comensales || 0,
      productos,
      total,
    };

    const response = await axios.post(`${IMPRESION_SERVER}/imprimir-cuenta`, datosImpresion);

    res.json({ message: 'Cuenta enviada a impresión correctamente', data: response.data });
  } catch (error) {
    console.error('Error al imprimir cuenta:', error.message);
    res.status(500).json({ error: 'Error al imprimir cuenta' });
  }
};



