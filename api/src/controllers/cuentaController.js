import axios from 'axios';
import Mesa from '../models/Mesa.js';
import { io } from '../../index.js';


// Endpoint para solicitar la cuenta de una mesa
export const pedirCuenta = async (req, res) => {
  const { numeroMesa } = req.params; // Número de mesa enviado en el cuerpo de la solicitud
  try {
    // Verificar si la mesa existe
    const mesa = await Mesa.findOne({ numero: numeroMesa });
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada.' });
    }

    // Emitir evento de WebSocket para el TPV
    io.emit('cuentaSolicitada', { numeroMesa }); // Enviar el número de la mesa al TPV

    res.status(200).json({ message: `Cuenta solicitada para la mesa ${numeroMesa}` });
  } catch (error) {
    console.error('Error al solicitar la cuenta:', error);
    res.status(500).json({ error: 'Error al solicitar la cuenta.' });
  }
};


export const imprimirCuenta = async (req, res) => {
  const { id } = req.params;

  try {
    const mesa = await Mesa.findById(id)
      .populate({
        path: 'pedidos',
        populate: { path: 'productos.producto' }
      })
      .populate({
        path: 'pedidosBebidas',
        populate: { path: 'productos.producto' }
      });

    if (!mesa) {
      console.error('Mesa no encontrada');
      return res.status(404).json({ error: 'Mesa no encontrada.' });
    }

    const productos = [];

    mesa.pedidos.forEach(pedido => {
      pedido.productos.forEach(producto => {
        console.log('Producto en pedido:', producto);  // Log del producto
        productos.push({
          nombre: producto.producto?.nombre || 'Producto sin nombre',
          cantidad: producto.cantidad,
          opcionesPersonalizables: producto.opcionesPersonalizables || [],
          alergiasComensal: producto.alergiasComensal || '',
          tipoPrecio: producto.tipoPrecio || '',
          precio: producto.precioSeleccionado || 0
        });
      });
    });

    mesa.pedidosBebidas.forEach(pedido => {
      pedido.productos.forEach(producto => {
        console.log('Producto en bebida:', producto);  // Log del producto bebida
        productos.push({
          nombre: producto.producto?.nombre || 'Bebida sin nombre',
          cantidad: producto.cantidad,
          opcionesPersonalizables: producto.opcionesPersonalizables || [],
          alergiasComensal: producto.alergiasComensal || '',
          tipoPrecio: producto.tipoPrecio || '',
          precio: producto.precioSeleccionado || 0
        });
      });
    });

    console.log('Productos para enviar al servidor de impresión:', productos);  // Log del listado completo

    // Llamar al servidor de impresión
    await axios.post('http://localhost:4000/imprimir-cuenta', {
      mesaNumero: mesa.numero,
      comensales: mesa.comensales,
      productos,
      total: mesa.total
    });

    res.status(200).json({ message: 'Cuenta enviada a impresión.' });
  } catch (error) {
    console.error('Error al imprimir la cuenta:', error);
    res.status(500).json({ error: 'Error al imprimir la cuenta.' });
  }
};