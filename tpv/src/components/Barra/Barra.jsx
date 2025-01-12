import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import io from 'socket.io-client';
import PedidosFinalizados from './PedidosFinalizados';

// Conectar al servidor de Socket.io
const socket = io('http://172.20.10.7:3000');

const Barra = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);

  // Función para calcular tiempo transcurrido
  const calcularTiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const fechaPedido = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaPedido) / 60000); // Diferencia en minutos
    return `${diferencia}m`;
  };

  // Función para cargar pedidos pendientes de bebidas
  const cargarPedidos = async () => {
    try {
      // Agregamos el tipo como query parameter
      const response = await api.get('/pedidos/pendientes/pendientes', {
        params: { tipo: 'bebida' }, // Aquí especificamos que queremos solo las bebidas
      });
      console.log('Pedidos de bebidas pendientes:', response.data);
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos de bebidas:', error);
    }
  };

  // Escuchar evento `nuevoPedido` y recargar pedidos de bebidas
  useEffect(() => {
    socket.on('nuevoPedido', () => {
      cargarPedidos(); // Recargar solo los pedidos de bebidas
    });

    // Cleanup del evento para evitar duplicados
    return () => {
      socket.off('nuevoPedido');
    };
  }, []);

  // Marcar un producto como listo
  const marcarProductoComoListo = async (pedidoId, productoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}/producto/${productoId}`, { estado: 'listo' });
      cargarPedidos(); // Recargar la lista de pedidos de bebidas
    } catch (error) {
      console.error('Error al marcar producto como listo:', error);
    }
  };

  // Marcar el pedido entero como listo
  const marcarPedidoComoListo = async (pedidoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}`, { estado: 'listo' });
      cargarPedidos();
    } catch (error) {
      console.error('Error al marcar pedido como listo:', error);
    }
  };

  // Cargar pedidos pendientes al montar el componente y configurar actualización periódica
  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="barra">
      <h1>Pedidos Pendientes - Barra</h1>
      <button onClick={() => setMostrarFinalizados(true)}>Ver Pedidos Finalizados</button>
      {mostrarFinalizados && (
        <PedidosFinalizados onClose={() => setMostrarFinalizados(false)} />
      )}
      {pedidos.length === 0 ? (
        <p>No hay pedidos de bebidas pendientes</p>
      ) : (
        pedidos.map((pedido) => {
          const todosProductosListos = pedido.productos.every(
            (producto) => producto.estado === 'listo'
          );

          return (
            <div key={pedido._id} className="pedido">
              <h3>Mesa: {pedido.mesa.numero}</h3>
              <p>Comensales: {pedido.comensales}</p>
              {pedido.alergias && <p><strong>Alergias:</strong> {pedido.alergias}</p>}
              <p><strong>Tiempo desde el pedido:</strong> {calcularTiempoTranscurrido(pedido.fecha)}</p>
              <h4>Bebidas:</h4>
              <ul>
                {pedido.productos
                  .filter((producto) => producto.tipo === 'bebida')
                  .map((producto) => (
                    <li key={producto._id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={producto.estado === 'listo'}
                          onChange={() => marcarProductoComoListo(pedido._id, producto._id)}
                        />
                        {producto.cantidad}x {producto.producto?.nombre || "Producto no disponible"}
                      </label>
                      {producto.especificaciones.length > 0 && (
                        <p><strong>Especificaciones:</strong> {producto.especificaciones.join(", ")}</p>
                      )}
                    </li>
                  ))}
              </ul>
              <p><strong>Total:</strong> {pedido.total.toFixed(2)} €</p>
              <button
                onClick={() => marcarPedidoComoListo(pedido._id)}
                disabled={!todosProductosListos}
              >
                Terminar Pedido
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Barra;