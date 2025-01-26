import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import io from 'socket.io-client';
import PedidosFinalizados from './PedidosFinalizados';
import './Barra.css';

// Conectar al servidor de Socket.io
const socket = io(process.env.REACT_APP_SOCKET_URL);

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
      const response = await api.get('/pedidos/pendientes/pendientes', {
        params: { tipo: 'bebida' },
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
      cargarPedidos();
    });

    return () => {
      socket.off('nuevoPedido');
    };
  }, []);

  // Marcar un producto como listo y eliminarlo de la lista
  const marcarProductoComoListo = async (pedidoId, productoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}/producto/${productoId}`, { estadoPreparacion: 'listo' });
      // Filtrar el producto marcado como listo y actualizar la lista de pedidos
      setPedidos((prevPedidos) =>
        prevPedidos.map((pedido) => ({
          ...pedido,
          productos: pedido.productos.filter((producto) => producto._id !== productoId),
        })).filter((pedido) => pedido.productos.length > 0) // Eliminar pedidos sin productos
      );
    } catch (error) {
      console.error('Error al marcar producto como listo:', error);
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
      <button
        onClick={() => setMostrarFinalizados(true)}
        className="boton-finalizados--barra"
      >
        Ver Pedidos Finalizados
      </button>
      {mostrarFinalizados && (
        <PedidosFinalizados onClose={() => setMostrarFinalizados(false)} />
      )}
      {pedidos.length === 0 ? (
        <p className="mensaje-vacio--barra">No hay pedidos de bebidas pendientes</p>
      ) : (
        <div className="pedidos-container--barra">
          {pedidos.map((pedido) => (
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
                {pedido.productos
                  .filter((producto) => producto.tipo === "bebida")
                  .map((producto) => (
                    <li key={producto._id} className="producto-item--barra">
                      <label>
                        <input
                          type="checkbox"
                          checked={producto.estadoPreparacion === "listo"}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );  
};

export default Barra;