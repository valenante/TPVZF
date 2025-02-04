import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import io from 'socket.io-client';
import './Barra.css';

// Conectar al servidor de Socket.io
const socket = io(process.env.REACT_APP_SOCKET_URL);

const Barra = () => {
  const [pedidos, setPedidos] = useState([]);

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
      const response = await api.get('/pedidosBebidas/pendientes/pendientes', {
        params: { tipo: 'bebida' },
      });
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos de bebidas:', error);
    }
  };

  // Escuchar evento `nuevoPedido` y recargar pedidos de bebidas
  useEffect(() => {
    socket.on('nuevoPedido', () => {
      cargarPedidos();
    });

    return () => {
      socket.off('nuevoPedido');
    };
  }, []);

  // Marcar un producto como listo
  const marcarProductoComoListo = async (pedidoId, productoId) => {
    try {
      await api.put(`/pedidosBebidas/${pedidoId}/producto/${productoId}`, {
        estadoPreparacion: 'listo',
      });

      // Actualizar el estado eliminando productos listos
      setPedidos((prevPedidos) =>
        prevPedidos
          .map((pedido) => {
            if (pedido._id === pedidoId) {
              const nuevosProductos = pedido.productos.map((producto) =>
                producto._id === productoId
                  ? { ...producto, estadoPreparacion: 'listo' }
                  : producto
              );

              return { ...pedido, productos: nuevosProductos };
            }
            return pedido;
          })
      );
    } catch (error) {
      console.error('Error al marcar producto como listo:', error);
    }
  };

  // Marcar el pedido entero como listo
  const marcarPedidoComoListo = async (pedidoId) => {
    try {
      await api.put(`/pedidosBebidas/${pedidoId}`, { estado: 'listo' });

      // Filtrar el pedido eliminado de la UI
      setPedidos((prevPedidos) => prevPedidos.filter((pedido) => pedido._id !== pedidoId));
    } catch (error) {
      console.error('Error al marcar pedido como listo:', error);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="barra--barra">
      <h1 className="titulo--barra">Pedidos Pendientes</h1>
      {pedidos.length === 0 ? (
        <p className="mensaje-vacio--barra">No hay pedidos de bebidas pendientes</p>
      ) : (
        <div className="pedidos-container--barra">
          {pedidos.map((pedido) => {
            // Verificar si todos los productos del pedido están listos
            const todosListos = pedido.productos.every(
              (producto) => producto.estadoPreparacion === 'listo'
            );

            return (
              <div key={pedido._id} className="pedido-card--barra">
                <div className="pedido-header--barra">
                  <h3>Mesa: {pedido.mesa.numero}</h3>
                  <p>Comensales: {pedido.comensales}</p>
                  {pedido.alergias && (
                    <p className="alergias--barra">
                      <strong>Alergias:</strong> {pedido.alergias}
                    </p>
                  )}
                </div>
                <p>
                  <strong>Hace:</strong> {calcularTiempoTranscurrido(pedido.fecha)}
                </p>
                <ul className="productos-list--barra">
                  {pedido.productos.map((producto) => (
                    <li key={producto._id} className="producto-item--barra">
                      <label>
                        <input
                          type="checkbox"
                          checked={producto.estadoPreparacion === 'listo'}
                          onChange={() =>
                            marcarProductoComoListo(pedido._id, producto._id)
                          }
                        />
                        {producto.cantidad}x{" "}
                        {producto.producto?.nombre || "Producto no disponible"}
                      </label>
                      {producto.especificaciones.length > 0 && (
                        <p>
                          <strong>Especificaciones:</strong>{" "}
                          {producto.especificaciones.join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Botón para marcar el pedido como terminado (solo si todos los productos están listos) */}
                {todosListos && (
                  <button
                    className="boton-terminar--barra"
                    onClick={() => marcarPedidoComoListo(pedido._id)}
                  >
                    Marcar Pedido como Terminado
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Barra;
