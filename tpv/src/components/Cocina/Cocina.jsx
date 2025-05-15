import React, { useState, useEffect } from 'react';
import { useContext } from "react";
import api from '../../utils/api';
import { SocketContext } from "../../utils/socket";
import PedidosFinalizados from './PedidosFinalizados';
import './Cocina.css';

const Cocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const { socket } = useContext(SocketContext);
  const [mesas, setMesas] = useState([]);

  const cargarMesas = async () => {
    try {
      const response = await api.get('/mesas/mesas-abiertas/mesas-abiertas');
      setMesas(response.data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const calcularTiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const fechaPedido = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaPedido) / 60000);
    return `${diferencia}m`;
  };

  const cargarPedidos = async () => {
    try {
      const response = await api.get('/pedidos/pendientes/pendientes', {
        params: { tipo: ['plato', 'tapaRacion'] },
      });
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const manejarNuevoPedido = () => {
      cargarPedidos();
    };

    socket.on("nuevoPedido", manejarNuevoPedido);

    return () => {
      socket.off("nuevoPedido", manejarNuevoPedido);
    };
  }, [socket]); // 👈 importante agregar socket como dependencia  

  const marcarProductoComoListo = async (pedidoId, productoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}/producto/${productoId}`, { estadoPreparacion: 'listo' });
      cargarPedidos();
    } catch (error) {
      console.error('Error al marcar producto como listo:', error);
    }
  };

  const marcarPedidoComoListo = async (pedidoId) => {
    try {
      await api.put(`/pedidos/${pedidoId}`, { estado: 'listo' });
      cargarPedidos();
    } catch (error) {
      console.error('Error al marcar pedido como listo:', error);
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarMesas();
    const interval = setInterval(() => {
      cargarPedidos();
      cargarMesas();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getComensalesMesa = (numeroMesa) => {
    const mesa = mesas.find(m => m.numero === numeroMesa);
    return mesa?.comensales || 1;
  };

  const getComensalesPedido = (pedido) => {
    return pedido.comensales && pedido.comensales > 0
      ? pedido.comensales
      : getComensalesMesa(pedido.mesa.numero);
  };
  return (
    <div className="cocina--cocina">
      <h1 className="titulo--cocina">Pedidos Pendientes</h1>
      <button onClick={() => setMostrarFinalizados(true)} className="boton-finalizados--cocina">
        Ver Pedidos Finalizados
      </button>
      {mostrarFinalizados && <PedidosFinalizados onClose={() => setMostrarFinalizados(false)} />}

      {pedidos.length === 0 ? (
        <p className="mensaje-vacio--cocina">No hay pedidos pendientes</p>
      ) : (
        <div className="pedidos-container--cocina">
          {pedidos.map((pedido) => {
            const todosProductosListos = pedido.productos
              .filter((producto) => ['plato', 'tapaRacion'].includes(producto.tipo))
              .every((producto) => producto.estadoPreparacion === 'listo');

            return (
              <div key={pedido._id} className="pedido-card--cocina">
                <div className="pedido-header--cocina">
                  <h3>Mesa {pedido.mesa.numero}</h3>
                  <p>{getComensalesPedido(pedido)} comensales</p>
                </div>
                <p><strong>Hace:</strong> {calcularTiempoTranscurrido(pedido.fecha)}</p>
                <ul className="productos-list--cocina">
                  {pedido.productos
                    .filter((producto) => ['plato', 'tapaRacion'].includes(producto.tipo))
                    .map((producto) => {
                      const nombreColor = producto.tipoPlato === 'individual' ? 'green' : 'purple';
                      const mostrarCroqueta = producto.producto.nombre.toLowerCase().includes('croqueta')
                        ? `${producto.tipoCroqueta}`
                        : null;

                      return (
                        <li key={producto._id} className="producto-item--cocina">
                          <label>
                            <input
                              type="checkbox"
                              checked={producto.estadoPreparacion === 'listo'}
                              onChange={() => marcarProductoComoListo(pedido._id, producto._id)}
                            />
                            <span style={{ color: nombreColor }}>
                              {producto.cantidad}x {producto.tipoPrecio !== 'precioBase' && `${producto.tipoPrecio}`} {producto.producto?.nombre || 'Producto no disponible'} {producto.adicionales.length > 0 && (
                                <p>{producto.adicionales.map(ad => `${ad.nombre}`)}</p>
                              )}
                            </span>
                          </label>

                          {producto.alergiasComensal && (
                            <p className="alergias-individual--cocina"><strong>A:</strong> {producto.alergiasComensal}</p>
                          )}

                          {productoSeleccionado === producto && (
                            <div className="tooltip-detalle">
                              <p><strong>C:</strong> {producto.nombreComensal || 'No disponible'}</p>
                              {producto.alergiasComensal && <p><strong>A:</strong> {producto.alergiasComensal}</p>}
                            </div>
                          )}

                          {mostrarCroqueta && <p className="tipo-croqueta">{mostrarCroqueta}</p>}
                          {producto.sabor?.length > 0 && (
                            <ul>
                              {producto.sabor.map((s, i) => (
                                <li key={i}>{s.cantidad}x {s.ingrediente}</li>
                              ))}
                            </ul>
                          )}
                          {producto.ingredientesEliminados.length > 0 && (
                            <p><strong>Sin:</strong> {producto.ingredientesEliminados.join(', ')}</p>
                          )}
                          {producto.especificaciones.length > 0 && (
                            <p><strong>Especificaciones:</strong> {producto.especificaciones.join(', ')}</p>
                          )}
                          {producto.mensaje && (
                            <p className="mensaje-producto--cocina">{producto.mensaje}</p>
                          )}

                        </li>
                      );
                    })}
                </ul>

                <button
                  onClick={() => marcarPedidoComoListo(pedido._id)}
                  disabled={!todosProductosListos}
                  className="boton-terminar--cocina"
                >
                  Terminar Pedido
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Cocina;
