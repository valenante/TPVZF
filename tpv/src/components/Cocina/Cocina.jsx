import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import io from 'socket.io-client'
import PedidosFinalizados from './PedidosFinalizados';

// Conectar al servidor de Socket.io
const socket = io('http://172.20.10.7:3000');

const Cocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);

  // Función para calcular tiempo transcurrido
  const calcularTiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const fechaPedido = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaPedido) / 60000); // Diferencia en minutos
    return `${diferencia}m`;
  };

  // Función para cargar pedidos pendientes
  const cargarPedidos = async () => {
    try {
      // Agregamos el tipo como query parameter
      const response = await api.get('/pedidos/pendientes/pendientes', {
        params: { tipo: 'plato' }, // Aquí especificamos que queremos solo los platos
      });
      console.log('Pedidos pendientes (platos):', response.data);
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  // Escuchar evento nuevoPedido y recargar pedidos de platos
  useEffect(() => {
    socket.on('nuevoPedido', () => {
      cargarPedidos(); // Recargar solo los pedidos de platos
    });

    // Cleanup del evento para evitar duplicados
    return () => {
      socket.off('nuevoPedido');
    };
  }, []);

  // Marcar un producto como listo
  const marcarProductoComoListo = async (pedidoId, productoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}/producto/${productoId}`, { estadoPreparacion: 'listo' });
      cargarPedidos(); // Recargar la lista de pedidos de platos
    } catch (error) {
      console.error('Error al marcar producto como listo:', error);
    }
  };


  // Marcar el pedido entero como listo
  const marcarPedidoComoListo = async (pedidoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}`, { estado: 'listo' });
      cargarPedidos(); // Recargar la lista de pedidos
    } catch (error) {
      console.error('Error al marcar pedido como listo:', error);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, []);

  return (
    <div className="cocina">
      <h1>Pedidos Pendientes</h1>
      <button onClick={() => setMostrarFinalizados(true)}>Ver Pedidos Finalizados</button>
      {mostrarFinalizados && (
        <PedidosFinalizados onClose={() => setMostrarFinalizados(false)} />
      )}
      {pedidos.length === 0 ? (
        <p>No hay pedidos pendientes</p>
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
              <h4>Productos:</h4>
              <ul>
                {pedido.productos.map((producto) => (
                  <li key={producto._id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={producto.estado === 'listo'}
                        onChange={() => marcarProductoComoListo(pedido._id, producto._id)}
                      />
                      {producto.cantidad}x {producto.producto?.nombre || "Producto no disponible"}
                    </label>
                    {producto.ingredientesEliminados.length > 0 && (
                      <p><strong>Sin:</strong> {producto.ingredientesEliminados.join(", ")}</p>
                    )}
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

export default Cocina;